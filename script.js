const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const MAX_AD_SLIDES = 10;
const SHIP_KEY = "stopmod_ship_to";
const SHIP_LIST_KEY = "stopmod_ship_list";
const PROFILE_KEY = "stopmod_profile";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const AUTH_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const INVALID_CEP_MSG = "CEP invalido, digite outro CEP.";
const GOOGLE_MAPS_API_KEY = "stopmod_google_maps_api_key";
const STATE_NAME_TO_UF = Object.freeze({
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO"
});

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

const LEGACY_SEEDED_SHIP_IDS = new Set([
  "sp-paulista-1578",
  "sp-oscar-freire-379"
]);

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

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const menuLocation = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const adMainImage = document.getElementById("ad-main-image");
const adMainLink = document.getElementById("ad-main-link");
const adMainDots = document.getElementById("ad-main-dots");
const adSeqImage = document.getElementById("ad-seq-image");
const adSeqLink = document.getElementById("ad-seq-link");
const adSeqDots = document.getElementById("ad-seq-dots");
const heroCategoryDropdown = document.getElementById("hero-category-dropdown");
const heroCategoryBtn = document.getElementById("hero-category-btn");
const heroCategoryPanel = document.getElementById("hero-category-panel");
const productSlidesViewport = document.getElementById("product-slides-viewport");
const productSlidesTrack = document.getElementById("product-slides-track");
const productSlidesPrev = document.getElementById("product-slides-prev");
const productSlidesNext = document.getElementById("product-slides-next");
const productSlidesDots = document.getElementById("product-slides-dots");
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
const addressEditToggleBtn = document.getElementById("address-edit-toggle");
const addressFeedback = document.getElementById("address-feedback");
const googleMapsApiKeyInput = document.getElementById("google-maps-api-key");
const saveGoogleKeyBtn = document.getElementById("save-google-key");
const addressCompleteBlock = document.getElementById("address-complete-block");

let selectedAddressId = "";
let validatedAddressSignature = "";
let cepResolved = false;
let addressEditMode = false;
let autoCepLookupTimer = null;
let lastAutoLookupCep = "";
let selectedCategory = "";
let productSlidesPage = 0;
let productSlidesTotalPages = 1;
let productSlidesStep = 1;
let productSlidesAutoTimer = null;

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
  const rawText = String(value || "").trim();
  if (!rawText) return "";

  const mapped = STATE_NAME_TO_UF[normalizeText(rawText)];
  if (mapped) return mapped;

  const letters = rawText.toUpperCase().replace(/[^A-Z]/g, "");
  if (letters.length === 2) return letters;
  return letters.slice(0, 2);
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

function isCompleteAddress(raw) {
  const addr = normalizeShipAddress(raw);
  return !!(
    isCepValid(addr.cep) &&
    String(addr.street || "").trim() &&
    String(addr.number || "").trim() &&
    String(addr.city || "").trim() &&
    String(addr.state || "").trim()
  );
}

function setInvalidCepFeedback() {
  setAddressFeedback(INVALID_CEP_MSG, true);
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

function setAddressCompletionVisible(show) {
  const isVisible = !!show;
  if (addressCompleteBlock) addressCompleteBlock.hidden = !isVisible;
  if (saveAddressBtn) saveAddressBtn.hidden = !isVisible;
  if (addressEditToggleBtn) addressEditToggleBtn.hidden = !isVisible;
  if (!isVisible) {
    addressEditMode = false;
    updateAddressEditToggleLabel();
  }
}

function setAutoAddressReadOnly(readOnly) {
  const lock = !!readOnly;
  if (addressStreetInput) addressStreetInput.readOnly = lock;
  if (addressDistrictInput) addressDistrictInput.readOnly = lock;
  if (addressCityInput) addressCityInput.readOnly = lock;
  if (addressStateInput) addressStateInput.readOnly = lock;
}

function updateAddressEditToggleLabel() {
  if (!addressEditToggleBtn) return;
  addressEditToggleBtn.textContent = addressEditMode ? "Bloquear edicao" : "Alterar endereco";
}

function setAddressEditMode(enabled) {
  addressEditMode = !!enabled;
  setAutoAddressReadOnly(!addressEditMode);
  updateAddressEditToggleLabel();
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

function loadGoogleMapsApiKey() {
  return String(localStorage.getItem(GOOGLE_MAPS_API_KEY) || "").trim();
}

function saveGoogleMapsApiKey(value) {
  localStorage.setItem(GOOGLE_MAPS_API_KEY, String(value || "").trim());
}

function readComponent(components, type, shortName) {
  const comp = (components || []).find((item) => Array.isArray(item.types) && item.types.includes(type));
  if (!comp) return "";
  return String(shortName ? comp.short_name : comp.long_name || "").trim();
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1200, Number(timeoutMs) || 6200));
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeCepLookupResult(raw, fallbackCep, source) {
  return {
    source: String(source || "").trim(),
    cep: normalizeCep(raw?.cep || fallbackCep),
    street: String(raw?.street || "").trim(),
    district: String(raw?.district || "").trim(),
    city: String(raw?.city || "").trim(),
    state: normalizeState(raw?.state || "")
  };
}

async function lookupCepViaCep(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://viacep.com.br/ws/${cepDigits}/json/`, 5000);
  if (!data || data.erro) return null;
  return normalizeCepLookupResult(
    {
      cep: data.cep,
      street: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf
    },
    cepDigits,
    "ViaCEP"
  );
}

async function lookupCepBrasilApi(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://brasilapi.com.br/api/cep/v2/${cepDigits}`, 5400);
  if (!data) return null;
  return normalizeCepLookupResult(
    {
      cep: data.cep,
      street: data.street,
      district: data.neighborhood,
      city: data.city,
      state: data.state
    },
    cepDigits,
    "BrasilAPI"
  );
}

async function lookupCepBrasilApiV1(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://brasilapi.com.br/api/cep/v1/${cepDigits}`, 5200);
  if (!data || String(data.type || "").toUpperCase() === "BAD_REQUEST") return null;
  return normalizeCepLookupResult(
    {
      cep: data.cep,
      street: data.street,
      district: data.neighborhood,
      city: data.city,
      state: data.state
    },
    cepDigits,
    "BrasilAPI v1"
  );
}

async function lookupCepOpenCep(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://opencep.com/v1/${cepDigits}.json`, 5400);
  if (!data || String(data.status || "") === "404") return null;
  return normalizeCepLookupResult(
    {
      cep: data.cep,
      street: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf
    },
    cepDigits,
    "OpenCEP"
  );
}

async function lookupCepAwesome(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://cep.awesomeapi.com.br/json/${cepDigits}`, 5400);
  if (!data || data.status === 404) return null;
  return normalizeCepLookupResult(
    {
      cep: data.cep,
      street: data.address,
      district: data.district,
      city: data.city,
      state: data.state
    },
    cepDigits,
    "AwesomeAPI"
  );
}

async function lookupCepGoogle(cepDigits) {
  const apiKey = loadGoogleMapsApiKey();
  if (!apiKey) return null;

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?components=${encodeURIComponent(`country:BR|postal_code:${cepDigits}`)}` +
    `&region=br&language=pt-BR&key=${encodeURIComponent(apiKey)}`;

  const data = await fetchJsonWithTimeout(url, 6200);
  if (!data || String(data.status || "") !== "OK" || !Array.isArray(data.results) || !data.results.length) {
    return null;
  }

  const components = Array.isArray(data.results[0]?.address_components) ? data.results[0].address_components : [];
  return normalizeCepLookupResult(
    {
      cep: normalizeCep(readComponent(components, "postal_code", false) || cepDigits),
      street: readComponent(components, "route", false),
      district: readComponent(components, "sublocality_level_1", false) || readComponent(components, "neighborhood", false),
      city: readComponent(components, "locality", false) || readComponent(components, "administrative_area_level_2", false),
      state: readComponent(components, "administrative_area_level_1", true)
    },
    cepDigits,
    "Google"
  );
}

async function lookupCepNominatim(cepDigits) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?country=${encodeURIComponent("Brazil")}` +
    `&postalcode=${encodeURIComponent(cepDigits)}` +
    `&format=jsonv2&limit=1&addressdetails=1&accept-language=pt-BR`;

  const data = await fetchJsonWithTimeout(url, 6200);
  if (!Array.isArray(data) || !data.length) return null;

  const address = data[0]?.address || {};
  const isoLvl4 = String(address["ISO3166-2-lvl4"] || "").trim().toUpperCase();
  const ufFromIso = /^BR-[A-Z]{2}$/.test(isoLvl4) ? isoLvl4.slice(3) : "";
  const state =
    normalizeState(ufFromIso) ||
    normalizeState(address.state || "") ||
    normalizeState(address.region || "");

  const city = String(
    address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      ""
  ).trim();

  const district = String(
    address.suburb ||
      address.neighbourhood ||
      address.neighborhood ||
      address.quarter ||
      ""
  ).trim();

  return normalizeCepLookupResult(
    {
      cep: address.postcode || cepDigits,
      street: "",
      district,
      city,
      state
    },
    cepDigits,
    "OpenStreetMap"
  );
}

async function lookupCepAllProviders(cepDigits) {
  const providers = [
    lookupCepViaCep,
    lookupCepBrasilApi,
    lookupCepBrasilApiV1,
    lookupCepOpenCep,
    lookupCepAwesome,
    lookupCepNominatim,
    lookupCepGoogle
  ];

  const results = await Promise.all(
    providers.map(async (provider) => {
      try {
        return await provider(cepDigits);
      } catch {
        return null;
      }
    })
  );

  for (const result of results) {
    if (!result) continue;
    if (!result.city || !result.state) continue;
    return result;
  }

  return null;
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

function applyCategoryFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = String(params.get("cat") || "").trim();
    if (!raw) return false;

    const categories = new Set(products.map((product) => normalizeText(product.category)));
    if (!categories.has(normalizeText(raw))) return false;
    selectedCategory = raw;
    return true;
  } catch {
    return false;
  }
}

function syncSearchQueryInUrl() {
  if (!searchInput) return;
  const params = new URLSearchParams(window.location.search);
  const query = String(searchInput.value || "").trim();
  const category = String(selectedCategory || "").trim();
  if (query) params.set("q", query);
  else params.delete("q");
  if (category) params.set("cat", category);
  else params.delete("cat");

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function normalizeHomeHashToTop() {
  if (window.location.hash !== "#produtos") return;
  const query = window.location.search || "";
  const nextUrl = `${window.location.pathname}${query}#top`;
  window.history.replaceState(null, "", nextUrl);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function ensureHeroVisibleOnLoad() {
  const hash = String(window.location.hash || "").trim();
  if (hash && hash !== "#top" && hash !== "#produtos") return;
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  const goTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  goTop();
  setTimeout(goTop, 70);
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
    const filtered = raw.filter((item) => !LEGACY_SEEDED_SHIP_IDS.has(String(item?.id || "").trim()));
    return dedupeAddresses(filtered).filter((item) => isCompleteAddress(item));
  } catch {
    return [];
  }
}

function saveShipList(items) {
  const normalized = dedupeAddresses(items || []);
  localStorage.setItem(SHIP_LIST_KEY, JSON.stringify(normalized));
}

function ensureShipDirectorySeed() {
  const list = loadShipList();
  const normalized = dedupeAddresses(list);
  if (normalized.length !== list.length) {
    saveShipList(normalized);
  }

  const current = loadShipTo();
  const hasCurrent = !!(current.city || current.cep || current.street);
  const hasCurrentInList = hasCurrent && normalized.some((item) => addressSignature(item) === addressSignature(current));

  if (!normalized.length) {
    if (hasCurrent) saveShipTo({});
    return;
  }

  if (!hasCurrentInList) {
    saveShipTo(normalized[0]);
  }
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

  cepResolved = !!(isCepValid(addr.cep) && addr.street && addr.city && addr.state);
  setAddressEditMode(false);
  setAddressCompletionVisible(cepResolved);
}

function clearAutoAddressFields(resetNumber) {
  setAddressEditMode(false);
  if (addressStreetInput) addressStreetInput.value = "";
  if (addressDistrictInput) addressDistrictInput.value = "";
  if (addressCityInput) addressCityInput.value = "";
  if (addressStateInput) addressStateInput.value = "";
  if (resetNumber && addressNumberInput) addressNumberInput.value = "";
  cepResolved = false;
  setAddressCompletionVisible(false);
}

function closeAddressDirectory(force = false) {
  if (!addressModal) return;
  if (!force) {
    const current = loadShipTo();
    const hasCurrentValid = isCompleteAddress(current);
    const hasSavedValid = loadShipList().some((item) => isCompleteAddress(item));
    if (!hasCurrentValid && !hasSavedValid) {
      setInvalidCepFeedback();
      if (addressCepInput) {
        setTimeout(() => addressCepInput.focus(), 40);
      }
      return;
    }
  }
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
    selectedAddressId = "";
    if (useSelectedAddressBtn) useSelectedAddressBtn.hidden = true;
    savedAddressList.innerHTML = "";
    if (savedAddressEmpty) savedAddressEmpty.hidden = false;
    clearAutoAddressFields(true);
    if (addressCepInput) addressCepInput.value = "";
    if (addressContactInput) addressContactInput.value = "";
    return;
  }

  if (useSelectedAddressBtn) useSelectedAddressBtn.hidden = false;
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
      validatedAddressSignature = "";
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

  if (addressCepInput) addressCepInput.value = "";
  if (addressContactInput) addressContactInput.value = "";
  clearAutoAddressFields(true);
  if (autoCepLookupTimer) {
    clearTimeout(autoCepLookupTimer);
    autoCepLookupTimer = null;
  }
  lastAutoLookupCep = "";
  validatedAddressSignature = "";
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
  if (!isCompleteAddress(selected)) {
    setInvalidCepFeedback();
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
    clearAutoAddressFields(true);
    setInvalidCepFeedback();
    return;
  }

  setAddressFeedback("Buscando CEP...", false);

  try {
    const digits = cep.replace(/\D/g, "");
    const data = await lookupCepAllProviders(digits);
    if (!data) {
      clearAutoAddressFields(true);
      setAddressEditMode(false);
      cepResolved = false;
      setAddressCompletionVisible(false);
      setInvalidCepFeedback();
      return;
    }

    const street = String(data.street || "").trim() || `Endereco referente ao CEP ${normalizeCep(digits)}`;
    const district = String(data.district || "").trim();
    const city = String(data.city || "").trim();
    const state = normalizeState(data.state || "");

    if (!city || !state) {
      clearAutoAddressFields(true);
      setAddressEditMode(false);
      cepResolved = false;
      setAddressCompletionVisible(false);
      setInvalidCepFeedback();
      return;
    }

    setAddressEditMode(false);
    if (addressStreetInput) addressStreetInput.value = street;
    if (addressDistrictInput) addressDistrictInput.value = district;
    if (addressCityInput) addressCityInput.value = city;
    if (addressStateInput) addressStateInput.value = state;

    validatedAddressSignature = "";
    cepResolved = true;
    setAddressCompletionVisible(true);
    if (addressNumberInput) {
      setTimeout(() => addressNumberInput.focus(), 40);
    }
    setAddressFeedback(
      `CEP validado (${String(data.source || "base nacional")}). Rua, bairro, cidade e estado preenchidos automaticamente. Informe o numero.`,
      false
    );
  } catch {
    clearAutoAddressFields(true);
    setAddressFeedback("Falha ao consultar CEP. Tente novamente.", true);
  }
}

function fillFromGoogleResult(result) {
  const components = Array.isArray(result?.address_components) ? result.address_components : [];
  const street = readComponent(components, "route", false);
  const number = readComponent(components, "street_number", false);
  const district = readComponent(components, "sublocality_level_1", false) || readComponent(components, "neighborhood", false);
  const city = readComponent(components, "locality", false) || readComponent(components, "administrative_area_level_2", false);
  const state = normalizeState(readComponent(components, "administrative_area_level_1", true));
  const cep = normalizeCep(readComponent(components, "postal_code", false));

  if (street && addressStreetInput) addressStreetInput.value = street;
  if (number && addressNumberInput) addressNumberInput.value = number;
  if (district && addressDistrictInput) addressDistrictInput.value = district;
  if (city && addressCityInput) addressCityInput.value = city;
  if (state && addressStateInput) addressStateInput.value = state;
  if (cep && addressCepInput) addressCepInput.value = cep;
}

async function validateAddressWithGoogle(openMapsAfter) {
  const apiKey = loadGoogleMapsApiKey();
  if (!apiKey) {
    setAddressFeedback("Configure sua Google Maps API Key para validar endereco.", true);
    return false;
  }

  const addr = readAddressForm();
  if (!cepResolved) {
    setAddressFeedback("Primeiro valide o CEP para preencher os dados do endereco.", true);
    return false;
  }
  if (!addr.number) {
    setAddressFeedback("Informe o numero da residencia antes de validar.", true);
    return false;
  }
  if (!addr.street || !addr.city || !addr.state || !isCepValid(addr.cep)) {
    setAddressFeedback("Dados de endereco incompletos. Valide o CEP novamente.", true);
    return false;
  }

  const query = mapQueryFromAddress(addr);
  setAddressFeedback("Validando endereco no Google...", false);

  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(query)}` +
      `&components=${encodeURIComponent(`country:BR|postal_code:${addr.cep.replace(/\D/g, "")}`)}` +
      `&region=br&language=pt-BR&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Falha no Google");
    }

    const data = await response.json();
    if (String(data.status || "") !== "OK" || !Array.isArray(data.results) || !data.results.length) {
      const reason = String(data.error_message || data.status || "Endereco nao encontrado");
      setAddressFeedback(`Endereco invalido no Google: ${reason}`, true);
      validatedAddressSignature = "";
      return false;
    }

    const best = data.results[0];
    fillFromGoogleResult(best);

    const validatedAddress = readAddressForm();
    const sig = addressSignature(validatedAddress);
    const cepMatch = validatedAddress.cep.replace(/\D/g, "") === addr.cep.replace(/\D/g, "");
    const cityMatch = normalizeText(validatedAddress.city) === normalizeText(addr.city);

    if (!cepMatch || !cityMatch) {
      setAddressFeedback("Endereco nao confere com cidade/CEP informados. Revise os dados.", true);
      validatedAddressSignature = "";
      return false;
    }

    validatedAddressSignature = sig;
    setAddressFeedback("Endereco validado com sucesso pelo Google.", false);

    if (openMapsAfter) {
      const placeId = String(best.place_id || "").trim();
      const mapsUrl = placeId
        ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQueryFromAddress(validatedAddress))}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }

    return true;
  } catch {
    validatedAddressSignature = "";
    setAddressFeedback("Nao foi possivel validar no Google agora. Tente novamente.", true);
    return false;
  }
}

async function openGoogleMapsValidation() {
  await validateAddressWithGoogle(true);
}

async function saveAddressFromForm() {
  const addr = readAddressForm();
  if (!isCepValid(addr.cep)) {
    setInvalidCepFeedback();
    return;
  }
  if (!cepResolved) {
    setInvalidCepFeedback();
    return;
  }
  if (!addr.number) {
    setAddressFeedback("Informe o numero da residencia.", true);
    return;
  }
  if (!addr.street || !addr.city || !addr.state) {
    setAddressFeedback("Endereco nao preenchido corretamente pelo CEP. Busque o CEP novamente.", true);
    return;
  }

  const currentSig = addressSignature(addr);
  validatedAddressSignature = currentSig;

  const confirmed = readAddressForm();
  const id = confirmed.id || buildAddressId(`${confirmed.street}|${confirmed.number}|${confirmed.cep}|${confirmed.city}`);
  const completeAddress = normalizeShipAddress({ ...confirmed, id });

  const currentList = loadShipList();
  const filtered = currentList.filter((item) => addressSignature(item) !== addressSignature(completeAddress));
  const nextList = dedupeAddresses([completeAddress, ...filtered]);

  saveShipList(nextList);
  saveShipTo(completeAddress);
  selectedAddressId = completeAddress.id;
  validatedAddressSignature = addressSignature(completeAddress);

  renderSavedAddresses();
  renderMenuLocation();
  setAddressFeedback("Endereco salvo e selecionado.", false);
  closeAddressDirectory();
}

function initAddressDirectory() {
  ensureShipDirectorySeed();
  setAddressCompletionVisible(false);

  if (openAddressModal) {
    openAddressModal.addEventListener("click", openAddressDirectory);
  }

  addressCloseEls.forEach((el) => {
    el.addEventListener("click", closeAddressDirectory);
  });

  useSelectedAddressBtn?.addEventListener("click", useSelectedAddress);
  lookupCepBtn?.addEventListener("click", () => {
    lastAutoLookupCep = normalizeCep(addressCepInput?.value || "");
    void lookupCep();
  });
  saveAddressBtn?.addEventListener("click", () => { void saveAddressFromForm(); });
  addressEditToggleBtn?.addEventListener("click", () => {
    const nextMode = !addressEditMode;
    setAddressEditMode(nextMode);
    if (nextMode) {
      setAddressFeedback("Edicao manual liberada para ajustar rua, bairro e numero.", false);
      if (addressStreetInput) addressStreetInput.focus();
    } else {
      setAddressFeedback("Edicao manual bloqueada.", false);
    }
  });

  addressCepInput?.addEventListener("input", () => {
    addressCepInput.value = normalizeCep(addressCepInput.value);
    validatedAddressSignature = "";
    const digits = addressCepInput.value.replace(/\D/g, "");
    if (digits.length < 8) {
      lastAutoLookupCep = "";
      if (autoCepLookupTimer) {
        clearTimeout(autoCepLookupTimer);
        autoCepLookupTimer = null;
      }
      clearAutoAddressFields(true);
    } else {
      const normalizedCep = normalizeCep(digits);
      setAddressEditMode(false);
      cepResolved = false;
      setAddressCompletionVisible(false);
      if (normalizedCep !== lastAutoLookupCep) {
        if (autoCepLookupTimer) clearTimeout(autoCepLookupTimer);
        autoCepLookupTimer = setTimeout(() => {
          autoCepLookupTimer = null;
          const currentCep = normalizeCep(addressCepInput?.value || "");
          if (!isCepValid(currentCep)) return;
          lastAutoLookupCep = currentCep;
          void lookupCep();
        }, 220);
      }
    }
  });

  addressStreetInput?.addEventListener("input", () => {
    validatedAddressSignature = "";
  });

  addressNumberInput?.addEventListener("input", () => {
    validatedAddressSignature = "";
  });

  addressDistrictInput?.addEventListener("input", () => {
    validatedAddressSignature = "";
  });

  addressCityInput?.addEventListener("input", () => {
    validatedAddressSignature = "";
  });

  addressStateInput?.addEventListener("input", () => {
    addressStateInput.value = normalizeState(addressStateInput.value);
    validatedAddressSignature = "";
  });

  addressContactInput?.addEventListener("input", () => {
    validatedAddressSignature = "";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !addressModal || addressModal.hidden) return;
    closeAddressDirectory();
  });

  updateAddressEditToggleLabel();
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
  if (!profileTopName || !profileTopLink) return;
  const profile = loadActiveProfile();

  if (!profile) {
    profileTopLink.classList.remove("logged");
    profileTopName.textContent = "Perfil";
    profileTopLink.setAttribute("aria-label", "Perfil");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.alt = "";
      profileTopPhoto.src = "assets/icons/user-solid.svg";
    }
    return;
  }

  const displayName = String(profile.name || "").trim() || "Perfil";
  const picture = String(profile.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.setAttribute("aria-label", `Perfil de ${displayName}`);
  profileTopLink.classList.add("logged");

  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadShipTo();
  const street = String(to.street || "").trim();
  const number = String(to.number || "").trim();
  const streetLine = street ? [street, number].filter(Boolean).join(", ") : "";
  menuLocation.textContent = streetLine || "Sao paulo";
}

function getFilteredProducts() {
  const term = normalizeText(searchInput?.value);
  const selectedCategoryKey = normalizeText(selectedCategory);

  return products.filter((product) => {
    const categoryOk = !selectedCategoryKey || normalizeText(product.category) === selectedCategoryKey;
    if (!term) return categoryOk;
    const target = normalizeText(`${product.name} ${product.category} ${product.size}`);
    const textOk = target.includes(term);
    return textOk && categoryOk;
  });
}

function updateCategoryButtonLabel() {
  if (!heroCategoryBtn) return;
  heroCategoryBtn.innerHTML = `Categorias <span class="hero-menu-cat-caret" aria-hidden="true">&#9662;</span>`;
}

function openCategoryDropdown() {
  if (!heroCategoryDropdown || !heroCategoryBtn || !heroCategoryPanel) return;
  heroCategoryPanel.hidden = false;
  heroCategoryPanel.removeAttribute("hidden");
  heroCategoryDropdown.classList.add("open");
  heroCategoryBtn.setAttribute("aria-expanded", "true");
}

function closeCategoryDropdown() {
  if (!heroCategoryDropdown || !heroCategoryBtn || !heroCategoryPanel) return;
  heroCategoryDropdown.classList.remove("open");
  heroCategoryBtn.setAttribute("aria-expanded", "false");
  heroCategoryPanel.hidden = true;
}

function renderCategoryDropdownItems() {
  if (!heroCategoryPanel) return;

  const categories = Array.from(new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  const items = ['<a href="#produtos" data-category="">Todas</a>']
    .concat(categories.map((category) => `<a href="#produtos" data-category="${escapeHtml(category)}">${escapeHtml(category)}</a>`))
    .join("");

  heroCategoryPanel.innerHTML = items;

  heroCategoryPanel.querySelectorAll("a[data-category]").forEach((item) => {
    const value = String(item.getAttribute("data-category") || "").trim();
    const isActive = normalizeText(value) === normalizeText(selectedCategory);
    item.classList.toggle("active", isActive);
    item.addEventListener("click", (event) => {
      event.preventDefault();
      selectedCategory = value;
      updateCategoryButtonLabel();
      renderCategoryDropdownItems();
      renderProducts();
      syncSearchQueryInUrl();
      closeCategoryDropdown();
      const section = document.getElementById("produtos");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initCategoryDropdown() {
  if (!heroCategoryDropdown || !heroCategoryBtn || !heroCategoryPanel) return;

  heroCategoryPanel.hidden = false;
  heroCategoryPanel.removeAttribute("hidden");
  renderCategoryDropdownItems();
  updateCategoryButtonLabel();
  closeCategoryDropdown();

  heroCategoryBtn.addEventListener("click", () => {
    const isOpen = heroCategoryDropdown.classList.contains("open");
    if (isOpen) closeCategoryDropdown();
    else openCategoryDropdown();
  });

  document.addEventListener("click", (event) => {
    if (!heroCategoryDropdown.contains(event.target)) closeCategoryDropdown();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeCategoryDropdown();
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
  let loadFailures = 0;

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
  imgEl.addEventListener("load", () => {
    loadFailures = 0;
  });
  imgEl.addEventListener("error", () => {
    loadFailures += 1;
    if (!list.length) return;
    if (loadFailures >= list.length) {
      const fallback = String(products?.[0]?.image || DEFAULT_LEFT_ADS?.[0] || "").trim();
      if (fallback) {
        imgEl.src = fallback;
        imgEl.alt = "Anuncio";
      }
      return;
    }
    index = (index + 1) % list.length;
    imgEl.src = list[index];
    imgEl.alt = `Anuncio ${index + 1}`;
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

function stopProductSlidesAuto() {
  if (!productSlidesAutoTimer) return;
  clearInterval(productSlidesAutoTimer);
  productSlidesAutoTimer = null;
}

function renderProductSlides() {
  if (!productSlidesTrack) return;

  const slideProducts = products.slice(0, 21);

  productSlidesTrack.innerHTML = slideProducts
    .map(
      (product) => `
      <article class="slide-product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="meta">${product.category} | Tam: ${product.size}</p>
          <p class="price">R$ ${formatBRL(product.price)}</p>
          <button class="btn" data-product-slide="${product.id}">Adicionar</button>
        </div>
      </article>
    `
    )
    .join("");

  productSlidesTrack.querySelectorAll("button[data-product-slide]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-product-slide"));
      addToCart(id);
    });
  });

  if (productSlidesPrev) productSlidesPrev.hidden = true;
  if (productSlidesNext) productSlidesNext.hidden = true;
  if (productSlidesDots) productSlidesDots.hidden = true;
}

function initProductSlides() {
  renderProductSlides();
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
  syncSearchQueryInUrl();
});

normalizeHomeHashToTop();
ensureHeroVisibleOnLoad();
applySearchFromUrl();
applyCategoryFromUrl();
renderProducts();
updateCartCount();
initAddressDirectory();
renderMenuLocation();
renderTopProfile();
initCategoryDropdown();
const homeAds = loadHomeAds();
startAdSlider(adMainLink, adMainImage, adMainDots, homeAds, loadHomeTarget());
const sequenceAds = uniqueUrls([
  ...homeAds.slice(1),
  ...DEFAULT_LEFT_ADS,
  ...DEFAULT_RIGHT_ADS,
  ...homeAds.slice(0, 1)
]).slice(0, MAX_AD_SLIDES);
startAdSlider(adSeqLink, adSeqImage, adSeqDots, sequenceAds, loadHomeTarget());
initProductSlides();
syncSearchQueryInUrl();

window.addEventListener("storage", (event) => {
  const key = String(event?.key || "");
  if (key === SHIP_KEY) renderMenuLocation();
  if (key === PROFILE_KEY || key === AUTH_LAST_SEEN_KEY) renderTopProfile();
});
