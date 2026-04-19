const sharedCatalog = window.stopmodCatalog || null;
const CART_KEY = sharedCatalog?.storageKeys?.cart || "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const SHIP_KEY = "stopmod_ship_to";
const LEGACY_SHIP_KEY = "stopmod_ship_cep";
const COUPON_KEY = "stopmod_coupons";
const PAY_KEY = "stopmod_payment";
const ORDERS_KEY = "stopmod_orders";
const NOTES_KEY = "stopmod_notifications";
const SOLD_COUNTS_KEY = sharedCatalog?.storageKeys?.soldCounts || "stopmod_sold_counts";
const RATINGS_KEY = sharedCatalog?.storageKeys?.ratingStats || "stopmod_product_ratings";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const ADDRESS_CONFIRM_FINGERPRINT_KEY = "stopmod_address_confirmed_fp";
const AUTH_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const AUTH_TOUCH_MIN_GAP_MS = 15 * 1000;
const PAGBANK_API_BASE_KEY = "stopmod_pagbank_api_base";
const DEFAULT_STORE_PAGBANK_BASE = "/ops-api";
const DEFAULT_REMOTE_PAGBANK_BASE = "https://uzuu-backend.onrender.com";
const LEGACY_REMOTE_PAGBANK_BASES = Object.freeze([
  DEFAULT_REMOTE_PAGBANK_BASE,
  "https://stop-mod-api.onrender.com"
]);
const PAGBANK_RETURN_URL_KEY = "stopmod_pagbank_return_url";
const PAGBANK_REDIRECT_URL_KEY = "stopmod_pagbank_redirect_url";
const PAGBANK_NOTIFICATION_URL_KEY = "stopmod_pagbank_notification_url";
const PAGBANK_PAYMENT_NOTIFICATION_URL_KEY = "stopmod_pagbank_payment_notification_url";
const PAGBANK_SDK_URL = "https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js";
const PAYMENT_METHOD_LABELS = Object.freeze({
  pix: "Pix",
  credito: "Cartao de credito",
  debito: "Cartao de debito",
  boleto: "Boleto"
});
const PENDING_PAYMENT_TTL_MS = 5 * 60 * 60 * 1000;
const ORDER_STATUS_AWAITING_PAYMENT = "Aguardando finalizacao";
const ORDER_STATUS_PROCESSING_PAYMENT = "Processando pagamento";
const ORDER_STATUS_TIMEOUT_CANCELLED = "Cancelado por falta de finalizacao";

const products = Array.isArray(sharedCatalog?.products) && sharedCatalog.products.length ? sharedCatalog.products : [
  { id: 1, name: "Camiseta Oversized Street", category: "Camisetas", size: "P ao GG", price: 89.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Calca Cargo Urban", category: "Calcas", size: "36 ao 46", price: 159.9, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Jaqueta Jeans Vintage", category: "Jaquetas", size: "P ao XG", price: 219.9, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Moletom Essential Stop", category: "Moletons", size: "P ao GG", price: 179.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Vestido Casual Minimal", category: "Vestidos", size: "PP ao G", price: 139.9, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Camisa Linho Leve", category: "Camisas", size: "P ao GG", price: 129.9, image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Cardigan Tricot Cozy", category: "Casacos", size: "P ao G", price: 149.9, image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Blazer Minimal Preto", category: "Blazers", size: "P ao GG", price: 249.9, image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=700&q=80" },
  { id: 9, name: "Saia Midi Plissada", category: "Saias", size: "PP ao G", price: 119.9, image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=700&q=80" },
  { id: 10, name: "Short Alfaiataria", category: "Shorts", size: "36 ao 44", price: 109.9, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=700&q=80" },
  { id: 11, name: "Tenis Street Clean", category: "Calcados", size: "37 ao 43", price: 239.9, image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=700&q=80" },
  { id: 12, name: "Bolsa Tote Minimal", category: "Acessorios", size: "Unico", price: 189.9, image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=700&q=80" },
  { id: 13, name: "Camiseta Basic Premium", category: "Camisetas", size: "P ao GG", price: 99.9, image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=80" },
  { id: 14, name: "Calca Wide Leg Stone", category: "Calcas", size: "36 ao 46", price: 169.9, image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80" },
  { id: 15, name: "Jaqueta Bomber Utility", category: "Jaquetas", size: "P ao XG", price: 259.9, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80" },
  { id: 16, name: "Moletom Canguru Urban", category: "Moletons", size: "P ao GG", price: 199.9, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=700&q=80" },
  { id: 17, name: "Vestido Midi Floral Fresh", category: "Vestidos", size: "PP ao G", price: 159.9, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=80" },
  { id: 18, name: "Camisa Social Slim", category: "Camisas", size: "P ao GG", price: 149.9, image: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=700&q=80" },
  { id: 19, name: "Saia Jeans Cargo", category: "Saias", size: "36 ao 46", price: 129.9, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80" },
  { id: 20, name: "Regata Canelada Soft", category: "Blusas", size: "PP ao GG", price: 89.9, image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80" },
  { id: 21, name: "Conjunto Tricot Elegance", category: "Conjuntos", size: "P ao G", price: 219.9, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80" }
];

const productById = new Map(products.map((p) => [p.id, p]));

function resolveCanonicalProductId(value) {
  const numericId = Number(value);
  if (!Number.isInteger(numericId) || numericId <= 0) return 0;
  if (productById.has(numericId)) return numericId;

  const legacyAlias = numericId - 1000;
  if (Number.isInteger(legacyAlias) && productById.has(legacyAlias)) {
    return legacyAlias;
  }

  return 0;
}

function resolveProductById(value) {
  const canonicalId = resolveCanonicalProductId(value);
  if (!canonicalId) return null;
  return productById.get(canonicalId) || null;
}

const cartItems = document.getElementById("cart-items");
const productsBeforeWrap = document.getElementById("products-before-wrap");
const productsBeforeMain = document.getElementById("products-before-main");
const productsBeforeCents = document.getElementById("products-before-cents");
const productsNowMain = document.getElementById("products-now-main");
const productsNowCents = document.getElementById("products-now-cents");
const cartTotalMain = document.getElementById("cart-total-main");
const cartTotalCents = document.getElementById("cart-total-cents");
const itemsCount = document.getElementById("items-count");
const shippingValue = document.getElementById("shipping-value");
const freeShipCount = document.getElementById("free-ship-count");
const couponCount = document.getElementById("coupon-count");
const feedback = document.getElementById("feedback");
const checkoutBtn = document.getElementById("checkout");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const shipSummary = document.getElementById("ship-summary");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const paymentSelected = document.getElementById("payment-selected");
const checkoutModal = document.getElementById("checkout-modal");
const paymentForm = document.getElementById("payment-form");
const confirmPaymentBtn = document.getElementById("confirm-payment");
const cardKindSelect = document.getElementById("card-kind-select");
const checkoutCardNumber = document.getElementById("checkout-card-number");
const checkoutCardHolder = document.getElementById("checkout-card-holder");
const checkoutCardExpiry = document.getElementById("checkout-card-expiry");
const checkoutCardCvv = document.getElementById("checkout-card-cvv");
const checkoutCardTaxId = document.getElementById("checkout-card-tax-id");
const checkoutCardInstallments = document.getElementById("checkout-card-installments");
const morePaymentOptions = document.getElementById("more-payment-options");
const toggleMorePaymentsBtn = document.getElementById("toggle-more-payments");
const checkoutAddressLine = document.getElementById("checkout-address-line");
const checkoutAddressShip = document.getElementById("checkout-address-ship");
const checkoutFeedback = document.getElementById("checkout-feedback");
const confirmAddress = document.getElementById("confirm-address");
const checkoutSummaryImage = document.getElementById("checkout-summary-image");
const checkoutSummaryName = document.getElementById("checkout-summary-name");
const checkoutSummaryMeta = document.getElementById("checkout-summary-meta");
const checkoutSummaryQty = document.getElementById("checkout-summary-qty");
const checkoutSummarySubtotal = document.getElementById("checkout-summary-subtotal");
const checkoutSummaryShipping = document.getElementById("checkout-summary-shipping");
const checkoutSummaryTotal = document.getElementById("checkout-summary-total");
const checkoutPremiumTabs = Array.from(document.querySelectorAll("[data-payment-tab]"));
const checkoutPremiumPanels = Array.from(document.querySelectorAll("[data-payment-panel]"));
const inlinePayModal = document.getElementById("inline-pay-modal");
const inlinePayContent = document.getElementById("inline-pay-content");
const inlinePayStatus = document.getElementById("inline-pay-status");
const inlinePayOpenLink = document.getElementById("inline-pay-open-link");
const inlinePayDoneBtn = document.getElementById("inline-pay-done");
const addressInlineText = document.getElementById("address-inline-text");
const addressInlineState = document.getElementById("address-inline-state");
const addressInlineConfirm = document.getElementById("address-inline-confirm");
const confirmPaymentDefaultLabel = String(confirmPaymentBtn?.textContent || "Continuar");

let lastAuthTouchAt = 0;
let pagBankSdkPromise = null;
let pagBankPublicKeyCache = "";
let transparentCardContext = null;

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function productHref(id) {
  if (sharedCatalog?.productHref) return sharedCatalog.productHref(id);
  return `../produtos/?id=${encodeURIComponent(String(id))}`;
}


function parseIsoMs(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paymentLabel(method) {
  return PAYMENT_METHOD_LABELS[String(method || "").trim()] || "";
}

function moneyParts(value) {
  const fixed = (Number(value) || 0).toFixed(2);
  const [a, b] = fixed.split(".");
  const main = Number(a).toLocaleString("pt-BR");
  return { main, cents: b || "00" };
}

function moneyToCents(value) {
  return Math.round((Number(value) || 0) * 100);
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeBarcodeDigits(value) {
  return digitsOnly(value).slice(0, 80);
}

function buildBarcodeImageUrl(value) {
  const digits = normalizeBarcodeDigits(value);
  if (digits.length < 20) return "";
  const params = new URLSearchParams({
    bcid: "code128",
    text: digits,
    includetext: "false",
    scale: "2",
    height: "14",
    paddingwidth: "8",
    paddingheight: "4"
  });
  return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
}

function optionalHttpUrlFromStorage(key) {
  const value = String(localStorage.getItem(key) || "").trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : "";
}

function normalizeApiBase(raw) {
  const base = String(raw || "").trim().replace(/\/+$/, "");
  if (!base) return "";
  if (/^https?:\/\//i.test(base)) return base;
  if (base.startsWith("/")) return base;
  return "";
}

function resolveForcedApiBase() {
  const fromWindow = normalizeApiBase(window.__UZUU_API_BASE__ || "");
  if (fromWindow) return fromWindow;
  const fromDocument = normalizeApiBase(document.documentElement?.getAttribute("data-api-base") || "");
  if (fromDocument) return fromDocument;
  return "";
}

function buildApiUrlFromBase(rawBase, rawPath) {
  const cleanPath = String(rawPath || "").startsWith("/") ? String(rawPath || "") : `/${String(rawPath || "")}`;
  const base = normalizeApiBase(rawBase);
  if (!base) return cleanPath;
  if (base.startsWith("/") && /^\/api(\/|$)/i.test(cleanPath)) {
    return `${base}${cleanPath.replace(/^\/api/i, "")}`;
  }
  if (/\/api$/i.test(base) && /^\/api(\/|$)/i.test(cleanPath)) {
    return `${base}${cleanPath.replace(/^\/api/i, "")}`;
  }
  return `${base}${cleanPath}`;
}

function buildPagBankInlineEndpointFromBase(raw) {
  return buildApiUrlFromBase(raw, "/api/pagbank/inline-payment");
}

function buildPagBankPublicKeyEndpointFromBase(raw) {
  return buildApiUrlFromBase(raw, "/api/pagbank/public-key");
}

function isProdStoreHost() {
  const host = String(window.location.hostname || "").toLowerCase();
  return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".onrender.com");
}

function isRenderApiBase(value) {
  const base = normalizeApiBase(value);
  if (!/^https?:\/\//i.test(base)) return false;
  try {
    return new URL(base).hostname.toLowerCase().endsWith(".onrender.com");
  } catch {
    return false;
  }
}

function readConfiguredPagBankApiBase() {
  const configured = normalizeApiBase(localStorage.getItem(PAGBANK_API_BASE_KEY) || "");
  if (!configured) return "";
  if (LEGACY_REMOTE_PAGBANK_BASES.includes(configured) || (isProdStoreHost() && isRenderApiBase(configured))) {
    localStorage.removeItem(PAGBANK_API_BASE_KEY);
    return "";
  }
  return configured;
}

function rememberPagBankApiBase(rawBase) {
  const base = normalizeApiBase(rawBase);
  if (!base) {
    localStorage.removeItem(PAGBANK_API_BASE_KEY);
    return;
  }
  localStorage.setItem(PAGBANK_API_BASE_KEY, base);
}

function resolvePagBankInlineEndpoint() {
  const forced = resolveForcedApiBase();
  if (forced) return buildPagBankInlineEndpointFromBase(forced);
  return buildPagBankInlineEndpointFromBase(readConfiguredPagBankApiBase());
}

function buildOrderAlertEndpointFromBase(raw) {
  return buildApiUrlFromBase(raw, "/api/alerts/order-event");
}

function deriveApiBaseFromPaymentEndpoint(paymentEndpoint) {
  const endpoint = String(paymentEndpoint || "").trim().replace(/\/+$/, "");
  if (!endpoint) return "";
  if (/\/(?:ops-api|api)\/pagbank\/inline-payment$/i.test(endpoint)) {
    return endpoint.replace(/\/pagbank\/inline-payment$/i, "");
  }
  return "";
}

function resolvePagBankEndpointCandidates() {
  const configured = readConfiguredPagBankApiBase();
  const forced = resolveForcedApiBase();
  const candidates = [];
  const pushUnique = (value) => {
    const normalized = normalizeApiBase(value);
    if (!normalized || candidates.includes(normalized)) return;
    candidates.push(normalized);
  };

  pushUnique(forced);
  pushUnique(configured);

  if (isProdStoreHost()) {
    pushUnique(DEFAULT_STORE_PAGBANK_BASE);
  } else {
    pushUnique("http://localhost:8787");
    pushUnique(DEFAULT_REMOTE_PAGBANK_BASE);
  }

  return candidates.map((base) => ({
    base,
    endpoint: buildPagBankInlineEndpointFromBase(base)
  }));
}

function resolvePagBankPublicKeyEndpointCandidates() {
  const configured = readConfiguredPagBankApiBase();
  const forced = resolveForcedApiBase();
  const candidates = [];
  const pushUnique = (value) => {
    const normalized = normalizeApiBase(value);
    if (!normalized || candidates.includes(normalized)) return;
    candidates.push(normalized);
  };

  pushUnique(forced);
  pushUnique(configured);

  if (isProdStoreHost()) {
    pushUnique(DEFAULT_STORE_PAGBANK_BASE);
  } else {
    pushUnique("http://localhost:8787");
    pushUnique(DEFAULT_REMOTE_PAGBANK_BASE);
  }

  return candidates.map((base) => ({
    base,
    endpoint: buildPagBankPublicKeyEndpointFromBase(base)
  }));
}

function resolveOrderAlertEndpoint(options = {}) {
  const fromBase = buildOrderAlertEndpointFromBase(options?.apiBase || "");
  if (fromBase) return fromBase;
  const fromEndpoint = buildOrderAlertEndpointFromBase(deriveApiBaseFromPaymentEndpoint(options?.paymentEndpoint || ""));
  if (fromEndpoint) return fromEndpoint;
  if (isProdStoreHost()) return buildOrderAlertEndpointFromBase(DEFAULT_STORE_PAGBANK_BASE);
  return buildOrderAlertEndpointFromBase("http://localhost:8787");
}

function sendOrderLifecycleEmailAlert(eventType, order, options = {}) {
  const event = String(eventType || "").trim().toLowerCase();
  if (!event || !order || typeof order !== "object") return;
  const endpoint = resolveOrderAlertEndpoint(options);
  const payload = {
    eventType: event,
    occurredAt: new Date().toISOString(),
    customer: {
      name: String(order?.ownerName || "").trim(),
      email: String(order?.ownerEmail || "").trim().toLowerCase()
    },
    order: {
      id: String(order?.referenceId || order?.id || "").trim(),
      paymentMethod: String(order?.payment || "").trim(),
      total: Number(order?.totals?.total || 0),
      status: String(order?.tracking?.status || order?.status || "").trim(),
      deadlineAt: String(order?.paymentDeadlineAt || "").trim(),
      cancelReason: String(order?.cancelReason || "").trim()
    }
  };

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {
    // alerta de email nao pode interromper checkout
  });
}

function isNotAllowedHtmlError(message) {
  const text = String(message || "").toLowerCase();
  if (!text) return false;
  if (text.includes("cannot post")) return true;
  if (text.includes("404") && text.includes("not found")) return true;
  return text.includes("405") && text.includes("not allowed");
}

function normalizeCheckoutErrorMessage(error) {
  const raw = String(error?.message || "").trim();
  const lower = raw.toLowerCase();
  const details = Array.isArray(error?.details) ? error.details : [];
  const firstDetail = details[0] && typeof details[0] === "object" ? details[0] : null;
  const detailDescription = String(firstDetail?.description || "").trim();
  const detailParameter = String(firstDetail?.parameter_name || "").trim();

  if (isNotAllowedHtmlError(raw)) {
    return "A rota de pagamento nao esta disponivel neste ambiente agora.";
  }
  if (lower.includes("whitelist access required") || lower.includes("access_denied")) {
    return "A conta PagBank de producao ainda precisa de liberacao para pagamentos por API. Nenhuma cobranca foi feita.";
  }
  if (lower.includes("falha ao consultar o pagbank (404)") || lower.includes("pagbank (404)")) {
    return "A API de cartao do PagBank nao esta liberada para esse ambiente. Nenhuma cobranca foi feita.";
  }
  if (lower.includes("failed to fetch") || lower.includes("connection refused")) {
    return "Nao foi possivel conectar ao gateway de pagamento no momento.";
  }
  if (
    detailParameter === "customer.email" &&
    detailDescription.toLowerCase().includes("buyer email must not be equals to merchant email")
  ) {
    return "No ambiente de teste do PagBank, o e-mail do comprador nao pode ser o mesmo da conta vendedora.";
  }
  if (detailDescription) {
    return raw ? `${raw} ${detailDescription}` : detailDescription;
  }
  return raw || "tente novamente.";
}

async function postJson(url, payload, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 15000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = String(data?.message || data?.error || text || `HTTP ${response.status}`);
      const error = new Error(message);
      if (data?.details) {
        error.details = data.details;
      }
      throw error;
    }

    return data || {};
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Tempo esgotado ao iniciar pagamento no PagBank.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getJson(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 15000);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(String(data?.message || data?.error || text || `HTTP ${response.status}`));
    }

    return data || {};
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Tempo esgotado ao consultar o PagBank.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function loadPagBankSdk() {
  if (window.PagSeguro?.encryptCard) {
    return Promise.resolve(window.PagSeguro);
  }
  if (pagBankSdkPromise) {
    return pagBankSdkPromise;
  }

  pagBankSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAGBANK_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PagSeguro), { once: true });
      existing.addEventListener("error", () => reject(new Error("Nao foi possivel carregar o SDK do PagBank.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PAGBANK_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.PagSeguro?.encryptCard) {
        resolve(window.PagSeguro);
        return;
      }
      reject(new Error("SDK do PagBank carregado sem o recurso de criptografia."));
    };
    script.onerror = () => reject(new Error("Nao foi possivel carregar o SDK do PagBank."));
    document.body.appendChild(script);
  });

  return pagBankSdkPromise;
}

async function fetchPagBankPublicKey() {
  if (pagBankPublicKeyCache) {
    return {
      publicKey: pagBankPublicKeyCache,
      apiBase: resolveForcedApiBase() || readConfiguredPagBankApiBase() || DEFAULT_STORE_PAGBANK_BASE
    };
  }

  const candidates = resolvePagBankPublicKeyEndpointCandidates();
  let lastError = null;
  for (const candidate of candidates) {
    try {
      const data = await getJson(candidate.endpoint, 15000);
      const publicKey = String(data?.publicKey || "").trim();
      if (!publicKey) {
        throw new Error("Chave publica do PagBank indisponivel.");
      }
      pagBankPublicKeyCache = publicKey;
      rememberPagBankApiBase(candidate.base);
      return {
        publicKey,
        apiBase: candidate.base
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Nao foi possivel consultar a chave publica do PagBank.");
}

function normalizeCardNumber(value) {
  return digitsOnly(value).slice(0, 19);
}

function formatCardNumber(value) {
  return normalizeCardNumber(value).replace(/(.{4})/g, "$1 ").trim();
}

function normalizeCardExpiry(raw) {
  const digits = digitsOnly(raw).slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function parseCardExpiry(raw) {
  const digits = digitsOnly(raw);
  if (digits.length < 4) return { expMonth: "", expYear: "" };
  const expMonth = digits.slice(0, 2);
  const yearPart = digits.slice(2);
  const expYear = yearPart.length === 2 ? `20${yearPart}` : yearPart.slice(0, 4);
  return { expMonth, expYear };
}

function loadCartIds() {
  if (sharedCatalog?.loadCartIds) {
    const normalized = sharedCatalog
      .loadCartIds()
      .map((item) => resolveCanonicalProductId(item))
      .filter((item) => Number.isInteger(item) && item > 0);

    if (normalized.length) {
      return normalized;
    }
  }
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    const normalized = raw
      .map((item) => {
        if (Number.isInteger(Number(item))) return Number(item);
        if (item && typeof item === "object") {
          return resolveCanonicalProductId(item.productId ?? item.id ?? item.product ?? 0);
        }
        return Number.NaN;
      })
      .filter((item) => Number.isInteger(item) && item > 0 && productById.has(item));
    if (normalized.length !== raw.length) {
      saveCartIds(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function loadProfileExtra() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_EXTRA_KEY) || "null");
    return raw && typeof raw === "object" ? raw : null;
  } catch {
    return null;
  }
}

function loadCheckoutCustomer() {
  const profile = loadProfile() || {};
  const extra = loadProfileExtra() || {};
  return {
    name: String(profile?.name || extra?.fullName || extra?.displayName || "").trim(),
    email: String(profile?.email || extra?.email || "").trim().toLowerCase(),
    cpf: digitsOnly(extra?.cpf || profile?.cpf || ""),
    phone: digitsOnly(extra?.phone || profile?.phone || "")
  };
}

function requiresCheckoutRegistrationCompletion() {
  const extra = loadProfileExtra() || {};
  return extra?.googlePending === true || extra?.registrationComplete === false;
}

function redirectToRegistrationCompletion() {
  const nextPath = `${window.location.pathname || "/carrinho/"}${window.location.search || ""}${window.location.hash || ""}` || "/carrinho/";
  window.location.href = `/login/?complete=1&next=${encodeURIComponent(nextPath)}`;
}

function renderTopProfile() {
  if (!profileTopLink || !profileTopName) return;
  const profile = loadProfile();
  if (!profile) {
    profileTopName.textContent = "Perfil";
    profileTopLink.classList.remove("logged");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.removeAttribute("src");
      profileTopPhoto.alt = "";
    }
    return;
  }

  const displayName = String(profile.name || "").trim().split(/\s+/)[0] || "Perfil";
  const picture = String(profile.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.classList.add("logged");
  profileTopLink.setAttribute("aria-label", `Perfil de ${displayName}`);
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function clearAuthSession() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(AUTH_LAST_SEEN_KEY);
}

function hasActiveAuthSession() {
  const profile = loadProfile();
  if (!profile) return false;

  const rawLastSeen = Number(localStorage.getItem(AUTH_LAST_SEEN_KEY) || "0");
  if (!Number.isFinite(rawLastSeen) || rawLastSeen <= 0) {
    localStorage.setItem(AUTH_LAST_SEEN_KEY, String(Date.now()));
    return true;
  }

  if (Date.now() - rawLastSeen > AUTH_TIMEOUT_MS) {
    clearAuthSession();
    return false;
  }

  return true;
}

function touchAuthSession(force) {
  if (!hasActiveAuthSession()) return;
  const now = Date.now();
  if (!force && now - lastAuthTouchAt < AUTH_TOUCH_MIN_GAP_MS) return;
  lastAuthTouchAt = now;
  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(now));
}

function bindAuthActivity() {
  const touch = () => touchAuthSession(false);
  ["pointerdown", "keydown", "touchstart", "mousemove", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, touch, { passive: true });
  });
  window.addEventListener("focus", touch);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) touch();
  });
}

function saveCartIds(ids) {
  if (sharedCatalog?.saveCartIds) {
    sharedCatalog.saveCartIds(ids);
    return;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function loadShipTo() {
  // New format: JSON { street, number, city, cep }
  try {
    const raw = localStorage.getItem(SHIP_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") {
        return {
          street: String(obj.street || "").trim(),
          number: String(obj.number || "").trim(),
          district: String(obj.district || "").trim(),
          city: String(obj.city || "").trim(),
          state: normalizeState(String(obj.state || "")),
          cep: normalizeCep(String(obj.cep || "")),
          complement: String(obj.complement || "").trim()
        };
      }
    }
  } catch {
    // ignore
  }

  // Legacy: stored CEP string
  const legacy = String(localStorage.getItem(LEGACY_SHIP_KEY) || "").trim();
  if (legacy) {
    const to = { street: "", number: "", district: "", city: "", state: "", cep: normalizeCep(legacy), complement: "" };
    try {
      localStorage.setItem(SHIP_KEY, JSON.stringify(to));
    } catch {
      // ignore
    }
    return to;
  }
  return { street: "", number: "", district: "", city: "", state: "", cep: "", complement: "" };
}

function shipSummaryText(to) {
  const street = String(to?.street || "").trim();
  const number = String(to?.number || "").trim();
  const streetLine = street ? [street, number].filter(Boolean).join(", ") : "";
  return streetLine || "Rua nao informada";
}

function addressLineText(to) {
  const street = String(to?.street || "").trim();
  const number = String(to?.number || "").trim();
  const city = String(to?.city || "").trim();
  const cep = String(to?.cep || "").trim();

  const lineA = street ? [street, number].filter(Boolean).join(", ") : "";
  const lineB = [city, cep].filter(Boolean).join(" ");

  if (lineA && lineB) return `${lineA} - ${lineB}`;
  if (lineA) return lineA;
  if (lineB) return lineB;
  return "Rua nao informada";
}

function shipValueText(value) {
  if (value === null) return "Frete: informe o CEP";
  if (value === 0) return "Frete: Gratis";
  return `Frete: R$ ${formatBRL(value)}`;
}

function addressFingerprint(to) {
  const street = normalizeText(to?.street || "");
  const number = normalizeText(to?.number || "");
  const city = normalizeText(to?.city || "");
  const cep = String(to?.cep || "").replace(/\D/g, "");
  return [street, number, city, cep].join("|");
}

function isAddressConfirmed(to) {
  const fp = addressFingerprint(to);
  if (!fp || !isCepValid(to?.cep)) return false;
  return String(localStorage.getItem(ADDRESS_CONFIRM_FINGERPRINT_KEY) || "") === fp;
}

function setAddressConfirmed(to, confirmed) {
  if (!confirmed) {
    localStorage.removeItem(ADDRESS_CONFIRM_FINGERPRINT_KEY);
    return;
  }
  const fp = addressFingerprint(to);
  if (!fp || !isCepValid(to?.cep)) return;
  localStorage.setItem(ADDRESS_CONFIRM_FINGERPRINT_KEY, fp);
}

function clearCheckoutFeedback() {
  if (!checkoutFeedback) return;
  checkoutFeedback.textContent = "";
  checkoutFeedback.classList.remove("error");
}

function setCheckoutFeedback(text, isError) {
  if (!checkoutFeedback) return;
  checkoutFeedback.textContent = String(text || "");
  checkoutFeedback.classList.toggle("error", !!isError);
}

function renderAddressConfirmation() {
  const to = loadShipTo();
  const ids = loadCartIds();
  const subtotal = groupedCart(ids).reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calcShipping(subtotal, ids.length, to.cep);
  const confirmed = isAddressConfirmed(to);

  if (checkoutAddressLine) checkoutAddressLine.textContent = addressLineText(to);
  if (checkoutAddressShip) {
    checkoutAddressShip.textContent = shipValueText(shipping);
    checkoutAddressShip.classList.toggle("free", shipping === 0);
  }

  if (addressInlineText) {
    addressInlineText.textContent = `Endereco padrao: ${addressLineText(to)}`;
  }
  if (addressInlineState) {
    addressInlineState.textContent = confirmed ? "Endereco confirmado" : "Aguardando confirmacao";
    addressInlineState.classList.toggle("ok", confirmed);
  }
  if (addressInlineConfirm) {
    addressInlineConfirm.textContent = confirmed ? "Confirmado" : "Confirmar endereco";
    addressInlineConfirm.classList.toggle("confirmed", confirmed);
  }
  if (confirmAddress) {
    confirmAddress.checked = confirmed;
  }
}

function normalizeCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeState(value) {
  return String(value || "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

function isCepValid(value) {
  return String(value || "").replace(/\D/g, "").length === 8;
}

function loadCoupons() {
  try {
    const raw = JSON.parse(localStorage.getItem(COUPON_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((c) => String(c || "").trim().toUpperCase()).filter(Boolean);
  } catch {
    return [];
  }
}

function saveCoupons(coupons) {
  localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
}

function loadOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function loadSoldCounters() {
  try {
    const raw = JSON.parse(localStorage.getItem(SOLD_COUNTS_KEY) || "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw;
  } catch {
    return {};
  }
}

function saveSoldCounters(counters) {
  localStorage.setItem(SOLD_COUNTS_KEY, JSON.stringify(counters || {}));
}

function loadRatingStatsMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw;
  } catch {
    return {};
  }
}

function saveRatingStatsMap(stats) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(stats || {}));
}

function estimateAutoRatingByProduct(id) {
  const base = Number(id) || 0;
  const raw = 4.6 + (base % 5) * 0.08;
  return Math.max(1, Math.min(5, Number(raw.toFixed(2))));
}

function registerSoldItemsFromCheckout(items) {
  if (!Array.isArray(items) || !items.length) return;
  const counters = loadSoldCounters();

  items.forEach((item) => {
    const id = Number(item?.id);
    const qty = Number(item?.quantity);
    if (!Number.isInteger(id) || id <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;
    const prev = Number(counters[String(id)] || 0);
    counters[String(id)] = Math.max(0, Math.floor(prev + qty));
  });

  saveSoldCounters(counters);
}

function registerRatingFromCheckout(items) {
  if (!Array.isArray(items) || !items.length) return;
  const stats = loadRatingStatsMap();

  items.forEach((item) => {
    const id = Number(item?.id);
    const qty = Number(item?.quantity);
    if (!Number.isInteger(id) || id <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    const key = String(id);
    const prevSum = Number(stats[key]?.sum || 0);
    const prevCount = Number(stats[key]?.count || 0);
    const score = estimateAutoRatingByProduct(id);

    stats[key] = {
      sum: Math.max(0, prevSum + score * qty),
      count: Math.max(0, Math.floor(prevCount + qty))
    };
  });

  saveRatingStatsMap(stats);
}

function loadNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(Array.isArray(notes) ? notes : []));
}

function upsertNotification(payload) {
  const safe = {
    id: String(payload?.id || "").trim(),
    scope: "individual",
    type: "pedido",
    userKey: String(payload?.userKey || "").trim().toLowerCase(),
    title: String(payload?.title || "Notificacao"),
    text: String(payload?.text || ""),
    href: String(payload?.href || "/perfil/processando/"),
    date: String(payload?.date || "Agora"),
    createdAt: String(payload?.createdAt || new Date().toISOString())
  };
  if (!safe.id) return;

  if (window.StopModNotifications && typeof window.StopModNotifications.add === "function") {
    window.StopModNotifications.add(safe);
    if (typeof window.StopModNotifications.sync === "function") {
      window.StopModNotifications.sync();
    }
    return;
  }

  const notes = loadNotes();
  const idx = notes.findIndex((note) => String(note?.id || "") === safe.id);
  if (idx >= 0) notes[idx] = { ...notes[idx], ...safe };
  else notes.unshift(safe);
  saveNotes(notes.slice(0, 500));
}

function loadPayment() {
  const method = String(localStorage.getItem(PAY_KEY) || "").trim();
  return /^(pix|credito|debito|boleto)$/.test(method) ? method : "";
}

function savePayment(method) {
  const value = String(method || "").trim();
  if (!/^(pix|credito|debito|boleto)$/.test(value)) return;
  localStorage.setItem(PAY_KEY, value);
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function openStoreProductSearch() {
  const query = String(searchInput?.value || "").trim();
  const target = query ? `/?q=${encodeURIComponent(query)}#produtos` : "/#produtos";
  window.location.href = target;
}

function redirectToLoginForCheckout() {
  const nextPath = `${window.location.pathname || "/carrinho/"}${window.location.search || ""}${window.location.hash || ""}` || "/carrinho/";
  window.location.href = `/login/?next=${encodeURIComponent(nextPath)}`;
}

function groupedCart(ids) {
  const map = new Map();
  ids.forEach((id) => {
    const p = resolveProductById(id);
    if (!p) return;
    const cur = map.get(p.id) || { ...p, qty: 0 };
    cur.qty += 1;
    map.set(p.id, cur);
  });
  return Array.from(map.values());
}

function addOne(id) {
  const canonicalId = resolveCanonicalProductId(id);
  if (!canonicalId) return;
  const ids = loadCartIds();
  if (ids.length >= MAX_CART_ITEMS) {
    feedback.textContent = "Limite de 2000 itens no carrinho atingido.";
    return;
  }
  ids.push(canonicalId);
  saveCartIds(ids);
  renderCart();
}

function removeOne(id) {
  const canonicalId = resolveCanonicalProductId(id);
  if (!canonicalId) return;
  const ids = loadCartIds();
  const idx = ids.indexOf(canonicalId);
  if (idx === -1) return;
  ids.splice(idx, 1);
  saveCartIds(ids);
  renderCart();
}

function calcShipping(subtotal, itemCount, cep) {
  if (!isCepValid(cep)) return null;
  const free = subtotal > 50;
  return free ? 0 : 19.9;
}

function calcDiscount(subtotal, coupons) {
  const unique = Array.from(new Set(coupons)).slice(0, 1);
  if (!unique.length) return 0;
  // Simples: 10% com 1 cupom (demo).
  return subtotal * 0.1;
}

function checkoutSnapshot() {
  const ids = loadCartIds();
  const grouped = groupedCart(ids);
  const shipTo = loadShipTo();
  const coupons = loadCoupons();
  const subtotal = grouped.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calcShipping(subtotal, ids.length, shipTo.cep);
  const discount = calcDiscount(subtotal, coupons);
  const total = Math.max(0, Math.max(0, subtotal - discount) + (shipping ?? 0));

  return {
    ids,
    grouped,
    shipTo,
    coupons,
    subtotal,
    shipping: shipping ?? 0,
    discount,
    total
  };
}

function buildPagBankCheckoutPayload(paymentMethod) {
  const snapshot = checkoutSnapshot();
  if (!snapshot.ids.length || !snapshot.grouped.length) return null;

  const customer = loadCheckoutCustomer();
  const returnUrl = optionalHttpUrlFromStorage(PAGBANK_RETURN_URL_KEY);
  const redirectUrl = optionalHttpUrlFromStorage(PAGBANK_REDIRECT_URL_KEY);
  const notificationUrl = optionalHttpUrlFromStorage(PAGBANK_NOTIFICATION_URL_KEY);
  const paymentNotificationUrl = optionalHttpUrlFromStorage(PAGBANK_PAYMENT_NOTIFICATION_URL_KEY);

  return {
    referenceId: genOrderId(),
    paymentMethod: String(paymentMethod || "").trim(),
    customer,
    coupon: snapshot.coupons[0] || "",
    shipTo: snapshot.shipTo,
    discountAmount: moneyToCents(snapshot.discount),
    shippingAmount: moneyToCents(snapshot.shipping),
    items: snapshot.grouped.map((item) => ({
      id: String(item.id),
      referenceId: `SKU-${item.id}`,
      name: String(item.name || "").trim(),
      description: [item.category, item.size].filter(Boolean).join(" | ").slice(0, 240),
      quantity: Number(item.qty) || 1,
      unitAmount: moneyToCents(item.price)
    })),
    totals: {
      subtotal: moneyToCents(snapshot.subtotal),
      discount: moneyToCents(snapshot.discount),
      shipping: moneyToCents(snapshot.shipping),
      total: moneyToCents(snapshot.total)
    },
    returnUrl,
    redirectUrl,
    notificationUrl,
    paymentNotificationUrl
  };
}

function genOrderId() {
  const rnd = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `SM-${Date.now().toString(36).toUpperCase()}-${rnd}`;
}

function genTrackingCode() {
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BR${rnd}`;
}

function mapPayloadItemsToOrderItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const id = Number(item?.id);
      const product = productById.get(id);
      const qty = Math.max(1, Number(item?.quantity) || 1);
      const unitAmount = Number(item?.unitAmount || 0);
      const price = Number.isFinite(unitAmount) ? unitAmount / 100 : Number(product?.price || 0);
      return {
        id,
        name: String(item?.name || product?.name || `Produto ${id}`),
        price: Number(price) || 0,
        qty,
        image: String(product?.image || ""),
        category: String(product?.category || ""),
        size: String(product?.size || "")
      };
    })
    .filter((item) => Number.isInteger(item.id) && item.id > 0);
}

function buildOrderTotalsFromPayload(payloadTotals) {
  const subtotal = (Number(payloadTotals?.subtotal) || 0) / 100;
  const shipping = (Number(payloadTotals?.shipping) || 0) / 100;
  const discount = (Number(payloadTotals?.discount) || 0) / 100;
  const total = (Number(payloadTotals?.total) || 0) / 100;
  return {
    subtotal: Number(subtotal) || 0,
    shipping: Number(shipping) || 0,
    discount: Number(discount) || 0,
    total: Number(total) || 0
  };
}

function addPendingPaymentNotification(order) {
  if (!order?.id) return;
  const owner = String(order?.ownerEmail || "").trim().toLowerCase();
  upsertNotification({
    id: `order-${order.id}-payment-pending`,
    userKey: owner,
    title: `Pedido ${order.id} aguardando finalizacao`,
    text: "Finalize o pagamento em ate 5 horas para evitar cancelamento automatico.",
    href: "/perfil/processando/",
    createdAt: new Date().toISOString()
  });
}

function addTimeoutCancellationNotification(order) {
  if (!order?.id) return;
  const owner = String(order?.ownerEmail || "").trim().toLowerCase();
  upsertNotification({
    id: `order-${order.id}-payment-timeout`,
    userKey: owner,
    title: `Pedido ${order.id} cancelado por tempo`,
    text: "Seu pedido nao foi finalizado dentro de 5 horas e foi cancelado automaticamente.",
    href: "/perfil/processando/",
    createdAt: new Date().toISOString()
  });
}

function addProcessingNotification(order) {
  if (!order?.id) return;
  const owner = String(order?.ownerEmail || "").trim().toLowerCase();
  upsertNotification({
    id: `order-${order.id}-payment-finalized`,
    userKey: owner,
    title: `Pedido ${order.id} em processamento`,
    text: "Pagamento informado. Aguarde a confirmacao na aba Processando.",
    href: "/perfil/processando/",
    createdAt: new Date().toISOString()
  });
}

function createPendingOrderFromCheckout(payload, paymentMethod, referenceId, options = {}) {
  if (!payload || !Array.isArray(payload.items) || !payload.items.length) return null;
  const profile = loadProfile();
  const customer = loadCheckoutCustomer();
  const shipTo = payload?.shipTo && typeof payload.shipTo === "object" ? payload.shipTo : loadShipTo();
  const nowIso = new Date().toISOString();
  const deadlineIso = new Date(Date.now() + PENDING_PAYMENT_TTL_MS).toISOString();
  const orderId = String(referenceId || payload.referenceId || genOrderId()).trim() || genOrderId();
  const method = String(paymentMethod || payload.paymentMethod || "pix").trim();
  const totals = buildOrderTotalsFromPayload(payload?.totals || {});
  const items = mapPayloadItemsToOrderItems(payload.items);
  if (!items.length) return null;

  const orders = loadOrders();
  const idx = orders.findIndex((item) => {
    const itemRef = String(item?.referenceId || item?.id || "").trim();
    return itemRef && itemRef === orderId;
  });
  const previous = idx >= 0 ? orders[idx] : null;

  const order = {
    id: orderId,
    referenceId: orderId,
    createdAt: nowIso,
    ownerName: String(profile?.name || customer?.name || "").trim(),
    ownerEmail: String(profile?.email || customer?.email || "").trim().toLowerCase(),
    payment: method,
    shipTo,
    coupon: String(payload?.coupon || "").trim(),
    totals,
    tracking: { code: genTrackingCode(), status: ORDER_STATUS_AWAITING_PAYMENT },
    status: ORDER_STATUS_AWAITING_PAYMENT,
    awaitingPayment: true,
    paymentStartedAt: nowIso,
    paymentDeadlineAt: deadlineIso,
    pendingAlertSent: !!previous?.pendingAlertSent,
    timeoutAlertSent: !!previous?.timeoutAlertSent,
    processingAlertSent: !!previous?.processingAlertSent,
    items
  };

  const shouldSendPendingAlert = !order.pendingAlertSent;
  if (shouldSendPendingAlert) {
    order.pendingAlertSent = true;
  }

  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      ...order,
      tracking: { ...(orders[idx]?.tracking || {}), ...(order.tracking || {}) }
    };
  } else {
    orders.unshift(order);
  }
  saveOrders(orders.slice(0, 100));
  addPendingPaymentNotification(order);
  if (shouldSendPendingAlert) {
    sendOrderLifecycleEmailAlert("payment_pending", order, { paymentEndpoint: options?.paymentEndpoint || "" });
  }
  return order;
}

function resolvePendingDeadlineMs(order) {
  const explicit = parseIsoMs(order?.paymentDeadlineAt);
  if (explicit > 0) return explicit;
  const base = parseIsoMs(order?.paymentStartedAt || order?.createdAt);
  if (base <= 0) return 0;
  return base + PENDING_PAYMENT_TTL_MS;
}

function isAwaitingPayment(order) {
  const rawStatus = normalizeText(order?.tracking?.status || order?.status || "");
  if (order?.cancelled) return false;
  if (order?.awaitingPayment === true) return true;
  return rawStatus.includes("aguard");
}

function sweepPendingOrdersForTimeout() {
  const orders = loadOrders();
  if (!orders.length) return;

  const now = Date.now();
  let changed = false;
  const cancelledOrders = [];

  orders.forEach((order) => {
    if (!order || typeof order !== "object") return;
    if (!isAwaitingPayment(order)) return;

    const deadlineMs = resolvePendingDeadlineMs(order);
    if (deadlineMs <= 0) return;
    if (!order.paymentDeadlineAt) {
      order.paymentDeadlineAt = new Date(deadlineMs).toISOString();
      changed = true;
    }
    if (now < deadlineMs) return;

    order.awaitingPayment = false;
    order.cancelled = true;
    order.cancelReason = "payment_timeout";
    order.cancelledAt = new Date(now).toISOString();
    order.status = ORDER_STATUS_TIMEOUT_CANCELLED;
    order.tracking = {
      ...(order.tracking || {}),
      status: ORDER_STATUS_TIMEOUT_CANCELLED
    };
    order.timeoutAlertSent = true;
    changed = true;
    cancelledOrders.push(order);
  });

  if (changed) {
    saveOrders(orders.slice(0, 100));
  }
  cancelledOrders.forEach((order) => {
    addTimeoutCancellationNotification(order);
    if (!order?.timeoutAlertSent) return;
    sendOrderLifecycleEmailAlert("payment_timeout", order);
  });
}

function readPendingCheckoutReference() {
  try {
    const raw = JSON.parse(localStorage.getItem("stopmod_pending_checkout") || "null");
    return String(raw?.referenceId || "").trim();
  } catch {
    return "";
  }
}

function markPendingOrderAsProcessing(referenceId) {
  const ref = String(referenceId || "").trim();
  if (!ref) return null;

  const orders = loadOrders();
  if (!orders.length) return null;
  const idx = orders.findIndex((order) => {
    const orderRef = String(order?.referenceId || order?.id || "").trim();
    return orderRef && orderRef === ref;
  });
  if (idx < 0) return null;

  const order = orders[idx];
  if (!order || typeof order !== "object" || order.cancelled === true) return order || null;
  if (!isAwaitingPayment(order)) return order;

  order.awaitingPayment = false;
  order.paymentFinalizedAt = new Date().toISOString();
  order.status = ORDER_STATUS_PROCESSING_PAYMENT;
  order.tracking = {
    ...(order.tracking || {}),
    status: ORDER_STATUS_PROCESSING_PAYMENT
  };
  const shouldSendProcessingAlert = !order.processingAlertSent;
  if (shouldSendProcessingAlert) {
    order.processingAlertSent = true;
  }
  orders[idx] = order;
  saveOrders(orders.slice(0, 100));
  addProcessingNotification(order);
  if (shouldSendProcessingAlert) {
    sendOrderLifecycleEmailAlert("payment_processing", order);
  }
  return order;
}

function setCartExtraSpace(itemCount) {
  const extra = Math.round(Math.min(600, 120 + itemCount * 0.24));
  document.documentElement.style.setProperty("--cart-extra", `${extra}px`);
}

function updatePaymentUI(method) {
  if (!paymentSelected) return;
  const label = paymentLabel(method);
  if (!label) {
    paymentSelected.textContent = "";
    paymentSelected.hidden = true;
    return;
  }
  paymentSelected.textContent = `com ${label}`;
  paymentSelected.hidden = false;
}

function formatCheckoutSummaryShipping(value) {
  if (value === null || Number.isNaN(Number(value))) return "--";
  if (Number(value) === 0) return "Gratis";
  return `R$ ${formatBRL(Number(value) || 0)}`;
}

function setConfirmButtonLabelForMethod(method) {
  if (!confirmPaymentBtn) return;
  confirmPaymentBtn.textContent = confirmPaymentDefaultLabel;
}

function buildInstallmentOptions(total, selectedValue = 1) {
  const safeTotal = Math.max(0, Number(total) || 0);
  const maxInstallments = Math.max(1, Math.min(6, Math.floor(safeTotal / 60) || 1));
  return Array.from({ length: maxInstallments }, (_, index) => {
    const installment = index + 1;
    const label = installment === 1
      ? `1x de R$ ${formatBRL(safeTotal)} sem juros`
      : `${installment}x de R$ ${formatBRL(safeTotal / installment)} sem juros`;
    return `<option value="${installment}"${Number(selectedValue) === installment ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function renderCheckoutModalSnapshot() {
  const snapshot = checkoutSnapshot();
  const firstItem = snapshot.grouped[0] || null;
  const totalUnits = snapshot.grouped.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const extraItems = Math.max(0, snapshot.grouped.length - 1);

  if (checkoutSummaryImage) {
    if (firstItem?.image) {
      checkoutSummaryImage.innerHTML = `<img src="${escapeHtml(firstItem.image)}" alt="${escapeHtml(firstItem.name || "Produto Uzuu")}" loading="lazy" />`;
    } else {
      checkoutSummaryImage.textContent = "UZUU";
    }
  }

  if (checkoutSummaryName) {
    checkoutSummaryName.textContent = firstItem
      ? extraItems > 0
        ? `${firstItem.name} +${extraItems} ${extraItems > 1 ? "itens" : "item"}`
        : firstItem.name
      : "Produto Uzuu";
  }

  if (checkoutSummaryMeta) {
    const meta = firstItem ? [firstItem.category, firstItem.size].filter(Boolean).join(" | ") : "";
    checkoutSummaryMeta.textContent = meta || "Em ate 3 dias uteis";
  }

  if (checkoutSummaryQty) {
    checkoutSummaryQty.textContent = totalUnits === 1 ? "1 unidade" : `${totalUnits} unidades`;
  }

  if (checkoutSummarySubtotal) {
    checkoutSummarySubtotal.textContent = `R$ ${formatBRL(snapshot.subtotal)}`;
  }

  if (checkoutSummaryShipping) {
    checkoutSummaryShipping.textContent = formatCheckoutSummaryShipping(snapshot.shipping);
  }

  if (checkoutSummaryTotal) {
    checkoutSummaryTotal.textContent = `R$ ${formatBRL(snapshot.total)}`;
  }
}

function populateCheckoutCardForm() {
  const view = buildTransparentCardViewModel("credito");
  if (checkoutCardHolder && !String(checkoutCardHolder.value || "").trim()) {
    checkoutCardHolder.value = view.customerName || "";
  }
  if (checkoutCardTaxId && !digitsOnly(checkoutCardTaxId.value).length) {
    checkoutCardTaxId.value = view.customerCpf
      ? view.customerCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : "";
  }
  if (checkoutCardInstallments) {
    const current = Number(checkoutCardInstallments.value || 1) || 1;
    checkoutCardInstallments.innerHTML = buildInstallmentOptions(view.total, current);
  }
}

function syncCheckoutPremiumTabs() {
  if (!paymentForm) return;
  const checked = paymentForm.querySelector('input[name="pay"]:checked');
  const radioValue = String(checked?.value || "").trim().toLowerCase() || "pix";
  const resolvedMethod = radioValue === "credito"
    ? String(cardKindSelect?.value || "credito").trim().toLowerCase() === "debito"
      ? "debito"
      : "credito"
    : radioValue;
  const panelKey = radioValue === "credito" ? "credito" : radioValue;

  checkoutPremiumTabs.forEach((tab) => {
    const tabKey = String(tab.getAttribute("data-payment-tab") || "").trim().toLowerCase();
    const isActive = tabKey === panelKey;
    tab.classList.toggle("is-active", isActive);
  });

  checkoutPremiumPanels.forEach((panel) => {
    const panelName = String(panel.getAttribute("data-payment-panel") || "").trim().toLowerCase();
    const isActive = panelName === panelKey;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  setConfirmButtonLabelForMethod(resolvedMethod);
}

function checkoutPanelForMethod(method) {
  const key = String(method || "").trim().toLowerCase() === "credito" || String(method || "").trim().toLowerCase() === "debito"
    ? "credito"
    : String(method || "").trim().toLowerCase();
  return checkoutPremiumPanels.find((panel) => String(panel.getAttribute("data-payment-panel") || "") === key) || null;
}

function renderCheckoutPaymentResult(data = {}, method = "") {
  const panel = checkoutPanelForMethod(method);
  if (!panel) return false;

  const mode = String(data?.mode || "").trim().toLowerCase();
  const referenceId = escapeHtml(String(data?.referenceId || "").trim());
  const checkoutUrl = escapeHtml(String(data?.paymentUrl || data?.checkout?.payUrl || data?.checkoutUrl || "").trim());
  const expiryText = String(data?.expiresAt || "").trim()
    ? escapeHtml(new Date(String(data.expiresAt)).toLocaleString("pt-BR"))
    : "";

  if (mode === "card") {
    const outcome = buildTransparentCardOutcome(data);
    panel.innerHTML = `
      <div class="checkout-result checkout-result--card">
        <span class="checkout-result__badge">${escapeHtml(outcome.statusLabel)}</span>
        <h3>${escapeHtml(outcome.title)}</h3>
        <p>${escapeHtml(outcome.isSandbox ? outcome.summary : outcome.isError ? outcome.summary : "Seu pedido foi recebido e o pagamento foi confirmado dentro da Uzuu.")}</p>
        ${referenceId ? `<p class="checkout-result__line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
        ${outcome.isSandbox ? "<p class=\"checkout-result__warning\"><strong>Ambiente de teste:</strong> para cobrar de verdade, precisamos trocar o PagBank para producao.</p>" : ""}
        <div class="checkout-result__actions">
          <a class="checkout-result__button" href="../perfil/pedidos/">Ver meu pedido</a>
          <a class="checkout-result__link" href="../">Continuar comprando</a>
        </div>
      </div>
    `;
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = !outcome.isError;
      confirmPaymentBtn.textContent = outcome.isError ? "Tentar novamente" : outcome.isSandbox ? "Teste aprovado" : "Pagamento aprovado";
    }
    return true;
  }

  if (mode === "pix") {
    const qrText = String(data?.pix?.qrText || "").trim();
    const qrSources = resolvePixQrSources(data?.pix || {});
    panel.innerHTML = `
      <div class="checkout-result checkout-result--pix">
        <span class="checkout-result__badge">Pix gerado</span>
        <h3>Pague com Pix</h3>
        <p>Escaneie o QR Code ou copie o codigo Pix. A Uzuu atualiza o pedido automaticamente quando o PagBank confirmar.</p>
        <div id="checkout-pay-qr-slot" class="inline-pay-qr-slot checkout-result__qr"></div>
        ${referenceId ? `<p class="checkout-result__line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
        ${expiryText ? `<p class="checkout-result__line"><strong>Validade:</strong> ${expiryText}</p>` : ""}
        ${qrText ? "<button id=\"checkout-pay-copy\" class=\"checkout-result__button\" type=\"button\">Copiar codigo Pix</button>" : ""}
      </div>
    `;
    const qrSlot = document.getElementById("checkout-pay-qr-slot");
    if (qrSlot) {
      qrSlot.id = "inline-pay-qr-slot";
      attachPixQrImage(qrSources, "Nao foi possivel carregar o QR Code automaticamente. Use o codigo Pix abaixo.");
      qrSlot.id = "checkout-pay-qr-slot";
    }
    document.getElementById("checkout-pay-copy")?.addEventListener("click", async () => {
      if (!qrText) return;
      try {
        await navigator.clipboard.writeText(qrText);
        setCheckoutFeedback("Codigo Pix copiado com sucesso.", false);
      } catch {
        setCheckoutFeedback("Nao foi possivel copiar automaticamente. Copie manualmente o codigo.", true);
      }
    });
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = true;
      confirmPaymentBtn.textContent = "Pix gerado";
    }
    return true;
  }

  if (mode === "boleto") {
    const barcodeFormatted = String(data?.boleto?.formattedBarcode || data?.boleto?.barcode || "").trim();
    const boletoPdf = escapeHtml(String(data?.boleto?.pdfUrl || checkoutUrl || "").trim());
    panel.innerHTML = `
      <div class="checkout-result checkout-result--boleto">
        <span class="checkout-result__badge">Boleto pronto</span>
        <h3>Boleto gerado</h3>
        <p>Use o boleto para concluir o pagamento. Assim que o PagBank confirmar, o pedido sera atualizado automaticamente.</p>
        ${barcodeFormatted ? `<p class="checkout-result__barcode">${escapeHtml(barcodeFormatted)}</p>` : ""}
        ${referenceId ? `<p class="checkout-result__line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
        ${expiryText ? `<p class="checkout-result__line"><strong>Validade:</strong> ${expiryText}</p>` : ""}
        ${boletoPdf ? `<a class="checkout-result__button" href="${boletoPdf}" target="_blank" rel="noopener noreferrer">Abrir boleto</a>` : ""}
      </div>
    `;
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = true;
      confirmPaymentBtn.textContent = "Boleto gerado";
    }
    return true;
  }

  if (hasHostedCheckoutLink(data)) {
    const label = paymentLabel(method) || "PagBank";
    panel.innerHTML = `
      <div class="checkout-result checkout-result--hosted">
        <span class="checkout-result__badge">${escapeHtml(label)}</span>
        <h3>Pagamento pronto</h3>
        <p>O PagBank gerou a proxima etapa para concluir este pagamento.</p>
        ${referenceId ? `<p class="checkout-result__line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
        ${checkoutUrl ? `<a class="checkout-result__button" href="${checkoutUrl}" target="_blank" rel="noopener noreferrer">Concluir pagamento</a>` : ""}
      </div>
    `;
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = true;
      confirmPaymentBtn.textContent = "Pagamento criado";
    }
    return true;
  }

  return false;
}

function openModal() {
  if (!checkoutModal) return;
  renderAddressConfirmation();
  renderCheckoutModalSnapshot();
  populateCheckoutCardForm();
  syncPaymentRadios();
  syncCheckoutPremiumTabs();
  clearCheckoutFeedback();
  checkoutModal.hidden = false;
}

function closeModal() {
  if (!checkoutModal) return;
  clearCheckoutFeedback();
  checkoutModal.hidden = true;
}

function setInlinePayStatus(text, isError) {
  if (!inlinePayStatus) return;
  inlinePayStatus.textContent = String(text || "");
  inlinePayStatus.classList.toggle("error", !!isError);
}

function hasHostedCheckoutLink(data) {
  const paymentUrl = String(data?.paymentUrl || data?.checkout?.payUrl || data?.checkoutUrl || "").trim();
  const mode = String(data?.mode || "").trim().toLowerCase();
  const lifecycleMode = String(data?.lifecycleMode || "").trim().toLowerCase();
  return !!paymentUrl && (mode === "checkout" || lifecycleMode === "provider_webhook");
}

function isProviderManagedPayment(data) {
  const lifecycleMode = String(data?.lifecycleMode || "").trim().toLowerCase();
  return lifecycleMode === "provider_webhook";
}

function setInlinePayDoneVisible(visible) {
  if (!inlinePayDoneBtn) return;
  inlinePayDoneBtn.hidden = !visible;
  inlinePayDoneBtn.style.display = visible ? "" : "none";
}

function hideInlinePayOpenLink() {
  if (!inlinePayOpenLink) return;
  inlinePayOpenLink.hidden = true;
  inlinePayOpenLink.removeAttribute("href");
  inlinePayOpenLink.textContent = "";
}

function showInlinePayOpenLink(text, href) {
  if (!inlinePayOpenLink) return;
  const targetHref = String(href || "").trim();
  if (!targetHref || !/^https?:\/\//i.test(targetHref)) {
    hideInlinePayOpenLink();
    return;
  }
  inlinePayOpenLink.hidden = false;
  inlinePayOpenLink.href = targetHref;
  inlinePayOpenLink.textContent = String(text || "Abrir");
}

function buildInstallmentPreviewLabel(total) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (safeTotal <= 0) return "1x sem juros";
  const count = safeTotal >= 180 ? 3 : safeTotal >= 120 ? 2 : 1;
  if (count <= 1) {
    return `1x de R$ ${formatBRL(safeTotal)} sem juros`;
  }
  return `${count}x de R$ ${formatBRL(safeTotal / count)} sem juros`;
}

function buildHostedCardPreviewModel(data, method) {
  const snapshot = checkoutSnapshot();
  const customer = loadCheckoutCustomer();
  const grouped = Array.isArray(snapshot?.grouped) ? snapshot.grouped : [];
  const primaryItem = grouped[0] || null;
  const itemCount = grouped.reduce((sum, item) => sum + Math.max(1, Number(item?.qty || 1) || 1), 0);
  const subtotal = Number(snapshot?.subtotal || 0);
  const shipping = Number(snapshot?.shipping || 0);
  const total = Number(snapshot?.total || 0);
  const expiryText = String(data?.expiresAt || "").trim()
    ? new Date(String(data.expiresAt)).toLocaleString("pt-BR")
    : "";

  return {
    methodLabel: paymentLabel(method) || "Cartao",
    customerName: String(customer?.name || "Nome do titular").trim() || "Nome do titular",
    customerCpf: String(customer?.cpf || "").trim(),
    productName: String(primaryItem?.name || "Produto Uzuu").trim() || "Produto Uzuu",
    productMeta: [primaryItem?.category, primaryItem?.size].filter(Boolean).join(" • "),
    productImage: String(primaryItem?.image || "").trim(),
    itemCount,
    subtotal,
    shipping,
    total,
    installmentLabel: buildInstallmentPreviewLabel(total),
    referenceId: String(data?.referenceId || "").trim(),
    expiresAt: expiryText,
    checkoutUrl: String(data?.paymentUrl || data?.checkout?.payUrl || data?.checkoutUrl || "").trim()
  };
}

function buildTransparentCardViewModel(method = "credito") {
  const snapshot = checkoutSnapshot();
  const customer = loadCheckoutCustomer();
  const grouped = Array.isArray(snapshot?.grouped) ? snapshot.grouped : [];
  const primaryItem = grouped[0] || null;
  const itemCount = grouped.reduce((sum, item) => sum + Math.max(1, Number(item?.qty || 1) || 1), 0);
  const subtotal = Number(snapshot?.subtotal || 0);
  const shipping = Number(snapshot?.shipping || 0);
  const total = Number(snapshot?.total || 0);

  return {
    methodLabel: paymentLabel(method) || "Cartao de credito",
    customerName: String(customer?.name || "").trim(),
    customerCpf: String(customer?.cpf || "").trim(),
    productName: String(primaryItem?.name || "Produto Uzuu").trim() || "Produto Uzuu",
    productMeta: [primaryItem?.category, primaryItem?.size].filter(Boolean).join(" • "),
    productImage: String(primaryItem?.image || "").trim(),
    itemCount,
    subtotal,
    shipping,
    total,
    installmentLabel: buildInstallmentPreviewLabel(total)
  };
}

function formatGatewayCardStatus(value) {
  const status = String(value || "").trim().toUpperCase();
  switch (status) {
    case "PAID":
      return "Pago";
    case "AUTHORIZED":
      return "Autorizado";
    case "IN_ANALYSIS":
      return "Em analise";
    case "DECLINED":
      return "Recusado";
    case "CANCELED":
    case "CANCELLED":
      return "Cancelado";
    case "WAITING":
      return "Aguardando confirmacao";
    default:
      return status || "Processando";
  }
}

function buildTransparentCardOutcome(data = {}) {
  const chargeStatus = String(data?.chargeStatus || data?.gatewayStatus || data?.order?.status || "")
    .trim()
    .toUpperCase();
  const gatewayMessage = String(data?.paymentResponse?.message || "").trim();
  const isSandbox = data?.sandbox === true;

  if (chargeStatus === "PAID" || chargeStatus === "AUTHORIZED") {
    return {
      title: isSandbox ? "Teste aprovado" : "Cartao aprovado",
      summary: isSandbox
        ? "Este pagamento foi aprovado no ambiente de testes do PagBank. Nenhuma cobranca real foi feita no cartao."
        : "O PagBank aprovou o pagamento do cartao sem redirecionar voce para fora da Uzuu.",
      feedback: isSandbox
        ? "Teste de cartao aprovado no sandbox do PagBank. Nenhuma cobranca real foi feita."
        : "Cartao aprovado com confirmacao automatica pelo PagBank.",
      statusLabel: isSandbox ? "Teste aprovado" : formatGatewayCardStatus(chargeStatus),
      isError: false,
      isSandbox,
      gatewayMessage
    };
  }

  if (chargeStatus === "IN_ANALYSIS") {
    return {
      title: "Pagamento em analise",
      summary: "O pagamento foi recebido e esta em analise pelo PagBank. A Uzuu atualiza o pedido automaticamente assim que houver retorno.",
      feedback: "Pagamento enviado e aguardando a analise automatica do PagBank.",
      statusLabel: formatGatewayCardStatus(chargeStatus),
      isError: false,
      isSandbox,
      gatewayMessage
    };
  }

  if (["DECLINED", "CANCELED", "CANCELLED"].includes(chargeStatus)) {
    return {
      title: chargeStatus === "DECLINED" ? "Cartao recusado" : "Pagamento cancelado",
      summary:
        gatewayMessage ||
        "O PagBank nao conseguiu confirmar o pagamento deste cartao. Revise os dados e tente novamente.",
      feedback:
        chargeStatus === "DECLINED"
          ? "O PagBank recusou o pagamento do cartao."
          : "O pagamento com cartao foi cancelado pelo gateway.",
      statusLabel: formatGatewayCardStatus(chargeStatus),
      isError: true,
      isSandbox,
      gatewayMessage
    };
  }

  return {
    title: "Pagamento enviado com sucesso",
    summary:
      gatewayMessage ||
      "A Uzuu enviou o cartao criptografado ao PagBank e agora aguarda a confirmacao automatica do gateway.",
    feedback: "Cartao enviado com sucesso para o PagBank.",
    statusLabel: formatGatewayCardStatus(chargeStatus),
    isError: false,
    isSandbox,
    gatewayMessage
  };
}

function buildInlinePaymentTabs(active = "card") {
  const tabs = [
    { key: "card", label: "Cartao" },
    { key: "pix", label: "Pix" },
    { key: "boleto", label: "Boleto" }
  ];

  return `
    <div class="inline-card-preview__tabs" role="tablist" aria-label="Formas de pagamento">
      ${tabs
        .map((tab) => {
          const isActive = tab.key === active;
          return `<button class="inline-card-preview__tab${isActive ? " is-active" : ""}" type="button" ${
            isActive ? 'aria-selected="true"' : 'aria-selected="false" disabled'
          }>${escapeHtml(tab.label)}</button>`;
        })
        .join("")}
    </div>
  `;
}

function buildInlineCardSummary(view = {}, actionHtml = "", footerText = "") {
  const shippingLabel = Number(view.shipping || 0) > 0 ? `R$ ${escapeHtml(formatBRL(view.shipping))}` : "Gratis";
  return `
    <aside class="inline-card-preview__summary">
      <h3 class="inline-card-preview__summary-title">Resumo do pedido</h3>
      <div class="inline-card-preview__product">
        ${
          view.productImage
            ? `<img class="inline-card-preview__image" src="${escapeHtml(view.productImage)}" alt="${escapeHtml(view.productName || "Produto Uzuu")}" />`
            : `<div class="inline-card-preview__image inline-card-preview__image--placeholder" aria-hidden="true">UZUU</div>`
        }
        <div class="inline-card-preview__product-copy">
          <strong>${escapeHtml(view.productName || "Produto Uzuu")}</strong>
          <small>${escapeHtml(view.productMeta || "Compra protegida na Uzuu")}</small>
          <small>${view.itemCount > 1 ? `${view.itemCount} itens no pedido` : "1 unidade"}</small>
        </div>
      </div>
      <div class="inline-card-preview__totals">
        <div><span>Subtotal</span><strong>R$ ${escapeHtml(formatBRL(view.subtotal || 0))}</strong></div>
        <div><span>Entrega</span><strong>${shippingLabel}</strong></div>
        <div class="is-total"><span>Total</span><strong>R$ ${escapeHtml(formatBRL(view.total || 0))}</strong></div>
      </div>
      ${actionHtml}
      ${footerText ? `<p class="inline-card-preview__foot">${escapeHtml(footerText)}</p>` : ""}
    </aside>
  `;
}

function renderTransparentCardModal(method = "credito") {
  if (!inlinePayContent || !inlinePayModal) return;
  const view = buildTransparentCardViewModel(method);
  transparentCardContext = { method };
  hideInlinePayOpenLink();
  setInlinePayDoneVisible(false);
  setInlinePayStatus("Preencha os dados do cartao para pagar sem sair da Uzuu.", false);
  inlinePayContent.innerHTML = `
    <form id="inline-card-transparent-form" class="inline-card-preview" novalidate>
      <div class="inline-card-preview__topbar">
        <h3 class="inline-card-preview__page-title">Pagamento</h3>
        <div class="inline-card-preview__secure"><span>🔒</span> Ambiente seguro</div>
      </div>
      ${buildInlinePaymentTabs("card")}
      <div class="inline-card-preview__grid">
        <div class="inline-card-preview__panel">
          <div class="inline-card-preview__status">
            <span class="inline-card-preview__dot"></span>
            Cartao transparente do PagBank dentro da Uzuu
          </div>
          <h3 class="inline-card-preview__title">Dados do cartao</h3>
          <p class="inline-card-preview__text">Seu cartao sera criptografado no navegador antes do envio. A Uzuu envia apenas o cartao protegido para o PagBank.</p>
          <div class="inline-card-preview__brands">
            <img class="inline-card-preview__brands-image" src="/assets/icons/card-banner.svg" alt="Bandeiras aceitas para cartao" />
          </div>
          <div class="inline-card-preview__form">
            <label class="inline-card-preview__field inline-card-preview__field--full">
              <span>Numero do cartao</span>
              <input id="inline-card-number" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" required />
            </label>
            <label class="inline-card-preview__field inline-card-preview__field--full">
              <span>Nome no cartao</span>
              <input id="inline-card-holder" type="text" autocomplete="cc-name" placeholder="Nome igual ao cartao" value="${escapeHtml(view.customerName)}" required />
            </label>
            <label class="inline-card-preview__field">
              <span>Validade</span>
              <input id="inline-card-expiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / AAAA" required />
            </label>
            <label class="inline-card-preview__field">
              <span>CVV</span>
              <input id="inline-card-cvv" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" required />
            </label>
            <label class="inline-card-preview__field">
              <span>CPF do titular</span>
              <input id="inline-card-tax-id" type="text" inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" value="${escapeHtml(
                view.customerCpf ? view.customerCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : ""
              )}" required />
            </label>
            <label class="inline-card-preview__field">
              <span>Parcelamento</span>
              <select id="inline-card-installments" class="inline-card-preview__native-select">
                ${buildInstallmentOptions(view.total, 1)}
              </select>
            </label>
          </div>
          <p class="inline-card-preview__billing-note">O endereco da fatura pode ser o mesmo endereco de entrega do pedido.</p>
        </div>
        ${buildInlineCardSummary(
          view,
          '<button id="inline-card-submit" class="inline-card-preview__cta" type="submit">Finalizar compra</button>',
          "Depois do pagamento, a confirmacao volta automaticamente para a Uzuu via webhook."
        )}
      </div>
    </form>
  `;
  inlinePayModal.hidden = false;
}

function resolvePixQrSources(pix = {}) {
  const qrImageDataUrl = String(pix?.qrImageDataUrl || "").trim();
  const qrImageBase64 = String(pix?.qrImageBase64 || "").trim();
  const qrImageUrl = String(pix?.qrImageUrl || pix?.qrLink || "").trim();
  const sources = [];

  if (qrImageDataUrl) {
    sources.push(qrImageDataUrl);
  }

  if (qrImageBase64) {
    sources.push(
      qrImageBase64.startsWith("data:image/")
        ? qrImageBase64
        : `data:image/png;base64,${qrImageBase64}`
    );
  }

  if (qrImageUrl) {
    sources.push(qrImageUrl);
  }

  return Array.from(new Set(sources.filter(Boolean)));
}

function attachPixQrImage(qrSources = [], fallbackMessage = "") {
  const qrSlot = document.getElementById("inline-pay-qr-slot");
  if (!qrSlot) return false;
  qrSlot.innerHTML = "";

  const sources = Array.isArray(qrSources) ? qrSources.filter(Boolean) : [];
  if (!sources.length) {
    if (fallbackMessage) {
      qrSlot.innerHTML = `<p class="inline-pay-line">${escapeHtml(fallbackMessage)}</p>`;
    }
    return false;
  }

  const image = document.createElement("img");
  image.alt = "QR Code Pix";
  image.loading = "eager";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";

  let index = 0;
  const tryLoad = () => {
    if (index >= sources.length) {
      qrSlot.innerHTML = `<p class="inline-pay-line">${escapeHtml(
        fallbackMessage || "Nao foi possivel carregar o QR Code automaticamente. Use o codigo Pix abaixo."
      )}</p>`;
      return;
    }

    image.src = String(sources[index] || "").trim();
    index += 1;
  };

  image.addEventListener("error", tryLoad);
  qrSlot.appendChild(image);
  tryLoad();
  return true;
}

function renderInlinePaymentContent(data, method) {
  if (!inlinePayContent) return;
  const mode = String(data?.mode || "").trim().toLowerCase();
  const referenceId = escapeHtml(String(data?.referenceId || ""));
  const checkoutUrl = String(data?.paymentUrl || data?.checkout?.payUrl || data?.checkoutUrl || "").trim();
  const expiresAt = String(data?.pix?.expiresAt || data?.expiresAt || "").trim();
  const expiryText = expiresAt ? new Date(expiresAt).toLocaleString("pt-BR") : "";

  if (hasHostedCheckoutLink(data) && (method === "credito" || method === "debito")) {
    const preview = buildHostedCardPreviewModel(data, method);
    inlinePayContent.innerHTML = `
      <section class="inline-card-preview" aria-label="Pagamento com cartao na Uzuu">
        <div class="inline-card-preview__topbar">
          <h3 class="inline-card-preview__page-title">Pagamento</h3>
          <div class="inline-card-preview__secure"><span>🔒</span> Ambiente seguro</div>
        </div>
        ${buildInlinePaymentTabs("card")}
        <div class="inline-card-preview__grid">
          <div class="inline-card-preview__panel">
            <div class="inline-card-preview__status">
              <span class="inline-card-preview__dot"></span>
              Checkout seguro do PagBank
            </div>
            <h3 class="inline-card-preview__title">Dados do cartao</h3>
            <p class="inline-card-preview__text">Esse pedido ainda termina no ambiente seguro do PagBank. Mantive o visual da Uzuu para voce analisar a experiencia.</p>
            <div class="inline-card-preview__brands">
              <img class="inline-card-preview__brands-image" src="/assets/icons/card-banner.svg" alt="Bandeiras aceitas para cartao" />
            </div>
            <div class="inline-card-preview__form">
              <label class="inline-card-preview__field inline-card-preview__field--full">
                <span>Numero do cartao</span>
                <input type="text" value="4111 1111 1111 1111" readonly />
              </label>
              <label class="inline-card-preview__field inline-card-preview__field--full">
                <span>Nome impresso no cartao</span>
                <input type="text" value="${escapeHtml(preview.customerName)}" readonly />
              </label>
              <label class="inline-card-preview__field">
                <span>Validade</span>
                <input type="text" value="12/28" readonly />
              </label>
              <label class="inline-card-preview__field">
                <span>CVV</span>
                <input type="text" value="***" readonly />
              </label>
              <label class="inline-card-preview__field inline-card-preview__field--full">
                <span>Parcelamento</span>
                <div class="inline-card-preview__select">${escapeHtml(preview.installmentLabel)}</div>
              </label>
              <label class="inline-card-preview__field inline-card-preview__field--full">
                <span>CPF do titular</span>
                <input type="text" value="${escapeHtml(
                  preview.customerCpf ? preview.customerCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "123.456.789-00"
                )}" readonly />
              </label>
            </div>
            <p class="inline-card-preview__billing-note">Pedido ${escapeHtml(preview.referenceId)}${preview.expiresAt ? ` • Validade ${escapeHtml(preview.expiresAt)}` : ""}</p>
          </div>
          ${buildInlineCardSummary(
            preview,
            `<a class="inline-card-preview__cta" href="${escapeHtml(preview.checkoutUrl)}" target="_blank" rel="noopener noreferrer">Abrir checkout PagBank</a>`,
            "Quando o PagBank confirmar o pagamento, a Uzuu atualiza o pedido automaticamente."
          )}
        </div>
      </section>
    `;
    hideInlinePayOpenLink();
    return;
  }

  if (hasHostedCheckoutLink(data)) {
    if (method === "credito" || method === "debito") {
      const preview = buildHostedCardPreviewModel(data, method);
      inlinePayContent.innerHTML = `
        <section class="inline-card-preview" aria-label="Pagamento com cartao na Uzuu">
          <div class="inline-card-preview__status">
            <span class="inline-card-preview__dot"></span>
            Visual do cartao dentro da Uzuu. Nesta etapa, a finalizacao segue no ambiente seguro do PagBank.
          </div>
          <div class="inline-card-preview__grid">
            <div class="inline-card-preview__panel">
              <h3 class="inline-card-preview__title">Dados do cartao</h3>
              <p class="inline-card-preview__text">Fluxo visual dentro da Uzuu para voce analisar. O PagBank continua protegido por tras enquanto finalizamos o cartao transparente.</p>
              <div class="inline-card-preview__chips">
                <span class="inline-card-preview__chip is-active">${escapeHtml(preview.methodLabel)}</span>
                <span class="inline-card-preview__chip">Pix</span>
              </div>
              <div class="inline-card-preview__brands">
                <span class="inline-card-preview__brand">Visa</span>
                <span class="inline-card-preview__brand">Mastercard</span>
                <span class="inline-card-preview__brand">Elo</span>
                <span class="inline-card-preview__brand">Hipercard</span>
              </div>
              <div class="inline-card-preview__form">
                <label class="inline-card-preview__field inline-card-preview__field--full">
                  <span>Numero do cartao</span>
                  <input type="text" value="4111 1111 1111 1111" readonly />
                </label>
                <label class="inline-card-preview__field inline-card-preview__field--full">
                  <span>Nome no cartao</span>
                  <input type="text" value="${escapeHtml(preview.customerName)}" readonly />
                </label>
                <label class="inline-card-preview__field">
                  <span>Validade</span>
                  <input type="text" value="12 / 2028" readonly />
                </label>
                <label class="inline-card-preview__field">
                  <span>CVV</span>
                  <input type="text" value="***" readonly />
                </label>
                <label class="inline-card-preview__field">
                  <span>CPF do titular</span>
                  <input type="text" value="${escapeHtml(
                    preview.customerCpf ? preview.customerCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "123.456.789-00"
                  )}" readonly />
                </label>
                <label class="inline-card-preview__field">
                  <span>Parcelamento</span>
                  <div class="inline-card-preview__select">${escapeHtml(preview.installmentLabel)} <strong>▾</strong></div>
                </label>
              </div>
              <div class="inline-card-preview__note">
                <strong>Pedido:</strong> ${escapeHtml(preview.referenceId)}
                ${preview.expiresAt ? `<br /><strong>Validade:</strong> ${escapeHtml(preview.expiresAt)}` : ""}
                <br />Ao clicar em pagar agora, a etapa final ainda abre no PagBank enquanto fechamos a integracao completa do cartao dentro da Uzuu.
              </div>
              <div class="inline-card-preview__actions">
                <span class="inline-card-preview__mini">Confirmacao automatica via PagBank</span>
                <a class="inline-card-preview__cta" href="${escapeHtml(preview.checkoutUrl)}" target="_blank" rel="noopener noreferrer">Pagar agora</a>
              </div>
            </div>
            <aside class="inline-card-preview__summary">
              <div class="inline-card-preview__product">
                ${
                  preview.productImage
                    ? `<img class="inline-card-preview__image" src="${escapeHtml(preview.productImage)}" alt="${escapeHtml(preview.productName)}" />`
                    : `<div class="inline-card-preview__image inline-card-preview__image--placeholder" aria-hidden="true"></div>`
                }
                <div>
                  <strong>${escapeHtml(preview.productName)}</strong>
                  <small>${escapeHtml(preview.productMeta || "Produto selecionado na Uzuu")}</small>
                  <small>${preview.itemCount > 1 ? `${preview.itemCount} itens no pedido` : "1 item no pedido"}</small>
                </div>
              </div>
              <div class="inline-card-preview__totals">
                <div><span>Subtotal</span><strong>R$ ${escapeHtml(formatBRL(preview.subtotal))}</strong></div>
                <div><span>Frete</span><strong>${preview.shipping > 0 ? `R$ ${escapeHtml(formatBRL(preview.shipping))}` : "Gratis"}</strong></div>
                <div><span>Parcelas</span><strong>${escapeHtml(preview.installmentLabel.replace(/^(\d+x de )?/, ""))}</strong></div>
                <div class="is-total"><span>Total</span><strong>R$ ${escapeHtml(formatBRL(preview.total))}</strong></div>
              </div>
              <div class="inline-card-preview__foot">
                Depois do pagamento, a confirmacao volta para a Uzuu automaticamente por webhook e o cliente acompanha tudo em Meus pedidos.
              </div>
            </aside>
          </div>
        </section>
      `;
      hideInlinePayOpenLink();
      return;
    }

    const label = paymentLabel(method) || "PagBank";
    const guidance = method === "pix"
      ? "Abra o checkout seguro do PagBank para gerar o Pix e concluir o pagamento."
      : method === "boleto"
        ? "Abra o checkout seguro do PagBank para visualizar o boleto e concluir o pagamento."
        : "Abra o checkout seguro do PagBank para concluir o pagamento com cartao.";
    inlinePayContent.innerHTML = `
      <h3 class="inline-pay-title">Checkout seguro pronto</h3>
      <p class="inline-pay-text">${escapeHtml(guidance)}</p>
      <p class="inline-pay-line"><strong>Forma:</strong> ${escapeHtml(label)}</p>
      ${referenceId ? `<p class="inline-pay-line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
      ${expiryText ? `<p class="inline-pay-line"><strong>Validade:</strong> ${escapeHtml(expiryText)}</p>` : ""}
      <p class="inline-pay-line">Assim que o PagBank confirmar o pagamento, o status sera atualizado automaticamente na sua conta.</p>
    `;
    showInlinePayOpenLink("Abrir checkout PagBank", checkoutUrl);
    return;
  }

  if (mode === "card") {
    const outcome = buildTransparentCardOutcome(data);
    const orderId = escapeHtml(String(data?.order?.id || ""));
    const gatewayStatus = escapeHtml(outcome.statusLabel);
    const gatewayMessage = escapeHtml(String(outcome.gatewayMessage || "").trim());
    inlinePayContent.innerHTML = `
      <h3 class="inline-pay-title">${escapeHtml(outcome.title)}</h3>
      <p class="inline-pay-text">${escapeHtml(outcome.summary)}</p>
      ${referenceId ? `<p class="inline-pay-line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
      ${orderId ? `<p class="inline-pay-line"><strong>Ordem PagBank:</strong> ${orderId}</p>` : ""}
      <p class="inline-pay-line"><strong>Status:</strong> ${gatewayStatus}</p>
      ${gatewayMessage ? `<p class="inline-pay-line"><strong>Gateway:</strong> ${gatewayMessage}</p>` : ""}
      <p class="inline-pay-line">Voce continua na Uzuu enquanto o PagBank confirma e sincroniza o pedido automaticamente.</p>
    `;
    hideInlinePayOpenLink();
    return;
  }

  if (mode === "pix") {
    const qrText = String(data?.pix?.qrText || "").trim();
    const qrSources = resolvePixQrSources(data?.pix || {});
    inlinePayContent.innerHTML = `
      <h3 class="inline-pay-title">Pix gerado com sucesso</h3>
      <p class="inline-pay-text">Escaneie o QR Code ou copie o codigo Pix.</p>
      <p class="inline-pay-line"><strong>Recebedor:</strong> Uzuu</p>
      <div id="inline-pay-qr-slot" class="inline-pay-qr-slot"></div>
      ${referenceId ? `<p class="inline-pay-line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
      ${expiryText ? `<p class="inline-pay-line"><strong>Validade:</strong> ${escapeHtml(expiryText)}</p>` : ""}
      ${qrText ? "<button id=\"inline-pay-copy\" class=\"inline-pay-copy\" type=\"button\">Copiar codigo Pix</button>" : ""}
      ${!qrText ? "<p class=\"inline-pay-line\">Codigo Pix indisponivel.</p>" : ""}
    `;
    attachPixQrImage(qrSources, "Nao foi possivel carregar o QR Code automaticamente. Use o codigo Pix abaixo.");
    const copyBtn = document.getElementById("inline-pay-copy");
    copyBtn?.addEventListener("click", async () => {
      const value = String(qrText || "");
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        setInlinePayStatus("Codigo Pix copiado com sucesso.", false);
      } catch {
        setInlinePayStatus("Nao foi possivel copiar automaticamente. Copie manualmente o codigo.", true);
      }
    });
    hideInlinePayOpenLink();
    return;
  }

  if (mode === "boleto") {
    const barcodeFormatted = String(data?.boleto?.formattedBarcode || data?.boleto?.barcode || "").trim();
    const barcodeDigits = normalizeBarcodeDigits(data?.boleto?.barcode || barcodeFormatted);
    const barcodeImage = buildBarcodeImageUrl(barcodeDigits || barcodeFormatted);
    const dueDate = String(data?.boleto?.dueDate || "").trim();
    const dueText = dueDate ? new Date(dueDate).toLocaleDateString("pt-BR") : "";
    inlinePayContent.innerHTML = `
      <h3 class="inline-pay-title">Boleto gerado com sucesso</h3>
      <p class="inline-pay-text">Use o codigo de barras abaixo para pagar no banco/app.</p>
      ${barcodeImage ? `<img class="inline-pay-boleto-barcode" src="${escapeHtml(barcodeImage)}" alt="Codigo de barras do boleto" loading="lazy" referrerpolicy="no-referrer" />` : ""}
      ${barcodeFormatted ? `<p class="inline-pay-barcode-number">${escapeHtml(barcodeFormatted)}</p>` : "<p class=\"inline-pay-line\">Codigo de barras indisponivel.</p>"}
      ${referenceId ? `<p class="inline-pay-line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
      ${dueText ? `<p class="inline-pay-line"><strong>Vencimento:</strong> ${escapeHtml(dueText)}</p>` : ""}
      ${barcodeFormatted ? "<button id=\"inline-pay-copy\" class=\"inline-pay-copy\" type=\"button\">Copiar codigo de barras</button>" : ""}
    `;
    const copyBtn = document.getElementById("inline-pay-copy");
    copyBtn?.addEventListener("click", async () => {
      const value = String(barcodeDigits || barcodeFormatted || "");
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        setInlinePayStatus("Codigo de barras copiado com sucesso.", false);
      } catch {
        setInlinePayStatus("Nao foi possivel copiar automaticamente. Copie manualmente o codigo.", true);
      }
    });
    showInlinePayOpenLink("Abrir boleto (PDF)", data?.boleto?.pdfUrl || "");
    return;
  }

  inlinePayContent.innerHTML = `
    <h3 class="inline-pay-title">Pagamento iniciado</h3>
    <p class="inline-pay-text">Seu pedido foi criado. Acompanhe o status em Meus pedidos.</p>
    ${referenceId ? `<p class="inline-pay-line"><strong>Pedido:</strong> ${referenceId}</p>` : ""}
  `;
  hideInlinePayOpenLink();
}

function openInlinePayModal(data, method) {
  if (!inlinePayModal || !inlinePayContent) return;
  const hostedCheckout = hasHostedCheckoutLink(data);
  const providerManaged = isProviderManagedPayment(data);
  const cardOutcome = String(data?.mode || "").trim().toLowerCase() === "card" ? buildTransparentCardOutcome(data) : null;
  setInlinePayDoneVisible(!providerManaged && !hostedCheckout);
  setInlinePayStatus(
    hostedCheckout
      ? `Pagamento com ${paymentLabel(method) || "PagBank"} pronto no checkout seguro do PagBank.`
      : providerManaged
        ? String(data?.mode || "").trim().toLowerCase() === "pix"
          ? "Pix gerado com sucesso. Assim que o PagBank confirmar o pagamento, o pedido sera atualizado automaticamente."
          : cardOutcome
            ? cardOutcome.feedback
            : `Pagamento com ${paymentLabel(method) || "PagBank"} criado com confirmacao automatica pelo PagBank.`
        : `Pagamento com ${paymentLabel(method) || "PagBank"} iniciado em ambiente de teste.`,
    !!cardOutcome?.isError
  );
  renderInlinePaymentContent(data || {}, method);
  inlinePayModal.hidden = false;
}

function closeInlinePayModal() {
  if (!inlinePayModal) return;
  inlinePayModal.hidden = true;
  transparentCardContext = null;
  if (inlinePayContent) inlinePayContent.innerHTML = "";
  setInlinePayDoneVisible(true);
  hideInlinePayOpenLink();
}

async function requestInlinePayment(payload, method, options = {}) {
  const endpointCandidates = resolvePagBankEndpointCandidates();
  let effectiveEndpoint = "";
  let effectiveApiBase = "";
  let data = null;
  let lastError = null;

  for (const candidate of endpointCandidates) {
    try {
      data = await postJson(candidate.endpoint, payload, 22000);
      effectiveEndpoint = candidate.endpoint;
      effectiveApiBase = candidate.base;
      rememberPagBankApiBase(candidate.base);
      break;
    } catch (candidateError) {
      lastError = candidateError;
    }
  }

  if (!data || typeof data !== "object") {
    throw lastError || new Error("PagBank nao retornou dados de pagamento.");
  }

  registerSoldItemsFromCheckout(payload.items);
  registerRatingFromCheckout(payload.items);

  const referenceId = String(data?.referenceId || payload.referenceId || "").trim();
  createPendingOrderFromCheckout(payload, method, referenceId, {
    paymentEndpoint: effectiveEndpoint,
    apiBase: effectiveApiBase
  });
  localStorage.setItem(
    "stopmod_pending_checkout",
    JSON.stringify({
      referenceId,
      method,
      createdAt: new Date().toISOString()
    })
  );

  if (!options.keepCheckoutModalOpen) {
    closeModal();
  }
  feedback.textContent = hasHostedCheckoutLink(data)
    ? "Pagamento criado. Abra o checkout seguro do PagBank para concluir."
    : isProviderManagedPayment(data)
      ? String(data?.mode || "").trim().toLowerCase() === "pix"
        ? "Pix gerado. Pague com o QR Code e aguarde a confirmacao automatica."
        : buildTransparentCardOutcome(data).feedback
      : "Pagamento iniciado. Finalize no quadro seguro abaixo.";
  if (options.renderResultInCheckout && renderCheckoutPaymentResult(data, method)) {
    return data;
  }
  openInlinePayModal(data, method);
  return data;
}

async function submitTransparentCardPayment() {
  if (!transparentCardContext) {
    throw new Error("Fluxo transparente do cartao nao foi iniciado.");
  }

  const numberInput = document.getElementById("inline-card-number");
  const holderInput = document.getElementById("inline-card-holder");
  const expiryInput = document.getElementById("inline-card-expiry");
  const cvvInput = document.getElementById("inline-card-cvv");
  const taxIdInput = document.getElementById("inline-card-tax-id");
  const installmentsInput = document.getElementById("inline-card-installments");
  const submitBtn = document.getElementById("inline-card-submit");

  const cardNumber = normalizeCardNumber(numberInput?.value || "");
  const holderName = String(holderInput?.value || "").trim();
  const { expMonth, expYear } = parseCardExpiry(expiryInput?.value || "");
  const securityCode = digitsOnly(cvvInput?.value || "").slice(0, 4);
  const holderTaxId = digitsOnly(taxIdInput?.value || "").slice(0, 11);
  const installments = Math.max(1, Math.min(12, Number(installmentsInput?.value || 1) || 1));

  if (cardNumber.length < 13) {
    throw new Error("Preencha um numero de cartao valido.");
  }
  if (!holderName) {
    throw new Error("Informe o nome do titular.");
  }
  if (!expMonth || !expYear || Number(expMonth) < 1 || Number(expMonth) > 12 || String(expYear).length !== 4) {
    throw new Error("Informe a validade do cartao no formato MM / AAAA.");
  }
  if (securityCode.length < 3) {
    throw new Error("Informe um CVV valido.");
  }
  if (holderTaxId.length !== 11) {
    throw new Error("Informe o CPF completo do titular.");
  }

  setInlinePayStatus("Protegendo os dados do cartao com o PagBank...", false);
  submitBtn && (submitBtn.disabled = true);

  try {
    await loadPagBankSdk();
    const keyData = await fetchPagBankPublicKey();
    const card = window.PagSeguro.encryptCard({
      publicKey: keyData.publicKey,
      holder: holderName,
      number: cardNumber,
      expMonth,
      expYear,
      securityCode
    });

    if (card?.hasErrors) {
      const firstError = Array.isArray(card.errors) ? card.errors[0] : null;
      throw new Error(String(firstError?.message || "Nao foi possivel criptografar os dados do cartao."));
    }

    const payload = buildPagBankCheckoutPayload("credito");
    if (!payload) {
      throw new Error("Seu carrinho esta vazio.");
    }
    payload.card = {
      encryptedCard: String(card?.encryptedCard || "").trim(),
      holderName,
      holderTaxId,
      installments
    };

    setInlinePayStatus("Enviando pagamento transparente para o PagBank...", false);
    await requestInlinePayment(payload, "credito", { keepCheckoutModalOpen: false });
  } finally {
    submitBtn && (submitBtn.disabled = false);
  }
}

async function submitCheckoutTransparentCardPayment() {
  const cardNumber = normalizeCardNumber(checkoutCardNumber?.value || "");
  const holderName = String(checkoutCardHolder?.value || "").trim();
  const { expMonth, expYear } = parseCardExpiry(checkoutCardExpiry?.value || "");
  const securityCode = digitsOnly(checkoutCardCvv?.value || "").slice(0, 4);
  const holderTaxId = digitsOnly(checkoutCardTaxId?.value || loadCheckoutCustomer()?.cpf || "").slice(0, 11);
  const installments = Math.max(1, Math.min(12, Number(checkoutCardInstallments?.value || 1) || 1));

  if (cardNumber.length < 13) {
    throw new Error("Preencha um numero de cartao valido.");
  }
  if (!holderName) {
    throw new Error("Informe o nome do titular.");
  }
  if (!expMonth || !expYear || Number(expMonth) < 1 || Number(expMonth) > 12 || String(expYear).length !== 4) {
    throw new Error("Informe a validade do cartao no formato MM / AAAA.");
  }
  if (securityCode.length < 3) {
    throw new Error("Informe um CVV valido.");
  }
  if (holderTaxId.length !== 11) {
    throw new Error("Informe o CPF completo do titular.");
  }

  setCheckoutFeedback("Protegendo os dados do cartao com o PagBank...", false);
  await loadPagBankSdk();
  const keyData = await fetchPagBankPublicKey();
  const card = window.PagSeguro.encryptCard({
    publicKey: keyData.publicKey,
    holder: holderName,
    number: cardNumber,
    expMonth,
    expYear,
    securityCode
  });

  if (card?.hasErrors) {
    const firstError = Array.isArray(card.errors) ? card.errors[0] : null;
    throw new Error(String(firstError?.message || "Nao foi possivel criptografar os dados do cartao."));
  }

  const payload = buildPagBankCheckoutPayload("credito");
  if (!payload) {
    throw new Error("Seu carrinho esta vazio.");
  }
  payload.card = {
    encryptedCard: String(card?.encryptedCard || "").trim(),
    holderName,
    holderTaxId,
    installments
  };

  setCheckoutFeedback("Enviando pagamento transparente para o PagBank...", false);
  await requestInlinePayment(payload, "credito", {
    keepCheckoutModalOpen: true,
    renderResultInCheckout: true
  });
}

function syncPaymentRadios() {
  if (!paymentForm) return;
  const cur = loadPayment() || "credito";
  const radioValue = cur === "debito" ? "credito" : cur;
  const radios = paymentForm.querySelectorAll("input[name=\"pay\"]");
  radios.forEach((r) => {
    r.checked = String(r.value) === radioValue;
  });
  if (cardKindSelect) {
    cardKindSelect.value = cur === "debito" ? "debito" : "credito";
  }
  setMorePaymentsOpen(shouldExpandMorePayments(cur));
  syncCheckoutPremiumTabs();
}

function selectedPaymentFromModal() {
  if (!paymentForm) return "";
  const checked = paymentForm.querySelector("input[name=\"pay\"]:checked");
  if (!checked) return "";
  const selected = String(checked.value);
  if (selected !== "credito") return selected;
  if (!cardKindSelect) return "credito";
  const mode = String(cardKindSelect.value || "").trim().toLowerCase();
  return mode === "debito" ? "debito" : "credito";
}

function shouldExpandMorePayments(method) {
  const value = String(method || "").trim();
  return value === "boleto";
}

function setMorePaymentsOpen(open) {
  if (!morePaymentOptions || !toggleMorePaymentsBtn) return;
  const expanded = !!open;
  morePaymentOptions.hidden = !expanded;
  toggleMorePaymentsBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  toggleMorePaymentsBtn.textContent = expanded
    ? "Mostrar menos meios de pagamento"
    : "Mostrar mais meios de pagamento";
}

function renderCart() {
  const ids = loadCartIds();
  updatePaymentUI(loadPayment());
  updateCartCount();
  setCartExtraSpace(ids.length);
  const shipTo = loadShipTo();
  if (shipSummary) shipSummary.textContent = shipSummaryText(shipTo);
  renderAddressConfirmation();

  if (!ids.length) {
    cartItems.innerHTML = "<li class=\"empty\">Seu carrinho esta vazio.</li>";
    checkoutBtn.disabled = true;
    feedback.textContent = "";
    if (itemsCount) itemsCount.textContent = "0";
    if (freeShipCount) freeShipCount.textContent = "0";
    if (shippingValue) {
      shippingValue.textContent = "--";
      shippingValue.classList.remove("free");
    }
    if (couponCount) couponCount.textContent = String(loadCoupons().length);
    if (productsBeforeWrap) productsBeforeWrap.hidden = true;
    if (productsNowMain && productsNowCents) {
      productsNowMain.textContent = "0";
      productsNowCents.textContent = "00";
    }
    if (cartTotalMain && cartTotalCents) {
      cartTotalMain.textContent = "0";
      cartTotalCents.textContent = "00";
    }
    renderCheckoutModalSnapshot();
    return;
  }

  const cep = shipTo.cep;

  const grouped = groupedCart(ids);
  if (!grouped.length) {
    cartItems.innerHTML = "<li class=\"empty\">Nenhum item encontrado.</li>";
  } else {
    cartItems.innerHTML = grouped
      .map((item) => {
        const meta = [item.category, item.size].filter(Boolean).join(" | ");
        return `
        <li class="cart-item">
          <a class="cart-item-media" href="${productHref(item.id)}"><img src="${item.image}" alt="${item.name}" loading="lazy" /></a>
          <div class="cart-item-body">
            <strong><a class="cart-item-link" href="${productHref(item.id)}">${item.name}</a></strong>
            ${meta ? `<div class="cart-item-meta">${meta}</div>` : ""}
            <div class="cart-item-row">
              <div class="qty-controls" aria-label="Quantidade">
                <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir">-</button>
                <span class="qty-val" aria-label="Quantidade">${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar">+</button>
              </div>
              <span class="cart-item-price">R$ ${formatBRL(item.price)}</span>
            </div>
            <div class="cart-item-meta">Subtotal: R$ ${formatBRL(item.price * item.qty)}</div>
            <a class="cart-item-link-inline" href="${productHref(item.id)}">Ver detalhes do produto</a>
          </div>
        </li>
      `;
      })
      .join("");
  }

  const subtotal = groupedCart(ids).reduce((sum, item) => sum + item.price * item.qty, 0);
  const coupons = loadCoupons();
  const shipping = calcShipping(subtotal, ids.length, cep);
  const discount = calcDiscount(subtotal, coupons);

  const productsBefore = subtotal;
  const productsNow = Math.max(0, subtotal - discount);
  const totalFinal = Math.max(0, productsNow + (shipping ?? 0));

  const pNow = moneyParts(productsNow);
  if (productsNowMain) productsNowMain.textContent = pNow.main;
  if (productsNowCents) productsNowCents.textContent = pNow.cents;

  if (productsBeforeWrap && productsBeforeMain && productsBeforeCents) {
    if (discount > 0.01) {
      const pBefore = moneyParts(productsBefore);
      productsBeforeMain.textContent = pBefore.main;
      productsBeforeCents.textContent = pBefore.cents;
      productsBeforeWrap.hidden = false;
    } else {
      productsBeforeWrap.hidden = true;
    }
  }

  if (cartTotalMain && cartTotalCents) {
    const t = moneyParts(totalFinal);
    cartTotalMain.textContent = t.main;
    cartTotalCents.textContent = t.cents;
  }

  if (itemsCount) itemsCount.textContent = String(ids.length);
  if (couponCount) couponCount.textContent = String(coupons.length);

  if (shippingValue) {
    if (shipping === null) {
      shippingValue.textContent = "Selecionar";
      shippingValue.classList.remove("free");
    } else if (shipping === 0) {
      shippingValue.textContent = "Gratis";
      shippingValue.classList.add("free");
    } else {
      shippingValue.textContent = `R$ ${formatBRL(shipping)}`;
      shippingValue.classList.remove("free");
    }
  }

  if (freeShipCount) {
    freeShipCount.textContent = String(shipping === 0 ? ids.length : 0);
  }

  checkoutBtn.disabled = false;
  renderCheckoutModalSnapshot();

  cartItems.querySelectorAll("button[data-action][data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      const action = String(btn.getAttribute("data-action"));
      if (action === "inc") addOne(id);
      if (action === "dec") removeOne(id);
    });
  });
}

checkoutBtn.addEventListener("click", () => {
  if (!hasActiveAuthSession()) {
    feedback.textContent = "Faca login para finalizar a compra.";
    redirectToLoginForCheckout();
    return;
  }

  if (requiresCheckoutRegistrationCompletion()) {
    feedback.textContent = "Complete seu cadastro para finalizar a compra.";
    redirectToRegistrationCompletion();
    return;
  }

  touchAuthSession(true);
  const ids = loadCartIds();
  if (!ids.length) return;
  if (!isCepValid(loadShipTo().cep)) {
    feedback.textContent = "Selecione o endereco de entrega antes de finalizar.";
    return;
  }
  feedback.textContent = "";
  clearCheckoutFeedback();
  syncPaymentRadios();
  openModal();
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  openStoreProductSearch();
});

checkoutModal?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

inlinePayModal?.querySelectorAll("[data-inline-close]").forEach((el) => {
  el.addEventListener("click", closeInlinePayModal);
});

inlinePayContent?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.id === "inline-card-number") {
    const formatted = formatCardNumber(target.value);
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "inline-card-expiry") {
    const formatted = normalizeCardExpiry(target.value);
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "inline-card-tax-id") {
    const digits = digitsOnly(target.value).slice(0, 11);
    const formatted = digits.length === 11
      ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : digits;
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "inline-card-cvv") {
    const digits = digitsOnly(target.value).slice(0, 4);
    if (target.value !== digits) target.value = digits;
  }
});

inlinePayContent?.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== "inline-card-transparent-form") return;
  event.preventDefault();
  try {
    await submitTransparentCardPayment();
  } catch (error) {
    setInlinePayStatus(normalizeCheckoutErrorMessage(error), true);
  }
});

inlinePayDoneBtn?.addEventListener("click", () => {
  const pendingReference = readPendingCheckoutReference();
  const updated = markPendingOrderAsProcessing(pendingReference);
  localStorage.removeItem("stopmod_pending_checkout");
  closeInlinePayModal();
  if (updated?.cancelled) {
    feedback.textContent = "Este pedido foi cancelado por falta de finalizacao no prazo.";
    return;
  }
  feedback.textContent = "Pedido em processamento. Aguarde confirmacao na aba Processando.";
});

toggleMorePaymentsBtn?.addEventListener("click", () => {
  const isOpen = String(toggleMorePaymentsBtn.getAttribute("aria-expanded") || "false") === "true";
  setMorePaymentsOpen(!isOpen);
});

cardKindSelect?.addEventListener("change", () => {
  if (!paymentForm) return;
  const cardRadio = paymentForm.querySelector('input[name="pay"][value="credito"]');
  if (cardRadio) cardRadio.checked = true;
  syncCheckoutPremiumTabs();
});

paymentForm?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name !== "pay") return;
  syncCheckoutPremiumTabs();
});

addressInlineConfirm?.addEventListener("click", () => {
  const to = loadShipTo();
  if (!isCepValid(to?.cep)) {
    feedback.textContent = "Selecione o endereco de entrega antes de confirmar.";
    return;
  }
  setAddressConfirmed(to, true);
  feedback.textContent = "Endereco confirmado para finalizar a compra.";
  renderAddressConfirmation();
});

confirmAddress?.addEventListener("change", () => {
  const to = loadShipTo();
  if (confirmAddress.checked && isCepValid(to?.cep)) {
    setAddressConfirmed(to, true);
  } else if (!confirmAddress.checked) {
    setAddressConfirmed(to, false);
  }
  renderAddressConfirmation();
});

paymentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  sweepPendingOrdersForTimeout();
  if (!hasActiveAuthSession()) {
    closeModal();
    feedback.textContent = "Sua sessao expirou. Faca login novamente para continuar.";
    redirectToLoginForCheckout();
    return;
  }

  if (requiresCheckoutRegistrationCompletion()) {
    closeModal();
    feedback.textContent = "Complete seu cadastro para finalizar a compra.";
    redirectToRegistrationCompletion();
    return;
  }

  touchAuthSession(true);
  const method = selectedPaymentFromModal();
  if (!method) {
    setCheckoutFeedback("Escolha a forma de pagamento para continuar.", true);
    feedback.textContent = "";
    return;
  }

  const shipTo = loadShipTo();
  const confirmedInModal = !!confirmAddress?.checked;
  if (!isCepValid(shipTo?.cep)) {
    setCheckoutFeedback("Selecione um endereco valido para entrega.", true);
    feedback.textContent = "";
    return;
  }
  setAddressConfirmed(shipTo, true);
  clearCheckoutFeedback();

  const payload = buildPagBankCheckoutPayload(method);
  if (!payload) {
    setCheckoutFeedback("Seu carrinho esta vazio.", true);
    feedback.textContent = "";
    return;
  }

  if (method === "credito") {
    savePayment(method);
    updatePaymentUI(method);
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = "Processando...";
    try {
      await submitCheckoutTransparentCardPayment();
    } catch (error) {
      setCheckoutFeedback(normalizeCheckoutErrorMessage(error), true);
      feedback.textContent = "";
    } finally {
      confirmPaymentBtn.disabled = false;
      syncCheckoutPremiumTabs();
    }
    return;
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = method === "boleto" ? "Gerando boleto..." : "Gerando pagamento...";
  }

  savePayment(method);
  updatePaymentUI(method);

  try {
    await requestInlinePayment(payload, method, {
      keepCheckoutModalOpen: true,
      renderResultInCheckout: true
    });
  } catch (error) {
    feedback.textContent = `Falha ao iniciar pagamento real: ${normalizeCheckoutErrorMessage(error)}`;
  } finally {
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = false;
      syncCheckoutPremiumTabs();
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (inlinePayModal && !inlinePayModal.hidden) {
    closeInlinePayModal();
    return;
  }
  if (checkoutModal && !checkoutModal.hidden) {
    closeModal();
  }
});

paymentForm?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.id === "checkout-card-number") {
    const formatted = formatCardNumber(target.value);
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "checkout-card-expiry") {
    const formatted = normalizeCardExpiry(target.value);
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "checkout-card-tax-id") {
    const digits = digitsOnly(target.value).slice(0, 11);
    const formatted = digits.length === 11
      ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : digits;
    if (target.value !== formatted) target.value = formatted;
  }
  if (target.id === "checkout-card-cvv") {
    const digits = digitsOnly(target.value).slice(0, 4);
    if (target.value !== digits) target.value = digits;
  }
});

bindAuthActivity();
sweepPendingOrdersForTimeout();
setMorePaymentsOpen(false);
renderCart();
renderTopProfile();

window.addEventListener("storage", (event) => {
  if (event.key === PROFILE_KEY) renderTopProfile();
  if (event.key === SHIP_KEY || event.key === LEGACY_SHIP_KEY || event.key === CART_KEY) {
    renderCart();
  }
});






