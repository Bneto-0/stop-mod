(function () {
  const CART_KEY = "stopmod_cart";
  const PROFILE_KEY = "stopmod_profile";
  const SHIP_KEY = "stopmod_ship_to";
  const LEGACY_SHIP_KEY = "stopmod_ship_cep";
  const FALLBACK_AVATAR_BASE = "https://ui-avatars.com/api/?background=111111&color=ffffff&bold=true&size=96&name=";

  const root = document.getElementById("site-header-root");
  if (!root) return;

  const path = window.location.pathname || "/";
  const isHome = path === "/" || /\/index\.html$/i.test(path);
  const navState = {
    perfil: /^\/perfil\/?$/i.test(path),
    favoritos: /\/perfil\/favoritos\//i.test(path),
    marketplace: /\/marketplace\//i.test(path),
    promocoes: /\/cupons\//i.test(path),
    categorias: /\/categorias\//i.test(path)
  };

  const primaryLinks = [
    { label: "Novidades", href: "/#anuncios", current: isHome },
    { label: "Masculino", href: "/?q=masculino#produtos", current: false },
    { label: "Feminino", href: "/?q=feminino#produtos", current: false },
    { label: "Acessorios", href: "/?cat=Acessorios#produtos", current: false },
    { label: "Calcados", href: "/?q=calcados#produtos", current: false },
    { label: "Streetwear", href: "/?q=streetwear#produtos", current: false },
    { label: "Marketplace", href: "/marketplace/", current: navState.marketplace }
  ];

  const megaColumns = [
    {
      title: "Masculino",
      href: "/?q=masculino#produtos",
      links: [
        { label: "Camisetas", href: "/?cat=Camisetas#produtos" },
        { label: "Tenis", href: "/?q=tenis#produtos" },
        { label: "Calcas", href: "/?cat=Calcas#produtos" },
        { label: "Jaquetas", href: "/?cat=Jaquetas#produtos" }
      ]
    },
    {
      title: "Feminino",
      href: "/?q=feminino#produtos",
      links: [
        { label: "Vestidos", href: "/?cat=Vestidos#produtos" },
        { label: "Blusas", href: "/?q=blusas#produtos" },
        { label: "Saias", href: "/?q=saias#produtos" },
        { label: "Jaquetas", href: "/?cat=Jaquetas#produtos" }
      ]
    },
    {
      title: "Calcados",
      href: "/?q=calcados#produtos",
      links: [
        { label: "Tenis", href: "/?q=tenis#produtos" },
        { label: "Botas", href: "/?q=botas#produtos" },
        { label: "Sandalias", href: "/?q=sandalias#produtos" },
        { label: "Slides", href: "/?q=slides#produtos" }
      ]
    },
    {
      title: "Acessorios",
      href: "/?cat=Acessorios#produtos",
      links: [
        { label: "Bolsas", href: "/?q=bolsas#produtos" },
        { label: "Bones", href: "/?q=bones#produtos" },
        { label: "Oculos", href: "/?q=oculos#produtos" },
        { label: "Joias", href: "/?q=acessorios#produtos" }
      ]
    },
    {
      title: "Streetwear",
      href: "/?q=streetwear#produtos",
      links: [
        { label: "Camisetas", href: "/?cat=Camisetas#produtos" },
        { label: "Moletons", href: "/?cat=Moletons#produtos" },
        { label: "Calcas", href: "/?cat=Calcas#produtos" },
        { label: "Bones", href: "/?q=bones#produtos" }
      ]
    },
    {
      title: "Marcas",
      href: "/marketplace/",
      links: [
        { label: "Uzuu", href: "/marketplace/" },
        { label: "Nike", href: "/?q=nike#produtos" },
        { label: "Adidas", href: "/?q=adidas#produtos" },
        { label: "Vans", href: "/?q=vans#produtos" }
      ]
    }
  ];

  function renderPrimaryNav() {
    return primaryLinks
      .map(
        (link) =>
          `<a href="${link.href}" class="${link.current ? "is-current" : ""}">${link.label}</a>`
      )
      .join("");
  }

  function renderMegaColumns() {
    return megaColumns
      .map(
        (column) => `
          <section class="shared-mega-column" aria-label="${column.title}">
            <div class="shared-mega-column__head">
              <span class="shared-mega-column__marker" aria-hidden="true"></span>
              <strong>${column.title}</strong>
            </div>
            <div class="shared-mega-column__links">
              ${column.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
            </div>
            <a class="shared-mega-column__more" href="${column.href}">Ver tudo <span aria-hidden="true">&#8594;</span></a>
          </section>
        `
      )
      .join("");
  }

  root.innerHTML = `
    <header class="shared-header" aria-label="Cabecalho da loja">
      <div class="shared-header__container">
        <div class="shared-header__top-row">
          <div class="shared-header__identity">
            <a class="shared-brand" href="/#top" aria-label="UZUU">UZUU</a>

            <a class="shared-location" href="/entrega/" aria-label="Selecionar endereco de entrega">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3.87 0 7 3.09 7 6.9 0 4.71-5.2 10.35-6.45 11.65a.8.8 0 0 1-1.1 0C10.2 19.25 5 13.61 5 8.9 5 5.09 8.13 2 12 2zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
              <span class="shared-location__text">
                <small>Enviar para</small>
                <strong id="ship-summary">Rua nao informada</strong>
              </span>
              <span class="shared-location__caret" aria-hidden="true">&#9662;</span>
            </a>
          </div>

          <form id="shared-search-form" class="shared-search" role="search">
            <svg class="shared-search__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.44 1.41-1.42-4.44-4.43A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9.001A4.5 4.5 0 0 1 10.5 6z"></path></svg>
            <label class="sr-only" for="search-input">Pesquisar produto</label>
            <input id="search-input" type="search" placeholder="Pesquisar produto, categoria ou marca..." />
            <button class="shared-search__button" type="submit">Buscar</button>
          </form>

          <div class="shared-header__actions">
            <a id="profile-top-link" class="shared-action-link shared-profile ${navState.perfil ? "is-current" : ""}" href="/login/" aria-label="Perfil">
              <img id="profile-top-photo" class="shared-profile-photo" alt="" hidden />
              <svg class="shared-profile-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"></path></svg>
              <span id="profile-top-name">Perfil</span>
            </a>

            <a class="shared-action-link ${navState.favoritos ? "is-current" : ""}" href="/perfil/favoritos/" aria-label="Favoritos">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 20.3 4.8 13a4.8 4.8 0 0 1 6.8-6.8l.5.5.5-.5a4.8 4.8 0 1 1 6.8 6.8l-7.3 7.3z"></path></svg>
              <span>Favoritos</span>
            </a>

            <a class="shared-cart" href="/carrinho/" aria-label="Carrinho">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9 0a2 2 0 1 0 .001 4A2 2 0 0 0 17 19zM6.2 5l.6 3h11.6l-1.2 6H8.1L6.2 5zM3 2h2l2.2 11.2A2 2 0 0 0 9.2 15H18v-2H9.2l-.2-1h9.1A2 2 0 0 0 20 10.4l1-5A2 2 0 0 0 19 3H6.4l-.3-1.6A2 2 0 0 0 4.1 0H3v2z"></path></svg>
              <span>Carrinho</span>
              <strong id="cart-count">0</strong>
            </a>
          </div>
        </div>
      </div>

      <div class="shared-header__menu-shell">
        <div class="shared-header__container shared-header__menu-row">
          <div class="shared-catalog">
            <button id="shared-catalog-button" class="shared-catalog__button ${navState.categorias || isHome ? "is-current" : ""}" type="button" aria-haspopup="true" aria-expanded="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>
              <span>Todas as categorias</span>
              <span class="shared-catalog__caret" aria-hidden="true">&#9662;</span>
            </button>
          </div>

          <nav class="shared-nav" aria-label="Navegacao principal da loja">
            ${renderPrimaryNav()}
          </nav>

          <a class="shared-promo-link ${navState.promocoes ? "is-current" : ""}" href="/cupons/" aria-label="Promocoes">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 13.59 12.59 21a2 2 0 0 1-2.83 0L3 14.24V4h10.24L20 10.76a2 2 0 0 1 0 2.83Z"></path>
              <circle cx="9" cy="9" r="1.6"></circle>
            </svg>
            <span>Promocoes</span>
          </a>
        </div>

        <div class="shared-header__mega">
          <div class="shared-header__container">
            <div class="shared-mega-panel" role="menu" aria-label="Todas as categorias">
              <div class="shared-mega-grid">
                ${renderMegaColumns()}
              </div>

              <aside class="shared-mega-promo">
                <span class="shared-mega-promo__eyebrow">Selecao UZUU</span>
                <strong>Estilo sem pagar caro</strong>
                <p>Moda com vitrine mais forte, leitura premium e campanhas prontas para vender mais.</p>
                <a href="/#produtos">Ver colecao</a>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  document.body.classList.add("with-shared-header");

  const header = root.querySelector(".shared-header");
  const searchForm = document.getElementById("shared-search-form");
  const searchInput = document.getElementById("search-input");
  const cartCount = document.getElementById("cart-count");
  const shipSummary = document.getElementById("ship-summary");
  const profileLink = document.getElementById("profile-top-link");
  const profileName = document.getElementById("profile-top-name");
  const profilePhoto = document.getElementById("profile-top-photo");
  const catalogButton = document.getElementById("shared-catalog-button");

  function loadJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function countCartItemsFromStorage() {
    const parsed = loadJson(CART_KEY);
    if (!Array.isArray(parsed)) return 0;

    return parsed.reduce((total, item) => {
      if (Number.isInteger(Number(item))) return total + 1;
      if (item && typeof item === "object") {
        return total + Math.max(1, Math.floor(Number(item.quantity ?? item.qty ?? 1) || 1));
      }
      return total;
    }, 0);
  }

  function loadShipTo() {
    const current = loadJson(SHIP_KEY);
    if (current && typeof current === "object") return current;
    const legacyCep = String(localStorage.getItem(LEGACY_SHIP_KEY) || "").trim();
    return legacyCep ? { cep: legacyCep } : null;
  }

  function summarizeAddress(address) {
    if (!address || typeof address !== "object") return "Rua nao informada";
    const street = String(address.street || "").trim();
    const number = String(address.number || "").trim();
    const city = String(address.city || "").trim();
    const cep = String(address.cep || "").trim();
    if (street && number) return `${street}, ${number}`;
    if (street) return street;
    if (city) return city;
    if (cep) return `CEP ${cep}`;
    return "Rua nao informada";
  }

  function buildFallbackAvatar(name) {
    return `${FALLBACK_AVATAR_BASE}${encodeURIComponent(String(name || "Perfil").trim())}`;
  }

  function isUsablePicture(value) {
    const picture = String(value || "").trim();
    return /^(https?:)?\/\//i.test(picture) || /^data:image\//i.test(picture);
  }

  function renderHeaderProfile() {
    const profile = loadJson(PROFILE_KEY);
    if (!profile || !profileName || !profileLink) {
      if (profileName) profileName.textContent = "Perfil";
      if (profileLink) {
        profileLink.href = "/login/";
        profileLink.classList.remove("has-photo");
      }
      if (profilePhoto) {
        profilePhoto.hidden = true;
        profilePhoto.removeAttribute("src");
        profilePhoto.alt = "";
        profilePhoto.onerror = null;
      }
      return;
    }

    const displayName = String(profile.name || "").trim().split(/\s+/)[0] || "Perfil";
    const picture = String(profile.picture || "").trim();
    const avatarSrc = isUsablePicture(picture) ? picture : buildFallbackAvatar(displayName);

    profileName.textContent = displayName;
    profileLink.href = "/perfil/";
    profileLink.setAttribute("aria-label", `Perfil de ${displayName}`);
    profileLink.classList.add("has-photo");

    if (profilePhoto) {
      profilePhoto.hidden = false;
      profilePhoto.src = avatarSrc;
      profilePhoto.alt = `Foto de ${displayName}`;
      profilePhoto.onerror = () => {
        profilePhoto.hidden = true;
        profilePhoto.removeAttribute("src");
        profilePhoto.alt = "";
        profileLink.classList.remove("has-photo");
      };
    }
  }

  function renderHeaderCart() {
    if (!cartCount) return;
    cartCount.textContent = String(countCartItemsFromStorage());
  }

  function renderHeaderAddress() {
    if (!shipSummary) return;
    shipSummary.textContent = summarizeAddress(loadShipTo());
  }

  function renderHeaderState() {
    renderHeaderCart();
    renderHeaderProfile();
    renderHeaderAddress();
  }

  function syncSearchFromQuery() {
    if (!searchInput) return;
    const params = new URLSearchParams(window.location.search);
    const q = String(params.get("q") || "").trim();
    if (q && !searchInput.value) searchInput.value = q;
  }

  function goToSearch() {
    if (!searchInput) return;
    const q = String(searchInput.value || "").trim();

    if (isHome) {
      const next = new URL(window.location.href);
      if (q) next.searchParams.set("q", q);
      else next.searchParams.delete("q");
      next.hash = "produtos";
      window.history.replaceState({}, "", next.toString());
      document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    window.location.href = q ? `/?q=${encodeURIComponent(q)}#produtos` : "/#produtos";
  }

  function setCatalogOpen(open) {
    const isOpen = !!open;
    header?.classList.toggle("is-menu-open", isOpen);
    catalogButton?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    goToSearch();
  });

  catalogButton?.addEventListener("click", () => {
    setCatalogOpen(!header?.classList.contains("is-menu-open"));
  });

  document.addEventListener("click", (event) => {
    if (!header || !catalogButton) return;
    if (header.contains(event.target)) return;
    setCatalogOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setCatalogOpen(false);
  });

  window.addEventListener("storage", (event) => {
    if ([CART_KEY, PROFILE_KEY, SHIP_KEY, LEGACY_SHIP_KEY].includes(event.key || "")) {
      renderHeaderState();
    }
  });

  syncSearchFromQuery();
  renderHeaderState();
  setCatalogOpen(false);
})();
