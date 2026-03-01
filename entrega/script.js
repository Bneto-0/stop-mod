const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const LIST_KEY = "stopmod_ship_list";
const PROFILE_KEY = "stopmod_profile";
const AUTH_TOKEN_KEY = "stopmod_auth_token";
const API_BASE_KEY = "stopmod_api_base";
const PAGBANK_API_BASE_KEY = "stopmod_pagbank_api_base";

const products = [
  { id: 1, price: 89.9 },
  { id: 2, price: 159.9 },
  { id: 3, price: 219.9 },
  { id: 4, price: 179.9 },
  { id: 5, price: 139.9 },
  { id: 6, price: 129.9 },
  { id: 7, price: 149.9 },
  { id: 8, price: 249.9 },
  { id: 9, price: 119.9 },
  { id: 10, price: 109.9 },
  { id: 11, price: 239.9 },
  { id: 12, price: 189.9 }
];

const productById = new Map(products.map((p) => [p.id, p]));

const currentDest = document.getElementById("current-dest");
const currentShip = document.getElementById("current-ship");
const listEl = document.getElementById("addr-list");
const emptyEl = document.getElementById("addr-empty");
const form = document.getElementById("addr-form");
const streetInput = document.getElementById("addr-street");
const numberInput = document.getElementById("addr-number");
const districtInput = document.getElementById("addr-district");
const cityInput = document.getElementById("addr-city");
const stateInput = document.getElementById("addr-state");
const cepInput = document.getElementById("addr-cep");
const complementInput = document.getElementById("addr-complement");
const feedback = document.getElementById("feedback");

const cartCount = document.getElementById("cart-count");
const menuLocation = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const searchInput = document.getElementById("search-input");

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeApiBase(raw) {
  return String(raw || "").trim().replace(/\/+$/, "");
}

function buildApiUrl(base, endpoint) {
  const path = `/${String(endpoint || "").replace(/^\/+/, "")}`;
  const root = normalizeApiBase(base);
  return root ? `${root}${path}` : path;
}

async function syncAddressToBackend(address) {
  const token = String(localStorage.getItem(AUTH_TOKEN_KEY) || "").trim();
  if (!token) return;

  const base = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || localStorage.getItem(PAGBANK_API_BASE_KEY) || "");
  const url = buildApiUrl(base, "/api/auth/address");

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ address })
    });
  } catch {
    // Mantem fluxo local mesmo se backend estiver indisponivel.
  }
}

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

function normalizeCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeState(value) {
  return String(value || "").replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}

function normalizeAddress(raw) {
  return {
    street: String(raw?.street || "").trim(),
    number: String(raw?.number || "").trim(),
    district: String(raw?.district || "").trim(),
    city: String(raw?.city || "").trim(),
    state: normalizeState(raw?.state || ""),
    cep: normalizeCep(String(raw?.cep || "")),
    complement: String(raw?.complement || "").trim()
  };
}

function hasAddressData(addr) {
  return !!(addr?.street || addr?.city || addr?.cep);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isCepValid(value) {
  return String(value || "").replace(/\D/g, "").length === 8;
}

function loadCartIds() {
  return loadJson(CART_KEY, []);
}

function cartSubtotal(ids) {
  return ids.reduce((sum, id) => sum + (productById.get(id)?.price || 0), 0);
}

function calcShipping(subtotal, itemCount, cep) {
  if (!isCepValid(cep)) return null;
  const free = subtotal >= 249.9 || itemCount >= 5;
  return free ? 0 : 19.9;
}

function loadShipTo() {
  const obj = loadJson(SHIP_KEY, {});
  return normalizeAddress(obj);
}

function saveShipTo(to) {
  localStorage.setItem(SHIP_KEY, JSON.stringify(to));
}

function loadList() {
  const raw = loadJson(LIST_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => normalizeAddress(x))
    .filter((x) => hasAddressData(x));
}

function saveList(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

function summaryText(to) {
  const streetLine = [String(to?.street || "").trim(), String(to?.number || "").trim()].filter(Boolean).join(", ");
  const cityState = [String(to?.city || "").trim(), String(to?.state || "").trim()].filter(Boolean).join(" - ");
  const meta = [
    String(to?.district || "").trim(),
    cityState,
    String(to?.cep || "").trim() ? `CEP ${String(to.cep).trim()}` : "",
    String(to?.complement || "").trim()
  ]
    .filter(Boolean)
    .join(" | ");
  if (streetLine && meta) return `${streetLine} - ${meta}`;
  if (streetLine) return streetLine;
  if (meta) return meta;
  return "Nenhum endereco selecionado";
}

function shipText(value) {
  if (value === null) return "Frete: informe o CEP";
  if (value === 0) return "Frete: Gratis";
  return `Frete: R$ ${formatBRL(value)}`;
}

function setFeedback(text, isError) {
  if (!feedback) return;
  feedback.textContent = String(text || "");
  feedback.classList.toggle("error", !!isError);
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  if (Array.isArray(ids) && ids.length) {
    cartCount.textContent = String(ids.length);
    cartCount.style.display = "inline-flex";
  } else {
    cartCount.textContent = "0";
    cartCount.style.display = "none";
  }
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadShipTo();
  const street = String(to?.street || "").trim();
  const number = String(to?.number || "").trim();
  const city = String(to?.city || "").trim();
  const cep = normalizeCep(String(to?.cep || ""));

  if (street) {
    menuLocation.textContent = [street, number].filter(Boolean).join(", ");
    return;
  }

  if (city || cep) {
    menuLocation.textContent = [city, cep].filter(Boolean).join(" ");
    return;
  }

  menuLocation.textContent = "Rua nao informada";
}

function renderTopProfile() {
  if (!profileTopLink || !profileTopName) return;
  const profile = loadJson(PROFILE_KEY, null);
  if (!profile || typeof profile !== "object") {
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
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function renderCurrent() {
  if (!currentDest || !currentShip) return;
  const ids = loadCartIds();
  const subtotal = cartSubtotal(ids);
  const to = loadShipTo();
  currentDest.textContent = summaryText(to);
  const ship = calcShipping(subtotal, ids.length, to.cep);
  currentShip.textContent = shipText(ship);
  currentShip.classList.toggle("free", ship === 0);
}

function renderList() {
  if (!emptyEl || !listEl) return;
  const ids = loadCartIds();
  const subtotal = cartSubtotal(ids);
  const list = loadList();

  emptyEl.hidden = list.length > 0;
  listEl.innerHTML = list
    .map((to, idx) => {
      const ship = calcShipping(subtotal, ids.length, to.cep);
      const shipLabel = ship === 0 ? "Gratis" : ship === null ? "--" : `R$ ${formatBRL(ship)}`;
      const shipClass = ship === 0 ? "free" : "";
      const title = [to.street, to.number].filter(Boolean).join(", ") || summaryText(to);
      const cityState = [to.city, to.state].filter(Boolean).join(" - ");
      const detail = [to.district, cityState, to.cep ? `CEP ${to.cep}` : "", to.complement].filter(Boolean).join(" | ");
      return `
        <div class="addr-item">
          <div>
            <strong>${escapeHtml(title)}</strong>
            ${detail ? `<div class="small">${escapeHtml(detail)}</div>` : ""}
            <div class="small">Frete: <span class="ship ${shipClass}">${shipLabel}</span></div>
          </div>
          <div class="addr-actions">
            <button class="btn" data-use="${idx}">Usar</button>
            <button class="btn2" data-del="${idx}">Remover</button>
          </div>
        </div>
      `;
    })
    .join("");

  listEl.querySelectorAll("button[data-use]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-use"));
      const selected = loadList()[idx];
      if (!selected) return;
      saveShipTo(selected);
      void syncAddressToBackend(selected);
      renderCurrent();
      renderMenuLocation();
      window.location.href = "../carrinho/";
    });
  });

  listEl.querySelectorAll("button[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-del"));
      const list2 = loadList();
      list2.splice(idx, 1);
      saveList(list2);
      renderList();
      renderCurrent();
      renderMenuLocation();
    });
  });
}

cepInput?.addEventListener("input", () => {
  cepInput.value = normalizeCep(cepInput.value);
});

stateInput?.addEventListener("input", () => {
  stateInput.value = normalizeState(stateInput.value);
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const to = normalizeAddress({
    street: streetInput?.value,
    number: numberInput?.value,
    district: districtInput?.value,
    city: cityInput?.value,
    state: stateInput?.value,
    cep: cepInput?.value,
    complement: complementInput?.value
  });

  if (!to.street) {
    setFeedback("Informe a rua.", true);
    return;
  }
  if (!to.number) {
    setFeedback("Informe o numero.", true);
    return;
  }
  if (!to.district) {
    setFeedback("Informe o bairro.", true);
    return;
  }
  if (!to.city) {
    setFeedback("Informe a cidade.", true);
    return;
  }
  if (to.state.length !== 2) {
    setFeedback("Informe o estado com 2 letras (UF).", true);
    return;
  }
  if (!isCepValid(to.cep)) {
    setFeedback("Digite um CEP valido.", true);
    return;
  }
  saveShipTo(to);

  const list = loadList();
  const uniq = [];
  const seen = new Set();
  [to, ...list].forEach((x) => {
    const k = [
      normalizeText(x.street),
      normalizeText(x.number),
      normalizeText(x.district),
      normalizeText(x.city),
      normalizeState(x.state),
      String(x.cep || "").replace(/\D/g, "")
    ].join("|");
    if (seen.has(k)) return;
    seen.add(k);
    uniq.push(x);
  });
  saveList(uniq.slice(0, 20));
  void syncAddressToBackend(to);

  setFeedback("Endereco completo salvo e selecionado.", false);
  renderCurrent();
  renderMenuLocation();
  renderList();
  window.location.href = "../carrinho/";
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const query = String(searchInput.value || "").trim();
  const target = query ? `../index.html?q=${encodeURIComponent(query)}#produtos` : "../index.html#produtos";
  window.location.href = target;
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) updateCartCount();
  if (event.key === SHIP_KEY) {
    renderCurrent();
    renderMenuLocation();
  }
  if (event.key === PROFILE_KEY) renderTopProfile();
});

renderCurrent();
renderList();
updateCartCount();
renderMenuLocation();
renderTopProfile();
