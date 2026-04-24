const sharedCatalog = window.stopmodCatalog || null;
const CART_KEY = sharedCatalog?.storageKeys?.cart || "stopmod_cart";
const FAVORITES_KEY = sharedCatalog?.storageKeys?.favorites || "stopmod_favorites";

const products = Array.isArray(sharedCatalog?.products) ? sharedCatalog.products : [];
const formatBRL = sharedCatalog?.formatBRL || ((value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const pixPrice = sharedCatalog?.pixPrice || ((value) => Number(value || 0) * 0.93);
const oldPrice = sharedCatalog?.oldPrice || ((value) => Number(value || 0) * 1.12);
const productHref = sharedCatalog?.productHref || ((id) => `/produtos/?id=${encodeURIComponent(String(id))}`);

const heroTrack = document.getElementById("home-hero-track");
const heroDots = document.getElementById("home-hero-dots");
const orbitGrid = document.getElementById("home-category-orbit");
const bestSellersTrack = document.getElementById("best-sellers-track");
const recommendGrid = document.getElementById("recommend-grid");
const recommendFeedback = document.getElementById("recommend-feedback");
const recommendTabs = Array.from(document.querySelectorAll("[data-home-filter]"));
const loadMoreButton = document.getElementById("load-more-products");
const newsletterForm = document.getElementById("newsletter-form");
const newsletterEmail = document.getElementById("newsletter-email");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");

const heroSlides = [
  {
    kickerAccent: "COLECAO",
    kickerText: "OUTONO / INVERNO",
    title: "ESTILO SEM PAGAR CARO",
    text: "As melhores pecas com os melhores precos. Qualidade premium, preco justo.",
    primaryLabel: "Ver colecao",
    primaryHref: "#recomendados",
    secondaryLabel: "Lancamentos",
    secondaryHref: "#lancamentos",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80"
  },
  {
    kickerAccent: "DROP",
    kickerText: "STREETWEAR PREMIUM",
    title: "PECAS FORTES EM LEITURA LIMPA",
    text: "Modelagens urbanas, visual refinado e selecao pensada para vender com cara de marca grande.",
    primaryLabel: "Ver streetwear",
    primaryHref: "#recomendados",
    secondaryLabel: "Mais vendidos",
    secondaryHref: "#produtos",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
  },
  {
    kickerAccent: "NOVA",
    kickerText: "CURADORIA UZUU",
    title: "PRECO FORTE E VITRINE PREMIUM",
    text: "Selecao escura, premium e comercial para deixar a home com leitura de marketplace profissional.",
    primaryLabel: "Explorar agora",
    primaryHref: "#produtos",
    secondaryLabel: "Promocoes",
    secondaryHref: "/cupons/",
    image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=1600&q=80"
  }
];

const homeProductMeta = {
  1: {
    segment: "streetwear",
    orbit: "streetwear",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80"
  },
  2: {
    segment: "masculino",
    orbit: "masculino",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"
  },
  3: {
    segment: "feminino",
    orbit: "feminino",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80"
  },
  4: {
    segment: "streetwear",
    orbit: "streetwear",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80"
  },
  10: {
    segment: "masculino",
    orbit: "masculino",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80"
  },
  11: {
    segment: "calcados",
    orbit: "calcados",
    image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=900&q=80"
  },
  12: {
    segment: "acessorios",
    orbit: "acessorios",
    image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=900&q=80"
  },
  13: {
    segment: "feminino",
    orbit: "feminino",
    image: "https://images.unsplash.com/photo-1506629905607-d9d4b5b1f1b3?auto=format&fit=crop&w=900&q=80"
  },
  14: {
    segment: "masculino",
    orbit: "masculino",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
  },
  15: {
    segment: "feminino",
    orbit: "feminino",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80"
  },
  17: {
    segment: "streetwear",
    orbit: "streetwear",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80"
  },
  18: {
    segment: "masculino",
    orbit: "masculino",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80"
  },
  19: {
    segment: "streetwear",
    orbit: "streetwear",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
  },
  21: {
    segment: "feminino",
    orbit: "feminino",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
  }
};

const orbitCards = [
  { key: "masculino", label: "Masculino", productId: 2 },
  { key: "feminino", label: "Feminino", productId: 15 },
  { key: "acessorios", label: "Acessorios", productId: 12 },
  { key: "calcados", label: "Calcados", productId: 11 },
  { key: "streetwear", label: "Streetwear", productId: 4 },
  { key: "promocoes", label: "Promocoes", promo: true }
];

const bestSellerIds = [4, 1, 12, 11, 14, 10];
const recommendationIds = [15, 2, 4, 17, 1, 11, 3, 12, 14, 18, 21, 13];
const recommendationBadges = {
  15: "-10%"
};

let currentHeroIndex = 0;
let heroTimer = null;
let activeFilter = "all";
let recommendLimit = 6;
const filterKeywords = new Set(["all", "masculino", "feminino", "acessorios", "calcados", "streetwear"]);

function getQueryParams() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getProductById(id) {
  return sharedCatalog?.getProductById ? sharedCatalog.getProductById(id) : products.find((item) => Number(item.id) === Number(id)) || null;
}

function getDisplayProduct(id) {
  const product = getProductById(id);
  if (!product) return null;
  const summary = sharedCatalog?.getRatingSummary ? sharedCatalog.getRatingSummary(product.id) : { average: 4.8, count: 32, sold: 0 };
  const meta = homeProductMeta[product.id] || {};
  return {
    ...product,
    displayImage: meta.image || product.image,
    segment: meta.segment || "all",
    ratingAverage: Number(summary?.average || 4.8),
    ratingCount: Math.max(Number(summary?.count || 0), 12),
    soldCount: Number(summary?.sold || 0),
    compareAt: oldPrice(product.price),
    pixValue: pixPrice(product.price)
  };
}

function loadFavoriteIds() {
  if (sharedCatalog?.loadFavorites) return sharedCatalog.loadFavorites();
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter((item) => Number.isInteger(item) && item > 0) : [];
  } catch {
    return [];
  }
}

function isFavorite(id) {
  return sharedCatalog?.isFavorite ? sharedCatalog.isFavorite(id) : loadFavoriteIds().includes(Number(id));
}

function toggleFavorite(id) {
  return sharedCatalog?.toggleFavorite ? sharedCatalog.toggleFavorite(id) : false;
}

function renderCartCount() {
  if (!cartCount) return;
  const total = sharedCatalog?.countCartItems ? sharedCatalog.countCartItems() : 0;
  cartCount.textContent = String(total);
}

function renderStars() {
  return "&#9733;&#9733;&#9733;&#9733;&#9733;";
}

function installPrice(value) {
  return formatBRL(Number(value || 0) / 12);
}

function favoriteIconMarkup(product) {
  const favorite = isFavorite(product.id);
  return `
    <button class="home-product-card__favorite${favorite ? " is-active" : ""}" type="button" data-product-favorite="${product.id}" data-no-card-open aria-label="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}" aria-pressed="${favorite ? "true" : "false"}">
      ${favorite ? "&#10084;" : "&#9825;"}
    </button>
  `;
}

function productCardMarkup(product, options = {}) {
  const saleBadge = options.saleBadge ? `<span class="home-product-card__sale">${options.saleBadge}</span>` : "";
  const compareAt = options.showCompare === false ? "" : `<small>${formatBRL(product.compareAt)}</small>`;
  return `
    <article class="home-product-card" data-product-open-id="${product.id}" tabindex="0" role="link" aria-label="Abrir ${product.name}">
      <div class="home-product-card__media">
        ${saleBadge}
        ${favoriteIconMarkup(product)}
        <img src="${product.displayImage}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="home-product-card__body">
        <h3>${product.name}</h3>
        <div class="home-product-card__rating">
          <span class="home-product-card__stars" aria-hidden="true">${renderStars()}</span>
          <span>(${product.ratingCount})</span>
        </div>
        <div class="home-product-card__price">
          <strong>${formatBRL(product.price)}</strong>
          ${compareAt}
        </div>
        <div class="home-product-card__pix">${formatBRL(product.pixValue)} no PIX</div>
        <div class="home-product-card__installments">12x de ${installPrice(product.price)}</div>
      </div>
    </article>
  `;
}

function renderHero() {
  if (!heroTrack || !heroDots) return;

  heroTrack.innerHTML = heroSlides
    .map(
      (slide, index) => `
        <article class="home-hero__slide${index === currentHeroIndex ? " is-active" : ""}" data-hero-slide="${index}">
          <div class="home-hero__media" style="background-image:url('${slide.image}')"></div>
          <div class="home-hero__overlay"></div>
          <div class="home-hero__content">
            <p class="home-hero__kicker"><span>${slide.kickerAccent}</span> ${slide.kickerText}</p>
            <h1>${slide.title}</h1>
            <p>${slide.text}</p>
            <div class="home-hero__actions">
              <a class="home-hero__primary" href="${slide.primaryHref}">${slide.primaryLabel}</a>
              <a class="home-hero__secondary" href="${slide.secondaryHref}">${slide.secondaryLabel}</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  heroDots.innerHTML = heroSlides
    .map(
      (_, index) => `<button type="button" class="${index === currentHeroIndex ? "is-active" : ""}" data-hero-dot="${index}" aria-label="Ir para banner ${index + 1}"></button>`
    )
    .join("");
}

function activateHero(index) {
  const total = heroSlides.length;
  currentHeroIndex = (index + total) % total;
  document.querySelectorAll("[data-hero-slide]").forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentHeroIndex);
  });
  document.querySelectorAll("[data-hero-dot]").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentHeroIndex);
  });
}

function restartHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => activateHero(currentHeroIndex + 1), 5400);
}

function renderOrbit() {
  if (!orbitGrid) return;

  orbitGrid.innerHTML = orbitCards
    .map((item) => {
      if (item.promo) {
        return `
          <button class="home-orbit-card home-orbit-card--promo" type="button" data-orbit-filter="promocoes" aria-label="Abrir promocoes">
            <span class="home-orbit-card__media">
              <span class="home-orbit-card__promo-icon" aria-hidden="true">%</span>
            </span>
            <span class="home-orbit-card__label">${item.label}</span>
          </button>
        `;
      }

      const product = getDisplayProduct(item.productId);
      if (!product) return "";

      return `
        <button class="home-orbit-card" type="button" data-orbit-filter="${item.key}" aria-label="Filtrar por ${item.label}">
          <span class="home-orbit-card__media">
            <img src="${product.displayImage}" alt="${item.label}" loading="lazy" />
          </span>
          <span class="home-orbit-card__label">${item.label}</span>
        </button>
      `;
    })
    .join("");
}

function renderBestSellers() {
  if (!bestSellersTrack) return;
  bestSellersTrack.innerHTML = bestSellerIds
    .map((id) => getDisplayProduct(id))
    .filter(Boolean)
    .map((product) => productCardMarkup(product, { showCompare: true }))
    .join("");
}

function getSearchTerm() {
  const fromInput = String(searchInput?.value || "").trim();
  if (fromInput) {
    const normalizedInput = normalizeText(fromInput);
    return filterKeywords.has(normalizedInput) ? "" : fromInput;
  }

  const params = getQueryParams();
  const query = String(params.get("q") || "").trim();
  return filterKeywords.has(normalizeText(query)) ? "" : query;
}

function inferFilterFromUrl() {
  const params = getQueryParams();
  const category = normalizeText(params.get("cat"));
  const query = normalizeText(params.get("q"));

  if (category === "acessorios") return "acessorios";
  if (category === "calcados") return "calcados";
  if (query.includes("streetwear")) return "streetwear";
  if (query.includes("masculino")) return "masculino";
  if (query.includes("feminino")) return "feminino";
  if (query.includes("calcados")) return "calcados";
  if (query.includes("acessorios")) return "acessorios";
  return "all";
}

function matchesSearch(product, term) {
  const haystack = normalizeText(`${product.name} ${product.category} ${product.badge} ${product.shortDescription || ""}`);
  return !term || haystack.includes(normalizeText(term));
}

function matchesFilter(product, filter) {
  return filter === "all" ? true : product.segment === filter;
}

function updateFilterButtons() {
  recommendTabs.forEach((button) => {
    button.classList.toggle("is-active", String(button.dataset.homeFilter || "") === activeFilter);
  });
}

function getRecommendationProducts() {
  const term = getSearchTerm();
  return recommendationIds
    .map((id) => getDisplayProduct(id))
    .filter(Boolean)
    .filter((product) => matchesFilter(product, activeFilter))
    .filter((product) => matchesSearch(product, term));
}

function renderRecommendations() {
  if (!recommendGrid || !recommendFeedback) return;

  const list = getRecommendationProducts();
  const visible = list.slice(0, recommendLimit);

  recommendGrid.innerHTML = visible
    .map((product) => productCardMarkup(product, { saleBadge: recommendationBadges[product.id] || "" }))
    .join("");

  recommendFeedback.hidden = list.length > 0;
  updateFilterButtons();

  if (loadMoreButton) {
    const remaining = list.length - visible.length;
    loadMoreButton.hidden = list.length === 0;
    loadMoreButton.disabled = remaining <= 0;
    loadMoreButton.querySelector("span:last-child").textContent = remaining > 0 ? "Carregando mais produtos..." : "Todos os produtos ja foram exibidos";
  }
}

function setActiveFilter(filter) {
  activeFilter = filter;
  recommendLimit = 6;
  renderRecommendations();
}

function showToast(message) {
  const current = document.querySelector(".toast");
  if (current) current.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2200);
}

function syncInitialState() {
  activeFilter = inferFilterFromUrl();
  updateFilterButtons();
  if (searchInput) {
    const params = getQueryParams();
    const query = String(params.get("q") || "").trim();
    if (query && !searchInput.value) searchInput.value = query;
  }
}

document.addEventListener("click", (event) => {
  const favoriteButton = event.target instanceof Element ? event.target.closest("[data-product-favorite]") : null;
  if (favoriteButton) {
    const id = favoriteButton.getAttribute("data-product-favorite");
    const product = getProductById(id);
    const isNowFavorite = toggleFavorite(id);
    renderBestSellers();
    renderRecommendations();
    showToast(isNowFavorite ? `${product?.name || "Produto"} salvo nos favoritos.` : `${product?.name || "Produto"} removido dos favoritos.`);
    return;
  }

  const card = event.target instanceof Element ? event.target.closest("[data-product-open-id]") : null;
  if (card && !event.target.closest("[data-no-card-open]")) {
    window.location.href = productHref(card.getAttribute("data-product-open-id"));
    return;
  }

  const heroDot = event.target instanceof Element ? event.target.closest("[data-hero-dot]") : null;
  if (heroDot) {
    activateHero(Number(heroDot.getAttribute("data-hero-dot") || 0));
    restartHeroTimer();
    return;
  }

  const heroNav = event.target instanceof Element ? event.target.closest("[data-hero-nav]") : null;
  if (heroNav) {
    activateHero(currentHeroIndex + (heroNav.getAttribute("data-hero-nav") === "prev" ? -1 : 1));
    restartHeroTimer();
    return;
  }

  const orbit = event.target instanceof Element ? event.target.closest("[data-orbit-filter]") : null;
  if (orbit) {
    const filter = String(orbit.getAttribute("data-orbit-filter") || "");
    if (filter === "promocoes") {
      window.location.href = "/cupons/";
      return;
    }

    setActiveFilter(filter);
    document.getElementById("recomendados")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const scrollButton = event.target instanceof Element ? event.target.closest("[data-scroll-target]") : null;
  if (scrollButton) {
    const targetId = scrollButton.getAttribute("data-scroll-target");
    const direction = scrollButton.getAttribute("data-scroll-direction") === "prev" ? -1 : 1;
    const target = document.getElementById(String(targetId || ""));
    target?.scrollBy({ left: direction * 380, behavior: "smooth" });
    return;
  }
});

document.addEventListener("keydown", (event) => {
  const card = event.target instanceof Element ? event.target.closest("[data-product-open-id]") : null;
  if (!card) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  window.location.href = productHref(card.getAttribute("data-product-open-id"));
});

recommendTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(String(button.dataset.homeFilter || "all"));
  });
});

searchInput?.addEventListener("input", () => {
  recommendLimit = 6;
  renderRecommendations();
});

loadMoreButton?.addEventListener("click", () => {
  recommendLimit += 6;
  renderRecommendations();
});

newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = String(newsletterEmail?.value || "").trim();
  if (!email || !email.includes("@")) {
    showToast("Digite um e-mail valido para continuar.");
    return;
  }

  if (newsletterEmail) newsletterEmail.value = "";
  showToast("Cadastro realizado com sucesso.");
});

window.addEventListener("storage", (event) => {
  if ([FAVORITES_KEY, CART_KEY].includes(String(event.key || ""))) {
    renderBestSellers();
    renderRecommendations();
    renderCartCount();
  }
});

syncInitialState();
renderHero();
renderOrbit();
renderBestSellers();
renderRecommendations();
renderCartCount();
restartHeroTimer();
