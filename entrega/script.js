const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const LIST_KEY = "stopmod_ship_list";
const PROFILE_KEY = "stopmod_profile";

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
const cityInput = document.getElementById("addr-city");
const cepInput = document.getElementById("addr-cep");
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

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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
  return { city: String(obj.city || "").trim(), cep: normalizeCep(String(obj.cep || "")) };
}

function saveShipTo(to) {
  localStorage.setItem(SHIP_KEY, JSON.stringify(to));
}

function loadList() {
  const raw = loadJson(LIST_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => ({ city: String(x.city || "").trim(), cep: normalizeCep(String(x.cep || "")) }))
    .filter((x) => x.city || x.cep);
}

function saveList(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

function summaryText(to) {
  const city = String(to.city || "").trim();
  const cep = String(to.cep || "").trim();
  if (city && cep) return `${city} ${cep}`;
  if (cep) return cep;
  if (city) return city;
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
  const to = loadJson(SHIP_KEY, {});
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
      return `
        <div class="addr-item">
          <div>
            <strong>${summaryText(to)}</strong>
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

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = String(cityInput?.value || "").trim();
  const cep = normalizeCep(String(cepInput?.value || ""));
  if (!city) {
    setFeedback("Informe a cidade.", true);
    return;
  }
  if (!isCepValid(cep)) {
    setFeedback("Digite um CEP valido.", true);
    return;
  }

  const to = { city, cep };
  saveShipTo(to);

  const list = loadList();
  const uniq = [];
  const seen = new Set();
  [to, ...list].forEach((x) => {
    const k = `${String(x.city || "").toLowerCase()}|${String(x.cep || "").replace(/\D/g, "")}`;
    if (seen.has(k)) return;
    seen.add(k);
    uniq.push(x);
  });
  saveList(uniq.slice(0, 20));

  setFeedback("Endereco salvo e selecionado.", false);
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
