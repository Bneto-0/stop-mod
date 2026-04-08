(function () {
  const catalog = window.stopmodCatalog;
  const root = document.getElementById("favorites-root");

  if (!catalog || !root) return;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function card(product) {
    return `
      <article class="favorite-card">
        <a class="favorite-card__media" href="${catalog.productHref(product.id)}">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
        </a>
        <div class="favorite-card__body">
          <span>${escapeHtml(product.category)} | ${escapeHtml(product.size)}</span>
          <h3><a href="${catalog.productHref(product.id)}">${escapeHtml(product.name)}</a></h3>
          <p>${escapeHtml(product.shortDescription || product.description)}</p>
          <strong>${catalog.formatBRL(product.price)}</strong>
          <div class="favorite-card__actions">
            <a class="btn secondary" href="${catalog.productHref(product.id)}">Ver detalhes</a>
            <button class="btn secondary" type="button" data-favorite-remove="${product.id}">Remover</button>
            <button class="btn primary" type="button" data-favorite-cart="${product.id}">Adicionar ao carrinho</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFavorites() {
    const ids = catalog.loadFavorites();
    const items = ids.map((id) => catalog.getProductById(id)).filter(Boolean);

    if (!items.length) {
      root.innerHTML = `
        <div class="favorite-empty-state">
          <h1>Favoritos</h1>
          <p>Quando voce salvar um produto, ele aparece aqui para comparar, revisar e comprar depois.</p>
          <a class="btn primary" href="/#produtos">Explorar produtos</a>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <header class="favorites-head">
        <div>
          <h1>Favoritos</h1>
          <p>${items.length} produto(s) salvo(s) para acompanhar depois.</p>
        </div>
        <a class="btn secondary" href="/#produtos">Voltar para vitrine</a>
      </header>
      <div class="favorite-grid">
        ${items.map(card).join("")}
      </div>
    `;
  }

  root.addEventListener("click", (event) => {
    const removeButton = event.target instanceof Element ? event.target.closest("[data-favorite-remove]") : null;
    if (removeButton) {
      catalog.toggleFavorite(removeButton.getAttribute("data-favorite-remove"));
      renderFavorites();
      return;
    }

    const cartButton = event.target instanceof Element ? event.target.closest("[data-favorite-cart]") : null;
    if (cartButton) {
      catalog.addToCart(cartButton.getAttribute("data-favorite-cart"));
      cartButton.textContent = "Adicionado";
      setTimeout(() => {
        cartButton.textContent = "Adicionar ao carrinho";
      }, 1200);
    }
  });

  renderFavorites();
})();
