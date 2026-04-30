const API_URL = "https://SEU-BACKEND.onrender.com";

const categories = [
  { name: "Masculino", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" },
  { name: "Feminino", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80" },
  { name: "Acessórios", image: "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=800&q=80" },
  { name: "Calçados", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { name: "Streetwear", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80" },
  { name: "Promoções", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" },
];

const demoProducts = [
  { id: "d-1", nome: "Moletom UZUU Oversized", categoria: "Streetwear", preco: 199.9, precoAntigo: 249.9, imagem: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80", tag: "20% OFF", avaliacao: 4.9, reviews: 128 },
  { id: "d-2", nome: "Camiseta UZUU Basic", categoria: "Masculino", preco: 89.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", tag: "Novo", avaliacao: 4.8, reviews: 96 },
  { id: "d-3", nome: "Boné UZUU Classic", categoria: "Acessórios", preco: 79.9, precoAntigo: 99.9, imagem: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80", tag: "Mais vendido", avaliacao: 4.9, reviews: 76 },
  { id: "d-4", nome: "Mochila UZUU Essential", categoria: "Acessórios", preco: 159.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", tag: "Premium", avaliacao: 4.7, reviews: 54 },
  { id: "d-5", nome: "Tênis UZUU Street", categoria: "Calçados", preco: 249.9, precoAntigo: 299.9, imagem: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=800&q=80", tag: "Oferta", avaliacao: 4.8, reviews: 112 },
  { id: "d-6", nome: "Bermuda UZUU Casual", categoria: "Masculino", preco: 99.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", tag: "Leve", avaliacao: 4.7, reviews: 68 },
  { id: "d-7", nome: "Jaqueta Puffer UZUU", categoria: "Streetwear", preco: 299.9, precoAntigo: 379.9, imagem: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80", tag: "-10%", avaliacao: 4.9, reviews: 88 },
  { id: "d-8", nome: "Calça Cargo UZUU", categoria: "Masculino", preco: 189.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80", tag: "Trend", avaliacao: 4.8, reviews: 63 },
  { id: "d-9", nome: "Moletom Canguru UZUU", categoria: "Streetwear", preco: 229.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80", tag: "Top", avaliacao: 4.9, reviews: 119 },
  { id: "d-10", nome: "Bucket Hat UZUU", categoria: "Acessórios", preco: 69.9, precoAntigo: 89.9, imagem: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80", tag: "Oferta", avaliacao: 4.7, reviews: 42 },
  { id: "d-11", nome: "Meia UZUU Cano Alto", categoria: "Acessórios", preco: 69.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80", tag: "Kit", avaliacao: 4.8, reviews: 104 },
  { id: "d-12", nome: "Camiseta Oversized UZUU", categoria: "Masculino", preco: 99.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80", tag: "Novo", avaliacao: 4.9, reviews: 97 },
  { id: "d-13", nome: "Tênis UZUU Black", categoria: "Calçados", preco: 279.9, precoAntigo: 329.9, imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", tag: "-15%", avaliacao: 4.9, reviews: 71 },
  { id: "d-14", nome: "Hoodie Zíper UZUU", categoria: "Streetwear", preco: 249.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=800&q=80", tag: "Premium", avaliacao: 4.8, reviews: 83 },
  { id: "d-15", nome: "Shoulder Bag UZUU", categoria: "Acessórios", preco: 129.9, precoAntigo: 159.9, imagem: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", tag: "Útil", avaliacao: 4.7, reviews: 45 },
  { id: "d-16", nome: "Óculos UZUU Style", categoria: "Acessórios", preco: 99.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80", tag: "Novo", avaliacao: 4.8, reviews: 41 },
  { id: "d-17", nome: "Calça Moletom UZUU", categoria: "Streetwear", preco: 169.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1506629905607-d9f297d8f8af?auto=format&fit=crop&w=800&q=80", tag: "Conforto", avaliacao: 4.7, reviews: 74 },
  { id: "d-18", nome: "Coturno UZUU Street", categoria: "Calçados", preco: 329.9, precoAntigo: null, imagem: "https://images.unsplash.com/photo-1608256246200-53e8b47b6609?auto=format&fit=crop&w=800&q=80", tag: "Forte", avaliacao: 4.9, reviews: 57 },
];

const adBanners = [
  { title: "Lançamentos", subtitle: "Novas peças toda semana", cta: "Ver lançamentos", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80", tone: "from-blue-950" },
  { title: "Até 50% OFF", subtitle: "Nas melhores peças", cta: "Aproveitar ofertas", image: "https://images.unsplash.com/photo-1506629905607-d9f297d8f8af?auto=format&fit=crop&w=1000&q=80", tone: "from-black" },
  { title: "Streetwear Premium", subtitle: "Qualidade que se destaca", cta: "Ver streetwear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80", tone: "from-neutral-950" },
];

const state = {
  products: [],
  page: 1,
  loadingInitial: true,
  loadingMore: false,
  selectedCategory: "Todos",
};

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeProduct(raw, index = 0) {
  return {
    id: raw.id || raw._id || `produto-${Date.now()}-${index}`,
    nome: raw.nome || raw.name || "Produto UZUU",
    categoria: raw.categoria || raw.category || "Streetwear",
    preco: Number(raw.preco || raw.price || 0),
    precoAntigo: raw.precoAntigo || raw.oldPrice || raw.compare_at_price || null,
    imagem: raw.imagem || raw.image || raw.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    tag: raw.tag || raw.badge || "Novo",
    avaliacao: Number(raw.avaliacao || raw.rating || 4.8),
    reviews: Number(raw.reviews || raw.review_count || 0),
  };
}

function demoPage(page) {
  return Array.from({ length: 18 }, (_, index) => {
    const base = demoProducts[(page * 18 + index) % demoProducts.length];
    return {
      ...base,
      id: `demo-${page}-${index}-${base.nome}`,
      preco: Number((base.preco + ((page + index) % 3) * 4).toFixed(2)),
    };
  });
}

async function fetchProducts(page = 1) {
  if (!API_URL || API_URL.includes("SEU-BACKEND")) {
    return demoPage(page - 1);
  }

  try {
    const response = await fetch(`${API_URL}/products?page=${page}&limit=18`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Falha ao buscar produtos");

    const data = await response.json();
    const list = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
    return list.map(normalizeProduct);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return demoPage(page - 1);
  }
}

function productCard(product) {
  const pixPrice = product.preco * 0.95;
  return `
    <article class="home-infinite-product-card">
      <div class="home-infinite-product-card__media">
        <img src="${product.imagem}" alt="${product.nome}" loading="lazy" />
        <button type="button" aria-label="Favoritar produto">♡</button>
        <span>${product.tag}</span>
      </div>
      <div class="home-infinite-product-card__body">
        <p>${product.categoria}</p>
        <h3>${product.nome}</h3>
        <div class="home-infinite-product-card__rating">★★★★★ <small>(${product.reviews})</small></div>
        <strong>${money(product.preco)}</strong>
        ${product.precoAntigo ? `<del>${money(product.precoAntigo)}</del>` : ""}
        <em>${money(pixPrice)} no PIX</em>
        <small>12x de ${money(product.preco / 12)}</small>
      </div>
    </article>
  `;
}

function skeletonCard() {
  return `
    <article class="home-infinite-skeleton">
      <div></div>
      <span></span>
      <span></span>
      <span></span>
    </article>
  `;
}

function renderProductGrid(node, products) {
  if (!node) return;
  node.innerHTML = products.map(productCard).join("");
}

function renderSkeletonGrid(node, count = 18) {
  if (!node) return;
  node.innerHTML = Array.from({ length: count }, skeletonCard).join("");
}

function filteredProducts() {
  if (state.selectedCategory === "Todos") return state.products;
  return state.products.filter((product) => product.categoria === state.selectedCategory);
}

function renderAllProducts() {
  const bestSellers = state.products.slice(0, 18);
  const recommended = filteredProducts().slice(0, 18);
  const exploreMore = state.products.slice(18);
  renderProductGrid(document.getElementById("best-sellers-grid"), bestSellers);
  renderProductGrid(document.getElementById("recommended-grid"), recommended);
  renderProductGrid(document.getElementById("explore-grid"), exploreMore);
}

function renderCategories() {
  const node = document.getElementById("home-categories-grid");
  if (!node) return;
  node.innerHTML = categories.map((category) => `
    <button type="button" data-category="${category.name}">
      <span><img src="${category.image}" alt="${category.name}" loading="lazy" /></span>
      <strong>${category.name}</strong>
    </button>
  `).join("");

  node.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-category");
      state.selectedCategory = value === state.selectedCategory ? "Todos" : value;
      updateTabs();
      renderAllProducts();
    });
  });
}

function renderTabs() {
  const node = document.getElementById("home-filter-tabs");
  if (!node) return;
  const tabs = ["Todos", "Masculino", "Feminino", "Acessórios", "Calçados", "Streetwear"];
  node.innerHTML = tabs.map((category) => `<button type="button" data-filter="${category}">${category}</button>`).join("");
  node.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCategory = button.getAttribute("data-filter");
      updateTabs();
      renderAllProducts();
    });
  });
  updateTabs();
}

function updateTabs() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-filter") === state.selectedCategory);
  });
}

function renderAdBanners(targetId) {
  const node = document.getElementById(targetId);
  if (!node) return;
  node.innerHTML = adBanners.map((banner) => `
    <article class="home-infinite-ad-card home-infinite-ad-card--${banner.tone}">
      <img src="${banner.image}" alt="${banner.title}" loading="lazy" />
      <div></div>
      <section>
        <h3>${banner.title}</h3>
        <p>${banner.subtitle}</p>
        <button type="button">${banner.cta}</button>
      </section>
    </article>
  `).join("");
}

function renderCartCount() {
  const node = document.getElementById("home-cart-count");
  if (!node) return;
  try {
    const raw = JSON.parse(localStorage.getItem("stopmod_cart") || "[]");
    const total = Array.isArray(raw)
      ? raw.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || item.qty || 1)), 0)
      : 0;
    node.textContent = String(total);
  } catch {
    node.textContent = "0";
  }
}

async function loadInitial() {
  state.loadingInitial = true;
  renderSkeletonGrid(document.getElementById("best-sellers-grid"));
  renderSkeletonGrid(document.getElementById("recommended-grid"));
  const firstPage = await fetchProducts(1);
  state.products = firstPage;
  state.page = 2;
  state.loadingInitial = false;
  renderAllProducts();
}

function setupInfiniteLoad() {
  const node = document.getElementById("infinite-loader");
  const loadingGrid = document.getElementById("loading-more-grid");
  if (!node) return;

  const observer = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (!entry.isIntersecting || state.loadingMore || state.loadingInitial) return;

    async function loadMore() {
      state.loadingMore = true;
      node.textContent = "Carregando mais produtos...";
      if (loadingGrid) {
        loadingGrid.hidden = false;
        renderSkeletonGrid(loadingGrid, 6);
      }
      const nextPage = await fetchProducts(state.page);
      state.products = [...state.products, ...nextPage];
      state.page += 1;
      state.loadingMore = false;
      if (loadingGrid) {
        loadingGrid.hidden = true;
        loadingGrid.innerHTML = "";
      }
      node.textContent = "Role para carregar mais produtos";
      renderAllProducts();
    }

    loadMore();
  }, { rootMargin: "700px" });

  observer.observe(node);
}

function initHome() {
  renderCartCount();
  renderCategories();
  renderTabs();
  renderAdBanners("ad-banner-row-primary");
  renderAdBanners("ad-banner-row-secondary");
  loadInitial();
  setupInfiniteLoad();
}

document.addEventListener("DOMContentLoaded", initHome);
