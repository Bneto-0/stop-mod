const CART_KEY = "stopmod_cart";
const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const ORDERS_KEY = "stopmod_orders";

const cartCount = document.getElementById("cart-count");
const clientInput = document.getElementById("google-client");
const saveClientBtn = document.getElementById("save-client");
const clientMsg = document.getElementById("client-msg");
const loginMsg = document.getElementById("login-msg");
const gbtn = document.getElementById("gbtn");
const logoutBtn = document.getElementById("logout");

const viewAuthed = document.getElementById("view-authed");
const viewGuest = document.getElementById("view-guest");
const avatarEl = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");

const tabBtns = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-panel]");

const accName = document.getElementById("acc-name");
const accPhone = document.getElementById("acc-phone");
const accSave = document.getElementById("acc-save");
const accMsg = document.getElementById("acc-msg");

const ordersList = document.getElementById("orders-list");
const trackList = document.getElementById("track-list");

function loadCartIds() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function loadClientId() {
  return String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim();
}

function saveClientId(id) {
  localStorage.setItem(GOOGLE_CLIENT_KEY, String(id || "").trim());
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
  if (!clientId) return;

  ensureGoogleScript(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      loginMsg.textContent = "Nao foi possivel carregar o Google. Tente novamente.";
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
    } catch {
      loginMsg.textContent = "Erro ao iniciar Google. Verifique o Client ID.";
    }
  });
}

function setTab(tabId) {
  tabBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-tab") === tabId));
  tabPanels.forEach((p) => p.hidden = p.getAttribute("data-panel") !== tabId);
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

function renderOrders() {
  const orders = loadOrders();
  if (!ordersList || !trackList) return;

  if (!orders.length) {
    ordersList.innerHTML = "<p class=\"muted2\">Voce ainda nao tem pedidos.</p>";
    trackList.innerHTML = "<p class=\"muted2\">Voce ainda nao tem compras para acompanhar.</p>";
    return;
  }

  ordersList.innerHTML = orders
    .map((o) => {
      const stage = stageForOrder(o);
      const total = o?.totals?.total ?? 0;
      const ship = o?.shipTo ? `${o.shipTo.city || ""} ${o.shipTo.cep || ""}`.trim() : "";
      return `
        <article class="order">
          <div class="order-top">
            <div>
              <div class="order-id">${escapeHtml(o.id)}</div>
              <div class="muted2">Data: ${escapeHtml(fmtDate(o.createdAt))}</div>
              <div class="muted2">Entrega: ${escapeHtml(ship || "Nao informado")}</div>
            </div>
            <div class="order-total">R$ ${escapeHtml(fmtBRL(total))}</div>
          </div>
          <div class="order-mid">
            <span class="chip">${escapeHtml(stage.key)}</span>
            <span class="muted2">Pagamento: ${escapeHtml(o.payment || "pix")}</span>
            <span class="muted2">Rastreio: ${escapeHtml(o?.tracking?.code || "--")}</span>
          </div>
          <details class="order-details">
            <summary>Ver itens</summary>
            <div class="items">
              ${(o.items || [])
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
    })
    .join("");

  trackList.innerHTML = orders
    .map((o) => {
      const stage = stageForOrder(o);
      const ship = o?.shipTo ? `${o.shipTo.city || ""} ${o.shipTo.cep || ""}`.trim() : "";
      const steps = ["Preparando", "Enviado", "Saiu para entrega", "Entregue"];
      const idx = steps.indexOf(stage.key);
      return `
        <article class="track">
          <div class="order-top">
            <div>
              <div class="order-id">${escapeHtml(o.id)}</div>
              <div class="muted2">Entrega: ${escapeHtml(ship || "Nao informado")}</div>
              <div class="muted2">Rastreio: ${escapeHtml(o?.tracking?.code || "--")}</div>
            </div>
            <div class="chip">${escapeHtml(stage.key)}</div>
          </div>
          <div class="bar">
            <div class="bar-fill" style="width:${stage.pct}%;"></div>
          </div>
          <div class="steps">
            ${steps
              .map((s, i) => `<span class="step ${i <= idx ? "done" : ""}">${escapeHtml(s)}</span>`)
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAccount() {
  const p = loadProfile();
  const extra = loadExtra();
  const displayName = String(extra.displayName || p?.name || "Cliente Stop mod");
  const email = String(p?.email || "");

  if (accName) accName.value = displayName;
  if (accPhone) accPhone.value = String(extra.phone || "");

  nameEl.textContent = displayName;
  emailEl.textContent = email || "email nao informado";
  if (avatarEl) {
    const pic = String(p?.picture || "").trim();
    avatarEl.src = pic || "../assets/icons/cart-solid.svg";
  }
}

function renderAuth() {
  const p = loadProfile();
  const authed = !!p;
  if (viewAuthed) viewAuthed.hidden = !authed;
  if (viewGuest) viewGuest.hidden = authed;

  if (!authed) {
    nameEl.textContent = "Nao logado";
    emailEl.textContent = "Entre com Google para ver seus pedidos.";
    if (avatarEl) avatarEl.src = "../assets/icons/cart-solid.svg";
    return;
  }

  renderAccount();
  renderOrders();
  setTab("account");
}

saveClientBtn?.addEventListener("click", () => {
  const v = String(clientInput?.value || "").trim();
  saveClientId(v);
  clientMsg.textContent = v ? "Client ID salvo." : "Client ID removido.";
  initGoogle();
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem(PROFILE_KEY);
  renderAuth();
});

tabBtns.forEach((b) => {
  b.addEventListener("click", () => setTab(String(b.getAttribute("data-tab"))));
});

accSave?.addEventListener("click", () => {
  const p = loadProfile();
  if (!p) return;
  const extra = loadExtra();
  extra.displayName = String(accName?.value || "").trim();
  extra.phone = String(accPhone?.value || "").trim();
  saveExtra(extra);
  accMsg.textContent = "Conta atualizada.";
  renderAccount();
});

clientInput.value = loadClientId();
updateCartCount();
initGoogle();
renderAuth();
