const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const DEFAULT_GOOGLE_CLIENT_ID = "887504211072-0elgoi3dbg80bb9640vvlqfl7cp8guq5.apps.googleusercontent.com";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const AUTH_TIMEOUT_MS = 30 * 60 * 1000;
const AUTH_TOUCH_MIN_GAP_MS = 15 * 1000;
const ORDERS_KEY = "stopmod_orders";
const FAVORITES_KEY = "stopmod_favorites";
const DEFAULT_PROFILE_PANEL = "account";

const cartCount = document.getElementById("cart-count");
const menuLocationEl = document.getElementById("menu-location");
const searchInput = document.getElementById("search-input");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const clientInput = document.getElementById("google-client");
const saveClientBtn = document.getElementById("save-client");
const clientMsg = document.getElementById("client-msg");
const clientNote = document.getElementById("client-note");
const clientAdv = document.getElementById("client-adv");
const loginMsg = document.getElementById("login-msg");
const gbtn = document.getElementById("gbtn");
const gWarn = document.getElementById("g-warn");
const logoutBtn = document.getElementById("logout");
const heroTabs = document.getElementById("hero-tabs");

const viewAuthed = document.getElementById("view-authed");
const viewGuest = document.getElementById("view-guest");
const detailSections = document.getElementById("detail-sections");
const avatarEl = document.getElementById("avatar");
const accountAvatarEl = document.getElementById("account-avatar");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const cornerLabel = document.getElementById("corner-label");

const tabPanels = document.querySelectorAll("[data-panel]");

const accFullName = document.getElementById("acc-full-name");
const accCpf = document.getElementById("acc-cpf");
const accPreferredName = document.getElementById("acc-preferred-name");
const accTaxAddress = document.getElementById("acc-tax-address");
const accEmail = document.getElementById("acc-email");
const accPhone = document.getElementById("acc-phone");
const accUsername = document.getElementById("acc-username");
const accSave = document.getElementById("acc-save");
const accMsg = document.getElementById("acc-msg");

const ordersInProgressList = document.getElementById("orders-in-progress-list");
const ordersDeliveredList = document.getElementById("orders-delivered-list");
const ordersCancelledList = document.getElementById("orders-cancelled-list");
const ordersInProgressCount = document.getElementById("orders-in-progress-count");
const ordersDeliveredCount = document.getElementById("orders-delivered-count");
const ordersCancelledCount = document.getElementById("orders-cancelled-count");
const purchasesDeliveredList = document.getElementById("purchases-delivered-list");
const purchasesDeliveredCount = document.getElementById("purchases-delivered-count");
const processingOrdersList = document.getElementById("processing-orders-list");
const processingOrdersCount = document.getElementById("processing-orders-count");
const favoritesList = document.getElementById("favorites-list");

let lastAuthTouchAt = 0;
let redirectingToLogin = false;

function loadCartIds() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadShipTo() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHIP_KEY) || "{}");
    return {
      street: String(raw?.street || "").trim(),
      number: String(raw?.number || "").trim(),
      city: String(raw?.city || "").trim(),
      cep: String(raw?.cep || "").trim()
    };
  } catch {
    return { street: "", number: "", city: "", cep: "" };
  }
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function renderMenuLocation() {
  if (!menuLocationEl) return;
  const shipTo = loadShipTo();
  const street = String(shipTo.street || "").trim();
  const number = String(shipTo.number || "").trim();
  const streetLine = street ? [street, number].filter(Boolean).join(", ") : "";
  menuLocationEl.textContent = streetLine || "Rua nao informada";
}

function renderTopProfile(profile, nameOverride) {
  if (!profileTopLink || !profileTopName) return;

  if (!profile) {
    profileTopName.textContent = "Perfil";
    profileTopLink.classList.remove("logged");
    profileTopLink.setAttribute("aria-label", "Perfil");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.removeAttribute("src");
      profileTopPhoto.alt = "";
    }
    return;
  }

  const displayName = String(nameOverride || profile?.name || "").trim() || "Perfil";
  const picture = String(profile?.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.classList.add("logged");
  profileTopLink.setAttribute("aria-label", `Perfil de ${displayName}`);
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function goToStoreSearch() {
  const query = String(searchInput?.value || "").trim();
  const target = query ? `../index.html?q=${encodeURIComponent(query)}#produtos` : "../index.html#produtos";
  window.location.href = target;
}

function loadClientId() {
  return String(localStorage.getItem(GOOGLE_CLIENT_KEY) || DEFAULT_GOOGLE_CLIENT_ID || "").trim();
}

function saveClientId(id) {
  localStorage.setItem(GOOGLE_CLIENT_KEY, String(id || "").trim());
}

function isLikelyGoogleClientId(v) {
  const s = String(v || "").trim();
  return !!s && /\.apps\.googleusercontent\.com$/i.test(s);
}

function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function clearAuthSession() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(AUTH_LAST_SEEN_KEY);
}

function touchAuthSession(force) {
  const profile = loadProfile();
  if (!profile) return;
  const now = Date.now();
  if (!force && now - lastAuthTouchAt < AUTH_TOUCH_MIN_GAP_MS) return;
  lastAuthTouchAt = now;
  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(now));
}

function loadActiveProfile() {
  const profile = loadProfile();
  if (!profile) return null;

  const rawLastSeen = Number(localStorage.getItem(AUTH_LAST_SEEN_KEY) || "0");
  if (!Number.isFinite(rawLastSeen) || rawLastSeen <= 0) {
    touchAuthSession(true);
    return profile;
  }

  if (Date.now() - rawLastSeen > AUTH_TIMEOUT_MS) {
    clearAuthSession();
    return null;
  }

  return profile;
}

function resolveLoginUrlFromProfile() {
  const nextPath = `../perfil/${window.location.search || ""}${window.location.hash || ""}`;
  return `../login/?next=${encodeURIComponent(nextPath)}`;
}

function goToLoginFromProfile() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  window.location.href = resolveLoginUrlFromProfile();
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

function loadExtra() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_EXTRA_KEY) || "null") || {};
  } catch {
    return {};
  }
}

function saveExtra(extra) {
  localStorage.setItem(PROFILE_EXTRA_KEY, JSON.stringify(extra || {}));
}

function loadOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function loadFavoriteIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function fmtBRL(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return String(iso || "");
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function deriveUsername(profile, extra) {
  const custom = String(extra?.username || "").trim();
  if (custom) return custom;
  const email = String(profile?.email || "").trim();
  if (email.includes("@")) return email.split("@")[0];
  const fallback = String(extra?.displayName || profile?.name || "cliente-stopmod");
  return fallback.toLowerCase().replace(/\s+/g, "-");
}

function jwtPayload(token) {
  // Client-only decode. No signature verification.
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = atob(b64 + pad);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function ensureGoogleScript(cb) {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    cb();
    return;
  }
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = cb;
  document.head.appendChild(s);
}

function initGoogle() {
  const clientId = loadClientId();
  if (gWarn) gWarn.hidden = true;
  if (!clientId) {
    if (gWarn) gWarn.hidden = false;
    return;
  }

  ensureGoogleScript(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      loginMsg.textContent = "Nao foi possivel carregar o Google. Tente novamente.";
      if (gWarn) gWarn.hidden = false;
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          if (!resp || !resp.credential) {
            loginMsg.textContent = "Falha ao entrar.";
            return;
          }
          const p = jwtPayload(resp.credential) || {};
          saveProfile({
            name: String(p.name || "Cliente Stop mod"),
            email: String(p.email || ""),
            picture: String(p.picture || "")
          });
          touchAuthSession(true);
          loginMsg.textContent = "Login realizado.";
          renderAuth();
        }
      });

      gbtn.innerHTML = "";
      window.google.accounts.id.renderButton(gbtn, {
        theme: "outline",
        size: "large",
        text: "continue_with"
      });

      // Hide the warning only if the button actually rendered.
      setTimeout(() => {
        const rendered = !!(gbtn && gbtn.querySelector("iframe, div, span, button"));
        if (gWarn) gWarn.hidden = rendered;
      }, 600);
    } catch {
      loginMsg.textContent = "Erro ao iniciar Google. Verifique o Client ID.";
      if (gWarn) gWarn.hidden = false;
    }
  });
}

function setTab(tabId) {
  const requested = String(tabId || "").trim() || DEFAULT_PROFILE_PANEL;
  const hasPanel = Array.from(tabPanels).some((panel) => panel.getAttribute("data-panel") === requested);
  const safeTabId = hasPanel ? requested : DEFAULT_PROFILE_PANEL;
  tabPanels.forEach((panel) => {
    panel.hidden = panel.getAttribute("data-panel") !== safeTabId;
  });
}

function stageForOrder(order) {
  // Simple estimation based on time since purchase.
  try {
    const created = new Date(order.createdAt).getTime();
    const hours = (Date.now() - created) / 36e5;
    if (hours < 6) return { key: "Preparando", pct: 25 };
    if (hours < 24) return { key: "Enviado", pct: 55 };
    if (hours < 48) return { key: "Saiu para entrega", pct: 80 };
    return { key: "Entregue", pct: 100 };
  } catch {
    return { key: "Preparando", pct: 25 };
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paymentLabel(value) {
  const key = normalizeText(value);
  if (key.includes("credito")) return "Cartao de credito";
  if (key.includes("debito")) return "Cartao de debito";
  if (key.includes("boleto")) return "Boleto";
  return "Pix";
}

function getStatusLabel(order) {
  const raw = String(order?.tracking?.status || order?.status || "").trim();
  if (raw) return raw;
  return stageForOrder(order).key;
}

function getStatusBucket(order) {
  const rawStatus = normalizeText(order?.tracking?.status || order?.status || "");

  if (order?.cancelled === true || rawStatus.includes("cancel")) {
    return "cancelled";
  }

  if (rawStatus.includes("entreg")) {
    return "delivered";
  }

  if (
    rawStatus.includes("prepar") ||
    rawStatus.includes("process") ||
    rawStatus.includes("envi") ||
    rawStatus.includes("transit") ||
    rawStatus.includes("transito") ||
    rawStatus.includes("rota") ||
    rawStatus.includes("saiu")
  ) {
    return "in-progress";
  }

  const stage = stageForOrder(order);
  if (normalizeText(stage.key).includes("entreg")) return "delivered";
  return "in-progress";
}

function statusChipClass(bucket) {
  if (bucket === "delivered") return "chip status-delivered";
  if (bucket === "cancelled") return "chip status-cancelled";
  return "chip status-progress";
}

function itemCount(order) {
  return (order?.items || []).reduce((sum, item) => sum + (Number(item?.qty) || 0), 0);
}

function renderOrderCard(order, bucket) {
  const total = order?.totals?.total ?? 0;
  const ship = order?.shipTo ? `${order.shipTo.city || ""} ${order.shipTo.cep || ""}`.trim() : "";
  const stage = getStatusLabel(order);
  const cardClass = statusChipClass(bucket);
  const qty = itemCount(order);

  return `
    <article class="order">
      <div class="order-top">
        <div>
          <div class="order-id">${escapeHtml(order?.id || "Pedido")}</div>
          <div class="muted2">Data: ${escapeHtml(fmtDate(order?.createdAt || ""))}</div>
          <div class="muted2">Entrega: ${escapeHtml(ship || "Nao informado")}</div>
        </div>
        <div class="order-total">R$ ${escapeHtml(fmtBRL(total))}</div>
      </div>
      <div class="order-mid">
        <span class="${cardClass}">${escapeHtml(stage)}</span>
        <span class="muted2">Itens: ${escapeHtml(qty)}</span>
        <span class="muted2">Pagamento: ${escapeHtml(paymentLabel(order?.payment || "pix"))}</span>
        <span class="muted2">Rastreio: ${escapeHtml(order?.tracking?.code || "--")}</span>
      </div>
      <details class="order-details">
        <summary>Ver itens</summary>
        <div class="items">
          ${(order?.items || [])
            .map((it) => `
              <div class="item">
                <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" loading="lazy" />
                <div>
                  <strong>${escapeHtml(it.name)}</strong>
                  <div class="muted2">Qtd: ${escapeHtml(it.qty)} | R$ ${escapeHtml(fmtBRL(it.price))}</div>
                </div>
              </div>
            `)
            .join("")}
        </div>
      </details>
    </article>
  `;
}

function fillOrderBucket(listEl, countEl, orders, emptyText, bucket) {
  if (countEl) countEl.textContent = String(orders.length);
  if (!listEl) return;

  if (!orders.length) {
    listEl.innerHTML = `<p class="orders-empty">${escapeHtml(emptyText)}</p>`;
    return;
  }

  listEl.innerHTML = orders.map((order) => renderOrderCard(order, bucket)).join("");
}

function renderOrders() {
  const orders = loadOrders();
  if (
    !ordersInProgressList &&
    !ordersDeliveredList &&
    !ordersCancelledList &&
    !purchasesDeliveredList &&
    !processingOrdersList
  ) return;

  const buckets = {
    "in-progress": [],
    delivered: [],
    cancelled: []
  };

  orders.forEach((order) => {
    const bucket = getStatusBucket(order);
    buckets[bucket].push(order);
  });

  fillOrderBucket(
    ordersInProgressList,
    ordersInProgressCount,
    buckets["in-progress"],
    "Nenhum pedido em entrega.",
    "in-progress"
  );
  fillOrderBucket(
    ordersDeliveredList,
    ordersDeliveredCount,
    buckets.delivered,
    "Nenhum pedido entregue.",
    "delivered"
  );
  fillOrderBucket(
    ordersCancelledList,
    ordersCancelledCount,
    buckets.cancelled,
    "Nenhum pedido cancelado.",
    "cancelled"
  );
  fillOrderBucket(
    purchasesDeliveredList,
    purchasesDeliveredCount,
    buckets.delivered,
    "Voce ainda nao tem compras entregues.",
    "delivered"
  );
  fillOrderBucket(
    processingOrdersList,
    processingOrdersCount,
    buckets["in-progress"],
    "Voce nao tem pedidos processando.",
    "in-progress"
  );

  if (!orders.length) {
    if (ordersInProgressCount) ordersInProgressCount.textContent = "0";
    if (ordersDeliveredCount) ordersDeliveredCount.textContent = "0";
    if (ordersCancelledCount) ordersCancelledCount.textContent = "0";
    if (purchasesDeliveredCount) purchasesDeliveredCount.textContent = "0";
    if (processingOrdersCount) processingOrdersCount.textContent = "0";
    return;
  }
}

function renderFavorites() {
  if (!favoritesList) return;
  const favorites = loadFavoriteIds();
  if (!favorites.length) {
    favoritesList.innerHTML = "<p class=\"muted2\">Voce ainda nao tem produtos favoritos.</p>";
    return;
  }

  favoritesList.innerHTML = favorites
    .map((id, idx) => `
      <article class="order">
        <div class="order-top">
          <div>
            <div class="order-id">Favorito ${escapeHtml(idx + 1)}</div>
            <div class="muted2">Produto ID: ${escapeHtml(id)}</div>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderAccount(activeProfile) {
  const p = activeProfile || loadActiveProfile();
  if (!p) return;
  const extra = loadExtra();
  const fullName = String(extra.fullName || extra.displayName || p?.name || "Cliente Stop mod");
  const preferredName = String(extra.preferredName || extra.displayName || fullName);
  const username = deriveUsername(p, extra);

  if (accFullName) accFullName.value = fullName;
  if (accCpf) accCpf.value = String(extra.cpf || "");
  if (accPreferredName) accPreferredName.value = preferredName;
  if (accTaxAddress) accTaxAddress.value = String(extra.taxAddress || "");
  if (accEmail) accEmail.value = String(p?.email || "");
  if (accPhone) accPhone.value = String(extra.phone || "");
  if (accUsername) accUsername.value = username;

  if (nameEl) nameEl.textContent = preferredName;
  // Avoid showing personal email in the public UI; use a simple status line instead.
  if (emailEl) emailEl.textContent = String(p?.email || "Conta conectada");
  if (cornerLabel) cornerLabel.textContent = preferredName;
  renderTopProfile(p, preferredName);
  if (avatarEl) {
    const pic = String(p?.picture || "").trim();
    avatarEl.src = pic || "../assets/icons/user-solid.svg";
  }
  if (accountAvatarEl) {
    const pic = String(p?.picture || "").trim();
    accountAvatarEl.src = pic || "../assets/icons/user-solid.svg";
  }
}

function renderAuth() {
  const p = loadActiveProfile();
  const authed = !!p;
  if (viewAuthed) viewAuthed.hidden = !authed;
  if (viewGuest) viewGuest.hidden = authed;
  if (heroTabs) heroTabs.hidden = !authed;
  if (logoutBtn) logoutBtn.style.display = authed ? "inline-flex" : "none";

  if (!authed) {
    if (nameEl) nameEl.textContent = "Nao logado";
    if (emailEl) emailEl.textContent = "Faca login para ver seus pedidos.";
    if (cornerLabel) cornerLabel.textContent = "Perfil";
    if (avatarEl) avatarEl.src = "../assets/icons/user-solid.svg";
    renderTopProfile(null);
    goToLoginFromProfile();
    return false;
  }

  touchAuthSession(true);
  renderAccount(p);
  renderOrders();
  renderFavorites();
  if (detailSections) detailSections.hidden = false;
  setTab(DEFAULT_PROFILE_PANEL);
  return true;
}

saveClientBtn?.addEventListener("click", () => {
  const v = String(clientInput?.value || "").trim();
  saveClientId(v);
  clientMsg.textContent = v ? "Client ID salvo." : "Client ID removido.";
  initGoogle();
});

// Auto-save the Client ID (no need to click "Salvar").
let clientSaveTimer = null;
clientInput?.addEventListener("input", () => {
  if (!clientMsg) return;
  if (clientSaveTimer) clearTimeout(clientSaveTimer);
  clientSaveTimer = setTimeout(() => {
    const v = String(clientInput?.value || "").trim();
    saveClientId(v);
    clientMsg.textContent = !v ? "Client ID removido." : (isLikelyGoogleClientId(v) ? "Client ID salvo automaticamente." : "Salvo automaticamente (verifique se o ID esta correto).");
    initGoogle();
  }, 450);
});

logoutBtn?.addEventListener("click", () => {
  clearAuthSession();
  goToLoginFromProfile();
});

accSave?.addEventListener("click", () => {
  const p = loadProfile();
  if (!p) return;
  const extra = loadExtra();
  const fullName = String(accFullName?.value || "").trim();
  const preferredName = String(accPreferredName?.value || "").trim();
  extra.fullName = fullName;
  extra.displayName = preferredName || fullName || String(p?.name || "Cliente Stop mod");
  extra.preferredName = preferredName;
  extra.cpf = String(accCpf?.value || "").trim();
  extra.taxAddress = String(accTaxAddress?.value || "").trim();
  extra.phone = String(accPhone?.value || "").trim();
  extra.username = String(accUsername?.value || "").trim();
  saveExtra(extra);
  accMsg.textContent = "Conta atualizada.";
  renderAccount();
});

if (clientInput) {
  const hadStoredClientId = !!String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim();
  clientInput.value = loadClientId();
  if (!hadStoredClientId && DEFAULT_GOOGLE_CLIENT_ID) {
    localStorage.setItem(GOOGLE_CLIENT_KEY, DEFAULT_GOOGLE_CLIENT_ID);
    if (clientMsg) clientMsg.textContent = "Client ID configurado automaticamente.";
  }

  // Keep advanced config collapsed for most users.
  try {
    const current = String(clientInput?.value || "").trim();
    const isDefault = !!DEFAULT_GOOGLE_CLIENT_ID && current === DEFAULT_GOOGLE_CLIENT_ID;
    if (clientAdv) clientAdv.open = !isDefault && !!current;
    if (clientNote) clientNote.textContent = isDefault
      ? "Login Google ja esta configurado automaticamente. Se precisar, voce pode alterar o Client ID nas configuracoes avancadas."
      : "Se voce tiver um Client ID proprio, voce pode configurar nas configuracoes avancadas.";
  } catch {}
}
searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  goToStoreSearch();
});

updateCartCount();
renderMenuLocation();
const authedNow = renderAuth();
if (authedNow) {
  bindAuthActivity();
}
