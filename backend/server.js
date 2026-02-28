import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 8787);

const pagBankEnv = String(process.env.PAGBANK_ENV || "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox";
const pagBankToken = String(process.env.PAGBANK_TOKEN || "").trim();
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
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "stopmod-pagbank-backend",
    environment: pagBankEnv
  });
});

app.post("/api/pagbank/checkout", async (req, res) => {
  if (!pagBankToken) {
    return res.status(500).json({
      error: "missing_pagbank_token",
      message: "Configure PAGBANK_TOKEN no backend."
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
    const response = await fetch(`${pagBankApiBase}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pagBankToken}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    const data = safeParseJson(text);

    if (!response.ok) {
      return res.status(response.status).json({
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
});

function parseCsvList(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
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
    if (Array.isArray(data.error_messages) && data.error_messages.length) return String(data.error_messages[0]);
  }
  const text = String(fallback || "").trim();
  if (!text) return "Erro desconhecido ao criar checkout.";
  return text.slice(0, 400);
}

function findPayUrl(links) {
  if (!Array.isArray(links)) return "";
  const payLink = links.find((item) => String(item?.rel || "").toUpperCase() === "PAY");
  if (payLink?.href) return String(payLink.href);
  const first = links.find((item) => typeof item?.href === "string");
  return first?.href ? String(first.href) : "";
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

function toCentsInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  // Aceita valor em reais (ex: 19.9) ou centavos inteiro (ex: 1990).
  if (Number.isInteger(n) && n > 999) return n;
  return Math.round(n * 100);
}
