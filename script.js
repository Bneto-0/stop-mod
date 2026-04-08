const sharedCatalog = window.stopmodCatalog || null;
const CART_KEY = sharedCatalog?.storageKeys?.cart || "stopmod_cart";
const PROFILE_KEY = "stopmod_profile";

const products = Array.isArray(sharedCatalog?.products) && sharedCatalog.products.length ? sharedCatalog.products : [
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
    kicker: "uzuu seleciona",
    title: "ESTILO SEM PAGAR CARO",
    text: "Moda, calcados e acessorios em um so lugar com os melhores achados da semana e visual mais forte na vitrine.",
    badge: "comprar agora",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Ver produtos",
    ctaHref: "#produtos"
  },
  {
    kicker: "frete rapido",
    title: "OFERTAS QUE GIRAM RAPIDO",
    text: "Hero laranja, precos em destaque e uma home com mais cara de loja pronta para vender todo dia.",
    badge: "pix e cartao",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Ir para vitrine",
    ctaHref: "#produtos"
  },
  {
    kicker: "compra segura",
    title: "MODA E ACESSORIOS COM MAIS PRESENCA",
    text: "Blocos de destaque, produtos mais claros e uma paleta laranja para deixar a marca Uzuu mais marcante.",
    badge: "layout renovado",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
    ctaLabel: "Entrar na conta",
    ctaHref: "./login/"
  }
];

const campaignBannerData = {
  kicker: "moda e calcados com estilo e preco justo",
  title: "Descubra as ultimas tendencias da moda e calcados.",
  text: "Selecao com bons precos, entrega rapida e uma vitrine mais limpa para deixar a marca Uzuu mais proxima do modelo que voce quer.",
  primaryLabel: "Abrir vitrine",
  primaryHref: "#produtos",
  secondaryLabel: "Entrar na conta",
  secondaryHref: "./login/",
  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  spotlightValue: "UZUU",
  spotlightText: "nova vitrine da marca",
  chips: [
    "frete gratis acima de R$ 99",
    "cartao em ate 12x",
    "compra segura"
  ],
  stats: [
    { value: "PIX", label: "pagamento rapido" },
    { value: "12x", label: "sem juros" },
    { value: "BR", label: "entrega nacional" }
  ]
};

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
const adFlow = document.getElementById("ad-flow");
const campaignBanner = document.getElementById("campaign-banner");

let activeAnnouncementIndex = 0;
let announcementTimer = null;
let announcementDragStartX = null;
let announcementDragCurrentX = null;

function loadCartIds() {
  if (sharedCatalog?.loadCartIds) return sharedCatalog.loadCartIds();
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter((item) => Number.isInteger(item) && item > 0) : [];
  } catch {
    return [];
  }
}

function saveCartIds(ids) {
  if (sharedCatalog?.saveCartIds) {
    sharedCatalog.saveCartIds(ids);
    return;
  }
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

function productHref(id) {
  if (sharedCatalog?.productHref) return sharedCatalog.productHref(id);
  return `/produtos/?id=${encodeURIComponent(String(id))}`;
}

function renderCartCount() {
  if (cartCount) cartCount.textContent = String(sharedCatalog?.countCartItems ? sharedCatalog.countCartItems() : loadCartIds().length);
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
  if (sharedCatalog?.addToCart) {
    sharedCatalog.addToCart(id, 1);
    renderCartCount();
    showToast("Produto adicionado ao carrinho.");
    return;
  }

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
    <article class="product-card product-card--interactive" data-product-open-id="${product.id}" tabindex="0" role="link" aria-label="Abrir ${product.name}">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-card__body">
        <p class="product-card__meta">${product.category} | ${product.size}</p>
        <h3>${product.name}</h3>
        <p class="product-card__summary">${product.shortDescription || product.badge}</p>
        <div class="product-card__badges">
          <span class="badge-pill">${product.badge}</span>
          <span class="badge-pill">pix ${formatBRL(pixPrice(product.price))}</span>
        </div>
        <div class="product-card__price">
          <strong>${formatBRL(product.price)}</strong>
          <span>${formatBRL(oldPrice(product.price))}</span>
        </div>
        <div class="product-card__actions">
          <a class="btn primary" href="${productHref(product.id)}" data-no-card-open>Ver detalhes</a>
          <button class="btn secondary" type="button" data-add-id="${product.id}" data-no-card-open>Adicionar</button>
        </div>
      </div>
    </article>
  `;
}

function shelfCard(product) {
  return `
    <article class="shelf-card shelf-card--interactive" data-product-open-id="${product.id}" tabindex="0" role="link" aria-label="Abrir ${product.name}">
      <img src="${product.image}" alt="${product.name}" />
      <div class="shelf-card__body">
        <p class="product-card__meta">${product.category}</p>
        <h3>${product.name}</h3>
        <p>${product.shortDescription || product.badge}</p>
        <div class="shelf-card__price">
          <strong>${formatBRL(product.price)}</strong>
          <span>${formatBRL(oldPrice(product.price))}</span>
        </div>
        <div class="shelf-card__actions">
          <a class="btn primary" href="${productHref(product.id)}" data-no-card-open>Detalhes</a>
          <button class="btn secondary" type="button" data-add-id="${product.id}" data-no-card-open>Adicionar</button>
        </div>
      </div>
    </article>
  `;
}

function compactProductCard(product) {
  return `
    <article class="compact-product-card compact-product-card--interactive" data-product-open-id="${product.id}" tabindex="0" role="link" aria-label="Abrir ${product.name}">
      <img src="${product.image}" alt="${product.name}" />
      <div class="compact-product-card__meta">
        <span>${product.category}</span>
        <span>${product.size}</span>
      </div>
      <h3>${product.name}</h3>
      <p class="compact-product-card__summary">${product.shortDescription || product.badge}</p>
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
function renderAdFlow() {
  if (!adFlow) return;
  const featuredItems = products.slice(0, 4);
  adFlow.innerHTML = featuredItems.map((product, index) => `
    <article class="feature-product-card feature-product-card--${index === 1 ? "spotlight" : "default"}" data-product-open-id="${product.id}" tabindex="0" role="link" aria-label="Abrir ${product.name}">
      <div class="feature-product-card__media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <button class="feature-product-card__favorite" type="button" aria-label="Salvar ${product.name}" data-no-card-open>&#9825;</button>
        ${index === 1 ? '<span class="feature-product-card__badge">-30%</span>' : `<span class="feature-product-card__tag">${index === 0 ? "Lancamento" : product.badge}</span>`}
      </div>
      <div class="feature-product-card__body">
        <strong>${product.name}</strong>
        <span>${product.shortDescription || product.category}</span>
        <div class="feature-product-card__price">
          <em>${formatBRL(product.price)}</em>
          ${index === 1 ? `<small>${formatBRL(oldPrice(product.price))}</small>` : ""}
        </div>
      </div>
      ${index === 3 ? '<a class="feature-product-card__cta" href="#produtos" data-no-card-open>Ver todos os produtos</a>' : ""}
    </article>
  `).join("");
}

function renderCampaignBanner() {
  if (!campaignBanner) return;

  let firstName = "";
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    firstName = String(profile?.name || "").trim().split(/\s+/)[0];
  } catch {
    firstName = "";
  }

  const secondaryLabel = firstName ? `Voltar, ${firstName}` : campaignBannerData.secondaryLabel;
  const secondaryHref = firstName ? "./perfil/" : campaignBannerData.secondaryHref;

  campaignBanner.innerHTML = `
    <article class="campaign-banner__card">
      <div class="campaign-banner__copy">
        <p class="campaign-banner__eyebrow">${campaignBannerData.kicker}</p>
        <h2>${campaignBannerData.title}</h2>
        <p>${campaignBannerData.text}</p>
        <div class="campaign-banner__actions">
          <a class="btn primary" href="${campaignBannerData.primaryHref}">${campaignBannerData.primaryLabel}</a>
          <a class="btn secondary" href="${secondaryHref}">${secondaryLabel}</a>
        </div>
        <div class="campaign-banner__chips">
          ${campaignBannerData.chips.map((item) => `<span class="campaign-banner__chip">${item}</span>`).join("")}
        </div>
      </div>

      <div class="campaign-banner__media">
        <div class="campaign-banner__visual">
          <img src="${campaignBannerData.image}" alt="${campaignBannerData.title}" loading="lazy" />
          <div class="campaign-banner__spotlight">
            <strong>${campaignBannerData.spotlightValue}</strong>
            <span>${campaignBannerData.spotlightText}</span>
          </div>
          <div class="campaign-banner__stats">
            ${campaignBannerData.stats.map((item) => `
              <article class="campaign-banner__stat">
                <strong>${item.value}</strong>
                <span>${item.label}</span>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
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
  const openCard = event.target instanceof Element ? event.target.closest("[data-product-open-id]") : null;
  if (openCard && !event.target.closest("[data-no-card-open]")) {
    window.location.href = productHref(openCard.getAttribute("data-product-open-id"));
    return;
  }

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
renderAdFlow();
renderCampaignBanner();
renderCompactBoard();
renderProductShelf();
renderCartCount();
renderProfileState();
renderProducts();
restartAnnouncementTimer();





document.addEventListener("keydown", (event) => {
  const target = event.target instanceof Element ? event.target.closest("[data-product-open-id]") : null;
  if (!target) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  window.location.href = productHref(target.getAttribute("data-product-open-id"));
});




