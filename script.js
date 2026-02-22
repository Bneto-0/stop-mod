const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const MAX_AD_SLIDES = 10;
const SHIP_KEY = "stopmod_ship_to";
const SHIP_LIST_KEY = "stopmod_ship_list";

const ADS_LEFT_IMAGES_KEY = "stopmod_ads_left_images";
const ADS_RIGHT_IMAGES_KEY = "stopmod_ads_right_images";
const ADS_LEFT_TARGET_KEY = "stopmod_ads_left_target";
const ADS_RIGHT_TARGET_KEY = "stopmod_ads_right_target";
const ADS_HOME_IMAGES_KEY = "stopmod_ads_home_images";
const ADS_HOME_TARGET_KEY = "stopmod_ads_home_target";

const DEFAULT_LEFT_ADS = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=80"
];

const DEFAULT_RIGHT_ADS = [
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1542293787938-4d273c37c18d?auto=format&fit=crop&w=1400&q=80"
];

const DEFAULT_SHIP_ADDRESSES = [
  {
    id: "sp-paulista-1578",
    street: "Avenida Paulista",
    number: "1578",
    district: "Bela Vista",
    city: "Sao Paulo",
    state: "SP",
    cep: "01310-200",
    contact: "Cliente Stop mod - 11999999999"
  },
  {
    id: "sp-oscar-freire-379",
    street: "Rua Oscar Freire",
    number: "379",
    district: "Cerqueira Cesar",
    city: "Sao Paulo",
    state: "SP",
    cep: "01426-001",
    contact: "Cliente Stop mod - 11999999998"
  }
];

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

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const menuLocation = document.getElementById("menu-location");
const adMainImage = document.getElementById("ad-main-image");
const adMainLink = document.getElementById("ad-main-link");
const adMainDots = document.getElementById("ad-main-dots");
const openAddressModal = document.getElementById("open-address-modal");
const addressModal = document.getElementById("address-modal");
const addressCloseEls = document.querySelectorAll("[data-address-close=\"1\"]");
const savedAddressList = document.getElementById("saved-address-list");
const savedAddressEmpty = document.getElementById("saved-address-empty");
const useSelectedAddressBtn = document.getElementById("use-selected-address");
const addressCepInput = document.getElementById("address-cep");
const addressContactInput = document.getElementById("address-contact");
const addressStreetInput = document.getElementById("address-street");
const addressNumberInput = document.getElementById("address-number");
const addressDistrictInput = document.getElementById("address-district");
const addressCityInput = document.getElementById("address-city");
const addressStateInput = document.getElementById("address-state");
const lookupCepBtn = document.getElementById("lookup-cep");
const googleMapsCheckBtn = document.getElementById("google-maps-check");
const saveAddressBtn = document.getElementById("save-address");
const addressFeedback = document.getElementById("address-feedback");

let selectedAddressId = "";

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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function isCepValid(value) {
  return String(value || "").replace(/\D/g, "").length === 8;
}

function normalizeState(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
}

function buildAddressId(base) {
  const seed = normalizeText(base).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (seed) return seed.slice(0, 42);
  return `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeShipAddress(raw) {
  const street = String(raw?.street || "").trim();
  const number = String(raw?.number || "").trim();
  const district = String(raw?.district || "").trim();
  const city = String(raw?.city || "").trim();
  const state = normalizeState(raw?.state || "");
  const cep = normalizeCep(raw?.cep || "");
  const contact = String(raw?.contact || "").trim();
  const id = String(raw?.id || "").trim() || buildAddressId(`${street}|${number}|${cep}|${city}`);

  return { id, street, number, district, city, state, cep, contact };
}

function addressSignature(raw) {
  const addr = normalizeShipAddress(raw);
  return [
    normalizeText(addr.street),
    normalizeText(addr.number),
    normalizeText(addr.district),
    normalizeText(addr.city),
    normalizeText(addr.state),
    String(addr.cep || "").replace(/\D/g, "")
  ].join("|");
}

function addressTitle(raw) {
  const addr = normalizeShipAddress(raw);
  const streetPart = [addr.street, addr.number].filter(Boolean).join(" ");
  if (streetPart) return streetPart;
  return [addr.city, addr.state].filter(Boolean).join(" - ") || "Endereco";
}

function addressMeta(raw) {
  const addr = normalizeShipAddress(raw);
  const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
  const left = [addr.cep ? `CEP: ${addr.cep}` : "", cityState].filter(Boolean).join(" - ");
  return [left, addr.contact].filter(Boolean).join(" | ");
}

function mapQueryFromAddress(raw) {
  const addr = normalizeShipAddress(raw);
  return [
    [addr.street, addr.number].filter(Boolean).join(" "),
    addr.district,
    addr.city,
    addr.state,
    addr.cep
  ].filter(Boolean).join(", ");
}

function setAddressFeedback(text, isError) {
  if (!addressFeedback) return;
  addressFeedback.textContent = text || "";
  addressFeedback.classList.toggle("error", !!isError);
}

function dedupeAddresses(items) {
  const seen = new Set();
  const out = [];

  items.forEach((item) => {
    const addr = normalizeShipAddress(item);
    if (!addr.city && !addr.cep && !addr.street) return;
    const sig = addressSignature(addr);
    if (seen.has(sig)) return;
    seen.add(sig);
    out.push(addr);
  });

  return out.slice(0, 30);
}

function applySearchFromUrl() {
  if (!searchInput) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const query = String(params.get("q") || "").trim();
    if (!query) return false;
    searchInput.value = query;
    return true;
  } catch {
    return false;
  }
}

function syncSearchQueryInUrl() {
  if (!searchInput) return;
  const params = new URLSearchParams(window.location.search);
  const query = String(searchInput.value || "").trim();
  if (query) params.set("q", query);
  else params.delete("q");

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function scrollToProducts(smooth) {
  const section = document.getElementById("produtos");
  if (!section) return;
  section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

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
    return normalizeShipAddress(raw || {});
  } catch {
    return normalizeShipAddress({});
  }
}

function saveShipTo(raw) {
  const addr = normalizeShipAddress(raw || {});
  localStorage.setItem(SHIP_KEY, JSON.stringify(addr));
}

function loadShipList() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHIP_LIST_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return dedupeAddresses(raw);
  } catch {
    return [];
  }
}

function saveShipList(items) {
  const normalized = dedupeAddresses(items || []);
  localStorage.setItem(SHIP_LIST_KEY, JSON.stringify(normalized));
}

function ensureShipDirectorySeed() {
  const current = loadShipTo();
  const list = loadShipList();

  const hasCurrent = !!(current.city || current.cep || current.street);
  const merged = dedupeAddresses([
    ...list,
    ...(hasCurrent ? [current] : []),
    ...DEFAULT_SHIP_ADDRESSES
  ]);

  if (!list.length || merged.length !== list.length || (hasCurrent && !list.some((x) => addressSignature(x) === addressSignature(current)))) {
    saveShipList(merged);
  }

  if (hasCurrent) return;
  const fallback = merged[0];
  if (fallback) saveShipTo(fallback);
}

function readAddressForm() {
  return normalizeShipAddress({
    id: selectedAddressId || "",
    cep: addressCepInput?.value,
    contact: addressContactInput?.value,
    street: addressStreetInput?.value,
    number: addressNumberInput?.value,
    district: addressDistrictInput?.value,
    city: addressCityInput?.value,
    state: addressStateInput?.value
  });
}

function fillAddressForm(raw) {
  const addr = normalizeShipAddress(raw || {});
  if (addressCepInput) addressCepInput.value = addr.cep || "";
  if (addressContactInput) addressContactInput.value = addr.contact || "";
  if (addressStreetInput) addressStreetInput.value = addr.street || "";
  if (addressNumberInput) addressNumberInput.value = addr.number || "";
  if (addressDistrictInput) addressDistrictInput.value = addr.district || "";
  if (addressCityInput) addressCityInput.value = addr.city || "";
  if (addressStateInput) addressStateInput.value = addr.state || "";
}

function closeAddressDirectory() {
  if (!addressModal) return;
  addressModal.hidden = true;
  document.body.classList.remove("address-modal-open");
}

function renderSavedAddresses() {
  if (!savedAddressList) return;
  const list = loadShipList();
  const current = loadShipTo();

  if (!selectedAddressId) {
    const currentMatch = list.find((item) => addressSignature(item) === addressSignature(current));
    selectedAddressId = currentMatch?.id || list[0]?.id || "";
  }

  if (!list.length) {
    savedAddressList.innerHTML = "";
    if (savedAddressEmpty) savedAddressEmpty.hidden = false;
    return;
  }

  if (savedAddressEmpty) savedAddressEmpty.hidden = true;
  savedAddressList.innerHTML = list
    .map((item) => `
      <div class="saved-address-item">
        <input type="radio" name="saved-address" value="${escapeHtml(item.id)}" ${item.id === selectedAddressId ? "checked" : ""} />
        <div class="saved-address-text">
          <strong>${escapeHtml(addressTitle(item))}</strong>
          <span>${escapeHtml(addressMeta(item))}</span>
        </div>
        <button class="address-mini" type="button" data-remove-address="${escapeHtml(item.id)}">Remover</button>
      </div>
    `)
    .join("");

  savedAddressList.querySelectorAll("input[name=\"saved-address\"]").forEach((radioEl) => {
    radioEl.addEventListener("change", () => {
      selectedAddressId = String(radioEl.value || "");
      const selected = loadShipList().find((x) => x.id === selectedAddressId);
      if (selected) fillAddressForm(selected);
      setAddressFeedback("", false);
    });
  });

  savedAddressList.querySelectorAll("button[data-remove-address]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.getAttribute("data-remove-address") || "");
      const nextList = loadShipList().filter((item) => item.id !== id);
      saveShipList(nextList);
      if (selectedAddressId === id) selectedAddressId = nextList[0]?.id || "";
      renderSavedAddresses();
      setAddressFeedback("Endereco removido.", false);
    });
  });
}

function openAddressDirectory(event) {
  if (event) event.preventDefault();
  if (!addressModal) return;
  ensureShipDirectorySeed();

  const current = loadShipTo();
  const list = loadShipList();
  const currentMatch = list.find((item) => addressSignature(item) === addressSignature(current));
  selectedAddressId = currentMatch?.id || list[0]?.id || "";

  fillAddressForm(currentMatch || list[0] || current);
  renderSavedAddresses();
  setAddressFeedback("", false);

  addressModal.hidden = false;
  document.body.classList.add("address-modal-open");
}

function useSelectedAddress() {
  const list = loadShipList();
  const selected = list.find((item) => item.id === selectedAddressId) || list[0];
  if (!selected) {
    setAddressFeedback("Nenhum endereco disponivel para selecionar.", true);
    return;
  }

  saveShipTo(selected);
  renderMenuLocation();
  setAddressFeedback("Endereco selecionado.", false);
  closeAddressDirectory();
}

async function lookupCep() {
  const cep = normalizeCep(addressCepInput?.value || "");
  if (addressCepInput) addressCepInput.value = cep;
  if (!isCepValid(cep)) {
    setAddressFeedback("CEP invalido. Use 8 numeros.", true);
    return;
  }

  setAddressFeedback("Buscando CEP...", false);

  try {
    const digits = cep.replace(/\D/g, "");
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("CEP nao encontrado");
    }
    const data = await response.json();
    if (data.erro) {
      setAddressFeedback("CEP nao encontrado.", true);
      return;
    }

    if (addressStreetInput) addressStreetInput.value = String(data.logradouro || addressStreetInput.value || "");
    if (addressDistrictInput) addressDistrictInput.value = String(data.bairro || addressDistrictInput.value || "");
    if (addressCityInput) addressCityInput.value = String(data.localidade || addressCityInput.value || "");
    if (addressStateInput) addressStateInput.value = normalizeState(data.uf || addressStateInput?.value || "");

    setAddressFeedback("CEP validado e endereco preenchido.", false);
  } catch {
    setAddressFeedback("Falha ao consultar CEP. Tente novamente.", true);
  }
}

function openGoogleMapsValidation() {
  const query = mapQueryFromAddress(readAddressForm());
  if (!query) {
    setAddressFeedback("Preencha o endereco para validar no Google Maps.", true);
    return;
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  setAddressFeedback("Validacao aberta no Google Maps.", false);
}

function saveAddressFromForm() {
  const addr = readAddressForm();
  if (!addr.city) {
    setAddressFeedback("Informe a cidade.", true);
    return;
  }
  if (!isCepValid(addr.cep)) {
    setAddressFeedback("Informe um CEP valido.", true);
    return;
  }
  if (!addr.street) {
    setAddressFeedback("Informe a rua para validar no Google Maps.", true);
    return;
  }

  const id = addr.id || buildAddressId(`${addr.street}|${addr.number}|${addr.cep}|${addr.city}`);
  const completeAddress = normalizeShipAddress({ ...addr, id });

  const currentList = loadShipList();
  const filtered = currentList.filter((item) => addressSignature(item) !== addressSignature(completeAddress));
  const nextList = dedupeAddresses([completeAddress, ...filtered]);

  saveShipList(nextList);
  saveShipTo(completeAddress);
  selectedAddressId = completeAddress.id;

  renderSavedAddresses();
  renderMenuLocation();
  setAddressFeedback("Endereco salvo e selecionado.", false);
  closeAddressDirectory();
}

function initAddressDirectory() {
  ensureShipDirectorySeed();

  if (openAddressModal) {
    openAddressModal.addEventListener("click", openAddressDirectory);
  }

  addressCloseEls.forEach((el) => {
    el.addEventListener("click", closeAddressDirectory);
  });

  useSelectedAddressBtn?.addEventListener("click", useSelectedAddress);
  lookupCepBtn?.addEventListener("click", lookupCep);
  googleMapsCheckBtn?.addEventListener("click", openGoogleMapsValidation);
  saveAddressBtn?.addEventListener("click", saveAddressFromForm);

  addressCepInput?.addEventListener("input", () => {
    addressCepInput.value = normalizeCep(addressCepInput.value);
  });

  addressStateInput?.addEventListener("input", () => {
    addressStateInput.value = normalizeState(addressStateInput.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !addressModal || addressModal.hidden) return;
    closeAddressDirectory();
  });
}

function loadStringArray(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(raw)) return fallback.slice(0, MAX_AD_SLIDES);
    const items = raw.map((x) => String(x || "").trim()).filter(Boolean);
    return items.length ? items.slice(0, MAX_AD_SLIDES) : fallback.slice(0, MAX_AD_SLIDES);
  } catch {
    return fallback.slice(0, MAX_AD_SLIDES);
  }
}

function loadLinkTarget(key) {
  return String(localStorage.getItem(key) || "").trim();
}

function uniqueUrls(items) {
  const seen = new Set();
  const out = [];
  items.forEach((url) => {
    const u = String(url || "").trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  });
  return out;
}

function loadHomeAds() {
  const home = loadStringArray(ADS_HOME_IMAGES_KEY, []);
  if (home.length) return home.slice(0, MAX_AD_SLIDES);

  const left = loadStringArray(ADS_LEFT_IMAGES_KEY, []);
  const right = loadStringArray(ADS_RIGHT_IMAGES_KEY, []);
  const merged = uniqueUrls([...left, ...right]);
  if (merged.length) return merged.slice(0, MAX_AD_SLIDES);

  return uniqueUrls([...DEFAULT_LEFT_ADS, ...DEFAULT_RIGHT_ADS]).slice(0, MAX_AD_SLIDES);
}

function loadHomeTarget() {
  return (
    loadLinkTarget(ADS_HOME_TARGET_KEY) ||
    loadLinkTarget(ADS_LEFT_TARGET_KEY) ||
    loadLinkTarget(ADS_RIGHT_TARGET_KEY) ||
    "anuncios/"
  );
}

function saveCartIds(ids) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadShipTo();
  menuLocation.textContent = to.city || "Sao paulo";
}

function getFilteredProducts() {
  const term = normalizeText(searchInput?.value);
  if (!term) return products;

  return products.filter((product) => {
    const target = normalizeText(`${product.name} ${product.category} ${product.size}`);
    const textOk = target.includes(term);
    return textOk;
  });
}

function startAdSlider(frameEl, imgEl, dotsEl, images, targetHref) {
  if (!frameEl || !imgEl) return;
  const list = Array.isArray(images) ? images.filter(Boolean).slice(0, MAX_AD_SLIDES) : [];
  frameEl.href = String(targetHref || "anuncios/");
  const navEls = Array.from(frameEl.querySelectorAll("[data-nav]"));

  let index = 0;
  let autoTimer = null;
  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let suppressClick = false;

  const syncDots = () => {
    if (!dotsEl) return;
    dotsEl.querySelectorAll(".ad-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  };

  const buildDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = list
      .map((_, i) => `<span class="ad-dot ${i === 0 ? "active" : ""}" data-i="${i}"></span>`)
      .join("");
    dotsEl.querySelectorAll(".ad-dot").forEach((dotEl) => {
      dotEl.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const i = Number(dotEl.getAttribute("data-i"));
        if (!Number.isInteger(i)) return;
        index = i;
        apply();
        startAuto();
      });
    });
  };

  const apply = () => {
    imgEl.style.opacity = "0.2";
    imgEl.style.transform = "translateX(0)";
    setTimeout(() => {
      imgEl.src = list[index];
      imgEl.alt = `Anuncio ${index + 1}`;
      imgEl.style.opacity = "1";
      syncDots();
    }, 120);
  };

  const next = () => {
    index = (index + 1) % list.length;
    apply();
  };

  const prev = () => {
    index = (index - 1 + list.length) % list.length;
    apply();
  };

  const setNavVisible = () => {
    const show = list.length > 1;
    navEls.forEach((el) => {
      el.style.display = show ? "inline-flex" : "none";
    });
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    if (list.length <= 1) return;
    autoTimer = setInterval(next, 3400);
  };

  const onPointerDown = (ev) => {
    if (list.length <= 1) return;
    dragging = true;
    startX = ev.clientX;
    lastX = ev.clientX;
    suppressClick = false;
    frameEl.classList.add("dragging");
    stopAuto();
    try {
      frameEl.setPointerCapture(ev.pointerId);
    } catch {}
  };

  const onPointerMove = (ev) => {
    if (!dragging) return;
    lastX = ev.clientX;
    const dx = lastX - startX;
    if (Math.abs(dx) > 8) suppressClick = true;
    const shift = Math.max(-44, Math.min(44, dx * 0.2));
    imgEl.style.transform = `translateX(${shift}px)`;
  };

  const onPointerUp = (ev) => {
    if (!dragging) return;
    dragging = false;
    frameEl.classList.remove("dragging");
    const dx = lastX - startX;
    imgEl.style.transform = "translateX(0)";
    if (Math.abs(dx) > 45) {
      if (dx < 0) next();
      else prev();
    }
    startAuto();
    try {
      frameEl.releasePointerCapture(ev.pointerId);
    } catch {}
    if (suppressClick) {
      setTimeout(() => {
        suppressClick = false;
      }, 180);
    }
  };

  frameEl.addEventListener("pointerdown", onPointerDown);
  frameEl.addEventListener("pointermove", onPointerMove);
  frameEl.addEventListener("pointerup", onPointerUp);
  frameEl.addEventListener("pointercancel", onPointerUp);
  frameEl.addEventListener("click", (ev) => {
    if (!suppressClick) return;
    ev.preventDefault();
    ev.stopPropagation();
  });

  navEls.forEach((navEl) => {
    const go = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const dir = String(navEl.getAttribute("data-nav") || "");
      if (dir === "next") next();
      else prev();
      startAuto();
    };
    navEl.addEventListener("pointerdown", (ev) => {
      ev.stopPropagation();
    });
    navEl.addEventListener("click", go);
    navEl.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      go(ev);
    });
  });

  if (!list.length) {
    imgEl.removeAttribute("src");
    imgEl.alt = "Sem anuncios";
    if (dotsEl) dotsEl.innerHTML = "";
    setNavVisible();
    return;
  }

  buildDots();
  setNavVisible();
  const firstImage = list[0];
  if (firstImage) {
    imgEl.src = firstImage;
    imgEl.alt = "Anuncio 1";
  }
  syncDots();

  if (list.length <= 1) return;

  setTimeout(() => {
    imgEl.src = list[index];
    imgEl.alt = `Anuncio ${index + 1}`;
  }, 0);
  startAuto();
}

function renderProducts() {
  if (!productGrid) return;
  const filtered = getFilteredProducts();

  if (!filtered.length) {
    const query = String(searchInput?.value || "").trim();
    productGrid.innerHTML = `
      <article class="product-card">
        <div class="product-info">
          <h4>Nenhum produto encontrado</h4>
          <p class="meta">Busca: ${query || "--"}</p>
        </div>
      </article>
    `;
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="meta">${product.category} | Tam: ${product.size}</p>
          <p class="price">R$ ${formatBRL(product.price)}</p>
          <button class="btn" data-product="${product.id}">Adicionar</button>
        </div>
      </article>
    `
    )
    .join("");

  productGrid.querySelectorAll("button[data-product]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-product"));
      addToCart(id);
    });
  });
}

function addToCart(productId) {
  const ids = loadCartIds();
  if (ids.length >= MAX_CART_ITEMS) {
    alert("Limite de 2000 itens no carrinho atingido.");
    return;
  }
  ids.push(productId);
  saveCartIds(ids);
  updateCartCount();
}

searchInput?.addEventListener("input", renderProducts);
searchInput?.addEventListener("input", syncSearchQueryInUrl);
searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  scrollToProducts(true);
});

const openedWithQuery = applySearchFromUrl();
renderProducts();
updateCartCount();
initAddressDirectory();
renderMenuLocation();
startAdSlider(adMainLink, adMainImage, adMainDots, loadHomeAds(), loadHomeTarget());
syncSearchQueryInUrl();

if (openedWithQuery) {
  setTimeout(() => scrollToProducts(false), 70);
}
