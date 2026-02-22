const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const SHIP_KEY = "stopmod_ship_to";

const ADS_LEFT_IMAGES_KEY = "stopmod_ads_left_images";
const ADS_RIGHT_IMAGES_KEY = "stopmod_ads_right_images";
const ADS_LEFT_TARGET_KEY = "stopmod_ads_left_target";
const ADS_RIGHT_TARGET_KEY = "stopmod_ads_right_target";

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
const adLeftImage = document.getElementById("ad-left-image");
const adRightImage = document.getElementById("ad-right-image");
const adLeftLink = document.getElementById("ad-left-link");
const adRightLink = document.getElementById("ad-right-link");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    return {
      city: String(raw.city || "").trim(),
      cep: String(raw.cep || "").trim()
    };
  } catch {
    return { city: "", cep: "" };
  }
}

function loadStringArray(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(raw)) return fallback;
    const items = raw.map((x) => String(x || "").trim()).filter(Boolean);
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}

function loadLinkTarget(key) {
  return String(localStorage.getItem(key) || "").trim();
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
  const term = String(searchInput?.value || "").toLowerCase().trim();

  return products.filter((product) => {
    const textOk = !term || product.name.toLowerCase().includes(term);
    return textOk;
  });
}

function startAdRotation(imgEl, linkEl, imageKey, targetKey, fallbackImages) {
  if (!imgEl) return;
  const images = loadStringArray(imageKey, fallbackImages);
  const target = loadLinkTarget(targetKey) || "anuncios/";
  if (linkEl) linkEl.href = target;

  let index = 0;
  const apply = () => {
    imgEl.src = images[index];
    imgEl.alt = `Anuncio ${index + 1}`;
  };

  apply();
  if (images.length <= 1) return;

  setInterval(() => {
    index = (index + 1) % images.length;
    apply();
  }, 3200);
}

function renderProducts() {
  const filtered = getFilteredProducts();

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

renderProducts();
updateCartCount();
renderMenuLocation();
startAdRotation(adLeftImage, adLeftLink, ADS_LEFT_IMAGES_KEY, ADS_LEFT_TARGET_KEY, DEFAULT_LEFT_ADS);
startAdRotation(adRightImage, adRightLink, ADS_RIGHT_IMAGES_KEY, ADS_RIGHT_TARGET_KEY, DEFAULT_RIGHT_ADS);
