(function () {
  const catalog = window.stopmodCatalog;
  const root = document.getElementById("product-detail-root");

  if (!catalog || !root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id") || 0);
  const product = catalog.getProductById(productId);

  function loadProfileName() {
    try {
      const profile = JSON.parse(localStorage.getItem(catalog.storageKeys.profile) || "null");
      const name = String(profile?.name || profile?.fullName || "").trim();
      return name || "Cliente";
    } catch {
      return "Cliente";
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderStars(value) {
    const rounded = Math.round(Number(value) || 0);
    return Array.from({ length: 5 }, (_, index) => index < rounded ? "&#9733;" : "&#9734;").join("");
  }

  function showFeedback(message) {
    const feedback = root.querySelector("[data-product-feedback]");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  function reviewCard(review) {
    const createdAt = review?.createdAt ? new Date(review.createdAt) : null;
    const createdLabel = createdAt && Number.isFinite(createdAt.getTime())
      ? createdAt.toLocaleDateString("pt-BR")
      : "Agora";

    return `
      <article class="review-card">
        <div class="review-card__head">
          <strong>${escapeHtml(review.name || "Cliente")}</strong>
          <span class="rating-stars">${renderStars(review.rating)}</span>
        </div>
        <p>${escapeHtml(review.text || "")}</p>
        <small>${createdLabel}</small>
      </article>
    `;
  }

  function relatedCard(item) {
    return `
      <a class="related-product-card" href="${catalog.productHref(item.id)}">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" />
        <span>${escapeHtml(item.category)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <em>${catalog.formatBRL(item.price)}</em>
      </a>
    `;
  }

  function renderMissingProduct() {
    root.innerHTML = `
      <div class="product-empty-state">
        <h1>Produto nao encontrado</h1>
        <p>Esse item nao esta mais na vitrine ou o link ficou incompleto.</p>
        <div class="product-detail-actions">
          <a class="btn primary" href="../index.html#produtos">Voltar para vitrine</a>
        </div>
      </div>
    `;
  }

  function renderProduct() {
    if (!product) {
      renderMissingProduct();
      return;
    }

    const summary = catalog.getRatingSummary(product.id);
    const reviews = catalog.getProductReviews(product.id);
    const related = catalog.getRelatedProducts(product.id, 4);
    const favoriteLabel = catalog.isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos";

    root.innerHTML = `
      <div class="product-detail-grid">
        <section class="product-detail-media">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
        </section>

        <section class="product-detail-panel">
          <div class="product-detail-topline">
            <span class="badge-pill">${escapeHtml(product.badge)}</span>
            <span>${escapeHtml(product.category)} | ${escapeHtml(product.size)}</span>
          </div>
          <h1>${escapeHtml(product.name)}</h1>
          <p class="product-detail-summary">${escapeHtml(product.shortDescription || product.description)}</p>

          <div class="product-detail-rating">
            <span class="rating-stars">${renderStars(summary.average)}</span>
            <strong>${summary.average.toFixed(1)}</strong>
            <span>${summary.count} avaliacao(oes)</span>
            <span>${summary.sold} vendas confirmadas</span>
          </div>

          <div class="product-detail-price">
            <strong>${catalog.formatBRL(product.price)}</strong>
            <span>${catalog.formatBRL(catalog.oldPrice(product.price))}</span>
            <small>Pix: ${catalog.formatBRL(catalog.pixPrice(product.price))}</small>
          </div>

          <ul class="product-detail-highlights">
            ${product.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>

          <div class="product-quantity-box">
            <span>Adicionar mais produtos</span>
            <div class="quantity-stepper">
              <button type="button" data-qty-step="-1">-</button>
              <input id="product-qty" type="number" min="1" max="12" value="1" />
              <button type="button" data-qty-step="1">+</button>
            </div>
          </div>

          <div class="product-detail-actions">
            <button class="btn secondary" type="button" data-favorite-toggle>${favoriteLabel}</button>
            <button class="btn secondary" type="button" data-add-cart>Adicionar ao carrinho</button>
            <button class="btn primary" type="button" data-buy-now>Comprar agora</button>
          </div>
          <p class="product-detail-feedback" data-product-feedback hidden></p>
        </section>
      </div>

      <section class="product-extra-grid">
        <article class="product-description-card">
          <p class="eyebrow">Descricao</p>
          <h2>Sobre este produto</h2>
          <p>${escapeHtml(product.description)}</p>
        </article>

        <article class="product-reviews-card">
          <div class="product-reviews-card__head">
            <div>
              <p class="eyebrow">Avaliacoes</p>
              <h2>O que clientes estao dizendo</h2>
            </div>
            <span class="review-badge">${summary.count} comentario(s)</span>
          </div>
          <div class="review-list">
            ${reviews.length ? reviews.slice(0, 6).map(reviewCard).join("") : '<p class="review-empty">Esse produto ainda nao recebeu avaliacao. Seja o primeiro.</p>'}
          </div>
          <form class="review-form" data-review-form>
            <label>
              Nota
              <select name="rating" required>
                <option value="5">5 estrelas</option>
                <option value="4">4 estrelas</option>
                <option value="3">3 estrelas</option>
                <option value="2">2 estrelas</option>
                <option value="1">1 estrela</option>
              </select>
            </label>
            <label>
              Sua avaliacao
              <textarea name="text" rows="4" placeholder="Conte como foi sua experiencia com este produto." required></textarea>
            </label>
            <button class="btn primary" type="submit">Enviar avaliacao</button>
          </form>
        </article>
      </section>

      <section class="related-products-block">
        <div class="related-products-head">
          <div>
            <p class="eyebrow">Relacionados</p>
            <h2>Adicionar mais produtos</h2>
          </div>
          <a class="btn secondary" href="../index.html#produtos">Ver vitrine completa</a>
        </div>
        <div class="related-products-grid">
          ${related.map(relatedCard).join("")}
        </div>
      </section>
    `;
  }

  function currentQty() {
    const input = root.querySelector("#product-qty");
    const value = Number(input?.value || 1);
    return Math.max(1, Math.min(12, Number.isFinite(value) ? Math.round(value) : 1));
  }

  function setQty(next) {
    const input = root.querySelector("#product-qty");
    if (!input) return;
    input.value = String(Math.max(1, Math.min(12, Number(next) || 1)));
  }

  function addSelectedQtyToCart() {
    const qty = currentQty();
    for (let index = 0; index < qty; index += 1) {
      catalog.addToCart(product.id);
    }
    showFeedback(`${qty} unidade(s) adicionada(s) ao carrinho.`);
  }

  root.addEventListener("click", (event) => {
    const step = event.target instanceof Element ? event.target.closest("[data-qty-step]") : null;
    if (step) {
      setQty(currentQty() + Number(step.getAttribute("data-qty-step") || 0));
      return;
    }

    const favorite = event.target instanceof Element ? event.target.closest("[data-favorite-toggle]") : null;
    if (favorite) {
      const isNowFavorite = catalog.toggleFavorite(product.id);
      favorite.textContent = isNowFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
      showFeedback(isNowFavorite ? "Produto salvo nos favoritos." : "Produto removido dos favoritos.");
      return;
    }

    const addCart = event.target instanceof Element ? event.target.closest("[data-add-cart]") : null;
    if (addCart) {
      addSelectedQtyToCart();
      return;
    }

    const buyNow = event.target instanceof Element ? event.target.closest("[data-buy-now]") : null;
    if (buyNow) {
      addSelectedQtyToCart();
      window.location.href = "../carrinho/";
    }
  });

  root.addEventListener("submit", (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target.closest("[data-review-form]") : null;
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const review = catalog.addProductReview(product.id, {
      name: loadProfileName(),
      rating: Number(data.get("rating") || 5),
      text: String(data.get("text") || "")
    });
    if (!review) {
      showFeedback("Preencha a avaliacao para continuar.");
      return;
    }
    renderProduct();
    showFeedback("Avaliacao enviada com sucesso.");
  });

  renderProduct();
})();

