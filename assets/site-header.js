(function () {
  const CART_KEY = "stopmod_cart";
  const PROFILE_KEY = "stopmod_profile";
  const SHIP_KEY = "stopmod_ship_to";
  const LEGACY_SHIP_KEY = "stopmod_ship_cep";

  const root = document.getElementById("site-header-root");
  if (!root) return;

  const path = window.location.pathname || "/";
  const isHome = path === "/" || /\/index\.html$/i.test(path);

  const navState = {
    pedidos: /\/perfil\/pedidos\//i.test(path),
    favoritos: /\/perfil\/favoritos\//i.test(path),
    processando: /\/perfil\/processando\//i.test(path),
    cupons: /\/cupons\//i.test(path),
    categorias: /\/categorias\//i.test(path)
  };

  root.innerHTML = `
    <header class="shared-header" aria-label="Cabecalho da loja">
      <div class="shared-header__container shared-header__top-row">
        <a class="shared-brand" href="/index.html#top" aria-label="Stop mod">Stop <em>mod</em></a>

        <a class="shared-location" href="/entrega/" aria-label="Selecionar endereco de entrega">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3.87 0 7 3.09 7 6.9 0 4.71-5.2 10.35-6.45 11.65a.8.8 0 0 1-1.1 0C10.2 19.25 5 13.61 5 8.9 5 5.09 8.13 2 12 2zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
          <span class="shared-location__text">
            <small>Enviar para</small>
            <strong id="ship-summary">Rua nao informada</strong>
          </span>
        </a>

        <label class="shared-search" for="search-input">
          <span class="sr-only">Pesquisar produto</span>
          <input id="search-input" type="search" placeholder="Pesquisar produto" />
        </label>

        <div class="shared-header__actions">
          <a id="profile-top-link" class="shared-profile" href="/login/" aria-label="Perfil">
            <img id="profile-top-photo" class="shared-profile-photo" src="/assets/icons/user-solid.svg" alt="" hidden />
            <svg class="shared-profile-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"></path></svg>
            <span id="profile-top-name">Perfil</span>
          </a>

          <a class="shared-icon-link" href="/notificacoes/" aria-label="Notificacoes">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z"></path></svg>
          </a>

          <a class="shared-cart" href="/carrinho/" aria-label="Carrinho">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9 0a2 2 0 1 0 .001 4A2 2 0 0 0 17 19zM6.2 5l.6 3h11.6l-1.2 6H8.1L6.2 5zM3 2h2l2.2 11.2A2 2 0 0 0 9.2 15H18v-2H9.2l-.2-1h9.1A2 2 0 0 0 20 10.4l1-5A2 2 0 0 0 19 3H6.4l-.3-1.6A2 2 0 0 0 4.1 0H3v2z"></path></svg>
            <span>Carrinho</span>
            <strong id="cart-count">0</strong>
          </a>
        </div>
      </div>

      <div class="shared-header__bottom">
        <div class="shared-header__container shared-header__bottom-row">
          <nav class="shared-nav" aria-label="Navegacao da loja">
            <a href="/perfil/pedidos/" class="${navState.pedidos ? "is-current" : ""}">Pedidos</a>
            <a href="/perfil/favoritos/" class="${navState.favoritos ? "is-current" : ""}">Favoritos</a>
            <a href="/perfil/processando/" class="${navState.processando ? "is-current" : ""}">Processando</a>
            <a href="/cupons/" class="${navState.cupons ? "is-current" : ""}">Cupons</a>
            <div class="shared-cat">
              <button class="shared-cat-btn ${navState.categorias ? "is-current" : ""}" type="button" aria-haspopup="true" aria-expanded="false">
                Categorias <span aria-hidden="true">&#9662;</span>
              </button>
              <div class="shared-cat-panel" role="menu" aria-label="Categorias">
                <a href="/categorias/" role="menuitem">Ver todas</a>
                <a href="/index.html?cat=Camisetas#produtos" role="menuitem">Camisetas</a>
                <a href="/index.html?cat=Calcas#produtos" role="menuitem">Calcas</a>
                <a href="/index.html?cat=Jaquetas#produtos" role="menuitem">Jaquetas</a>
                <a href="/index.html?cat=Moletons#produtos" role="menuitem">Moletons</a>
                <a href="/index.html?cat=Vestidos#produtos" role="menuitem">Vestidos</a>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  `;

  document.body.classList.add("with-shared-header");

  const searchInput = document.getElementById("search-input");
  const cartCount = document.getElementById("cart-count");
  const shipSummary = document.getElementById("ship-summary");
  const profileLink = document.getElementById("profile-top-link");
  const profileName = document.getElementById("profile-top-name");
  const profilePhoto = document.getElementById("profile-top-photo");
  const categoryDropdown = root.querySelector(".shared-cat");
  const categoryButton = root.querySelector(".shared-cat-btn");

  function loadJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function loadCartIds() {
    const parsed = loadJson(CART_KEY);
    return Array.isArray(parsed) ? parsed : [];
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

  function renderHeaderProfile() {
    const profile = loadJson(PROFILE_KEY);
    if (!profile || !profileName || !profileLink) {
      if (profileName) profileName.textContent = "Perfil";
      if (profileLink) profileLink.href = "/login/";
      if (profilePhoto) {
        profilePhoto.hidden = true;
        profilePhoto.removeAttribute("src");
      }
      return;
    }

    const displayName = String(profile.name || "").trim().split(/\s+/)[0] || "Perfil";
    const picture = String(profile.picture || "").trim();
    profileName.textContent = displayName;
    profileLink.href = "/perfil/";
    profileLink.setAttribute("aria-label", `Perfil de ${displayName}`);
    if (picture && profilePhoto) {
      profilePhoto.hidden = false;
      profilePhoto.src = picture;
      profilePhoto.alt = `Foto de ${displayName}`;
    } else if (profilePhoto) {
      profilePhoto.hidden = true;
      profilePhoto.removeAttribute("src");
      profilePhoto.alt = "";
    }
  }

  function renderHeaderCart() {
    if (!cartCount) return;
    cartCount.textContent = String(loadCartIds().length);
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
    window.location.href = q ? `/index.html?q=${encodeURIComponent(q)}#produtos` : "/index.html#produtos";
  }

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    goToSearch();
  });

  categoryButton?.addEventListener("click", () => {
    const opened = categoryDropdown.classList.toggle("is-open");
    categoryButton.setAttribute("aria-expanded", opened ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!categoryDropdown || !categoryButton) return;
    if (categoryDropdown.contains(event.target)) return;
    categoryDropdown.classList.remove("is-open");
    categoryButton.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !categoryDropdown || !categoryButton) return;
    categoryDropdown.classList.remove("is-open");
    categoryButton.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("storage", (event) => {
    if ([CART_KEY, PROFILE_KEY, SHIP_KEY, LEGACY_SHIP_KEY].includes(event.key || "")) {
      renderHeaderState();
    }
  });

  syncSearchFromQuery();
  renderHeaderState();
})();
