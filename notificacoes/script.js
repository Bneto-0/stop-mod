const CART_KEY = "stopmod_cart";
const COUPON_KEY = "stopmod_coupons";
const NOTES_KEY = "stopmod_notifications";
const NOTES_READ_KEY = "stopmod_notifications_read";
const ORDERS_KEY = "stopmod_orders";
const FAVORITES_KEY = "stopmod_favorites";
const SHIP_KEY = "stopmod_ship_to";
const PROFILE_KEY = "stopmod_profile";
const PAGBANK_API_BASE_KEY = "stopmod_pagbank_api_base";
const PENDING_PAYMENT_TTL_MS = 5 * 60 * 60 * 1000;
const ORDER_STATUS_TIMEOUT_CANCELLED = "Cancelado por falta de finalizacao";
const NOTES_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const NOTES_READ_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;

const listEl = document.getElementById("list");
const feedback = document.getElementById("feedback");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const menuLocation = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const listCount = document.getElementById("list-count");

function loadJson(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseTime(value) {
  const ts = Date.parse(String(value || ""));
  return Number.isFinite(ts) ? ts : 0;
}

function defaultNoteTtlMs(note) {
  const scope = String(note?.scope || "general").toLowerCase();
  const type = normalizeText(note?.type || "");
  if (scope !== "individual") return 48 * 60 * 60 * 1000;
  if (type.includes("pedido")) return 30 * 24 * 60 * 60 * 1000;
  if (type.includes("cupom")) return 7 * 24 * 60 * 60 * 1000;
  if (type.includes("favorito")) return 5 * 24 * 60 * 60 * 1000;
  return 14 * 24 * 60 * 60 * 1000;
}

function resolveNoteExpiresAt(note, createdAtIso) {
  const explicit = parseTime(note?.expiresAt);
  if (explicit > 0) return new Date(explicit).toISOString();
  const createdMs = parseTime(createdAtIso) || Date.now();
  return new Date(createdMs + defaultNoteTtlMs(note)).toISOString();
}

function isNoteExpired(note) {
  const expiresMs = parseTime(note?.expiresAt);
  if (expiresMs > 0) return Date.now() > expiresMs;
  const createdMs = parseTime(note?.createdAt);
  if (createdMs <= 0) return false;
  return Date.now() - createdMs > NOTES_MAX_AGE_MS;
}

function normalizeReadStore(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  Object.entries(src).forEach(([key, value]) => {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) return;
    const ts = parseTime(value);
    if (ts > 0) out[normalizedKey] = new Date(ts).toISOString();
  });
  return out;
}

function loadReadStore() {
  return normalizeReadStore(loadJson(NOTES_READ_KEY, {}));
}

function saveReadStore(store) {
  saveJson(NOTES_READ_KEY, normalizeReadStore(store));
}

function pruneReadStore(store) {
  const map = store && typeof store === "object" ? store : {};
  let changed = false;
  const now = Date.now();
  Object.keys(map).forEach((key) => {
    const ts = parseTime(map[key]);
    if (ts <= 0 || now - ts > NOTES_READ_MAX_AGE_MS) {
      delete map[key];
      changed = true;
    }
  });
  return changed;
}

function readKeyForNote(note, currentUserKey) {
  const id = String(note?.id || "").trim();
  if (!id) return "";
  const scope = String(note?.scope || "general").toLowerCase();
  if (scope !== "individual") return `g:${id}`;
  const owner = normalizeText(note?.userKey || currentUserKey || "guest");
  return `u:${owner || "guest"}:${id}`;
}

function isNoteRead(note, currentUserKey, readStore) {
  const key = readKeyForNote(note, currentUserKey);
  if (!key) return false;
  return !!readStore?.[key];
}

function userKey() {
  const profile = loadJson(PROFILE_KEY, null);
  return normalizeText(profile?.email || "");
}

function loadCartIds() {
  const raw = loadJson(CART_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function loadShipTo() {
  const raw = loadJson(SHIP_KEY, {});
  return {
    street: String(raw?.street || "").trim(),
    number: String(raw?.number || "").trim(),
    city: String(raw?.city || "").trim(),
    cep: String(raw?.cep || "").trim()
  };
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadShipTo();
  const street = String(to.street || "").trim();
  const number = String(to.number || "").trim();
  const streetLine = street ? [street, number].filter(Boolean).join(", ") : "";
  menuLocation.textContent = streetLine || "Rua nao informada";
}

function loadProfile() {
  return loadJson(PROFILE_KEY, null);
}

function renderTopProfile() {
  if (!profileTopName || !profileTopLink) return;
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
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function upsert(list, note) {
  const id = String(note?.id || "").trim();
  if (!id) return;
  const idx = list.findIndex((n) => String(n?.id || "") === id);
  const previous = idx >= 0 ? (list[idx] || {}) : {};
  const createdAt = String(previous.createdAt || note.createdAt || new Date().toISOString());
  const expiresAt = String(note.expiresAt || previous.expiresAt || resolveNoteExpiresAt(note, createdAt));
  const next = {
    id,
    scope: String(note.scope || "general"),
    type: String(note.type || "aviso"),
    title: String(note.title || "Notificacao"),
    text: String(note.text || ""),
    href: String(note.href || "../notificacoes/"),
    userKey: String(note.userKey || "").trim(),
    createdAt,
    expiresAt,
    date: String(note.date || "Agora"),
    coupon: String(note.coupon || ""),
    claimed: !!note.claimed
  };

  if (idx >= 0) list[idx] = { ...previous, ...next, createdAt, expiresAt };
  else list.push(next);
}

function removeById(list, id) {
  const key = String(id || "").trim();
  if (!key) return;
  const idx = list.findIndex((n) => String(n?.id || "") === key);
  if (idx >= 0) list.splice(idx, 1);
}

function paymentLabel(value) {
  const key = normalizeText(value);
  if (key.includes("credito")) return "Cartao de credito";
  if (key.includes("debito")) return "Cartao de debito";
  if (key.includes("boleto")) return "Boleto";
  return "Pix";
}

function resolveOrderAlertEndpoint() {
  const rawBase = String(localStorage.getItem(PAGBANK_API_BASE_KEY) || "").trim().replace(/\/+$/, "");
  if (!rawBase) {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8787/api/alerts/order-event";
    return "https://stop-mod-api.onrender.com/api/alerts/order-event";
  }
  if (/\/api\/pagbank\/inline-payment$/i.test(rawBase)) {
    return rawBase.replace(/\/api\/pagbank\/inline-payment$/i, "/api/alerts/order-event");
  }
  if (/\/api$/i.test(rawBase)) return `${rawBase}/alerts/order-event`;
  return `${rawBase}/api/alerts/order-event`;
}

function sendOrderLifecycleEmailAlert(eventType, order) {
  const event = String(eventType || "").trim().toLowerCase();
  if (!event || !order || typeof order !== "object") return;
  const endpoint = resolveOrderAlertEndpoint();
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
    // ignorar erro de alerta
  });
}

function isAwaitingPaymentOrder(order) {
  const status = normalizeText(order?.tracking?.status || order?.status || "");
  if (order?.cancelled === true) return false;
  if (order?.awaitingPayment === true) return true;
  return status.includes("aguard");
}

function resolvePendingDeadlineMs(order) {
  const explicit = parseTime(order?.paymentDeadlineAt);
  if (explicit > 0) return explicit;
  const base = parseTime(order?.paymentStartedAt || order?.createdAt);
  if (base <= 0) return 0;
  return base + PENDING_PAYMENT_TTL_MS;
}

function sweepPendingOrdersForTimeout() {
  const orders = loadJson(ORDERS_KEY, []);
  if (!Array.isArray(orders) || !orders.length) return;

  const now = Date.now();
  let changed = false;
  const cancelledNow = [];

  orders.forEach((order) => {
    if (!order || typeof order !== "object") return;
    if (!isAwaitingPaymentOrder(order)) return;

    const deadline = resolvePendingDeadlineMs(order);
    if (deadline <= 0) return;
    if (!order.paymentDeadlineAt) {
      order.paymentDeadlineAt = new Date(deadline).toISOString();
      changed = true;
    }
    if (now < deadline) return;

    order.awaitingPayment = false;
    order.cancelled = true;
    order.cancelReason = "payment_timeout";
    order.cancelledAt = new Date(now).toISOString();
    order.status = ORDER_STATUS_TIMEOUT_CANCELLED;
    order.tracking = {
      ...(order.tracking || {}),
      status: ORDER_STATUS_TIMEOUT_CANCELLED
    };
    const shouldSendTimeoutAlert = !order.timeoutAlertSent;
    if (shouldSendTimeoutAlert) {
      order.timeoutAlertSent = true;
      cancelledNow.push(order);
    }
    changed = true;
  });

  if (changed) saveJson(ORDERS_KEY, orders.slice(0, 100));
  if (!cancelledNow.length) return;

  const notes = loadJson(NOTES_KEY, []);
  const list = Array.isArray(notes) ? notes.filter(Boolean) : [];
  cancelledNow.forEach((order) => {
    const id = String(order?.id || "").trim();
    if (!id) return;
    const owner = normalizeText(order?.ownerEmail || "");
    upsert(list, {
      id: `order-${id}-payment-timeout`,
      scope: "individual",
      type: "pedido",
      userKey: owner,
      title: `Pedido ${id} cancelado por tempo`,
      text: "Seu pedido nao foi finalizado dentro de 5 horas e foi cancelado automaticamente.",
      href: "../perfil/processando/",
      date: "Agora",
      createdAt: new Date().toISOString()
    });
    sendOrderLifecycleEmailAlert("payment_timeout", order);
  });
  list.sort((a, b) => parseTime(b?.createdAt) - parseTime(a?.createdAt));
  saveJson(
    NOTES_KEY,
    list.filter((note) => !isNoteExpired(note)).slice(0, 500)
  );
}

function fallbackSyncNotifications() {
  sweepPendingOrdersForTimeout();
  const notes = loadJson(NOTES_KEY, []);
  const list = Array.isArray(notes) ? notes.filter(Boolean) : [];
  const me = userKey();

  upsert(list, {
    id: "general-discounts",
    scope: "general",
    type: "desconto",
    title: "Descontos ativos na loja",
    text: "Novos produtos em promocao foram publicados.",
    href: "../descontos/",
    date: "Hoje"
  });

  upsert(list, {
    id: "general-coupons",
    scope: "general",
    type: "cupom",
    title: "Cupons disponiveis",
    text: "Confira e ative seu cupom na aba Cupons.",
    href: "../cupons/",
    date: "Hoje"
  });

  upsert(list, {
    id: "general-new-products",
    scope: "general",
    type: "novo",
    title: "Produtos novos na colecao",
    text: "A loja recebeu novas pecas para voce.",
    href: "../index.html#produtos",
    date: "Hoje"
  });

  upsert(list, {
    id: "general-promotions",
    scope: "general",
    type: "promo",
    title: "Promocoes gerais atualizadas",
    text: "Ofertas relampago e campanhas da semana ativas.",
    href: "../descontos/",
    date: "Hoje"
  });

  const coupons = loadJson(COUPON_KEY, []);
  const activeCoupon = Array.isArray(coupons) ? String(coupons[0] || "").trim().toUpperCase() : "";
  const couponPrefix = `coupon-active-${me || "guest"}-`;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const noteId = String(list[i]?.id || "");
    if (noteId.startsWith(couponPrefix)) list.splice(i, 1);
  }
  if (activeCoupon) {
    upsert(list, {
      id: `${couponPrefix}${activeCoupon}`,
      scope: "individual",
      type: "cupom",
      userKey: me,
      title: `Cupom ativo: ${activeCoupon}`,
      text: "Use este cupom no carrinho antes de finalizar a compra.",
      href: "../carrinho/",
      date: "Agora"
    });
  }

  const orders = loadJson(ORDERS_KEY, []);
  if (Array.isArray(orders)) {
    orders.forEach((order) => {
      const id = String(order?.id || "").trim();
      if (!id) return;
      const owner = normalizeText(order?.ownerEmail || "");
      const noteUser = owner || me;
      const status = normalizeText(order?.tracking?.status || order?.status || "preparando");
      const isCancelled = !!order?.cancelled || status.includes("cancel");
      const isDelivered = status.includes("entreg");
      const bucket = isCancelled ? "cancelled" : isDelivered ? "delivered" : "in-progress";
      ["in-progress", "delivered", "cancelled"].forEach((candidate) => {
        if (candidate === bucket) return;
        removeById(list, `order-${id}-${candidate}`);
      });
      const title = isCancelled
        ? `Pedido ${id} cancelado`
        : isDelivered
        ? `Pedido ${id} entregue`
        : `Pedido ${id} em andamento`;
      upsert(list, {
        id: `order-${id}-${bucket}`,
        scope: "individual",
        type: "pedido",
        userKey: noteUser,
        title,
        text: `Acompanhe no perfil. Total: R$ ${(Number(order?.totals?.total || 0)).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}. Pagamento: ${paymentLabel(order?.payment)}.`,
        href: "../perfil/pedidos/",
        createdAt: String(order?.createdAt || new Date().toISOString()),
        date: "Agora"
      });
    });
  }

  const fav = loadJson(FAVORITES_KEY, []);
  const favCount = Array.isArray(fav) ? fav.length : 0;
  const favoriteId = `favorites-${me || "guest"}`;
  if (favCount > 0) {
    upsert(list, {
      id: favoriteId,
      scope: "individual",
      type: "favorito",
      userKey: me,
      title: `${favCount} produto(s) nos favoritos`,
      text: "Seus favoritos estao salvos no perfil.",
      href: "../perfil/favoritos/",
      date: "Agora"
    });
  } else {
    removeById(list, favoriteId);
  }

  list.sort((a, b) => parseTime(b?.createdAt) - parseTime(a?.createdAt));
  saveJson(
    NOTES_KEY,
    list.filter((note) => !isNoteExpired(note)).slice(0, 500)
  );
  return list;
}

function loadNotes() {
  if (window.StopModNotifications && typeof window.StopModNotifications.sync === "function") {
    window.StopModNotifications.sync();
    if (typeof window.StopModNotifications.listVisible === "function") {
      return window.StopModNotifications.listVisible(300).filter((note) => !isNoteExpired(note));
    }
  }

  const me = userKey();
  const readStore = loadReadStore();
  const changedReadStore = pruneReadStore(readStore);
  if (changedReadStore) saveReadStore(readStore);
  const notes = fallbackSyncNotifications();
  return notes.filter((note) => {
    if (isNoteExpired(note)) return false;
    if (isNoteRead(note, me, readStore)) return false;
    const scope = String(note?.scope || "general");
    if (scope !== "individual") return true;
    const owner = normalizeText(note?.userKey || "");
    if (!owner) return !!me;
    if (!me) return false;
    return owner === me;
  });
}

function markNotificationAsRead(noteId) {
  const id = String(noteId || "").trim();
  if (!id) return;

  if (window.StopModNotifications && typeof window.StopModNotifications.markRead === "function") {
    window.StopModNotifications.markRead(id);
    return;
  }

  const me = userKey();
  const all = loadJson(NOTES_KEY, []);
  const notes = Array.isArray(all) ? all : [];
  const note = notes.find((item) => String(item?.id || "") === id);
  if (!note) return;
  const readStore = loadReadStore();
  const key = readKeyForNote(note, me);
  if (!key) return;
  readStore[key] = new Date().toISOString();
  pruneReadStore(readStore);
  saveReadStore(readStore);
}

function saveCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return;
  localStorage.setItem(COUPON_KEY, JSON.stringify([normalized]));
}

function filteredNotes(notes) {
  const term = (searchInput?.value || "").toLowerCase().trim();
  if (!term) return notes;
  return notes.filter((n) => String(n.title || "").toLowerCase().includes(term) || String(n.text || "").toLowerCase().includes(term));
}

function notificationChip(type) {
  const key = normalizeText(type);
  if (key.includes("pedido")) return '<span class="chip">Pedido</span>';
  if (key.includes("cupom")) return '<span class="chip win">Cupom</span>';
  if (key.includes("promo") || key.includes("desconto")) return '<span class="chip">Promocao</span>';
  if (key.includes("novo")) return '<span class="chip">Novo</span>';
  if (key.includes("favorito")) return '<span class="chip">Favoritos</span>';
  return '<span class="chip">Atualizacao</span>';
}

function noteDate(note) {
  if (note?.date) return String(note.date);
  const ts = parseTime(note?.createdAt);
  if (!ts) return "Agora";
  return new Date(ts).toLocaleString("pt-BR");
}

function render() {
  const notes = loadNotes();
  const list = filteredNotes(notes);
  if (listCount) listCount.textContent = String(list.length);
  listEl.innerHTML = list
    .map((n) => {
      const action =
        n.coupon && !n.claimed
          ? `<button class="btn" data-claim="${n.id}">Resgatar cupom</button>`
          : n.href
          ? `<a class="btn" data-note-open="${n.id}" href="${n.href}">Abrir</a>`
          : "";

      return `
        <article class="note">
          <strong>${n.title}</strong>
          <div class="meta">${n.text || ""}</div>
          <div class="row">
            <div style="display:flex; gap:.45rem; flex-wrap:wrap; align-items:center;">
              ${notificationChip(n.type)}
              <span class="meta">${noteDate(n)}</span>
            </div>
            ${action}
          </div>
        </article>
      `;
    })
    .join("");

  listEl.querySelectorAll("button[data-claim]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.getAttribute("data-claim") || "");
      const all = loadJson(NOTES_KEY, []);
      const notes2 = Array.isArray(all) ? all : [];
      const n = notes2.find((x) => x.id === id);
      if (!n || !n.coupon || n.claimed) return;
      saveCoupon(n.coupon);
      n.claimed = true;
      saveJson(NOTES_KEY, notes2);
      markNotificationAsRead(id);
      feedback.textContent = `Cupom ativado: ${String(n.coupon).toUpperCase()}`;
      if (window.StopModNotifications && typeof window.StopModNotifications.sync === "function") {
        window.StopModNotifications.sync();
      }
      render();
    });
  });

  listEl.querySelectorAll("a[data-note-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = String(link.getAttribute("data-note-open") || "");
      const href = String(link.getAttribute("href") || "").trim();
      if (!id || !href) return;
      const openInNewTab = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      markNotificationAsRead(id);
      if (openInNewTab) return;
      if (event.cancelable) event.preventDefault();
      window.location.assign(href);
    });
  });
}

searchInput?.addEventListener("input", render);
updateCartCount();
render();
renderMenuLocation();
renderTopProfile();

window.addEventListener("load", () => {
  render();
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) updateCartCount();
  if (event.key === SHIP_KEY) renderMenuLocation();
  if (event.key === PROFILE_KEY) renderTopProfile();
  if (
    event.key === NOTES_KEY ||
    event.key === COUPON_KEY ||
    event.key === ORDERS_KEY ||
    event.key === FAVORITES_KEY
  ) {
    render();
  }
});
