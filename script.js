(function () {
  const catalog = window.stopmodCatalog || null;
  const NEWSLETTER_KEY = "uzuu_newsletter_emails";

  const fallbackProducts = [
    { id: 1, name: "Moletom UZUU Oversized", category: "Streetwear", price: 199.9, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80", badge: "20% OFF" },
    { id: 2, name: "Camiseta UZUU Basic", category: "Masculino", price: 89.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", badge: "Novo" },
    { id: 3, name: "Boné UZUU Classic", category: "Acessorios", price: 79.9, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80", badge: "Mais vendido" },
    { id: 4, name: "Mochila UZUU Essential", category: "Acessorios", price: 159.9, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", badge: "Premium" },
    { id: 5, name: "Tênis UZUU Street", category: "Calcados", price: 249.9, image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=800&q=80", badge: "Oferta" },
    { id: 6, name: "Bermuda UZUU Casual", category: "Masculino", price: 99.9, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", badge: "Leve" }
  ];

  const categories = [
    { name: "Masculino", label: "Masculino", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" },
    { name: "Feminino", label: "Feminino", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80" },
    { name: "Acessorios", label: "Acessórios", image: "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=800&q=80" },
    { name: "Calcados", label: "Calçados", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
    { name: "Streetwear", label: "Streetwear", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80" },
    { name: "Promocoes", label: "Promoções", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" }
  ];

  const tabs = ["Todos", "Masculino", "Feminino", "Acessorios", "Calcados", "Streetwear"];

  const adBanners = [
    { title: "Lançamentos", subtitle: "Novas peças toda semana", cta: "Ver lançamentos", action: "launches", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80", tone: "from-blue-950" },
    { title: "Até 50% OFF", subtitle: "Nas melhores peças", cta: "Aproveitar ofertas", action: "Promocoes", image: "https://images.unsplash.com/photo-1506629905607-d9f297d8f8af?auto=format&fit=crop&w=1000&q=80", tone: "from-black" },
    { title: "Streetwear Premium", subtitle: "Qualidade que se destaca", cta: "Ver streetwear", action: "Streetwear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80", tone: "from-neutral-950" }
  ];

  const state = {
    products: [],
    visibleCount: 24,
    selectedCategory: "Todos",
    query: "",
    loadingMore: false
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function money(value) {
    if (catalog?.formatBRL) return catalog.formatBRL(Number(value) || 0);
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function oldPrice(value) {
    return catalog?.oldPrice ? catalog.oldPrice(value) : Number((Number(value || 0) * 1.12).toFixed(2));
  }

  function pixPrice(value) {
    return catalog?.pixPrice ? catalog.pixPrice(value) : Number((Number(value || 0) * 0.95).toFixed(2));
  }

  function productHref(product) {
    return catalog?.productHref ? catalog.productHref(product.id) : `/produtos/?id=${encodeURIComponent(String(product.id))}`;
  }

  function productRating(product) {
    const summary = catalog?.getRatingSummary ? catalog.getRatingSummary(product.id) : null;
    return {
      average: Number(summary?.average || product.rating || 4.8),
      count: Number(summary?.count || product.reviews || 12)
    };
  }

  function normalizeProduct(product, index) {
    const price = Number(product.price || product.preco || 0);
    return {
      id: Number(product.id || index + 1),
      name: String(product.name || product.nome || "Produto UZUU"),
      category: String(product.category || product.categoria || "Streetwear"),
      size: String(product.size || product.tamanho || "P ao GG"),
      price,
      oldPrice: Number(product.oldPrice || product.precoAntigo || oldPrice(price)),
      image: String(product.image || product.imagem || ""),
      badge: String(product.badge || product.tag || (index % 3 === 0 ? "Novo" : "Oferta")),
      description: String(product.shortDescription || product.description || "")
    };
  }

  function baseProducts() {
    const source = Array.isArray(catalog?.products) && catalog.products.length ? catalog.products : fallbackProducts;
    return source.map(normalizeProduct);
  }

  function buildProductPool() {
    const base = baseProducts();
    const pool = [];

    for (let batch = 0; batch < 8; batch += 1) {
      base.forEach((product, index) => {
        pool.push({
          ...product,
          uiId: `${product.id}-${batch}-${index}`,
          price: Number((product.price + ((batch + index) % 3) * 3.5).toFixed(2)),
          badge: batch === 0 ? product.badge : (index % 4 === 0 ? "Novo" : product.badge)
        });
      });
    }

    return pool;
  }

  function favoriteLabel(productId) {
    return catalog?.isFavorite?.(productId) ? "Remover dos favoritos" : "Adicionar aos favoritos";
  }

  function favoriteIcon(productId) {
    return catalog?.isFavorite?.(productId) ? "♥" : "♡";
  }

  function renderCartCount() {
    const homeCounter = document.getElementById("home-cart-count");
    if (!homeCounter) return;

    if (catalog?.countCartItems) {
      homeCounter.textContent = String(catalog.countCartItems());
      return;
    }

    try {
      const raw = JSON.parse(localStorage.getItem("stopmod_cart") || "[]");
      homeCounter.textContent = String(Array.isArray(raw) ? raw.length : 0);
    } catch {
      homeCounter.textContent = "0";
    }
  }

  function showToast(message) {
    const toast = document.getElementById("home-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  function searchInput() {
    return document.getElementById("search-input") || document.getElementById("home-search-input");
  }

  function readQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = String(params.get("cat") || "").trim();
    const q = String(params.get("q") || "").trim();
    if (q) state.query = q;
    if (cat) state.selectedCategory = cat;
  }

  function matchesCategory(product, category) {
    if (!category || category === "Todos") return true;
    if (category === "Promocoes") return product.oldPrice > product.price;
    if (category === "launches") return ["novo", "lancamento", "lançamento", "drop"].some((word) => normalizeText(product.badge).includes(word));

    const normalizedCategory = normalizeText(product.category);
    const normalizedName = normalizeText(product.name);
    const token = normalizeText(category);

    return normalizedCategory.includes(token) || normalizedName.includes(token);
  }

  function displayCategoryLabel(value) {
    const normalized = normalizeText(value);
    if (normalized === "acessorios") return "Acessórios";
    if (normalized === "calcados") return "Calçados";
    if (normalized === "promocoes") return "Promoções";
    if (normalized === "launches") return "Lançamentos";
    return String(value || "");
  }

  function matchesQuery(product) {
    const query = normalizeText(state.query);
    if (!query) return true;

    return [product.name, product.category, product.size, product.badge, product.description]
      .some((field) => normalizeText(field).includes(query));
  }

  function filteredProducts() {
    return state.products.filter((product) => matchesCategory(product, state.selectedCategory) && matchesQuery(product));
  }

  function updateUrlState() {
    const next = new URL(window.location.href);

    if (state.query) next.searchParams.set("q", state.query);
    else next.searchParams.delete("q");

    if (state.selectedCategory && state.selectedCategory !== "Todos" && state.selectedCategory !== "launches") {
      next.searchParams.set("cat", state.selectedCategory);
    } else {
      next.searchParams.delete("cat");
    }

    window.history.replaceState({}, "", next.toString());
  }

  function scrollToProducts() {
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function categoriesMarkup() {
    return categories.map((category) => `
      <button type="button" data-category="${category.name}">
        <span><img src="${escapeHtml(category.image)}" alt="${escapeHtml(category.label)}" loading="lazy" /></span>
        <strong>${escapeHtml(category.label)}</strong>
      </button>
    `).join("");
  }

  function renderCategories() {
    const node = document.getElementById("home-categories-grid");
    if (!node) return;
    node.innerHTML = categoriesMarkup();
  }

  function renderTabs() {
    const node = document.getElementById("home-filter-tabs");
    if (!node) return;

    node.innerHTML = tabs.map((tab) => `
      <button type="button" data-filter="${tab}">${displayCategoryLabel(tab)}</button>
    `).join("");
  }

  function renderAdBanners(targetId) {
    const node = document.getElementById(targetId);
    if (!node) return;

    node.innerHTML = adBanners.map((banner) => `
      <article class="home-infinite-ad-card home-infinite-ad-card--${escapeHtml(banner.tone)}">
        <img src="${escapeHtml(banner.image)}" alt="${escapeHtml(banner.title)}" loading="lazy" />
        <div></div>
        <section>
          <h3>${escapeHtml(banner.title)}</h3>
          <p>${escapeHtml(banner.subtitle)}</p>
          <button type="button" data-banner-action="${escapeHtml(banner.action)}">${escapeHtml(banner.cta)}</button>
        </section>
      </article>
    `).join("");
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

  function renderSkeletonGrid(node, count = 18) {
    if (!node) return;
    node.innerHTML = Array.from({ length: count }, skeletonCard).join("");
  }

  function productCard(product) {
    const href = productHref(product);
    const rating = productRating(product);
    const isFavorite = !!catalog?.isFavorite?.(product.id);

    return `
      <article class="home-infinite-product-card" data-product-id="${product.id}">
        <a class="home-infinite-product-card__media" href="${href}" aria-label="Abrir ${escapeHtml(product.name)}">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
          <span>${escapeHtml(product.badge)}</span>
        </a>
        <button class="home-infinite-product-card__favorite ${isFavorite ? "is-active" : ""}" type="button" data-home-favorite="${product.id}" aria-label="${favoriteLabel(product.id)}">${favoriteIcon(product.id)}</button>
        <div class="home-infinite-product-card__body">
          <p>${escapeHtml(displayCategoryLabel(product.category))}</p>
          <h3><a href="${href}">${escapeHtml(product.name)}</a></h3>
          <div class="home-infinite-product-card__rating">★★★★★ <small>(${rating.count || 12})</small></div>
          <strong>${money(product.price)}</strong>
          ${product.oldPrice > product.price ? `<del>${money(product.oldPrice)}</del>` : ""}
          <em>${money(pixPrice(product.price))} no PIX</em>
          <small>12x de ${money(product.price / 12)}</small>
          <button class="home-infinite-product-card__cart" type="button" data-home-cart="${product.id}">Adicionar ao carrinho</button>
        </div>
      </article>
    `;
  }

  function renderProductGrid(node, products) {
    if (!node) return;

    if (!products.length) {
      node.innerHTML = `
        <div class="home-infinite-empty">
          <strong>Nenhum produto encontrado.</strong>
          <span>Tente buscar por camiseta, calça, jaqueta ou acessórios.</span>
        </div>
      `;
      return;
    }

    node.innerHTML = products.map(productCard).join("");
  }

  function updateTabs() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-filter") === state.selectedCategory);
    });
  }

  function updateCategories() {
    document.querySelectorAll("[data-category]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-category") === state.selectedCategory);
    });
  }

  function renderAllProducts() {
    const list = filteredProducts();
    const bestSellers = state.products.filter((product) => matchesQuery(product)).slice(0, 12);
    const recommended = list.slice(0, 12);
    const explore = list.slice(12, state.visibleCount);

    renderProductGrid(document.getElementById("best-sellers-grid"), state.selectedCategory === "Todos" ? bestSellers : recommended);
    renderProductGrid(document.getElementById("recommended-grid"), recommended);
    renderProductGrid(document.getElementById("explore-grid"), explore);
    updateTabs();
    updateCategories();
    updateUrlState();
  }

  function selectCategory(category, shouldScroll = true) {
    state.selectedCategory = category || "Todos";
    state.visibleCount = 24;
    renderAllProducts();
    document.querySelector(".shared-header")?.classList.remove("is-menu-open");

    if (shouldScroll) scrollToProducts();
  }

  function addToCart(productId) {
    const product = catalog?.getProductById?.(productId);
    if (!catalog?.addToCart || !product) {
      window.location.href = `/produtos/?id=${encodeURIComponent(String(productId))}`;
      return;
    }

    const variant = catalog.getDefaultVariant?.(product.id);
    const count = catalog.addToCart(product.id, 1, { variantId: variant?.id || "" });
    renderCartCount();
    showToast(`${product.name} foi adicionado ao carrinho.`);
    window.dispatchEvent(new CustomEvent("stopmod:cart-updated", { detail: { count } }));
  }

  function toggleFavorite(productId) {
    if (!catalog?.toggleFavorite) return;

    const active = catalog.toggleFavorite(productId);
    document.querySelectorAll(`[data-home-favorite="${productId}"]`).forEach((button) => {
      button.classList.toggle("is-active", active);
      button.textContent = active ? "♥" : "♡";
      button.setAttribute("aria-label", active ? "Remover dos favoritos" : "Adicionar aos favoritos");
    });

    const product = catalog.getProductById?.(productId);
    showToast(active ? `${product?.name || "Produto"} salvo nos favoritos.` : "Produto removido dos favoritos.");
  }

  function inferCategoryFromHref(href) {
    const normalized = normalizeText(href);
    if (normalized.includes("/cupons/") || normalized.includes("promocoes")) return "Promocoes";
    if (normalized.includes("streetwear") || normalized.includes("moletons") || normalized.includes("jaquetas")) return "Streetwear";
    if (normalized.includes("calcados") || normalized.includes("tenis") || normalized.includes("botas") || normalized.includes("sandalias") || normalized.includes("slides")) return "Calcados";
    if (normalized.includes("acessorios") || normalized.includes("oculos") || normalized.includes("bolsas") || normalized.includes("bones")) return "Acessorios";
    if (normalized.includes("feminino") || normalized.includes("vestidos") || normalized.includes("blusas") || normalized.includes("saias")) return "Feminino";
    if (normalized.includes("masculino") || normalized.includes("camisetas") || normalized.includes("calcas")) return "Masculino";
    if (normalized.includes("novidades") || normalized.includes("marcas") || normalized.includes("/marketplace/")) return "Todos";
    return "";
  }

  function loadMoreProducts() {
    const list = filteredProducts();
    if (state.visibleCount >= list.length) {
      showToast("A vitrine continua carregando mais produtos.");
      return;
    }

    state.visibleCount += 12;
    renderAllProducts();
    document.getElementById("explore-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setupSearchBindings() {
    const form = document.getElementById("shared-search-form") || document.getElementById("home-search-form");
    const input = searchInput();
    if (!form || !input) return;

    if (state.query && !input.value) input.value = state.query;

    input.addEventListener("input", () => {
      state.query = input.value;
      state.visibleCount = 24;
      renderAllProducts();
    });

    form.addEventListener("submit", () => {
      window.setTimeout(() => {
        state.query = input.value;
        state.visibleCount = 24;
        renderAllProducts();
        scrollToProducts();
      }, 0);
    });
  }

  function setupNewsletter() {
    const form = document.getElementById("home-newsletter-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = form.querySelector("input[type='email']");
      const feedback = document.getElementById("home-newsletter-feedback");
      const email = String(input?.value || "").trim().toLowerCase();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!valid) {
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = "Digite um e-mail válido para receber as ofertas.";
        }
        return;
      }

      const current = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || "[]");
      const next = Array.isArray(current) && current.includes(email)
        ? current
        : [...(Array.isArray(current) ? current : []), email];

      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(next.slice(-200)));

      if (input) input.value = "";
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = "Cadastro realizado. Você vai receber as ofertas da UZUU.";
      }

      showToast("E-mail cadastrado com sucesso.");
    });
  }

  function setupInfiniteLoad() {
    const node = document.getElementById("infinite-loader");
    const loadingGrid = document.getElementById("loading-more-grid");
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting || state.loadingMore) return;

      const list = filteredProducts();
      if (state.visibleCount >= list.length) {
        node.textContent = "Continue navegando pela coleção";
        return;
      }

      state.loadingMore = true;
      node.textContent = "Carregando mais produtos...";

      if (loadingGrid) {
        loadingGrid.hidden = false;
        renderSkeletonGrid(loadingGrid, 6);
      }

      window.setTimeout(() => {
        state.visibleCount += 12;
        state.loadingMore = false;
        if (loadingGrid) {
          loadingGrid.hidden = true;
          loadingGrid.innerHTML = "";
        }
        node.textContent = "Role para carregar mais produtos";
        renderAllProducts();
      }, 320);
    }, { rootMargin: "700px" });

    observer.observe(node);
  }

  function setupEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const favoriteButton = target.closest("[data-home-favorite]");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(Number(favoriteButton.getAttribute("data-home-favorite")));
        return;
      }

      const cartButton = target.closest("[data-home-cart]");
      if (cartButton) {
        event.preventDefault();
        event.stopPropagation();
        addToCart(Number(cartButton.getAttribute("data-home-cart")));
        return;
      }

      const categoryButton = target.closest("[data-category]");
      if (categoryButton) {
        selectCategory(categoryButton.getAttribute("data-category") || "Todos");
        return;
      }

      const filterButton = target.closest("[data-filter]");
      if (filterButton) {
        selectCategory(filterButton.getAttribute("data-filter") || "Todos");
        return;
      }

      const bannerButton = target.closest("[data-banner-action]");
      if (bannerButton) {
        const action = bannerButton.getAttribute("data-banner-action") || "Todos";
        selectCategory(action === "launches" ? "launches" : action);
        return;
      }

      const navCategory = target.closest(".shared-nav a, .shared-mega-column a, .shared-promo-link, .home-footer__columns a");
      if (navCategory) {
        const href = String(navCategory.getAttribute("href") || "");
        const mapped = inferCategoryFromHref(href);
        if (mapped) {
          event.preventDefault();
          selectCategory(mapped);
        }
        return;
      }

      const actionButton = target.closest("[data-home-action]");
      if (!actionButton) return;

      const action = actionButton.getAttribute("data-home-action");
      if (action === "collection" || action === "show-all") {
        state.query = "";
        const input = searchInput();
        if (input) input.value = "";
        selectCategory("Todos");
      } else if (action === "launches") {
        selectCategory("launches");
      } else if (action === "load-more") {
        loadMoreProducts();
      }
    });

    window.addEventListener("storage", renderCartCount);
    window.addEventListener("stopmod:cart-updated", renderCartCount);
  }

  function initHome() {
    readQueryParams();
    state.products = buildProductPool();

    renderSkeletonGrid(document.getElementById("best-sellers-grid"));
    renderSkeletonGrid(document.getElementById("recommended-grid"));
    renderCategories();
    renderTabs();
    renderAdBanners("ad-banner-row-primary");
    renderAdBanners("ad-banner-row-secondary");
    setupEvents();
    setupSearchBindings();
    setupNewsletter();
    renderCartCount();
    renderAllProducts();
    setupInfiniteLoad();
  }

  document.addEventListener("DOMContentLoaded", initHome);
})();
