const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const LAST_PRODUCT_CHOICE_KEY = "stopmod_last_product_choice";
const SHIP_KEY = "stopmod_ship_to";
const PROFILE_KEY = "stopmod_profile";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const AUTH_TIMEOUT_MS = 2 * 60 * 60 * 1000;

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XXG"];

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

const productById = new Map(products.map((product) => [Number(product.id), product]));

const imageEl = document.getElementById("product-image");
const categoryEl = document.getElementById("product-category");
const nameEl = document.getElementById("product-name");
const priceEl = document.getElementById("product-price");
const oldPriceEl = document.getElementById("product-old-price");
const installmentEl = document.getElementById("product-installment");
const soldEl = document.getElementById("product-sold");
const ratingEl = document.getElementById("product-rating");
const arrivalEl = document.getElementById("product-arrival");
const sizePillsEl = document.getElementById("product-size-pills");
const colorSwatchesEl = document.getElementById("product-color-swatches");
const sizeEl = document.getElementById("product-size");
const colorEl = document.getElementById("product-color");
const qtyEl = document.getElementById("product-qty");
const qtyDecBtn = document.getElementById("qty-dec");
const qtyIncBtn = document.getElementById("qty-inc");
const feedbackEl = document.getElementById("product-feedback");
const addCartBtn = document.getElementById("add-cart-btn");
const buyNowBtn = document.getElementById("buy-now-btn");
const cartCountEl = document.getElementById("cart-count");
const searchInputEl = document.getElementById("search-input");
const menuLocationEl = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");

let activeProduct = null;

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    .replace(/'/g, "&#039;");
}

function colorToHex(colorName) {
  const key = normalizeText(colorName);
  if (key.includes("preto")) return "#101112";
  if (key.includes("branco")) return "#f5f5f5";
  if (key.includes("off")) return "#efe8dc";
  if (key.includes("marrom")) return "#7a4a30";
  if (key.includes("cinza")) return "#9aa0a6";
  if (key.includes("azul")) return "#183f8f";
  if (key.includes("bege")) return "#d8c6ad";
  return "#d5d0c9";
}

function starsByRating(rating) {
  const full = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
  return `${"*".repeat(full)}${"-".repeat(5 - full)}`;
}

function estimateSoldCount(productId) {
  const base = Number(productId) || 0;
  return 120 + base * 17;
}

function estimateRating(productId) {
  const base = Number(productId) || 0;
  const raw = 4.6 + (base % 5) * 0.08;
  return Math.min(5, Number(raw.toFixed(1)));
}

function formatArrivalRange() {
  const now = new Date();
  const min = new Date(now);
  const max = new Date(now);
  min.setDate(min.getDate() + 2);
  max.setDate(max.getDate() + 15);

  const month = max.toLocaleDateString("pt-BR", { month: "long" });
  const minDay = String(min.getDate()).padStart(2, "0");
  const maxDay = String(max.getDate()).padStart(2, "0");
  return `Chegara entre ${minDay} e ${maxDay} de ${month}`;
}

function loadCartIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0);
  } catch {
    return [];
  }
}

function saveCartIds(ids) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function updateCartCount() {
  if (!cartCountEl) return;
  const ids = loadCartIds();
  cartCountEl.textContent = String(ids.length);
  cartCountEl.style.display = ids.length ? "inline-flex" : "none";
}

function loadShipTo() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHIP_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function renderMenuLocation() {
  if (!menuLocationEl) return;
  const shipTo = loadShipTo();
  const street = String(shipTo?.street || "").trim();
  const number = String(shipTo?.number || "").trim();
  const city = String(shipTo?.city || "").trim();
  const streetLine = [street, number].filter(Boolean).join(", ");
  menuLocationEl.textContent = streetLine || city || "Sao paulo";
}

function loadProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    return raw && typeof raw === "object" ? raw : null;
  } catch {
    return null;
  }
}

function loadActiveProfile() {
  const profile = loadProfile();
  if (!profile) return null;

  const rawLastSeen = Number(localStorage.getItem(AUTH_LAST_SEEN_KEY) || "0");
  if (Number.isFinite(rawLastSeen) && rawLastSeen > 0 && Date.now() - rawLastSeen > AUTH_TIMEOUT_MS) {
    return null;
  }
  return profile;
}

function renderTopProfile() {
  if (!profileTopLink || !profileTopName) return;
  const profile = loadActiveProfile();

  if (!profile) {
    profileTopName.textContent = "Perfil";
    profileTopLink.classList.remove("logged");
    profileTopLink.setAttribute("aria-label", "Perfil");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.src = "/assets/icons/user-solid.svg";
      profileTopPhoto.alt = "";
    }
    return;
  }

  const displayName = String(profile.name || "").trim() || "Perfil";
  const photo = String(profile.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.classList.add("logged");
  profileTopLink.setAttribute("aria-label", `Perfil de ${displayName}`);
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = photo || "/assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function openStoreSearch() {
  const query = String(searchInputEl?.value || "").trim();
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const q = params.toString();
  window.location.href = `/index.html${q ? `?${q}` : ""}#produtos`;
}

function setFeedback(text, isError) {
  if (!feedbackEl) return;
  feedbackEl.textContent = String(text || "");
  feedbackEl.classList.toggle("error", !!isError);
}

function readProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) return 0;
  return id;
}

function optionsFromLetterRange(from, to) {
  const start = SIZE_ORDER.indexOf(String(from || "").toUpperCase());
  const end = SIZE_ORDER.indexOf(String(to || "").toUpperCase());
  if (start < 0 || end < 0) return [];
  const [low, high] = start <= end ? [start, end] : [end, start];
  return SIZE_ORDER.slice(low, high + 1);
}

function optionsFromNumericRange(from, to) {
  const start = Number(from);
  const end = Number(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const [low, high] = start <= end ? [start, end] : [end, start];
  const out = [];
  const step = low % 2 === high % 2 ? 2 : 1;
  for (let value = low; value <= high; value += step) {
    out.push(String(value));
  }
  return out;
}

function getSizeOptions(sizeText) {
  const raw = String(sizeText || "").trim();
  if (!raw) return ["Unico"];

  if (/unico/i.test(raw)) return ["Unico"];

  const letterMatch = raw.match(/(PP|P|M|G|GG|XG|XXG)\s*ao\s*(PP|P|M|G|GG|XG|XXG)/i);
  if (letterMatch) {
    const options = optionsFromLetterRange(letterMatch[1], letterMatch[2]);
    if (options.length) return options;
  }

  const numberMatch = raw.match(/(\d+)\s*ao\s*(\d+)/i);
  if (numberMatch) {
    const options = optionsFromNumericRange(numberMatch[1], numberMatch[2]);
    if (options.length) return options;
  }

  return raw
    .split(/[|,/;-]+/)
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function getColorOptions(product) {
  const name = String(product?.name || "").toLowerCase();
  if (name.includes("preto")) return ["Preto", "Marrom", "Cinza"];
  if (name.includes("branco")) return ["Branco", "Off White", "Preto"];
  if (name.includes("jeans")) return ["Azul Jeans", "Preto", "Cinza"];
  return ["Bege", "Preto", "Branco"];
}

function fillSelect(selectEl, options) {
  if (!selectEl) return;
  const items = Array.isArray(options) && options.length ? options : ["Unico"];
  selectEl.innerHTML = items
    .map((item) => `<option value="${String(item)}">${String(item)}</option>`)
    .join("");
}

function renderSizePills() {
  if (!sizePillsEl || !sizeEl) return;
  const options = Array.from(sizeEl.options).map((opt) => String(opt.value || ""));
  const selected = String(sizeEl.value || "");
  sizePillsEl.innerHTML = options
    .map(
      (option) =>
        `<button class="size-pill${selected === option ? " active" : ""}" type="button" data-size="${escapeHtml(option)}">${escapeHtml(option)}</button>`
    )
    .join("");
}

function renderColorSwatches() {
  if (!colorSwatchesEl || !colorEl) return;
  const options = Array.from(colorEl.options).map((opt) => String(opt.value || ""));
  const selected = String(colorEl.value || "");
  colorSwatchesEl.innerHTML = options
    .map(
      (option) =>
        `<button class="color-swatch${selected === option ? " active" : ""}" type="button" data-color="${escapeHtml(option)}" aria-label="${escapeHtml(option)}"><i style="background:${colorToHex(option)}"></i></button>`
    )
    .join("");
}

function renderNotFound() {
  if (categoryEl) categoryEl.textContent = "Produto";
  if (nameEl) nameEl.textContent = "Produto nao encontrado";
  if (priceEl) priceEl.textContent = "R$ 0,00";
  if (oldPriceEl) oldPriceEl.textContent = "R$ 0,00";
  if (installmentEl) installmentEl.textContent = "ou 0,00";
  if (soldEl) soldEl.textContent = "+ 0 quantidade vendida";
  if (ratingEl) ratingEl.innerHTML = `0.0 <span>${starsByRating(0)}</span>`;
  if (arrivalEl) arrivalEl.textContent = "Chegara entre -- e --";
  if (imageEl) {
    imageEl.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80";
    imageEl.alt = "Produto indisponivel";
  }
  fillSelect(sizeEl, ["--"]);
  fillSelect(colorEl, ["--"]);
  renderSizePills();
  renderColorSwatches();
  if (qtyEl) qtyEl.value = "1";
  if (addCartBtn) addCartBtn.disabled = true;
  if (buyNowBtn) buyNowBtn.disabled = true;
  setFeedback("Produto nao encontrado. Volte para a loja e escolha novamente.", true);
}

function renderProduct(product) {
  activeProduct = product;
  if (categoryEl) categoryEl.textContent = String(product.category || "Produto");
  if (nameEl) nameEl.textContent = String(product.name || "Produto");
  if (priceEl) priceEl.textContent = `R$ ${formatBRL(product.price)}`;
  const oldPrice = Number((Number(product.price || 0) * 1.07).toFixed(2));
  if (oldPriceEl) oldPriceEl.textContent = `R$ ${formatBRL(oldPrice)}`;
  if (installmentEl) installmentEl.textContent = `ou ${formatBRL(product.price)}`;
  if (soldEl) soldEl.textContent = `+ ${estimateSoldCount(product.id)} quantidade vendida`;
  if (ratingEl) ratingEl.innerHTML = `${estimateRating(product.id).toFixed(1)} <span>${starsByRating(estimateRating(product.id))}</span>`;
  if (arrivalEl) arrivalEl.textContent = formatArrivalRange();
  if (imageEl) {
    imageEl.src = String(product.image || "");
    imageEl.alt = String(product.name || "Produto");
  }

  fillSelect(sizeEl, getSizeOptions(product.size));
  fillSelect(colorEl, getColorOptions(product));
  if (sizeEl && sizeEl.options.length) sizeEl.value = String(sizeEl.options[0].value || "");
  if (colorEl && colorEl.options.length) colorEl.value = String(colorEl.options[0].value || "");
  renderSizePills();
  renderColorSwatches();
  if (qtyEl) qtyEl.value = "1";

  if (addCartBtn) addCartBtn.disabled = false;
  if (buyNowBtn) buyNowBtn.disabled = false;
  setFeedback("", false);
}

function getSelectedQty() {
  const value = Number(qtyEl?.value || "1");
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.round(value)));
}

function addCurrentProductToCart(quantity) {
  if (!activeProduct) return { ok: false, message: "Produto invalido." };

  const qty = Math.min(10, Math.max(1, Number(quantity) || 1));
  const ids = loadCartIds();
  if (ids.length + qty > MAX_CART_ITEMS) {
    return { ok: false, message: "Limite de 2000 itens no carrinho atingido." };
  }

  for (let i = 0; i < qty; i += 1) {
    ids.push(Number(activeProduct.id));
  }
  saveCartIds(ids);
  updateCartCount();

  localStorage.setItem(
    LAST_PRODUCT_CHOICE_KEY,
    JSON.stringify({
      productId: Number(activeProduct.id),
      size: String(sizeEl?.value || ""),
      color: String(colorEl?.value || ""),
      quantity: qty,
      at: new Date().toISOString()
    })
  );

  return { ok: true };
}

addCartBtn?.addEventListener("click", () => {
  const qty = getSelectedQty();
  const result = addCurrentProductToCart(qty);
  if (!result.ok) {
    setFeedback(result.message, true);
    return;
  }
  setFeedback(`Produto adicionado ao carrinho (${qty}x).`, false);
});

buyNowBtn?.addEventListener("click", () => {
  const qty = getSelectedQty();
  const result = addCurrentProductToCart(qty);
  if (!result.ok) {
    setFeedback(result.message, true);
    return;
  }
  window.location.href = "/carrinho/";
});

qtyEl?.addEventListener("input", () => {
  const qty = getSelectedQty();
  qtyEl.value = String(qty);
});

qtyDecBtn?.addEventListener("click", () => {
  const next = Math.max(1, getSelectedQty() - 1);
  if (qtyEl) qtyEl.value = String(next);
});

qtyIncBtn?.addEventListener("click", () => {
  const next = Math.min(10, getSelectedQty() + 1);
  if (qtyEl) qtyEl.value = String(next);
});

sizePillsEl?.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-size]") : null;
  if (!trigger || !sizeEl) return;
  const value = String(trigger.getAttribute("data-size") || "").trim();
  if (!value) return;
  sizeEl.value = value;
  renderSizePills();
});

colorSwatchesEl?.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-color]") : null;
  if (!trigger || !colorEl) return;
  const value = String(trigger.getAttribute("data-color") || "").trim();
  if (!value) return;
  colorEl.value = value;
  renderColorSwatches();
});

searchInputEl?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  openStoreSearch();
});

const requestedId = readProductIdFromUrl();
const foundProduct = productById.get(requestedId);
if (foundProduct) renderProduct(foundProduct);
else renderNotFound();
updateCartCount();
renderMenuLocation();
renderTopProfile();

window.addEventListener("storage", (event) => {
  const key = normalizeText(event?.key || "");
  if (key === normalizeText(SHIP_KEY)) renderMenuLocation();
  if (key === normalizeText(PROFILE_KEY) || key === normalizeText(AUTH_LAST_SEEN_KEY)) renderTopProfile();
  if (key === normalizeText(CART_KEY)) updateCartCount();
});
