const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const SHIP_KEY = "stopmod_ship_to";
const LEGACY_SHIP_KEY = "stopmod_ship_cep";
const COUPON_KEY = "stopmod_coupons";
const PAY_KEY = "stopmod_payment";
const ORDERS_KEY = "stopmod_orders";
const NOTES_KEY = "stopmod_notifications";
const PROFILE_KEY = "stopmod_profile";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const ADDRESS_CONFIRM_FINGERPRINT_KEY = "stopmod_address_confirmed_fp";
const AUTH_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const AUTH_TOUCH_MIN_GAP_MS = 15 * 1000;
const PAGBANK_API_BASE_KEY = "stopmod_pagbank_api_base";
const PAGBANK_RETURN_URL_KEY = "stopmod_pagbank_return_url";
const PAGBANK_REDIRECT_URL_KEY = "stopmod_pagbank_redirect_url";
const PAGBANK_NOTIFICATION_URL_KEY = "stopmod_pagbank_notification_url";
const PAGBANK_PAYMENT_NOTIFICATION_URL_KEY = "stopmod_pagbank_payment_notification_url";
const PAYMENT_METHOD_LABELS = Object.freeze({
  pix: "Pix",
  credito: "Cartao de credito",
  debito: "Cartao de debito",
  boleto: "Boleto"
});

const products = [
  { id: 1, name: "Camiseta Oversized Street", category: "Camisetas", size: "P ao GG", price: 89.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Calca Cargo Urban", category: "Calcas", size: "36 ao 46", price: 159.9, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Jaqueta Jeans Vintage", category: "Jaquetas", size: "P ao XG", price: 219.9, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Moletom Essential Stop", category: "Moletons", size: "P ao GG", price: 179.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Vestido Casual Minimal", category: "Vestidos", size: "PP ao G", price: 139.9, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Camisa Linho Leve", category: "Camisas", size: "P ao GG", price: 129.9, image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Cardigan Tricot Cozy", category: "Casacos", size: "P ao G", price: 149.9, image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Blazer Minimal Preto", category: "Blazers", size: "P ao GG", price: 249.9, image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=700&q=80" },
  { id: 9, name: "Saia Midi Plissada", category: "Saias", size: "PP ao G", price: 119.9, image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=700&q=80" },
  { id: 10, name: "Short Alfaiataria", category: "Shorts", size: "36 ao 44", price: 109.9, image: "https://images.unsplash.com/photo-1542293787938-4d273c37c18d?auto=format&fit=crop&w=700&q=80" },
  { id: 11, name: "Tenis Street Clean", category: "Calcados", size: "37 ao 43", price: 239.9, image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=700&q=80" },
  { id: 12, name: "Bolsa Tote Minimal", category: "Acessorios", size: "Unico", price: 189.9, image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=700&q=80" }
];

const productById = new Map(products.map((p) => [p.id, p]));

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
const morePaymentOptions = document.getElementById("more-payment-options");
const toggleMorePaymentsBtn = document.getElementById("toggle-more-payments");
const checkoutAddressLine = document.getElementById("checkout-address-line");
const checkoutAddressShip = document.getElementById("checkout-address-ship");
const checkoutFeedback = document.getElementById("checkout-feedback");
const confirmAddress = document.getElementById("confirm-address");
const addressInlineText = document.getElementById("address-inline-text");
const addressInlineState = document.getElementById("address-inline-state");
const addressInlineConfirm = document.getElementById("address-inline-confirm");
const confirmPaymentDefaultLabel = String(confirmPaymentBtn?.textContent || "Continuar");

let lastAuthTouchAt = 0;

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function optionalHttpUrlFromStorage(key) {
  const value = String(localStorage.getItem(key) || "").trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : "";
}

function resolvePagBankCheckoutEndpoint() {
  const raw = String(localStorage.getItem(PAGBANK_API_BASE_KEY) || "").trim();
  if (!raw) return "/api/pagbank/checkout";

  const base = raw.replace(/\/+$/, "");
  if (/\/api\/pagbank\/checkout$/i.test(base)) return base;
  if (/\/api$/i.test(base)) return `${base}/pagbank/checkout`;
  return `${base}/api/pagbank/checkout`;
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
      throw new Error(message);
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

function loadCartIds() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
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

  const displayName = String(profile.name || "").trim() || "Perfil";
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
          city: String(obj.city || "").trim(),
          cep: normalizeCep(String(obj.cep || "")),
        };
      }
    }
  } catch {
    // ignore
  }

  // Legacy: stored CEP string
  const legacy = String(localStorage.getItem(LEGACY_SHIP_KEY) || "").trim();
  if (legacy) {
    const to = { street: "", number: "", city: "", cep: normalizeCep(legacy) };
    try {
      localStorage.setItem(SHIP_KEY, JSON.stringify(to));
    } catch {
      // ignore
    }
    return to;
  }
  return { street: "", number: "", city: "", cep: "" };
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
  const target = query ? `../index.html?q=${encodeURIComponent(query)}#produtos` : "../index.html#produtos";
  window.location.href = target;
}

function redirectToLoginForCheckout() {
  const next = encodeURIComponent("../carrinho/");
  window.location.href = `../login/?next=${next}`;
}

function groupedCart(ids) {
  const map = new Map();
  ids.forEach((id) => {
    const p = productById.get(id);
    if (!p) return;
    const cur = map.get(id) || { ...p, qty: 0 };
    cur.qty += 1;
    map.set(id, cur);
  });
  return Array.from(map.values());
}

function addOne(id) {
  const ids = loadCartIds();
  if (ids.length >= MAX_CART_ITEMS) {
    feedback.textContent = "Limite de 2000 itens no carrinho atingido.";
    return;
  }
  ids.push(id);
  saveCartIds(ids);
  renderCart();
}

function removeOne(id) {
  const ids = loadCartIds();
  const idx = ids.indexOf(id);
  if (idx === -1) return;
  ids.splice(idx, 1);
  saveCartIds(ids);
  renderCart();
}

function calcShipping(subtotal, itemCount, cep) {
  if (!isCepValid(cep)) return null;
  const free = subtotal >= 249.9 || itemCount >= 5;
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

  const profile = loadProfile() || {};
  const returnUrl = optionalHttpUrlFromStorage(PAGBANK_RETURN_URL_KEY);
  const redirectUrl = optionalHttpUrlFromStorage(PAGBANK_REDIRECT_URL_KEY);
  const notificationUrl = optionalHttpUrlFromStorage(PAGBANK_NOTIFICATION_URL_KEY);
  const paymentNotificationUrl = optionalHttpUrlFromStorage(PAGBANK_PAYMENT_NOTIFICATION_URL_KEY);

  return {
    referenceId: genOrderId(),
    paymentMethod: String(paymentMethod || "").trim(),
    customer: {
      name: String(profile?.name || "").trim(),
      email: String(profile?.email || "").trim().toLowerCase()
    },
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

function createOrder(paymentMethod) {
  const ids = loadCartIds();
  if (!ids.length) return null;

  const profile = loadProfile();
  const shipTo = loadShipTo();
  const coupons = loadCoupons();
  const grouped = groupedCart(ids);
  const subtotal = grouped.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calcShipping(subtotal, ids.length, shipTo.cep);
  const discount = calcDiscount(subtotal, coupons);
  const total = Math.max(0, Math.max(0, subtotal - discount) + (shipping ?? 0));

  const order = {
    id: genOrderId(),
    createdAt: new Date().toISOString(),
    ownerName: String(profile?.name || "").trim(),
    ownerEmail: String(profile?.email || "").trim().toLowerCase(),
    payment: String(paymentMethod || "pix"),
    shipTo,
    coupon: coupons[0] || "",
    totals: { subtotal, shipping: shipping ?? 0, discount, total },
    tracking: { code: genTrackingCode(), status: "Preparando" },
    items: grouped.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      qty: it.qty,
      image: it.image || "",
      category: it.category || "",
      size: it.size || ""
    }))
  };

  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders.slice(0, 100));
  addOrderNotification(order);
  return order;
}

function addOrderNotification(order) {
  if (!order || !order.id) return;
  const owner = String(order.ownerEmail || "").trim().toLowerCase();
  const title = `Pedido ${order.id} criado`;
  const text = `Pagamento: ${paymentLabel(order.payment)}. Total: R$ ${formatBRL(Number(order?.totals?.total || 0))}.`;
  const payload = {
    id: `order-${order.id}-created`,
    scope: "individual",
    type: "pedido",
    userKey: owner,
    title,
    text,
    href: "/perfil/pedidos/",
    date: "Agora",
    createdAt: String(order.createdAt || new Date().toISOString())
  };

  if (window.StopModNotifications && typeof window.StopModNotifications.add === "function") {
    window.StopModNotifications.add(payload);
    if (typeof window.StopModNotifications.sync === "function") {
      window.StopModNotifications.sync();
    }
    return;
  }

  const notes = loadNotes();
  const idx = notes.findIndex((n) => String(n?.id || "") === payload.id);
  if (idx >= 0) notes[idx] = { ...notes[idx], ...payload };
  else notes.unshift(payload);
  saveNotes(notes.slice(0, 500));
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

function openModal() {
  if (!checkoutModal) return;
  renderAddressConfirmation();
  clearCheckoutFeedback();
  checkoutModal.hidden = false;
}

function closeModal() {
  if (!checkoutModal) return;
  clearCheckoutFeedback();
  checkoutModal.hidden = true;
}

function syncPaymentRadios() {
  if (!paymentForm) return;
  const cur = loadPayment();
  const radios = paymentForm.querySelectorAll("input[name=\"pay\"]");
  radios.forEach((r) => {
    r.checked = String(r.value) === cur;
  });
  setMorePaymentsOpen(shouldExpandMorePayments(cur));
}

function selectedPaymentFromModal() {
  if (!paymentForm) return "";
  const checked = paymentForm.querySelector("input[name=\"pay\"]:checked");
  return checked ? String(checked.value) : "";
}

function shouldExpandMorePayments(method) {
  const value = String(method || "").trim();
  return value === "debito" || value === "boleto";
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
    return;
  }

  const cep = shipTo.cep;

  const term = normalizeText(searchInput?.value);
  const grouped = groupedCart(ids).filter((item) =>
    !term ? true : normalizeText(`${item.name} ${item.category} ${item.size}`).includes(term)
  );
  if (!grouped.length) {
    cartItems.innerHTML = "<li class=\"empty\">Nenhum item encontrado.</li>";
  } else {
    cartItems.innerHTML = grouped
      .map((item) => {
        const meta = [item.category, item.size].filter(Boolean).join(" | ");
        return `
        <li class="cart-item">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="cart-item-body">
            <strong>${item.name}</strong>
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

searchInput?.addEventListener("input", renderCart);
searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  openStoreProductSearch();
});

checkoutModal?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

toggleMorePaymentsBtn?.addEventListener("click", () => {
  const isOpen = String(toggleMorePaymentsBtn.getAttribute("aria-expanded") || "false") === "true";
  setMorePaymentsOpen(!isOpen);
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
  if (!hasActiveAuthSession()) {
    closeModal();
    feedback.textContent = "Sua sessao expirou. Faca login novamente para continuar.";
    redirectToLoginForCheckout();
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
  if (!confirmedInModal && !isAddressConfirmed(shipTo)) {
    setCheckoutFeedback("Confirme o endereco ou altere antes de continuar.", true);
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

  if (confirmPaymentBtn) {
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = "Gerando pagamento...";
  }

  savePayment(method);
  updatePaymentUI(method);

  try {
    const endpoint = resolvePagBankCheckoutEndpoint();
    const data = await postJson(endpoint, payload, 22000);
    const checkoutUrl = String(data?.checkoutUrl || "").trim();

    if (!checkoutUrl) {
      throw new Error("PagBank nao retornou URL de pagamento.");
    }

    localStorage.setItem(
      "stopmod_pending_checkout",
      JSON.stringify({
        referenceId: String(data?.referenceId || payload.referenceId),
        method,
        createdAt: new Date().toISOString()
      })
    );

    closeModal();
    feedback.textContent = "Redirecionando para o PagBank...";
    window.location.href = checkoutUrl;
  } catch (error) {
    feedback.textContent = `Falha ao iniciar pagamento real: ${String(error?.message || "tente novamente.")}`;
  } finally {
    if (confirmPaymentBtn) {
      confirmPaymentBtn.disabled = false;
      confirmPaymentBtn.textContent = confirmPaymentDefaultLabel;
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && checkoutModal && !checkoutModal.hidden) {
    closeModal();
  }
});

bindAuthActivity();
setMorePaymentsOpen(false);
renderCart();
renderTopProfile();

window.addEventListener("storage", (event) => {
  if (event.key === PROFILE_KEY) renderTopProfile();
  if (event.key === SHIP_KEY || event.key === LEGACY_SHIP_KEY || event.key === CART_KEY) {
    renderCart();
  }
});
