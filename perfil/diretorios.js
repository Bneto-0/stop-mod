const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const PROFILE_KEY = "stopmod_profile";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const AUTH_TIMEOUT_MS = 30 * 60 * 1000;
const AUTH_TOUCH_MIN_GAP_MS = 15 * 1000;
const ORDERS_KEY = "stopmod_orders";
const FAVORITES_KEY = "stopmod_favorites";
const SHIP_LIST_KEY = "stopmod_ship_list";
const NOTES_KEY = "stopmod_notifications";

const PRODUCTS = [
  { id: 1, name: "Camiseta Oversized Street", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Calca Cargo Urban", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Jaqueta Jeans Vintage", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Moletom Essential Stop", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Vestido Casual Minimal", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Camisa Linho Leve", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Cardigan Tricot Cozy", image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Blazer Minimal Preto", image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=700&q=80" },
  { id: 9, name: "Saia Midi Plissada", image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=700&q=80" },
  { id: 10, name: "Short Alfaiataria", image: "https://images.unsplash.com/photo-1542293787938-4d273c37c18d?auto=format&fit=crop&w=700&q=80" },
  { id: 11, name: "Tenis Street Clean", image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=700&q=80" },
  { id: 12, name: "Bolsa Tote Minimal", image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=700&q=80" }
];

const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

const MODE_META = {
  pedidos: {
    title: "Pedidos",
    desc: "Todos os pedidos: em entrega, entregues e cancelados."
  },
  compras: {
    title: "Minhas compras",
    desc: "Compras ja entregues para voce."
  },
  processando: {
    title: "Processando",
    desc: "Pedidos que ainda estao em preparacao ou entrega."
  },
  favoritos: {
    title: "Favoritos",
    desc: "Produtos que voce marcou como favoritos."
  },
  enderecos: {
    title: "Enderecos",
    desc: "Enderecos salvos para entrega."
  },
  privacidade: {
    title: "Privacidade",
    desc: "Preferencias e controle dos seus dados."
  },
  comunicacoes: {
    title: "Comunicacoes",
    desc: "Promocoes e avisos da loja."
  }
};

const bodyMode = String(document.body?.dataset?.mode || "").trim().toLowerCase();
const mode = Object.prototype.hasOwnProperty.call(MODE_META, bodyMode) ? bodyMode : "pedidos";

const cartCount = document.getElementById("cart-count");
const avatarEl = document.getElementById("avatar");
const cornerLabel = document.getElementById("corner-label");
const accountAvatarEl = document.getElementById("account-avatar");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const pageTitleEl = document.getElementById("page-title");
const pageDescEl = document.getElementById("page-desc");
const contentRoot = document.getElementById("content-root");
const logoutBtn = document.getElementById("logout");
const tabLinks = document.querySelectorAll("[data-dir-tab]");
const menuLocationEl = document.getElementById("menu-location");
const searchInput = document.getElementById("search-input");

let lastAuthTouchAt = 0;

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function fmtBRL(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(value) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return String(value || "");
  }
}

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadCartIds() {
  const ids = loadJson(CART_KEY, []);
  return Array.isArray(ids) ? ids : [];
}

function loadShipTo() {
  const raw = loadJson(SHIP_KEY, {});
  return {
    city: String(raw?.city || "").trim(),
    cep: String(raw?.cep || "").trim()
  };
}

function loadOrders() {
  const orders = loadJson(ORDERS_KEY, []);
  return Array.isArray(orders) ? orders : [];
}

function loadFavoriteIds() {
  const ids = loadJson(FAVORITES_KEY, []);
  return Array.isArray(ids) ? ids : [];
}

function loadProfile() {
  const profile = loadJson(PROFILE_KEY, null);
  if (!profile || typeof profile !== "object") return null;
  return profile;
}

function loadShipList() {
  const list = loadJson(SHIP_LIST_KEY, []);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      city: String(item?.city || "").trim(),
      cep: String(item?.cep || "").trim()
    }))
    .filter((item) => item.city || item.cep);
}

function loadNotifications() {
  const notes = loadJson(NOTES_KEY, []);
  if (!Array.isArray(notes) || !notes.length) {
    return [
      { id: "n1", type: "promo", title: "Sem notificacoes novas", text: "As proximas promocoes vao aparecer aqui.", date: "Agora" }
    ];
  }
  return notes;
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

function goToLogin() {
  const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.href = `../../login/?next=${encodeURIComponent(nextPath)}`;
}

function paymentLabel(value) {
  const key = normalizeText(value);
  if (key.includes("credito")) return "Cartao de credito";
  if (key.includes("debito")) return "Cartao de debito";
  if (key.includes("boleto")) return "Boleto";
  return "Pix";
}

function stageForOrder(order) {
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

function getStatusLabel(order) {
  const raw = String(order?.tracking?.status || order?.status || "").trim();
  if (raw) return raw;
  return stageForOrder(order).key;
}

function getOrderBucket(order) {
  const rawStatus = normalizeText(order?.tracking?.status || order?.status || "");
  if (order?.cancelled === true || rawStatus.includes("cancel")) return "cancelled";
  if (rawStatus.includes("entreg")) return "delivered";

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
  const qty = itemCount(order);

  return `
    <article class="order-card">
      <div class="order-top">
        <div>
          <div class="order-id">${escapeHtml(order?.id || "Pedido")}</div>
          <div class="muted2">Data: ${escapeHtml(fmtDate(order?.createdAt || ""))}</div>
          <div class="muted2">Entrega: ${escapeHtml(ship || "Nao informado")}</div>
        </div>
        <div class="order-total">R$ ${escapeHtml(fmtBRL(total))}</div>
      </div>
      <div class="order-mid">
        <span class="${statusChipClass(bucket)}">${escapeHtml(stage)}</span>
        <span class="muted2">Itens: ${escapeHtml(qty)}</span>
        <span class="muted2">Pagamento: ${escapeHtml(paymentLabel(order?.payment || "pix"))}</span>
        <span class="muted2">Rastreio: ${escapeHtml(order?.tracking?.code || "--")}</span>
      </div>
      <details>
        <summary>Ver itens</summary>
        <div class="items">
          ${(order?.items || [])
            .map((item) => `
              <div class="item">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <div class="muted2">Qtd: ${escapeHtml(item.qty)} | R$ ${escapeHtml(fmtBRL(item.price))}</div>
                </div>
              </div>
            `)
            .join("")}
        </div>
      </details>
    </article>
  `;
}

function renderOrderGroup(title, orders, bucket, emptyText) {
  return `
    <section class="orders-group">
      <div class="orders-group-head">
        <h3>${escapeHtml(title)}</h3>
        <span class="orders-count">${escapeHtml(orders.length)}</span>
      </div>
      <div class="orders-list">
        ${
          orders.length
            ? orders.map((order) => renderOrderCard(order, bucket)).join("")
            : `<p class="orders-empty">${escapeHtml(emptyText)}</p>`
        }
      </div>
    </section>
  `;
}

function renderPedidosPage(orders) {
  const buckets = {
    "in-progress": [],
    delivered: [],
    cancelled: []
  };

  orders.forEach((order) => {
    const bucket = getOrderBucket(order);
    buckets[bucket].push(order);
  });

  contentRoot.innerHTML = [
    renderOrderGroup("Em entrega", buckets["in-progress"], "in-progress", "Nenhum pedido em entrega."),
    renderOrderGroup("Entregues", buckets.delivered, "delivered", "Nenhum pedido entregue."),
    renderOrderGroup("Cancelados", buckets.cancelled, "cancelled", "Nenhum pedido cancelado.")
  ].join("");
}

function renderComprasPage(orders) {
  const delivered = orders.filter((order) => getOrderBucket(order) === "delivered");
  contentRoot.innerHTML = renderOrderGroup("Compras entregues", delivered, "delivered", "Voce ainda nao tem compras entregues.");
}

function renderProcessandoPage(orders) {
  const processing = orders.filter((order) => getOrderBucket(order) === "in-progress");
  contentRoot.innerHTML = renderOrderGroup("Pedidos em andamento", processing, "in-progress", "Voce nao tem pedidos processando.");
}

function renderFavoritosPage() {
  const favoriteIds = loadFavoriteIds();
  if (!favoriteIds.length) {
    contentRoot.innerHTML = '<p class="orders-empty">Voce ainda nao tem produtos favoritos.</p>';
    return;
  }

  contentRoot.innerHTML = favoriteIds
    .map((id) => {
      const item = PRODUCT_BY_ID.get(Number(id));
      const name = item?.name || `Produto ${id}`;
      const image = item?.image || "../../assets/icons/user-solid.svg";
      return `
        <article class="fav-card">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" />
          <div>
            <strong>${escapeHtml(name)}</strong>
            <div class="muted2">ID: ${escapeHtml(id)}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function formatAddress(item) {
  const city = String(item?.city || "").trim();
  const cep = String(item?.cep || "").trim();
  if (city && cep) return `${city} - CEP ${cep}`;
  if (city) return city;
  if (cep) return `CEP ${cep}`;
  return "Endereco sem dados";
}

function renderEnderecosPage() {
  const current = loadShipTo();
  const list = loadShipList();
  const currentText = formatAddress(current);

  const savedHtml = list.length
    ? list
      .map((item, idx) => `
        <article class="mini-card">
          <strong>Endereco ${escapeHtml(idx + 1)}</strong>
          <p class="muted2">${escapeHtml(formatAddress(item))}</p>
        </article>
      `)
      .join("")
    : '<p class="orders-empty">Voce ainda nao tem enderecos salvos.</p>';

  contentRoot.innerHTML = `
    <section class="orders-group">
      <div class="orders-group-head">
        <h3>Endereco atual</h3>
      </div>
      <div class="orders-list">
        <article class="mini-card">
          <strong>Selecionado para entrega</strong>
          <p class="muted2">${escapeHtml(currentText)}</p>
        </article>
      </div>
    </section>

    <section class="orders-group">
      <div class="orders-group-head">
        <h3>Enderecos salvos</h3>
        <span class="orders-count">${escapeHtml(list.length)}</span>
      </div>
      <div class="orders-list">${savedHtml}</div>
    </section>

    <a class="btn dir-link-btn" href="../../entrega/">Editar enderecos completos</a>
  `;
}

function renderPrivacidadePage() {
  const profile = loadProfile() || {};
  const email = String(profile?.email || "Nao informado");

  contentRoot.innerHTML = `
    <section class="orders-group">
      <div class="orders-group-head">
        <h3>Dados da conta</h3>
      </div>
      <div class="orders-list">
        <article class="mini-card">
          <strong>Email principal</strong>
          <p class="muted2">${escapeHtml(email)}</p>
        </article>
        <article class="mini-card">
          <strong>Sessao de login</strong>
          <p class="muted2">A sessao expira apos 30 minutos sem atividade.</p>
        </article>
        <article class="mini-card">
          <strong>Controle de dados</strong>
          <p class="muted2">Voce pode revisar politica e termos sempre que quiser.</p>
        </article>
      </div>
    </section>

    <div class="dir-actions">
      <a class="btn dir-link-btn" href="../../privacidade/">Abrir politica de privacidade</a>
      <a class="btn dir-link-btn alt" href="../../termos/">Abrir termos de servico</a>
    </div>
  `;
}

function notificationChip(type) {
  const key = normalizeText(type);
  if (key.includes("premio")) return '<span class="chip status-delivered">Premio</span>';
  if (key.includes("promo")) return '<span class="chip status-progress">Promocao</span>';
  return '<span class="chip">Aviso</span>';
}

function renderComunicacoesPage() {
  const notes = loadNotifications();
  const listHtml = notes
    .map((note) => `
      <article class="mini-card">
        <div class="mini-head">
          <strong>${escapeHtml(note?.title || "Notificacao")}</strong>
          ${notificationChip(note?.type || "")}
        </div>
        <p class="muted2">${escapeHtml(note?.text || "")}</p>
        <p class="muted2">Data: ${escapeHtml(note?.date || "Hoje")}</p>
      </article>
    `)
    .join("");

  contentRoot.innerHTML = `
    <section class="orders-group">
      <div class="orders-group-head">
        <h3>Minhas comunicacoes</h3>
        <span class="orders-count">${escapeHtml(notes.length)}</span>
      </div>
      <div class="orders-list">${listHtml}</div>
    </section>
    <a class="btn dir-link-btn" href="../../notificacoes/">Abrir central completa de notificacoes</a>
  `;
}

function renderHeader(profile) {
  const displayName = String(profile?.name || "Cliente Stop mod");
  const email = String(profile?.email || "Conta conectada");
  const picture = String(profile?.picture || "").trim();
  const avatar = picture || "../../assets/icons/user-solid.svg";

  if (avatarEl) avatarEl.src = avatar;
  if (cornerLabel) cornerLabel.textContent = displayName;
  if (accountAvatarEl) accountAvatarEl.src = avatar;
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = email;
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
  menuLocationEl.textContent = shipTo.city || "Sao paulo";
}

function goToStoreSearch() {
  const query = String(searchInput?.value || "").trim();
  const target = query ? `../../index.html?q=${encodeURIComponent(query)}#produtos` : "../../index.html#produtos";
  window.location.href = target;
}

function renderPageContent() {
  const meta = MODE_META[mode] || MODE_META.pedidos;
  if (pageTitleEl) pageTitleEl.textContent = meta.title;
  if (pageDescEl) pageDescEl.textContent = meta.desc;

  tabLinks.forEach((link) => {
    link.classList.toggle("active", String(link.dataset.dirTab || "") === mode);
  });

  if (mode === "favoritos") {
    renderFavoritosPage();
    return;
  }

  if (mode === "enderecos") {
    renderEnderecosPage();
    return;
  }

  if (mode === "privacidade") {
    renderPrivacidadePage();
    return;
  }

  if (mode === "comunicacoes") {
    renderComunicacoesPage();
    return;
  }

  const orders = loadOrders();
  if (mode === "compras") {
    renderComprasPage(orders);
    return;
  }

  if (mode === "processando") {
    renderProcessandoPage(orders);
    return;
  }

  renderPedidosPage(orders);
}

function init() {
  const profile = loadActiveProfile();
  if (!profile) {
    goToLogin();
    return;
  }

  touchAuthSession(true);
  renderHeader(profile);
  renderMenuLocation();
  updateCartCount();
  renderPageContent();
  bindAuthActivity();
}

logoutBtn?.addEventListener("click", () => {
  clearAuthSession();
  goToLogin();
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  goToStoreSearch();
});

init();
