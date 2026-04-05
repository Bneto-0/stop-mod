(function () {
  const catalog = window.stopmodCatalog;
  const root = document.getElementById("product-detail-root");
  const topFeatures = document.getElementById("product-detail-top-features");

  if (!catalog || !root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id") || 0);
  const product = catalog.getProductById(productId);
  let selectedVariantId = String(params.get("variant") || "").trim();

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

  function favoriteHeartMarkup(isFavorite) {
    return isFavorite ? "&#10084;" : "&#9825;";
  }

  function favoriteHeartLabel(isFavorite) {
    return isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
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

  function renderTopHighlights(items) {
    if (!topFeatures) return;
    topFeatures.innerHTML = (Array.isArray(items) ? items : [])
      .map((item) => `<span class="product-top-highlight">${escapeHtml(item)}</span>`)
      .join("");
  }

  function renderMissingProduct() {
    renderTopHighlights([]);
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

  function getDisplayVariants() {
    return product ? catalog.getProductVariants(product.id) : [];
  }

  function getSelectedVariant() {
    if (!product) return null;
    return catalog.getVariantById(product.id, selectedVariantId) || catalog.getDefaultVariant(product.id);
  }

  function ensureSelectedVariant() {
    const variant = getSelectedVariant();
    selectedVariantId = variant?.id || "";
    return variant;
  }

  function updateVariantInUrl(variantId) {
    const next = new URL(window.location.href);
    if (variantId) next.searchParams.set("variant", variantId);
    else next.searchParams.delete("variant");
    window.history.replaceState({}, "", next.toString());
  }

  function currentQty() {
    const input = root.querySelector("#product-qty");
    const variant = getSelectedVariant();
    const max = Math.max(1, Number(variant?.stock || 1));
    const value = Number(input?.value || 1);
    return Math.max(1, Math.min(max, Number.isFinite(value) ? Math.round(value) : 1));
  }

  function setQty(next) {
    const input = root.querySelector("#product-qty");
    const variant = getSelectedVariant();
    const max = Math.max(1, Number(variant?.stock || 1));
    if (!input) return;
    input.max = String(max);
    input.value = String(Math.max(1, Math.min(max, Number(next) || 1)));
  }

  function syncQtyToVariant() {
    const variant = getSelectedVariant();
    const stepper = root.querySelector(".quantity-stepper");
    const input = root.querySelector("#product-qty");
    const soldOut = !variant || Number(variant.stock || 0) <= 0;
    if (stepper) stepper.classList.toggle("is-disabled", soldOut);
    if (!input) return;
    input.disabled = soldOut;
    input.max = String(Math.max(1, Number(variant?.stock || 1)));
    setQty(input.value || 1);
  }

  function variantCard(variant, selected) {
    const soldOut = Number(variant.stock || 0) <= 0;
    return `
      <button
        class="product-variant-card${selected ? " is-selected" : ""}${soldOut ? " is-unavailable" : ""}"
        type="button"
        data-variant-select="${escapeHtml(variant.id)}"
        aria-pressed="${selected ? "true" : "false"}"
        aria-label="Selecionar cor ${escapeHtml(variant.colorName)}${soldOut ? ", sem estoque" : ""}"
        title="${escapeHtml(variant.colorName)}"
      >
        <span class="product-variant-swatch" style="--variant-swatch:${escapeHtml(variant.swatch || "#d8c8bc")}"></span>
        <span class="sr-only">${escapeHtml(variant.colorName)}</span>
      </button>
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
    const isFavorite = catalog.isFavorite(product.id);
    const variants = getDisplayVariants();
    const selectedVariant = ensureSelectedVariant();
    const soldOut = !selectedVariant || Number(selectedVariant.stock || 0) <= 0;
    const selectedColorLabel = selectedVariant?.colorName || "Indisponivel";
    const stockLabel = soldOut
      ? "Sem estoque nesta cor."
      : `${selectedVariant.stock} unidade(s) disponivel(is) em ${selectedVariant.colorName}.`;

    renderTopHighlights(product.highlights);
    root.innerHTML = `
      <div class="product-detail-grid">
        <section class="product-detail-media">
          <img src="${selectedVariant?.image || product.image}" alt="${escapeHtml(product.name)}" />
        </section>

        <section class="product-detail-panel">
          <div class="product-detail-headbar">
            <div class="product-detail-topline">
              <span class="badge-pill">${escapeHtml(product.badge)}</span>
              <span>${escapeHtml(product.category)} | ${escapeHtml(product.size)}</span>
            </div>
            <button class="product-favorite-heart${isFavorite ? " is-active" : ""}" type="button" data-favorite-toggle aria-label="${favoriteHeartLabel(isFavorite)}" aria-pressed="${isFavorite ? "true" : "false"}">${favoriteHeartMarkup(isFavorite)}</button>
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

          <div class="product-quantity-box${soldOut ? " is-sold-out" : ""}">
            <div class="product-variant-stack">
              <div class="product-variant-title">
                <span>Cores disponiveis</span>
                <small>${variants.length} cor(es)</small>
              </div>
              <div class="product-variant-current" aria-live="polite">
                <strong>${escapeHtml(selectedColorLabel)}</strong>
                <span>${soldOut ? "Sem estoque nessa cor" : "Cor pronta para compra"}</span>
              </div>
              <div class="product-variant-list" role="list" aria-label="Variantes de cor disponiveis">
                ${variants.length ? variants.map((variant) => variantCard(variant, variant.id === selectedVariant?.id)).join("") : '<span class="product-variant-empty">Produto esgotado no momento.</span>'}
              </div>
            </div>

            <div class="product-qty-side">
              <span>Quantidade</span>
              <div class="quantity-stepper${soldOut ? " is-disabled" : ""}">
                <button type="button" data-qty-step="-1" ${soldOut ? "disabled" : ""}>-</button>
                <input id="product-qty" type="number" min="1" max="${Math.max(1, Number(selectedVariant?.stock || 1))}" value="1" ${soldOut ? "disabled" : ""} />
                <button type="button" data-qty-step="1" ${soldOut ? "disabled" : ""}>+</button>
              </div>
              <small class="product-stock-note">${stockLabel}</small>
            </div>
          </div>

          <div class="product-detail-actions">
            <button class="btn secondary" type="button" data-add-cart ${soldOut ? "disabled" : ""}>Adicionar ao carrinho</button>
            <button class="btn primary" type="button" data-buy-now ${soldOut ? "disabled" : ""}>Comprar agora</button>
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

    syncQtyToVariant();
  }

  function addSelectedQtyToCart() {
    const variant = getSelectedVariant();
    if (!variant || Number(variant.stock || 0) <= 0) {
      showFeedback("Essa cor esta sem estoque no momento.");
      return false;
    }

    const qty = currentQty();
    const before = catalog.getCartQuantity(product.id, variant.id);
    catalog.addToCart(product.id, qty, { variantId: variant.id });
    const after = catalog.getCartQuantity(product.id, variant.id);
    const added = Math.max(0, after - before);

    if (!added) {
      showFeedback(`Nao ha mais estoque disponivel para ${variant.colorName}.`);
      return false;
    }

    if (added < qty) {
      showFeedback(`${added} unidade(s) de ${variant.colorName} adicionada(s). Estoque restante limitado.`);
      setQty(Math.min(currentQty(), Math.max(1, variant.stock - after)));
      return true;
    }

    showFeedback(`${added} unidade(s) adicionada(s) ao carrinho.`);
    return true;
  }

  root.addEventListener("click", (event) => {
    const variantButton = event.target instanceof Element ? event.target.closest("[data-variant-select]") : null;
    if (variantButton) {
      selectedVariantId = String(variantButton.getAttribute("data-variant-select") || "");
      updateVariantInUrl(selectedVariantId);
      renderProduct();
      showFeedback(Number(getSelectedVariant()?.stock || 0) > 0 ? `Cor ${getSelectedVariant()?.colorName || "selecionada"}.` : `Cor ${getSelectedVariant()?.colorName || "selecionada"} sem estoque no momento.`);
      return;
    }

    const step = event.target instanceof Element ? event.target.closest("[data-qty-step]") : null;
    if (step) {
      setQty(currentQty() + Number(step.getAttribute("data-qty-step") || 0));
      return;
    }

    const favorite = event.target instanceof Element ? event.target.closest("[data-favorite-toggle]") : null;
    if (favorite) {
      const isNowFavorite = catalog.toggleFavorite(product.id);
      favorite.innerHTML = favoriteHeartMarkup(isNowFavorite);
      favorite.classList.toggle("is-active", isNowFavorite);
      favorite.setAttribute("aria-pressed", isNowFavorite ? "true" : "false");
      favorite.setAttribute("aria-label", favoriteHeartLabel(isNowFavorite));
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
      if (addSelectedQtyToCart()) {
        window.location.href = `../carrinho/?buyNow=1&variant=${encodeURIComponent(selectedVariantId)}`;
      }
    }
  });

  root.addEventListener("input", (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target.closest("#product-qty") : null;
    if (!input) return;
    setQty(input.value || 1);
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
