import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authHealth, createAuthRouter } from "./auth-router.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 8787);

const pagBankEnv = String(process.env.PAGBANK_ENV || "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox";
const pagBankToken = String(process.env.PAGBANK_TOKEN || "").trim();
const pagBankEmail = String(process.env.PAGBANK_EMAIL || "").trim();
const hasValidPagBankToken = isRealTokenValue(pagBankToken);
const pagBankApiBase = pagBankEnv === "production" ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com";

const frontendOrigins = parseCsvList(
  process.env.FRONTEND_ORIGINS ||
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,https://stopmod.com.br"
);

const defaultReturnUrl = String(process.env.PAGBANK_RETURN_URL || "https://stopmod.com.br/carrinho/").trim();
const defaultRedirectUrl = String(process.env.PAGBANK_REDIRECT_URL || defaultReturnUrl).trim();
const defaultNotificationUrl = String(process.env.PAGBANK_NOTIFICATION_URL || "").trim();
const defaultPaymentNotificationUrl = String(process.env.PAGBANK_PAYMENT_NOTIFICATION_URL || "").trim();
const webhookLogPath = path.join(__dirname, "data", "pagbank-webhook.log");
const authJwtSecret = String(process.env.AUTH_JWT_SECRET || "").trim();
const authTokenTtlSec = clampInt(process.env.AUTH_TOKEN_TTL_SEC, 120, 60 * 60 * 24 * 7);
const cpfCivilCheckMode = normalizeCpfCheckMode(process.env.CPF_CIVIL_CHECK_MODE || "off");
const cpfCivilCheckUrl = String(process.env.CPF_CIVIL_CHECK_URL || "").trim();
const cpfCivilCheckToken = String(process.env.CPF_CIVIL_CHECK_TOKEN || "").trim();
const cpfCivilCheckTimeoutMs = clampInt(process.env.CPF_CIVIL_CHECK_TIMEOUT_MS, 1000, 15000);
const cpfCivilLookupUrl = String(process.env.CPF_CIVIL_LOOKUP_URL || cpfCivilCheckUrl || "").trim();
const cpfCivilLookupToken = String(process.env.CPF_CIVIL_LOOKUP_TOKEN || cpfCivilCheckToken || "").trim();
const cpfCivilLookupTimeoutMs = clampInt(process.env.CPF_CIVIL_LOOKUP_TIMEOUT_MS, 1000, 15000);
const authStatus = authHealth({
  tokenSecret: authJwtSecret,
  cpfCheckMode: cpfCivilCheckMode,
  cpfCheckUrl: cpfCivilCheckUrl,
  cpfLookupUrl: cpfCivilLookupUrl
});

const paymentMethodMap = Object.freeze({
  pix: "PIX",
  credito: "CREDIT_CARD",
  debito: "DEBIT_CARD",
  boleto: "BOLETO"
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (frontendOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin nao permitida: ${origin}`));
    }
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api/auth",
  createAuthRouter({
    dataDir: path.join(__dirname, "data"),
    tokenSecret: authJwtSecret,
    tokenTtlSec: authTokenTtlSec,
    cpfCheckMode: cpfCivilCheckMode,
    cpfCheckUrl: cpfCivilCheckUrl,
    cpfCheckToken: cpfCivilCheckToken,
    cpfCheckTimeoutMs: cpfCivilCheckTimeoutMs,
    cpfLookupUrl: cpfCivilLookupUrl,
    cpfLookupToken: cpfCivilLookupToken,
    cpfLookupTimeoutMs: cpfCivilLookupTimeoutMs
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "stopmod-pagbank-backend",
    environment: pagBankEnv,
    pagbankTokenConfigured: hasValidPagBankToken,
    auth: authStatus
  });
});

app.post("/api/pagbank/checkout", async (req, res) => {
  if (!hasValidPagBankToken) {
    return res.status(500).json({
      error: "missing_pagbank_token",
      message: "Configure PAGBANK_TOKEN com o token real do PagBank (nao use SEU_TOKEN_AQUI)."
    });
  }

  const parsed = parseCheckoutRequest(req.body || {});
  if (!parsed.ok) {
    return res.status(400).json({
      error: "invalid_checkout_payload",
      message: parsed.message
    });
  }

  const input = parsed.value;
  const payType = paymentMethodMap[input.paymentMethod];
  const payload = {
    reference_id: input.referenceId,
    customer_modifiable: true,
    items: input.items.map((item) => ({
      reference_id: item.referenceId,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit_amount: item.unitAmount
    })),
    shipping: input.shippingAmount > 0 ? { type: "FIXED", amount: input.shippingAmount } : { type: "FREE" },
    discount_amount: input.discountAmount,
    payment_methods: [{ type: payType }],
    redirect_url: input.redirectUrl || defaultRedirectUrl,
    return_url: input.returnUrl || defaultReturnUrl
  };

  if (input.customer?.name && input.customer?.email) {
    payload.customer = {
      name: input.customer.name,
      email: input.customer.email
    };
  }
  if (input.notificationUrl || defaultNotificationUrl) {
    payload.notification_urls = [input.notificationUrl || defaultNotificationUrl];
  }
  if (input.paymentNotificationUrl || defaultPaymentNotificationUrl) {
    payload.payment_notification_urls = [input.paymentNotificationUrl || defaultPaymentNotificationUrl];
  }

  try {
    const authCandidates = buildAuthorizationCandidates(pagBankToken, pagBankEmail);
    let response = null;
    let text = "";
    let data = null;

    for (const authHeader of authCandidates) {
      response = await fetch(`${pagBankApiBase}/checkouts`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      text = await response.text();
      data = safeParseJson(text);

      if (response.ok) break;
      if (!isInvalidAuthorizationError(response.status, data, text)) break;
    }

    if (!response || !response.ok) {
      return res.status(response?.status || 500).json({
        error: "pagbank_checkout_error",
        message: extractErrorMessage(data, text),
        details: data
      });
    }

    const checkoutUrl =
      findPayUrl(data?.links) ||
      findPayUrl(data?.redirect_links) ||
      "";

    if (!checkoutUrl) {
      return res.status(502).json({
        error: "pagbank_missing_checkout_url",
        message: "PagBank nao retornou link de pagamento.",
        details: data
      });
    }

    return res.status(201).json({
      checkoutId: String(data?.id || ""),
      referenceId: String(data?.reference_id || input.referenceId),
      checkoutUrl,
      status: String(data?.status || ""),
      expiresAt: String(data?.expires_at || "")
    });
  } catch (error) {
    return res.status(500).json({
      error: "pagbank_checkout_request_failed",
      message: String(error?.message || error || "Falha ao chamar PagBank.")
    });
  }
});

app.post("/api/pagbank/inline-payment", async (req, res) => {
  if (!hasValidPagBankToken) {
    return res.status(500).json({
      error: "missing_pagbank_token",
      message: "Configure PAGBANK_TOKEN com o token real do PagBank (nao use SEU_TOKEN_AQUI)."
    });
  }

  const parsed = parseInlinePaymentRequest(req.body || {});
  if (!parsed.ok) {
    return res.status(400).json({
      error: "invalid_inline_payment_payload",
      message: parsed.message
    });
  }

  const input = parsed.value;

  if (input.paymentMethod === "credito" || input.paymentMethod === "debito") {
    return res.status(400).json({
      error: "card_inline_not_configured",
      message:
        "Cartao sem redirecionamento exige tokenizacao segura no frontend (SDK PagBank + 3DS). Use Pix ou Boleto por enquanto."
    });
  }

  try {
    if (input.paymentMethod === "pix") {
      const payload = buildPixInlineOrderPayload(input, {
        notificationUrl: input.notificationUrl || defaultNotificationUrl
      });

      const result = await requestPagBankJson("/orders", payload, {
        pagBankApiBase,
        pagBankToken,
        pagBankEmail
      });

      if (!result.ok) {
        return res.status(result.status || 500).json({
          error: "pagbank_inline_pix_error",
          message: extractErrorMessage(result.data, result.text),
          details: result.data
        });
      }

      const pix = extractPixInlineData(result.data);
      if (!pix.qrText && !pix.qrImageDataUrl && !pix.qrImageUrl) {
        return res.status(502).json({
          error: "pagbank_inline_pix_missing_data",
          message: "PagBank nao retornou dados do Pix.",
          details: result.data
        });
      }

      return res.status(201).json({
        mode: "pix",
        orderId: String(result.data?.id || ""),
        referenceId: String(result.data?.reference_id || input.referenceId),
        status: String(result.data?.status || ""),
        expiresAt: String(pix.expiresAt || result.data?.expires_at || ""),
        pix
      });
    }

    if (input.paymentMethod === "boleto") {
      const payload = buildBoletoInlineOrderPayload(input, {
        notificationUrl: input.paymentNotificationUrl || input.notificationUrl || defaultPaymentNotificationUrl || defaultNotificationUrl
      });

      const result = await requestPagBankJson("/orders", payload, {
        pagBankApiBase,
        pagBankToken,
        pagBankEmail
      });

      if (!result.ok) {
        return res.status(result.status || 500).json({
          error: "pagbank_inline_boleto_error",
          message: extractErrorMessage(result.data, result.text),
          details: result.data
        });
      }

      const boleto = extractBoletoInlineData(result.data);
      if (!boleto.barcode && !boleto.formattedBarcode && !boleto.pdfUrl) {
        return res.status(502).json({
          error: "pagbank_inline_boleto_missing_data",
          message: "PagBank nao retornou dados do Boleto.",
          details: result.data
        });
      }

      return res.status(201).json({
        mode: "boleto",
        orderId: String(result.data?.id || ""),
        referenceId: String(result.data?.reference_id || input.referenceId),
        status: String(result.data?.status || ""),
        boleto
      });
    }

    return res.status(400).json({
      error: "unsupported_inline_method",
      message: "Metodo sem redirecionamento nao suportado. Use Pix ou Boleto."
    });
  } catch (error) {
    return res.status(500).json({
      error: "pagbank_inline_payment_failed",
      message: String(error?.message || error || "Falha ao iniciar pagamento inline.")
    });
  }
});

app.post("/api/pagbank/webhook", async (req, res) => {
  try {
    await fs.mkdir(path.dirname(webhookLogPath), { recursive: true });
    const line = JSON.stringify({
      receivedAt: new Date().toISOString(),
      payload: req.body || {}
    });
    await fs.appendFile(webhookLogPath, `${line}\n`, "utf8");
  } catch (error) {
    console.error("Falha ao gravar webhook:", error);
  }
  res.status(204).send();
});

app.get("/api/pagbank/webhook/logs", async (_req, res) => {
  try {
    const raw = await fs.readFile(webhookLogPath, "utf8");
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(-50);
    const data = lines.map((line) => safeParseJson(line) || { raw: line });
    res.json({ count: data.length, events: data });
  } catch {
    res.json({ count: 0, events: [] });
  }
});

app.listen(port, () => {
  console.log(`[stopmod] PagBank backend online na porta ${port}`);
  console.log(`[stopmod] Ambiente PagBank: ${pagBankEnv}`);
  console.log(`[stopmod] Auth seguro: ${authStatus.enabled ? "habilitado" : "desabilitado"}`);
});

function parseCsvList(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function isRealTokenValue(value) {
  const token = String(value || "").trim();
  if (!token) return false;
  if (/^seu[_\s-]*token/i.test(token)) return false;
  if (token.toLowerCase().includes("token_aqui")) return false;
  return token.length >= 24;
}

function safeParseJson(value) {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return null;
  }
}

function extractErrorMessage(data, fallback) {
  if (data && typeof data === "object") {
    if (typeof data.error_message === "string" && data.error_message.trim()) return data.error_message.trim();
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    if (Array.isArray(data.error_messages) && data.error_messages.length) {
      const first = data.error_messages[0];
      if (typeof first === "string" && first.trim()) return first.trim();
      if (first && typeof first === "object") {
        if (typeof first.description === "string" && first.description.trim()) return first.description.trim();
        if (typeof first.error === "string" && first.error.trim()) return first.error.trim();
      }
    }
  }
  const text = String(fallback || "").trim();
  if (!text) return "Erro desconhecido ao criar checkout.";
  return text.slice(0, 400);
}

function buildAuthorizationCandidates(token, email) {
  const tokenValue = String(token || "").trim();
  const emailValue = String(email || "").trim();
  if (!tokenValue) return [];

  const out = [];
  if (/^Bearer\s+/i.test(tokenValue)) out.push(tokenValue);
  else out.push(`Bearer ${tokenValue}`);

  if (emailValue && emailValue.includes("@")) {
    const basic = Buffer.from(`${emailValue}:${tokenValue}`).toString("base64");
    out.push(`Basic ${basic}`);
  }

  return Array.from(new Set(out));
}

function isInvalidAuthorizationError(status, data, rawText) {
  if (Number(status) !== 401) return false;
  const text = String(rawText || "").toLowerCase();
  if (text.includes("invalid_authorization_header") || text.includes("invalid credential")) return true;
  if (!data || typeof data !== "object") return false;
  const list = Array.isArray(data.error_messages) ? data.error_messages : [];
  return list.some((item) => {
    if (!item || typeof item !== "object") return false;
    return (
      String(item.error || "").toLowerCase().includes("invalid_authorization_header") ||
      String(item.description || "").toLowerCase().includes("invalid credential")
    );
  });
}

function findPayUrl(links) {
  if (!Array.isArray(links)) return "";
  const payLink = links.find((item) => String(item?.rel || "").toUpperCase() === "PAY");
  if (payLink?.href) return String(payLink.href);
  const first = links.find((item) => typeof item?.href === "string");
  return first?.href ? String(first.href) : "";
}

async function requestPagBankJson(pathname, payload, options) {
  const apiBase = String(options?.pagBankApiBase || "").trim().replace(/\/+$/, "");
  const token = String(options?.pagBankToken || "").trim();
  const email = String(options?.pagBankEmail || "").trim();
  const endpoint = `${apiBase}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const authCandidates = buildAuthorizationCandidates(token, email);

  let response = null;
  let text = "";
  let data = null;

  for (const authHeader of authCandidates) {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    text = await response.text();
    data = safeParseJson(text);

    if (response.ok) break;
    if (!isInvalidAuthorizationError(response.status, data, text)) break;
  }

  return {
    ok: !!response?.ok,
    status: Number(response?.status || 500),
    data,
    text
  };
}

function parseInlinePaymentRequest(raw) {
  const parsedCheckout = parseCheckoutRequest(raw);
  if (!parsedCheckout.ok) return parsedCheckout;

  const input = parsedCheckout.value;
  const customer = normalizeInlineCustomer(raw?.customer || {});
  if (!customer) {
    return { ok: false, message: "Informe nome, email, CPF e celular do cliente para pagamento sem redirecionamento." };
  }

  const shipTo = normalizeInlineAddress(raw?.shipTo || {});
  if (input.paymentMethod === "boleto") {
    const shipValid = validateInlineAddress(shipTo);
    if (!shipValid.ok) {
      return { ok: false, message: shipValid.message };
    }
  }

  return {
    ok: true,
    value: {
      ...input,
      customer,
      shipTo
    }
  };
}

function normalizeInlineCustomer(raw) {
  const name = String(raw?.name || raw?.fullName || "").trim().slice(0, 120);
  const email = String(raw?.email || "").trim().slice(0, 120).toLowerCase();
  const cpf = digitsOnly(raw?.cpf || "").slice(0, 11);
  const phone = normalizeBrazilPhone(raw?.phone || "");
  if (!name || !email || !email.includes("@")) return null;
  if (cpf.length !== 11) return null;
  if (phone.length < 10) return null;
  return { name, email, cpf, phone };
}

function normalizeInlineAddress(raw) {
  const street = String(raw?.street || "").trim().slice(0, 120);
  const number = String(raw?.number || "").trim().slice(0, 30);
  const district = String(raw?.district || raw?.locality || "").trim().slice(0, 90);
  const city = String(raw?.city || "").trim().slice(0, 90);
  const state = String(raw?.state || "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
  const cep = digitsOnly(raw?.cep || "").slice(0, 8);
  const complement = String(raw?.complement || "").trim().slice(0, 120);
  return { street, number, district, city, state, cep, complement };
}

function validateInlineAddress(address) {
  if (!address.street) return { ok: false, message: "Endereco invalido: informe a rua." };
  if (!address.number) return { ok: false, message: "Endereco invalido: informe o numero." };
  if (!address.district) return { ok: false, message: "Endereco invalido: informe o bairro." };
  if (!address.city) return { ok: false, message: "Endereco invalido: informe a cidade." };
  if (!/^[A-Z]{2}$/.test(String(address.state || ""))) return { ok: false, message: "Endereco invalido: informe UF com 2 letras." };
  if (String(address.cep || "").length !== 8) return { ok: false, message: "Endereco invalido: informe CEP com 8 digitos." };
  return { ok: true };
}

function normalizeBrazilPhone(value) {
  const raw = digitsOnly(value);
  if (!raw) return "";
  if (raw.startsWith("55") && (raw.length === 12 || raw.length === 13)) return raw.slice(2);
  if (raw.length === 10 || raw.length === 11) return raw;
  return "";
}

function toPagBankPhoneList(phoneDigits) {
  const local = normalizeBrazilPhone(phoneDigits);
  if (!local || local.length < 10) return [];
  const area = local.slice(0, 2);
  const number = local.slice(2);
  return [
    {
      country: "55",
      area,
      number,
      type: local.length === 11 ? "MOBILE" : "HOME"
    }
  ];
}

function computeInlineTotalCents(input) {
  const itemsTotal = Array.isArray(input?.items)
    ? input.items.reduce((sum, item) => sum + toCentsInt(item?.unitAmount || 0) * clampInt(item?.quantity, 1, 999), 0)
    : 0;
  const discount = toCentsInt(input?.discountAmount || 0);
  const shipping = toCentsInt(input?.shippingAmount || 0);
  const total = Math.max(1, itemsTotal - discount + shipping);
  return total;
}

function buildPixInlineOrderPayload(input, options) {
  const total = computeInlineTotalCents(input);
  const payload = {
    reference_id: input.referenceId,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      tax_id: input.customer.cpf,
      phones: toPagBankPhoneList(input.customer.phone)
    },
    items: input.items.map((item) => ({
      reference_id: item.referenceId,
      name: item.name,
      quantity: item.quantity,
      unit_amount: item.unitAmount
    })),
    qr_codes: [
      {
        amount: { value: total },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    ]
  };

  const notification = String(options?.notificationUrl || "").trim();
  if (notification) {
    payload.notification_urls = [notification];
  }

  return payload;
}

function buildBoletoInlineOrderPayload(input, options) {
  const total = computeInlineTotalCents(input);
  const payload = {
    reference_id: input.referenceId,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      tax_id: input.customer.cpf,
      phones: toPagBankPhoneList(input.customer.phone)
    },
    items: input.items.map((item) => ({
      reference_id: item.referenceId,
      name: item.name,
      quantity: item.quantity,
      unit_amount: item.unitAmount
    })),
    charges: [
      {
        reference_id: `${input.referenceId}-B1`,
        description: `Pedido ${input.referenceId}`,
        amount: { value: total, currency: "BRL" },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            instruction_lines: {
              line_1: "Nao receber apos vencimento.",
              line_2: "Pagamento referente ao pedido da loja Stop mod."
            },
            holder: {
              name: input.customer.name,
              tax_id: input.customer.cpf,
              email: input.customer.email,
              address: {
                street: input.shipTo.street,
                number: input.shipTo.number,
                locality: input.shipTo.district,
                city: input.shipTo.city,
                region: input.shipTo.state,
                region_code: input.shipTo.state,
                country: "BRA",
                postal_code: input.shipTo.cep
              }
            }
          }
        }
      }
    ]
  };

  const notification = String(options?.notificationUrl || "").trim();
  if (notification && Array.isArray(payload.charges) && payload.charges[0]) {
    payload.charges[0].notification_urls = [notification];
  }

  return payload;
}

function extractPixInlineData(orderData) {
  const qrCode = Array.isArray(orderData?.qr_codes) ? orderData.qr_codes[0] : null;
  const qrText = String(qrCode?.text || qrCode?.emv || "").trim();
  const expiresAt = String(qrCode?.expiration_date || "").trim();
  const qrBase64Raw = findLinkByRel(qrCode?.links, "QRCODE.BASE64");
  const qrImageUrl = findLinkByRel(qrCode?.links, "QRCODE.PNG") || findLinkByRel(qrCode?.links, "QRCODE.IMAGE");
  const qrImageDataUrl = toDataImageUrlIfBase64(qrBase64Raw);

  return {
    qrText,
    expiresAt,
    qrImageDataUrl,
    qrImageUrl,
    qrLink: qrImageUrl
  };
}

function extractBoletoInlineData(orderData) {
  const charge = Array.isArray(orderData?.charges) ? orderData.charges[0] : null;
  const boleto =
    charge?.payment_method?.boleto ||
    charge?.payment_response?.boleto ||
    {};
  const barcode = String(
    boleto?.barcode ||
      boleto?.number ||
      charge?.payment_response?.bar_code ||
      ""
  ).trim();
  const formattedBarcode = String(
    boleto?.formatted_barcode ||
      boleto?.formatted ||
      charge?.payment_response?.formatted_bar_code ||
      ""
  ).trim();
  const dueDate = String(boleto?.due_date || "").trim();
  const pdfUrl =
    findLinkByRel(boleto?.links, "PDF") ||
    findLinkByRel(charge?.links, "PAY") ||
    findAnyHref(boleto?.links) ||
    "";

  return {
    barcode,
    formattedBarcode,
    dueDate,
    pdfUrl
  };
}

function findLinkByRel(links, relFragment) {
  if (!Array.isArray(links)) return "";
  const relNeedle = String(relFragment || "").trim().toUpperCase();
  if (!relNeedle) return "";
  const found = links.find((item) => String(item?.rel || "").toUpperCase().includes(relNeedle));
  return found?.href ? String(found.href) : "";
}

function findAnyHref(links) {
  if (!Array.isArray(links)) return "";
  const first = links.find((item) => typeof item?.href === "string" && /^https?:\/\//i.test(item.href));
  return first?.href ? String(first.href) : "";
}

function toDataImageUrlIfBase64(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return "";
  if (/^data:image\//i.test(text)) return text;
  if (!/^[a-z0-9+/=]+$/i.test(text)) return "";
  return `data:image/png;base64,${text}`;
}

function parseCheckoutRequest(raw) {
  const paymentMethod = normalizePaymentMethod(raw?.paymentMethod);
  if (!paymentMethod) {
    return { ok: false, message: "paymentMethod invalido. Use pix, credito, debito ou boleto." };
  }

  const referenceId = sanitizeReferenceId(raw?.referenceId || "");
  if (!referenceId) {
    return { ok: false, message: "referenceId invalido." };
  }

  const discountAmount = toCentsInt(raw?.discountAmount || 0);
  const shippingAmount = toCentsInt(raw?.shippingAmount || 0);
  const itemsRaw = Array.isArray(raw?.items) ? raw.items : [];
  const items = itemsRaw
    .map((item, idx) => normalizeItem(item, idx))
    .filter(Boolean);

  if (!items.length) {
    return { ok: false, message: "items vazio." };
  }

  const customer = normalizeCustomer(raw?.customer || {});

  return {
    ok: true,
    value: {
      referenceId,
      paymentMethod,
      discountAmount,
      shippingAmount,
      items,
      customer,
      returnUrl: sanitizeOptionalUrl(raw?.returnUrl),
      redirectUrl: sanitizeOptionalUrl(raw?.redirectUrl),
      notificationUrl: sanitizeOptionalUrl(raw?.notificationUrl),
      paymentNotificationUrl: sanitizeOptionalUrl(raw?.paymentNotificationUrl)
    }
  };
}

function normalizePaymentMethod(value) {
  const method = String(value || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(paymentMethodMap, method) ? method : "";
}

function sanitizeReferenceId(value) {
  const text = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9\-_.]/g, "")
    .slice(0, 64);
  return text || "";
}

function normalizeItem(item, idx) {
  const referenceId = sanitizeReferenceId(item?.referenceId || item?.id || `item-${idx + 1}`);
  const name = String(item?.name || "").trim().slice(0, 120);
  const description = String(item?.description || "").trim().slice(0, 250);
  const quantity = clampInt(item?.quantity, 1, 999);
  const unitAmount = toCentsInt(item?.unitAmount);

  if (!referenceId || !name || quantity < 1 || unitAmount < 1) return null;

  return {
    referenceId,
    name,
    description,
    quantity,
    unitAmount
  };
}

function normalizeCustomer(customer) {
  const name = String(customer?.name || "").trim().slice(0, 120);
  const email = String(customer?.email || "").trim().slice(0, 120);
  if (!name || !email || !email.includes("@")) return null;
  return { name, email };
}

function sanitizeOptionalUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (!/^https?:\/\//i.test(text)) return "";
  return text.slice(0, 500);
}

function clampInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeCpfCheckMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "off" || mode === "warn" || mode === "strict") return mode;
  return "off";
}

function toCentsInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  // Aceita valor em reais (ex: 19.9) ou centavos inteiro (ex: 1990).
  if (Number.isInteger(n) && n > 999) return n;
  return Math.round(n * 100);
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}
