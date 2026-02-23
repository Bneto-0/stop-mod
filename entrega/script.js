const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const LIST_KEY = "stopmod_ship_list";

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
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
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
  try {
    const raw = localStorage.getItem(SHIP_KEY);
    if (!raw) return { city: "", cep: "" };
    const obj = JSON.parse(raw);
    return { city: String(obj.city || "").trim(), cep: normalizeCep(String(obj.cep || "")) };
  } catch {
    return { city: "", cep: "" };
  }
}

function saveShipTo(to) {
  localStorage.setItem(SHIP_KEY, JSON.stringify(to));
}

function loadList() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((x) => ({ city: String(x.city || "").trim(), cep: normalizeCep(String(x.cep || "")) }))
      .filter((x) => x.city || x.cep);
  } catch {
    return [];
  }
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

function renderCurrent() {
  const ids = loadCartIds();
  const subtotal = cartSubtotal(ids);
  const to = loadShipTo();
  currentDest.textContent = summaryText(to);
  const ship = calcShipping(subtotal, ids.length, to.cep);
  currentShip.textContent = shipText(ship);
  currentShip.classList.toggle("free", ship === 0);
}

function renderList() {
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
    setFeedback("Digite um CEP válido.", true);
    return;
  }

  const to = { city, cep };
  saveShipTo(to);

  const list = loadList();
  const key = `${to.city.toLowerCase()}|${to.cep.replace(/\D/g, "")}`;
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
  renderList();
  window.location.href = "../carrinho/";
});

renderCurrent();
renderList();
