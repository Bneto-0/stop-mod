import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import nodemailer from "nodemailer";
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
const alertEmailEnabled = parseBool(process.env.ALERT_EMAIL_ENABLED, true);
const alertRecipientEmail = normalizeEmailAddress(process.env.ALERT_RECIPIENT_EMAIL || "loja@stopmod.com.br");
const alertFromEmail = normalizeEmailAddress(process.env.ALERT_EMAIL_FROM || "");
const smtpHost = String(process.env.SMTP_HOST || "").trim();
const smtpPort = clampInt(process.env.SMTP_PORT, 1, 65535);
const smtpSecure = parseBool(process.env.SMTP_SECURE, smtpPort === 465);
const smtpUser = String(process.env.SMTP_USER || "").trim();
const smtpPass = String(process.env.SMTP_PASS || "").trim();
const authStatus = authHealth({
  tokenSecret: authJwtSecret,
  cpfCheckMode: cpfCivilCheckMode,
  cpfCheckUrl: cpfCivilCheckUrl,
  cpfLookupUrl: cpfCivilLookupUrl
});
const emailAlerts = createEmailAlertSender({
  enabled: alertEmailEnabled,
  recipient: alertRecipientEmail,
  from: alertFromEmail,
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPass
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
    cpfLookupTimeoutMs: cpfCivilLookupTimeoutMs,
    sendAlert: (payload) => emailAlerts.send(payload)
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "stopmod-pagbank-backend",
    environment: pagBankEnv,
    pagbankTokenConfigured: hasValidPagBankToken,
    auth: authStatus,
    alerts: {
      emailEnabled: emailAlerts.enabled,
      emailConfigured: emailAlerts.configured,
      recipient: emailAlerts.recipient,
      host: emailAlerts.host,
      port: emailAlerts.port,
      secure: emailAlerts.secure,
      from: emailAlerts.from,
      missing: emailAlerts.missing
    }
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
  const buyerResolution = resolveInlineBuyerCustomer(input.customer, {
    merchantEmail: pagBankEmail,
    environment: pagBankEnv
  });
  if (!buyerResolution.ok) {
    return res.status(400).json({
      error: "invalid_inline_buyer_email",
      message: buyerResolution.message
    });
  }
  const gatewayInput = {
    ...input,
    customer: buyerResolution.customer
  };

  if (input.paymentMethod === "credito" || input.paymentMethod === "debito") {
    return res.status(400).json({
      error: "card_inline_not_configured",
      message:
        "Cartao sem redirecionamento exige tokenizacao segura no frontend (SDK PagBank + 3DS). Use Pix ou Boleto por enquanto."
    });
  }

  try {
    if (input.paymentMethod === "pix") {
      const payload = buildPixInlineOrderPayload(gatewayInput, {
        notificationUrl: gatewayInput.notificationUrl || defaultNotificationUrl
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
      const payload = buildBoletoInlineOrderPayload(gatewayInput, {
        notificationUrl:
          gatewayInput.paymentNotificationUrl ||
          gatewayInput.notificationUrl ||
          defaultPaymentNotificationUrl ||
          defaultNotificationUrl,
        includeHolder: true
      });

      let result = await requestPagBankJson("/orders", payload, {
        pagBankApiBase,
        pagBankToken,
        pagBankEmail
      });
      let aliasRetryTried = false;
      let withoutHolderRetryTried = false;

      if (!result.ok && shouldRetryWithBuyerAlias(result.data, result.text)) {
        aliasRetryTried = true;
        const retryCustomer = {
          ...gatewayInput.customer,
          email: makeBuyerAliasEmail(gatewayInput.customer?.email || "")
        };
        const retryPayload = buildBoletoInlineOrderPayload(
          {
            ...gatewayInput,
            customer: retryCustomer
          },
          {
            notificationUrl:
              gatewayInput.paymentNotificationUrl ||
              gatewayInput.notificationUrl ||
              defaultPaymentNotificationUrl ||
              defaultNotificationUrl,
            includeHolder: true
          }
        );
        result = await requestPagBankJson("/orders", retryPayload, {
          pagBankApiBase,
          pagBankToken,
          pagBankEmail
        });
      }

      if (!result.ok && shouldRetryWithBuyerAlias(result.data, result.text)) {
        withoutHolderRetryTried = true;
        const retryPayloadWithoutHolder = buildBoletoInlineOrderPayload(
          {
            ...gatewayInput,
            customer: {
              ...gatewayInput.customer,
              email: makeBuyerAliasEmail(gatewayInput.customer?.email || "")
            }
          },
          {
            notificationUrl:
              gatewayInput.paymentNotificationUrl ||
              gatewayInput.notificationUrl ||
              defaultPaymentNotificationUrl ||
              defaultNotificationUrl,
            includeHolder: false
          }
        );
        result = await requestPagBankJson("/orders", retryPayloadWithoutHolder, {
          pagBankApiBase,
          pagBankToken,
          pagBankEmail
        });
      }

      if (!result.ok) {
        const retryHint = withoutHolderRetryTried
          ? " (apos tentativa sem holder)"
          : aliasRetryTried
            ? " (apos tentativa com email alias)"
            : "";
        return res.status(result.status || 500).json({
          error: "pagbank_inline_boleto_error",
          message: `${extractErrorMessage(result.data, result.text)}${retryHint}`,
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
  console.log(`[stopmod] Alertas email: ${emailAlerts.configured ? "habilitado" : "desabilitado"}${emailAlerts.recipient ? ` (${emailAlerts.recipient})` : ""}`);
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
        const parameterName = String(first.parameter_name || first.parameter || "").trim();
        const description = typeof first.description === "string" ? first.description.trim() : "";
        if (description) {
          if (description.toLowerCase() === "invalid_parameter" && parameterName) {
            return `Parametro invalido: ${parameterName}`;
          }
          if (description.toLowerCase() === "must not be blank" && parameterName) {
            return `Campo obrigatorio ausente: ${parameterName}`;
          }
          return description;
        }
        if (parameterName) return `Parametro invalido: ${parameterName}`;
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

function resolveInlineBuyerCustomer(customer, options = {}) {
  const buyerEmail = normalizeEmailAddress(customer?.email || "");
  const merchantEmail = normalizeEmailAddress(options?.merchantEmail || "");
  if (!buyerEmail || !merchantEmail) {
    return { ok: true, customer };
  }
  if (buyerEmail !== merchantEmail) {
    return { ok: true, customer };
  }

  const env = String(options?.environment || "").trim().toLowerCase();
  if (env === "sandbox") {
    const at = buyerEmail.indexOf("@");
    if (at > 0) {
      const local = buyerEmail.slice(0, at);
      const domain = buyerEmail.slice(at + 1);
      const alias = `${local}+buyer${Date.now().toString(36)}@${domain}`;
      return {
        ok: true,
        customer: { ...customer, email: alias }
      };
    }
  }

  return {
    ok: false,
    message: "O email do comprador nao pode ser igual ao email da conta PagBank. Use outro email para o cliente."
  };
}

function makeBuyerAliasEmail(email) {
  const normalized = normalizeEmailAddress(email);
  if (!normalized) return "comprador+stopmod@exemplo.com";
  const at = normalized.indexOf("@");
  if (at <= 0) return normalized;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  return `${local}+buyer${Date.now().toString(36)}@${domain}`;
}

function shouldRetryWithBuyerAlias(data, rawText) {
  const text = String(rawText || "").toLowerCase();
  if (text.includes("buyer email must not be equals to merchant email")) return true;

  if (data && typeof data === "object" && Array.isArray(data.error_messages)) {
    return data.error_messages.some((item) => {
      if (!item || typeof item !== "object") return false;
      const description = String(item.description || item.error || "").toLowerCase();
      const parameterName = String(item.parameter_name || item.parameter || "").toLowerCase();
      if (description.includes("buyer email must not be equals to merchant email")) return true;
      return (
        description.includes("invalid_parameter") &&
        (parameterName.includes("payment_method.boleto.holder.email") || parameterName.includes("payment_method.boleto.holder"))
      );
    });
  }
  return false;
}

function stateNameFromUf(uf) {
  const key = String(uf || "").trim().toUpperCase();
  const map = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapa",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceara",
    DF: "Distrito Federal",
    ES: "Espirito Santo",
    GO: "Goias",
    MA: "Maranhao",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Para",
    PB: "Paraiba",
    PR: "Parana",
    PE: "Pernambuco",
    PI: "Piaui",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondonia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "Sao Paulo",
    SE: "Sergipe",
    TO: "Tocantins"
  };
  return map[key] || "";
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
  const includeHolder = options?.includeHolder !== false;
  const stateCode = String(input.shipTo?.state || "").trim().toUpperCase().slice(0, 2);
  const stateName = stateNameFromUf(stateCode);
  const postalCode = digitsOnly(input.shipTo?.cep || "").slice(0, 8);
  const complement = String(input.shipTo?.complement || "").trim() || "Sem complemento";
  const boleto = {
    template: "COBRANCA",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    days_until_expiration: "5",
    instruction_lines: {
      line_1: "Nao receber apos vencimento.",
      line_2: "Pagamento referente ao pedido da loja Stop mod."
    }
  };
  if (includeHolder) {
    const holderName = String(input.customer.name || "").trim().slice(0, 30) || "Cliente";
    boleto.holder = {
      name: holderName,
      tax_id: input.customer.cpf,
      email: String(input.customer.email || "").trim().toLowerCase().slice(0, 255),
      address: {
        street: input.shipTo.street,
        number: input.shipTo.number,
        complement,
        locality: input.shipTo.district,
        city: input.shipTo.city,
        region: stateName || stateCode,
        region_code: stateCode,
        country: "BRA",
        postal_code: postalCode
      }
    };
  }

  const payload = {
    reference_id: input.referenceId,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      tax_id: input.customer.cpf,
      phones: toPagBankPhoneList(input.customer.phone)
    },
    shipping: {
      address: {
        street: input.shipTo.street,
        number: input.shipTo.number,
        complement,
        locality: input.shipTo.district,
        city: input.shipTo.city,
        region_code: stateCode,
        country: "BRA",
        postal_code: postalCode
      }
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
          boleto
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

function parseBool(value, fallback = false) {
  const text = String(value == null ? "" : value).trim().toLowerCase();
  if (!text) return !!fallback;
  if (["1", "true", "yes", "y", "on", "sim", "s"].includes(text)) return true;
  if (["0", "false", "no", "n", "off", "nao", "não"].includes(text)) return false;
  return !!fallback;
}

function normalizeEmailAddress(value) {
  const email = String(value || "").trim().toLowerCase();
  return email.includes("@") ? email.slice(0, 160) : "";
}

function createEmailAlertSender(options = {}) {
  const enabled = !!options.enabled;
  const recipient = normalizeEmailAddress(options.recipient || "");
  const from = normalizeEmailAddress(options.from || options.smtpUser || recipient || "");
  const host = String(options.smtpHost || "").trim();
  const port = clampInt(options.smtpPort, 1, 65535);
  const secure = !!options.smtpSecure;
  const user = String(options.smtpUser || "").trim();
  const pass = String(options.smtpPass || "").trim();

  const configured = !!(enabled && recipient && from && host && port > 0 && user && pass);
  const transport = configured
    ? nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      })
    : null;

  return {
    enabled,
    configured,
    recipient,
    from,
    host,
    port,
    secure,
    missing: [
      enabled ? "" : "ALERT_EMAIL_ENABLED",
      recipient ? "" : "ALERT_RECIPIENT_EMAIL",
      from ? "" : "ALERT_EMAIL_FROM",
      host ? "" : "SMTP_HOST",
      port > 0 ? "" : "SMTP_PORT",
      user ? "" : "SMTP_USER",
      pass ? "" : "SMTP_PASS"
    ].filter(Boolean),
    async send(payload = {}) {
      if (!configured || !transport) return { ok: false, reason: "not_configured" };

      const built = buildAlertEmail(payload, { recipient, from });
      try {
        await transport.sendMail({
          from,
          to: recipient,
          subject: built.subject,
          text: built.text,
          html: built.html
        });
        return { ok: true };
      } catch (error) {
        console.warn("[stopmod] Falha ao enviar alerta de email:", String(error?.message || error || "erro"));
        return { ok: false, reason: "send_failed" };
      }
    }
  };
}

function buildAlertEmail(payload = {}, config = {}) {
  const recipient = String(config.recipient || "").trim();
  const event = String(payload.event || "").trim().toLowerCase();
  const user = payload.user && typeof payload.user === "object" ? payload.user : {};
  const name = String(user.name || "Cliente").trim() || "Cliente";
  const email = normalizeEmailAddress(user.email || "");
  const cpfMasked = String(user.cpfMasked || "").trim();
  const ip = String(payload.ip || "").trim();
  const userAgent = String(payload.userAgent || "").trim();
  const occurredAtIso = String(payload.occurredAt || new Date().toISOString()).trim();
  const occurredAt = toBrazilDateTime(occurredAtIso);

  let subject = "[Stop mod] Novo alerta";
  if (event === "user_login") subject = `[Stop mod] Login realizado - ${name}`;
  if (event === "user_register") subject = `[Stop mod] Novo cadastro - ${name}`;

  const lines = [
    `Evento: ${event || "geral"}`,
    `Data/Hora: ${occurredAt}`,
    `Nome: ${name}`,
    email ? `Email: ${email}` : "",
    cpfMasked ? `CPF: ${cpfMasked}` : "",
    ip ? `IP: ${ip}` : "",
    userAgent ? `Navegador: ${userAgent}` : "",
    recipient ? `Destino do alerta: ${recipient}` : ""
  ].filter(Boolean);

  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;background:#fff;padding:14px;color:#231f1b">
      <h2 style="margin:0 0 10px 0;color:#c7512f;">${escapeHtml(subject)}</h2>
      <p style="margin:0 0 6px 0;"><strong>Evento:</strong> ${escapeHtml(event || "geral")}</p>
      <p style="margin:0 0 6px 0;"><strong>Data/Hora:</strong> ${escapeHtml(occurredAt)}</p>
      <p style="margin:0 0 6px 0;"><strong>Nome:</strong> ${escapeHtml(name)}</p>
      ${email ? `<p style="margin:0 0 6px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
      ${cpfMasked ? `<p style="margin:0 0 6px 0;"><strong>CPF:</strong> ${escapeHtml(cpfMasked)}</p>` : ""}
      ${ip ? `<p style="margin:0 0 6px 0;"><strong>IP:</strong> ${escapeHtml(ip)}</p>` : ""}
      ${userAgent ? `<p style="margin:0 0 6px 0;"><strong>Navegador:</strong> ${escapeHtml(userAgent)}</p>` : ""}
      <hr style="border:none;border-top:1px solid #eadfd7;margin:12px 0;" />
      <p style="margin:0;color:#6f635c;font-size:12px;">Alerta automatico da loja Stop mod.</p>
    </div>
  `;

  return { subject, text, html };
}

function toBrazilDateTime(value) {
  const date = new Date(String(value || "").trim());
  if (!Number.isFinite(date.getTime())) return new Date().toLocaleString("pt-BR");
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
