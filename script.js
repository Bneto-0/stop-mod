const CART_KEY = "stopmod_cart";
const PROFILE_KEY = "stopmod_profile";

const products = [
  { id: 1, name: "Camiseta Oversized Street", category: "Camisetas", size: "P ao GG", price: 89.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", badge: "12x sem juros" },
  { id: 2, name: "Calca Cargo Urban", category: "Calcas", size: "36 ao 46", price: 159.9, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80", badge: "frete verde" },
  { id: 3, name: "Jaqueta Jeans Vintage", category: "Jaquetas", size: "P ao XG", price: 219.9, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80", badge: "novo drop" },
  { id: 4, name: "Moletom Essential Stop", category: "Moletons", size: "P ao GG", price: 179.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80", badge: "pix -7%" },
  { id: 5, name: "Vestido Casual Minimal", category: "Vestidos", size: "PP ao G", price: 139.9, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", badge: "mais vendido" },
  { id: 6, name: "Camisa Linho Leve", category: "Camisas", size: "P ao GG", price: 129.9, image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80", badge: "colecao 2026" },
  { id: 7, name: "Cardigan Tricot Cozy", category: "Casacos", size: "P ao G", price: 149.9, image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=900&q=80", badge: "estoque rapido" },
  { id: 8, name: "Blazer Minimal Preto", category: "Blazers", size: "P ao GG", price: 249.9, image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=900&q=80", badge: "premium" },
  { id: 9, name: "Saia Midi Plissada", category: "Saias", size: "PP ao G", price: 119.9, image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80", badge: "leve e soltinha" },
  { id: 10, name: "Short Alfaiataria", category: "Shorts", size: "36 ao 44", price: 109.9, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80", badge: "look do dia" },
  { id: 11, name: "Tenis Street Clean", category: "Calcados", size: "37 ao 43", price: 239.9, image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=900&q=80", badge: "street clean" },
  { id: 12, name: "Bolsa Tote Minimal", category: "Acessorios", size: "Unico", price: 189.9, image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=900&q=80", badge: "acabamento fosco" },
  { id: 13, name: "Top Ribana Soft", category: "Camisetas", size: "PP ao G", price: 79.9, image: "https://images.unsplash.com/photo-1506629905607-d9d4b5b1f1b3?auto=format&fit=crop&w=900&q=80", badge: "basico chic" },
  { id: 14, name: "Wide Leg Essential", category: "Calcas", size: "36 ao 48", price: 169.9, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", badge: "cintura alta" },
  { id: 15, name: "Jaqueta Puffer Glow", category: "Jaquetas", size: "P ao GG", price: 269.9, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", badge: "inverno" },
  { id: 16, name: "Vestido Midi Glow", category: "Vestidos", size: "PP ao GG", price: 149.9, image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80", badge: "tecido leve" },
  { id: 17, name: "Camiseta Boxy Fade", category: "Camisetas", size: "P ao XG", price: 94.9, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80", badge: "streetwear" },
  { id: 18, name: "Calca Reta Office", category: "Calcas", size: "38 ao 48", price: 154.9, image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80", badge: "alfaiataria" },
  { id: 19, name: "Jaqueta Couro Clean", category: "Jaquetas", size: "P ao G", price: 299.9, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", badge: "edicao limitada" },
  { id: 20, name: "Vestido Satin Night", category: "Vestidos", size: "PP ao G", price: 159.9, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", badge: "brilho suave" },
  { id: 21, name: "Cropped Urban Fit", category: "Camisetas", size: "PP ao G", price: 84.9, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", badge: "alta procura" }
];

const announcements = [
  {
    kicker: "drop principal",
    title: "Anuncios grandes de volta na home da loja.",
    text: "Banner principal passando sozinho, mais destaques laterais e uma pagina inicial com mais impacto visual.",
    badge: "campanha automatica",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Ver produtos",
    ctaHref: "#produtos"
  },
  {
    kicker: "frete + pix",
    title: "Colecao com pix em destaque, frete e giro de anuncios.",
    text: "Os anuncios passam sozinhos e deixam a home com mais cara de loja pronta para vender.",
    badge: "frete promocional",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Ir para vitrine",
    ctaHref: "#produtos"
  },
  {
    kicker: "pesquisa em alta",
    title: "Blocos de anuncio e prateleiras mais cheias logo abaixo.",
    text: "Deixamos a pagina inicial menos simples e mais parecida com a estrutura de marketplace que voce vinha pedindo.",
    badge: "layout renovado",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Entrar na conta",
    ctaHref: "./login/"
  }
];

const miniAnnouncements = [
  { kicker: "banner 01", title: "Oferta relampago com pix em destaque", text: "Visual curto e direto para chamar clique rapido.", actionLabel: "Pix ativo" },
  { kicker: "banner 02", title: "Boleto, cartao e login no mesmo fluxo", text: "Sem quebrar a navegacao da loja.", actionLabel: "Checkout real" },
  { kicker: "banner 03", title: "Vitrine menor para reforcar a area de anuncios", text: "Mais blocos, mais leitura visual, mais cara de loja.", actionLabel: "Home charmosa" }
];

const searchBanners = [
  { kicker: "pesquisa", title: "Vestidos em alta", text: "Toque para filtrar vestidos na vitrine.", searchTerm: "Vestidos", filter: "Vestidos" },
  { kicker: "pesquisa", title: "Jaquetas e inverno", text: "Leva voce direto para as pecas mais pesadas.", searchTerm: "Jaquetas", filter: "Jaquetas" },
  { kicker: "pesquisa", title: "Camisetas street", text: "Filtro rapido da parte mais buscada da loja.", searchTerm: "Camisetas", filter: "Camisetas" }
];

const adFlowCards = [
  { style: "accent", kicker: "sequencia de anuncios", title: "Banner principal + banner lateral + prateleira compacta.", text: "A home ficou mais carregada visualmente, como voce vinha pedindo." },
  { style: "neutral", kicker: "rolagem de produto", title: "Produtos com scroll horizontal sem poluir a pagina.", text: "A seta nao aparece e a prateleira continua mais elegante." },
  { style: "dark", kicker: "visual de loja", title: "Mais cara de storefront e menos cara de pagina provisoria.", text: "Mantivemos login, carrinho e backend funcionando no mesmo fluxo." }
];

const grid = document.getElementById("product-grid");
const productShelf = document.getElementById("product-shelf");
const compactBoard = document.getElementById("compact-product-board");
const catalogSummary = document.getElementById("catalog-summary");
const feedback = document.getElementById("catalog-feedback");
const searchInput = document.getElementById("search-home") || document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const profileLink = document.getElementById("profile-link");
const filters = Array.from(document.querySelectorAll("[data-filter]"));
const announcementTrack = document.getElementById("announcement-track");
const announcementCarousel = document.querySelector(".announcement-carousel");
const announcementDots = document.getElementById("announcement-dots");
const announcementMiniGrid = document.getElementById("announcement-mini-grid");
const searchBannerList = document.getElementById("search-banner-list");
const adFlow = document.getElementById("ad-flow");

let activeAnnouncementIndex = 0;
let announcementTimer = null;
let announcementDragStartX = null;
let announcementDragCurrentX = null;

function loadCartIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter((item) => Number.isInteger(item) && item > 0) : [];
  } catch {
    return [];
  }
}

function saveCartIds(ids) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function oldPrice(value) {
  return value * 1.12;
}

function pixPrice(value) {
  return value * 0.93;
}

function renderCartCount() {
  if (cartCount) cartCount.textContent = String(loadCartIds().length);
}

function renderProfileState() {
  if (!profileLink) return;
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    const firstName = String(profile?.name || "").trim().split(/\s+/)[0];
    if (firstName) {
      profileLink.textContent = firstName;
      profileLink.href = "./perfil/";
    }
  } catch {
    // ignore profile state errors
  }
}

function showToast(message) {
  const current = document.querySelector(".toast");
  if (current) current.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function addToCart(id) {
  const ids = loadCartIds();
  ids.push(Number(id));
  saveCartIds(ids);
  renderCartCount();
  showToast("Produto adicionado ao carrinho.");
}

function getQueryCategory() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("cat") || "").trim();
}

function activeFilter() {
  const button = filters.find((item) => item.classList.contains("is-active"));
  return button ? String(button.dataset.filter || "todos") : "todos";
}

function getVisibleProducts() {
  const search = String(searchInput?.value || "").trim().toLowerCase();
  const queryCategory = getQueryCategory();
  const filter = activeFilter();
  return products.filter((product) => {
    const categoryMatch = filter === "todos" ? true : product.category === filter;
    const queryMatch = queryCategory ? product.category === queryCategory : true;
    const textMatch = !search || `${product.name} ${product.category} ${product.size} ${product.badge}`.toLowerCase().includes(search);
    return categoryMatch && queryMatch && textMatch;
  });
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-card__body">
        <p class="product-card__meta">${product.category} | ${product.size}</p>
        <h3>${product.name}</h3>
        <div class="product-card__badges">
          <span class="badge-pill">${product.badge}</span>
          <span class="badge-pill">pix ${formatBRL(pixPrice(product.price))}</span>
        </div>
        <div class="product-card__price">
          <strong>${formatBRL(product.price)}</strong>
          <span>${formatBRL(oldPrice(product.price))}</span>
        </div>
        <div class="product-card__actions">
          <button class="btn primary" type="button" data-add-id="${product.id}">Comprar</button>
          <a class="btn secondary" href="./carrinho/">Carrinho</a>
        </div>
      </div>
    </article>
  `;
}

function shelfCard(product) {
  return `
    <article class="shelf-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="shelf-card__body">
        <p class="product-card__meta">${product.category}</p>
        <h3>${product.name}</h3>
        <p>${product.badge}</p>
        <div class="shelf-card__price">
          <strong>${formatBRL(product.price)}</strong>
          <span>${formatBRL(oldPrice(product.price))}</span>
        </div>
        <div class="shelf-card__actions">
          <button class="btn primary" type="button" data-add-id="${product.id}">Adicionar</button>
          <a class="btn secondary" href="./carrinho/">Ir</a>
        </div>
      </div>
    </article>
  `;
}

function compactProductCard(product) {
  return `
    <article class="compact-product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="compact-product-card__meta">
        <span>${product.category}</span>
        <span>${product.size}</span>
      </div>
      <h3>${product.name}</h3>
      <div class="compact-product-card__price">
        <strong>${formatBRL(product.price)}</strong>
        <span>${product.badge}</span>
      </div>
    </article>
  `;
}

function renderProducts() {
  if (!grid) return;
  const visible = getVisibleProducts();
  grid.innerHTML = visible.map(productCard).join("");
  if (feedback) feedback.hidden = visible.length > 0;
  if (catalogSummary) {
    catalogSummary.textContent = visible.length
      ? `${visible.length} produto(s) na vitrine com o filtro atual.`
      : "Nenhum produto encontrado com esse filtro.";
  }
}

function renderProductShelf() {
  if (!productShelf) return;
  const featured = products.slice(0, 12);
  productShelf.innerHTML = featured.map(shelfCard).join("");
}

function renderCompactBoard() {
  if (!compactBoard) return;
  const boardItems = products.slice(0, 21);
  compactBoard.innerHTML = boardItems.map(compactProductCard).join("");
}

function renderAnnouncementCarousel() {
  if (!announcementTrack || !announcementDots) return;

  announcementTrack.innerHTML = announcements.map((item, index) => `
    <article class="announcement-slide${index === 0 ? " is-active" : ""}" data-announcement-slide="${index}">
      <div class="announcement-slide__media">
        <img src="${item.image}" alt="${item.title}" />
        <div class="announcement-slide__overlay"></div>
      </div>
      <div class="announcement-slide__content">
        <span class="announcement-slide__tag">${item.kicker}</span>
        <h1>${item.title}</h1>
        <p>${item.text}</p>
        <div class="announcement-slide__footer">
          <a class="btn primary" href="${item.ctaHref}">${item.ctaLabel}</a>
          <span class="announcement-slide__badge">${item.badge}</span>
        </div>
      </div>
    </article>
  `).join("");

  announcementDots.innerHTML = announcements.map((_, index) => `
    <button type="button" aria-label="Ir para anuncio ${index + 1}" data-announcement-dot="${index}" class="${index === 0 ? "is-active" : ""}"></button>
  `).join("");
}

function activateAnnouncement(index) {
  activeAnnouncementIndex = (index + announcements.length) % announcements.length;
  document.querySelectorAll("[data-announcement-slide]").forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeAnnouncementIndex);
  });
  document.querySelectorAll("[data-announcement-dot]").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeAnnouncementIndex);
  });
}

function restartAnnouncementTimer() {
  if (announcementTimer) clearInterval(announcementTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  announcementTimer = setInterval(() => {
    activateAnnouncement(activeAnnouncementIndex + 1);
  }, 4800);
}

function beginAnnouncementDrag(clientX) {
  if (clientX === null || !announcementCarousel) return;
  announcementDragStartX = clientX;
  announcementDragCurrentX = clientX;
  announcementCarousel.classList.add("is-dragging");
}

function moveAnnouncementDrag(clientX) {
  if (announcementDragStartX === null || clientX === null) return;
  announcementDragCurrentX = clientX;
}

function endAnnouncementDrag() {
  if (announcementDragStartX === null || announcementDragCurrentX === null) {
    announcementDragStartX = null;
    announcementDragCurrentX = null;
    announcementCarousel?.classList.remove("is-dragging");
    return;
  }

  const delta = announcementDragCurrentX - announcementDragStartX;
  if (Math.abs(delta) >= 48) {
    activateAnnouncement(activeAnnouncementIndex + (delta < 0 ? 1 : -1));
    restartAnnouncementTimer();
  }

  announcementDragStartX = null;
  announcementDragCurrentX = null;
  announcementCarousel?.classList.remove("is-dragging");
}
function renderMiniAnnouncements() {
  if (!announcementMiniGrid) return;
  announcementMiniGrid.innerHTML = miniAnnouncements.map((item) => `
    <article class="announcement-mini">
      <div>
        <p class="announcement-mini__kicker">${item.kicker}</p>
        <h3>${item.title}</h3>
      </div>
      <p>${item.text}</p>
      <div class="announcement-mini__foot">
        <span class="badge-pill">${item.actionLabel}</span>
      </div>
    </article>
  `).join("");
}

function renderSearchBanners() {
  if (!searchBannerList) return;
  searchBannerList.innerHTML = searchBanners.map((item) => `
    <button class="search-chip" type="button" data-search-term="${item.searchTerm}" data-filter-set="${item.filter}">
      <p class="search-chip__kicker">${item.kicker}</p>
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </button>
  `).join("");
}

function renderAdFlow() {
  if (!adFlow) return;
  adFlow.innerHTML = adFlowCards.map((item) => `
    <article class="ad-card ad-card--${item.style}">
      <p class="ad-card__kicker">${item.kicker}</p>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderProducts();
  });
});

searchInput?.addEventListener("input", renderProducts);

document.addEventListener("click", (event) => {
  const addButton = event.target instanceof Element ? event.target.closest("[data-add-id]") : null;
  if (addButton) {
    addToCart(addButton.getAttribute("data-add-id"));
    return;
  }

  const searchButton = event.target instanceof Element ? event.target.closest("[data-search-term]") : null;
  if (searchButton) {
    const term = String(searchButton.getAttribute("data-search-term") || "");
    const filter = String(searchButton.getAttribute("data-filter-set") || "todos");
    if (searchInput) searchInput.value = term;
    filters.forEach((item) => item.classList.toggle("is-active", String(item.dataset.filter || "") === filter));
    renderProducts();
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const dot = event.target instanceof Element ? event.target.closest("[data-announcement-dot]") : null;
  if (dot) {
    activateAnnouncement(Number(dot.getAttribute("data-announcement-dot") || 0));
    restartAnnouncementTimer();
    return;
  }

  const nav = event.target instanceof Element ? event.target.closest("[data-announcement-nav]") : null;
  if (nav) {
    const direction = nav.getAttribute("data-announcement-nav") === "prev" ? -1 : 1;
    activateAnnouncement(activeAnnouncementIndex + direction);
    restartAnnouncementTimer();
  }
});

announcementCarousel?.addEventListener("mousedown", (event) => {
  beginAnnouncementDrag(event.clientX);
});

announcementCarousel?.addEventListener("mousemove", (event) => {
  moveAnnouncementDrag(event.clientX);
});

announcementCarousel?.addEventListener("mouseup", () => {
  endAnnouncementDrag();
});

announcementCarousel?.addEventListener("mouseleave", () => {
  if (announcementDragStartX !== null) endAnnouncementDrag();
});

announcementCarousel?.addEventListener("touchstart", (event) => {
  beginAnnouncementDrag(event.touches[0]?.clientX ?? null);
}, { passive: true });

announcementCarousel?.addEventListener("touchmove", (event) => {
  moveAnnouncementDrag(event.touches[0]?.clientX ?? null);
}, { passive: true });

announcementCarousel?.addEventListener("touchend", (event) => {
  const endX = event.changedTouches[0]?.clientX ?? announcementDragCurrentX;
  moveAnnouncementDrag(endX ?? null);
  endAnnouncementDrag();
}, { passive: true });

announcementCarousel?.addEventListener("touchcancel", () => {
  endAnnouncementDrag();
}, { passive: true });
renderAnnouncementCarousel();
renderMiniAnnouncements();
renderSearchBanners();
renderAdFlow();
renderCompactBoard();
renderProductShelf();
renderCartCount();
renderProfileState();
renderProducts();
restartAnnouncementTimer();
