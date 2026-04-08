(function () {
  const catalog = window.stopmodCatalog;
  const root = document.getElementById("product-detail-root");
  const topFeatures = document.getElementById("product-detail-top-features");

  if (!catalog || !root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id") || 0);
  const product = catalog.getProductById(productId);
  let selectedVariantId = String(params.get("variant") || "").trim();
  let selectedSize = String(params.get("size") || "").trim().toUpperCase();
  let galleryOpen = false;
  let galleryIndex = 0;
  let cepModalOpen = false;
  let cepDraft = "";
  let numberDraft = "";
  let cepLookupLoading = false;
  let cepLookupError = false;
  let cepLookupSuccess = false;
  let cepLookupMessage = "";
  let cepLookupResult = null;
  let pendingReviewPhoto = "";
  let pendingReviewPhotoName = "";
  const TEXT_SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XGG"];

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

  function normalizeCep(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  function normalizeState(value) {
    return String(value || "")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 2)
      .toUpperCase();
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function isCepValid(value) {
    return String(value || "").replace(/\D/g, "").length === 8;
  }

  function loadShipTo() {
    try {
      const raw = localStorage.getItem("stopmod_ship_to");
      if (!raw) return { street: "", number: "", district: "", city: "", state: "", cep: "", complement: "" };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { street: "", number: "", district: "", city: "", state: "", cep: "", complement: "" };
      }
      return {
        street: String(parsed.street || "").trim(),
        number: String(parsed.number || "").trim(),
        district: String(parsed.district || "").trim(),
        city: String(parsed.city || "").trim(),
        state: normalizeState(parsed.state || ""),
        cep: normalizeCep(parsed.cep || ""),
        complement: String(parsed.complement || "").trim()
      };
    } catch {
      return { street: "", number: "", district: "", city: "", state: "", cep: "", complement: "" };
    }
  }

  function saveShipTo(next) {
    const payload = {
      street: String(next?.street || "").trim(),
      number: String(next?.number || "").trim(),
      district: String(next?.district || "").trim(),
      city: String(next?.city || "").trim(),
      state: normalizeState(next?.state || ""),
      cep: normalizeCep(next?.cep || ""),
      complement: String(next?.complement || "").trim()
    };
    localStorage.setItem("stopmod_ship_to", JSON.stringify(payload));
    return payload;
  }

  function calcShipping(subtotal, itemCount, cep) {
    if (!isCepValid(cep)) return null;
    const free = Number(subtotal || 0) > 50;
    return free ? 0 : 19.9;
  }

  function quotedShippingForCep(cep) {
    return isCepValid(cep) ? 19.9 : null;
  }

  function formatFreightNumber(value) {
    return catalog.formatBRL(value).replace(/^R\$\s?/, "");
  }

  function deliveryAddressLine(to) {
    return [String(to?.street || "").trim(), String(to?.number || "").trim(), String(to?.district || "").trim()]
      .filter(Boolean)
      .join(", ");
  }

  function deliveryCityStateLine(to) {
    const city = String(to?.city || "").trim();
    const state = String(to?.state || "").trim();
    if (city && state) return `${city} - ${state}`;
    return city || state || "";
  }

  function deliverySummaryLine(to) {
    return [deliveryAddressLine(to), deliveryCityStateLine(to)]
      .filter(Boolean)
      .join(" - ");
  }

  function compactStreetName(value) {
    const clean = String(value || "")
      .trim()
      .replace(/^(rua|r\.|avenida|av\.|travessa|alameda|estrada|rodovia|praca|praça)\s+/i, "");
    const words = clean.split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    return words.slice(0, 2).join(" ");
  }

  function deliveryCompactLine(to) {
    const street = compactStreetName(to?.street || "");
    const state = String(to?.state || "").trim();
    const city = String(to?.city || "").trim();
    if (street && state) return `${street} - ${state}`;
    if (street) return street;
    if (city && state) return `${city} - ${state}`;
    return city || state || "";
  }

  function capitalizeWord(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function addBusinessDays(baseDate, days) {
    const date = new Date(baseDate);
    let remaining = Math.max(0, Number(days) || 0);
    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) remaining -= 1;
    }
    return date;
  }

  function deliveryHeaderText(shipTo) {
    const summaryLine = deliveryCompactLine(shipTo);
    return summaryLine ? `Entrega para ${summaryLine}` : "Informe seu CEP";
  }

  function deliveryFreightRowMarkup(shipping, quotedShipping) {
    if (quotedShipping === null) {
      return "";
    }

    if (shipping === 0) {
      return `<span class="product-delivery-card__freight is-free">Frete Gratis</span>`;
    }

    return `<span class="product-delivery-card__freight-meta is-quoted">Frete: ${escapeHtml(formatFreightNumber(shipping))}</span>`;
  }

  function shouldShowDeliveryEstimate(shipTo, shipping) {
    return isCepValid(shipTo?.cep) && shipping !== null;
  }

  function deliveryEstimateText(shipTo, shipping) {
    if (!shouldShowDeliveryEstimate(shipTo, shipping)) return "";

    const base = new Date();
    const start = addBusinessDays(base, shipping === 0 ? 3 : 5);
    const end = addBusinessDays(base, shipping === 0 ? 6 : 9);
    const startMonth = capitalizeWord(start.toLocaleDateString("pt-BR", { month: "long" }));
    const endMonth = capitalizeWord(end.toLocaleDateString("pt-BR", { month: "long" }));

    if (startMonth === endMonth) {
      return `Chega entre ${start.getDate()} e ${end.getDate()} de ${startMonth}`;
    }

    return `Chega entre ${start.getDate()} de ${startMonth} e ${end.getDate()} de ${endMonth}`;
  }

  function currentShippingForQty(qty) {
    const shipTo = loadShipTo();
    const safeQty = Math.max(1, Number(qty) || 1);
    const subtotal = Number(product?.price || 0) * safeQty;
    const quotedShipping = quotedShippingForCep(shipTo.cep);
    return {
      shipTo,
      qty: safeQty,
      quotedShipping,
      shipping: calcShipping(subtotal, safeQty, shipTo.cep)
    };
  }

  async function fetchJsonWithTimeout(url, timeoutMs = 5200) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 5200);
    try {
      const response = await fetch(String(url || ""), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("timeout");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function normalizeLookupAddress(raw, fallbackCepDigits) {
    if (!raw || typeof raw !== "object") return null;
    const street = String(raw.street || raw.logradouro || "").trim();
    const district = String(raw.district || raw.bairro || "").trim();
    const city = String(raw.city || raw.localidade || "").trim();
    const state = normalizeState(raw.state || raw.uf || "");
    const cepDigits = digitsOnly(raw.cep || fallbackCepDigits).slice(0, 8);
    if (!street && !district && !city && !state) return null;
    if (cepDigits.length !== 8) return null;
    return {
      cep: normalizeCep(cepDigits),
      street,
      district,
      city,
      state
    };
  }

  async function lookupCepViaCep(cepDigits) {
    const data = await fetchJsonWithTimeout(`https://viacep.com.br/ws/${cepDigits}/json/`, 5200);
    if (data?.erro) return null;
    return normalizeLookupAddress(data, cepDigits);
  }

  async function lookupCepBrasilApi(cepDigits) {
    const data = await fetchJsonWithTimeout(`https://brasilapi.com.br/api/cep/v1/${cepDigits}`, 5400);
    return normalizeLookupAddress(data, cepDigits);
  }

  async function lookupCep(cepValue) {
    const cepDigits = digitsOnly(cepValue).slice(0, 8);
    if (cepDigits.length !== 8) {
      cepLookupError = true;
      cepLookupSuccess = false;
      cepLookupLoading = false;
      cepLookupResult = null;
      cepLookupMessage = "CEP invalido. Use 8 digitos.";
      renderProduct();
      return null;
    }

    cepLookupLoading = true;
    cepLookupError = false;
    cepLookupSuccess = false;
    cepLookupMessage = "Consultando CEP...";
    renderProduct();

    const providers = [lookupCepViaCep, lookupCepBrasilApi];
    let found = null;
    for (const provider of providers) {
      try {
        const value = await provider(cepDigits);
        if (value) {
          found = value;
          break;
        }
      } catch {
        // tenta o proximo provedor
      }
    }

    cepLookupLoading = false;
    if (!found) {
      cepLookupError = true;
      cepLookupSuccess = false;
      cepLookupResult = null;
      cepLookupMessage = "CEP nao encontrado. Tente novamente.";
      renderProduct();
      return null;
    }

    cepLookupError = false;
    cepLookupSuccess = false;
    cepLookupResult = found;
    cepDraft = String(found.cep || normalizeCep(cepDigits));
    cepLookupMessage = "Endereco reconhecido. Informe o numero da residencia.";
    renderProduct();
    return found;
  }

  function openCepModal() {
    const current = loadShipTo();
    cepModalOpen = true;
    cepDraft = String(current.cep || "");
    numberDraft = String(current.number || "");
    cepLookupResult = current.street || current.city || current.state
      ? {
          cep: String(current.cep || ""),
          street: String(current.street || ""),
          district: String(current.district || ""),
          city: String(current.city || ""),
          state: String(current.state || "")
        }
      : null;
    cepLookupLoading = false;
    cepLookupError = false;
    cepLookupSuccess = false;
    cepLookupMessage = cepLookupResult ? "Endereco reconhecido. Informe o numero da residencia." : "";
  }

  function closeCepModal() {
    cepModalOpen = false;
    cepLookupLoading = false;
    cepLookupError = false;
    cepLookupSuccess = false;
    cepLookupMessage = "";
    cepLookupResult = null;
  }

  function deliveryCardMarkup(qty = 1) {
    const { shipTo, shipping, quotedShipping } = currentShippingForQty(qty);
    const headerText = deliveryHeaderText(shipTo);
    const freightMarkup = deliveryFreightRowMarkup(shipping, quotedShipping);
    const estimateText = deliveryEstimateText(shipTo, shipping);
    const showEstimate = Boolean(estimateText);

    return `
      <article class="product-delivery-card" data-delivery-card>
        <div class="product-delivery-card__topline">
          <p class="product-delivery-card__label" data-delivery-summary title="${escapeHtml(headerText)}">${escapeHtml(headerText)}</p>
          <button class="product-delivery-card__link" type="button" data-cep-open>CEP</button>
        </div>
        <div class="product-delivery-card__freight-row" data-delivery-freight-row ${freightMarkup ? "" : "hidden"}>
          ${freightMarkup}
        </div>
        <p class="product-delivery-card__estimate" data-delivery-estimate ${showEstimate ? "" : "hidden"}>${escapeHtml(estimateText)}</p>
        <p class="product-delivery-card__note">Ao finalizar o pagamento seu pedido sera enviado em ate 24 horas.</p>
      </article>
    `;
  }

  function updateDeliveryPreview(qtyValue) {
    const card = root.querySelector("[data-delivery-card]");
    if (!card) return;

    const qty = Math.max(1, Number(qtyValue) || currentQty() || 1);
    const { shipTo, shipping, quotedShipping } = currentShippingForQty(qty);
    const summary = card.querySelector("[data-delivery-summary]");
    const freightRow = card.querySelector("[data-delivery-freight-row]");
    const estimate = card.querySelector("[data-delivery-estimate]");
    const headerText = deliveryHeaderText(shipTo);
    const freightMarkup = deliveryFreightRowMarkup(shipping, quotedShipping);
    const estimateText = deliveryEstimateText(shipTo, shipping);

    if (summary) {
      summary.textContent = headerText;
      summary.setAttribute("title", headerText);
    }
    if (freightRow) {
      freightRow.innerHTML = freightMarkup;
      freightRow.hidden = !freightMarkup;
    }
    if (estimate) {
      estimate.textContent = estimateText;
      estimate.hidden = !estimateText;
    }
  }

  function reviewCard(review) {
    const createdAt = review?.createdAt ? new Date(review.createdAt) : null;
    const createdLabel = createdAt && Number.isFinite(createdAt.getTime())
      ? createdAt.toLocaleDateString("pt-BR")
      : "Agora";

    return `
      <article class="review-card">
        <div class="review-card__head">
          <div class="review-card__author">
            <strong>${escapeHtml(review.name || "Cliente")}</strong>
            <small>${createdLabel}</small>
          </div>
          <span class="rating-stars">${renderStars(review.rating)}</span>
        </div>
        ${review?.photo ? `
          <div class="review-card__media">
            <img src="${escapeHtml(review.photo)}" alt="Foto enviada por ${escapeHtml(review.name || "Cliente")}" loading="lazy" />
          </div>
        ` : ""}
        <p>${escapeHtml(review.text || "")}</p>
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

  function singularCategoryLabel(value) {
    const map = Object.freeze({
      Camisetas: "Camiseta",
      Calcas: "Calca",
      Jaquetas: "Jaqueta",
      Moletons: "Moletom",
      Vestidos: "Vestido",
      Camisas: "Camisa",
      Casacos: "Casaco",
      Blazers: "Blazer",
      Saias: "Saia",
      Shorts: "Short",
      Calcados: "Calcado",
      Acessorios: "Acessorio"
    });
    return map[String(value || "").trim()] || String(value || "").trim();
  }

  function compactReferenceLabel(value) {
    const normalized = String(value || "")
      .trim()
      .replace(/\s+/g, " ");

    const dictionary = new Map([
      ["Malha premium com toque macio", "malha premium"],
      ["Modelagem oversized", "oversized"],
      ["Caimento reto e gola reforcada", "caimento reto"],
      ["Boa para looks basicos e camadas", "looks em camadas"],
      ["Lavagem vintage", "lavagem vintage"],
      ["Jeans encorpado", "jeans encorpado"],
      ["Botoes metalicos", "botoes metalicos"],
      ["Facil de combinar com camisetas e vestidos", "facil de combinar"],
      ["Bolsos cargo laterais", "bolsos cargo"],
      ["Tecido resistente", "tecido resistente"],
      ["Modelagem reta", "modelagem reta"],
      ["Boa para composicoes street e utilitarias", "street e utilitaria"],
      ["Interior macio", "interior macio"],
      ["Punhos ajustados", "punhos ajustados"],
      ["Capuz estruturado", "capuz estruturado"],
      ["Visual limpo e versatil", "visual versatil"],
      ["Caimento leve", "caimento leve"],
      ["Modelagem minimalista", "minimalista"],
      ["Uso casual", "uso casual"],
      ["Combina com tenis e sandalia", "combina facil"],
      ["Tecido com linho", "linho leve"],
      ["Respiracao alta", "alta respiracao"],
      ["Caimento leve", "caimento leve"],
      ["Facil de usar aberta ou fechada", "uso aberto ou fechado"],
      ["Visual de couro", "couro clean"],
      ["Acabamento marcante", "acabamento forte"],
      ["Edicao limitada", "edicao limitada"],
      ["Peca de destaque no look", "peca destaque"]
    ]);

    if (dictionary.has(normalized)) {
      return String(dictionary.get(normalized) || normalized);
    }

    return normalized
      .toLowerCase()
      .replace(/\b(com|para|de|do|da|dos|das|e|ou|no|na|em|uma|um)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 22);
  }

  function buildTopReferences() {
    if (!product) return [];
    return [singularCategoryLabel(product.category), ...(Array.isArray(product.highlights) ? product.highlights : [])]
      .map((item) => compactReferenceLabel(item))
      .filter(Boolean);
  }

  function renderTopHighlights(items) {
    if (!topFeatures) return;
    topFeatures.innerHTML = (Array.isArray(items) ? items : [])
      .map((item) => `<span class="product-top-highlight">${escapeHtml(item)}</span>`)
      .join("");
  }

  function renderMissingProduct() {
    renderTopHighlights([]);
    document.body.classList.remove("has-product-gallery");
    document.body.classList.remove("has-cep-modal");
    root.innerHTML = `
      <div class="product-empty-state">
        <h1>Produto nao encontrado</h1>
        <p>Esse item nao esta mais na vitrine ou o link ficou incompleto.</p>
        <div class="product-detail-actions">
          <a class="btn primary" href="/#produtos">Voltar para vitrine</a>
        </div>
      </div>
    `;
  }

  function getDisplayVariants() {
    return product ? catalog.getProductVariants(product.id) : [];
  }

  function normalizeSizeToken(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buildNumericSizes(start, end) {
    const from = Number(start);
    const to = Number(end);
    const step = product?.category === "Calcados"
      ? 1
      : Math.abs(to - from) >= 4 && from % 2 === to % 2
        ? 2
        : 1;
    const direction = from <= to ? 1 : -1;
    const sizes = [];

    for (let value = from; direction > 0 ? value <= to : value >= to; value += step * direction) {
      sizes.push(String(value));
    }

    return sizes;
  }

  function getProductSizes() {
    const raw = String(product?.size || "").trim();
    if (!raw) return [];

    const normalized = normalizeSizeToken(raw).replace(/\s+/g, " ");
    if (normalized === "UNICO") return ["Unico"];

    const numericRange = normalized.match(/^(\d+)\s*(?:AO|A|ATE|-)\s*(\d+)$/);
    if (numericRange) {
      return buildNumericSizes(numericRange[1], numericRange[2]);
    }

    const textRange = normalized.match(/^(PP|P|M|G|GG|XG|XGG)\s*(?:AO|A|ATE|-)\s*(PP|P|M|G|GG|XG|XGG)$/);
    if (textRange) {
      const startIndex = TEXT_SIZE_ORDER.indexOf(textRange[1]);
      const endIndex = TEXT_SIZE_ORDER.indexOf(textRange[2]);
      if (startIndex >= 0 && endIndex >= 0) {
        const from = Math.min(startIndex, endIndex);
        const to = Math.max(startIndex, endIndex);
        return TEXT_SIZE_ORDER.slice(from, to + 1);
      }
    }

    return raw
      .split(/[\/,|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getSelectedSize() {
    const sizes = getProductSizes();
    if (!sizes.length) return "";
    const selected = sizes.find((size) => normalizeSizeToken(size) === normalizeSizeToken(selectedSize));
    return selected || sizes[0];
  }

  function ensureSelectedSize() {
    const size = getSelectedSize();
    selectedSize = normalizeSizeToken(size);
    return size;
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
    if (selectedSize) next.searchParams.set("size", selectedSize);
    else next.searchParams.delete("size");
    window.history.replaceState({}, "", next.toString());
  }

  function updateSizeInUrl(size) {
    const next = new URL(window.location.href);
    if (selectedVariantId) next.searchParams.set("variant", selectedVariantId);
    else next.searchParams.delete("variant");
    if (size) next.searchParams.set("size", normalizeSizeToken(size));
    else next.searchParams.delete("size");
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
    const safeQty = Math.max(1, Math.min(max, Number(next) || 1));
    input.value = String(safeQty);
    updateDeliveryPreview(safeQty);
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
        <span class="product-variant-thumb-wrap">
          <img class="product-variant-thumb" src="${escapeHtml(variant.image || product.image)}" data-fallback-src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} na cor ${escapeHtml(variant.colorName)}" loading="lazy" />
          <span class="product-variant-swatch" style="--variant-swatch:${escapeHtml(variant.swatch || "#d8c8bc")}"></span>
        </span>
        <span class="product-variant-name">${escapeHtml(variant.colorName)}</span>
      </button>
    `;
  }

  function sizeCard(size, selected) {
    return `
      <button
        class="product-size-card${selected ? " is-selected" : ""}"
        type="button"
        data-size-select="${escapeHtml(size)}"
        aria-pressed="${selected ? "true" : "false"}"
        aria-label="Selecionar tamanho ${escapeHtml(size)}"
      >
        ${escapeHtml(size)}
      </button>
    `;
  }

  function galleryModalMarkup(variants) {
    if (!galleryOpen || !variants.length) return "";
    const safeIndex = Math.max(0, variants.findIndex((variant) => variant.id === selectedVariantId));
    const active = variants[safeIndex] || variants[0];

    return `
      <div class="product-gallery-modal" role="dialog" aria-modal="true" aria-label="Galeria de cores do produto">
        <button class="product-gallery-modal__backdrop" type="button" data-gallery-close aria-label="Fechar galeria"></button>
        <div class="product-gallery-modal__panel">
          <button class="product-gallery-modal__close" type="button" data-gallery-close aria-label="Fechar galeria">&times;</button>
          <p class="sr-only">${escapeHtml(product.name)} na cor ${escapeHtml(active.colorName)}. ${safeIndex + 1} de ${variants.length} cores.</p>
          <div class="product-gallery-modal__thumbs" role="list" aria-label="Outras cores do produto">
            ${variants.map((variant) => `
              <button
                class="product-gallery-thumb${variant.id === active.id ? " is-selected" : ""}"
                type="button"
                data-gallery-select="${escapeHtml(variant.id)}"
                aria-pressed="${variant.id === active.id ? "true" : "false"}"
                aria-label="Abrir cor ${escapeHtml(variant.colorName)}"
              >
                <img src="${escapeHtml(variant.image || product.image)}" data-fallback-src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)} na cor ${escapeHtml(variant.colorName)}" loading="lazy" />
                <span>${escapeHtml(variant.colorName)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function reviewPhotoPreviewMarkup() {
    if (!pendingReviewPhoto) {
      return `
        <div class="review-photo-preview" data-review-photo-preview>
          <p>Adicione uma foto real do produto para aparecer junto do seu comentario.</p>
        </div>
      `;
    }

    return `
      <div class="review-photo-preview has-photo" data-review-photo-preview>
        <img src="${escapeHtml(pendingReviewPhoto)}" alt="Pre-visualizacao da foto da avaliacao" />
        <div class="review-photo-preview__meta">
          <strong>${escapeHtml(pendingReviewPhotoName || "Foto pronta")}</strong>
          <span>Essa imagem vai junto com sua avaliacao.</span>
        </div>
        <button class="btn secondary review-photo-preview__remove" type="button" data-review-photo-clear>Remover foto</button>
      </div>
    `;
  }

  function updateReviewPhotoPreview() {
    const preview = root.querySelector("[data-review-photo-preview]");
    if (!preview) return;

    if (!pendingReviewPhoto) {
      preview.className = "review-photo-preview";
      preview.innerHTML = "<p>Adicione uma foto real do produto para aparecer junto do seu comentario.</p>";
      return;
    }

    preview.className = "review-photo-preview has-photo";
    preview.innerHTML = `
      <img src="${escapeHtml(pendingReviewPhoto)}" alt="Pre-visualizacao da foto da avaliacao" />
      <div class="review-photo-preview__meta">
        <strong>${escapeHtml(pendingReviewPhotoName || "Foto pronta")}</strong>
        <span>Essa imagem vai junto com sua avaliacao.</span>
      </div>
      <button class="btn secondary review-photo-preview__remove" type="button" data-review-photo-clear>Remover foto</button>
    `;
  }

  function clearPendingReviewPhoto() {
    pendingReviewPhoto = "";
    pendingReviewPhotoName = "";
    const input = root.querySelector("[data-review-photo-input]");
    if (input instanceof HTMLInputElement) input.value = "";
    updateReviewPhotoPreview();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Nao foi possivel ler a foto."));
      reader.readAsDataURL(file);
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Nao foi possivel processar a foto."));
      image.src = dataUrl;
    });
  }

  async function optimizeReviewPhoto(file) {
    const rawDataUrl = await readFileAsDataUrl(file);
    const image = await loadImageFromDataUrl(rawDataUrl);
    const maxSide = 1280;
    const sourceWidth = image.naturalWidth || image.width || 1;
    const sourceHeight = image.naturalHeight || image.height || 1;
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return rawDataUrl;
    context.drawImage(image, 0, 0, width, height);

    let optimized = canvas.toDataURL("image/jpeg", 0.82);
    if (optimized.length > 420000) {
      optimized = canvas.toDataURL("image/jpeg", 0.72);
    }
    return optimized;
  }

  async function handleReviewPhotoSelection(file) {
    if (!file) {
      clearPendingReviewPhoto();
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      clearPendingReviewPhoto();
      showFeedback("Envie uma imagem valida para a avaliacao.");
      return;
    }

    if (Number(file.size || 0) > 8 * 1024 * 1024) {
      clearPendingReviewPhoto();
      showFeedback("A foto esta muito pesada. Use uma imagem com ate 8 MB.");
      return;
    }

    try {
      pendingReviewPhoto = await optimizeReviewPhoto(file);
      pendingReviewPhotoName = String(file.name || "foto-produto.jpg");
      if (!pendingReviewPhoto || pendingReviewPhoto.length > 450000) {
        clearPendingReviewPhoto();
        showFeedback("Nao deu para salvar essa foto. Tente uma imagem menor.");
        return;
      }
      updateReviewPhotoPreview();
      showFeedback("Foto pronta para ser enviada com a avaliacao.");
    } catch {
      clearPendingReviewPhoto();
      showFeedback("Nao foi possivel carregar a foto da avaliacao.");
    }
  }

  function formatPtDate(value) {
    const date = value ? new Date(value) : null;
    return date && Number.isFinite(date.getTime()) ? date.toLocaleDateString("pt-BR") : "";
  }

  function reviewAccessCopy(access) {
    const orderId = access?.orderId ? `Pedido ${access.orderId}` : "seu pedido";
    switch (access?.reason) {
      case "eligible":
        return {
          title: "Avaliacao liberada para voce",
          text: `${orderId} ja foi confirmado como recebido. Agora voce pode enviar estrelas, comentario e foto real do produto.`,
          linkHref: "../perfil/pedidos/",
          linkLabel: "Ver rastreio do pedido"
        };
      case "login_required":
        return {
          title: "Entre na conta que fez a compra",
          text: "Esse formulario so aparece para o cliente que recebeu o produto e confirmou o recebimento no pedido.",
          linkHref: "../login/",
          linkLabel: "Entrar agora"
        };
      case "already_reviewed":
        return {
          title: "Sua avaliacao ja foi publicada",
          text: "Depois que o comentario do pedido e enviado, essa area some automaticamente para esse cliente.",
          linkHref: "../perfil/pedidos/",
          linkLabel: "Ver meus pedidos"
        };
      case "awaiting_receipt":
        return {
          title: "Avaliacao bloqueada ate confirmar recebimento",
          text: "Assim que voce receber o produto, confirme isso em Meus pedidos. So depois dessa confirmacao o formulario aparece para voce.",
          linkHref: "../perfil/pedidos/",
          linkLabel: "Abrir meus pedidos"
        };
      default:
        return {
          title: "Avaliacao disponivel so para clientes",
          text: "Esse formulario so libera para quem comprou este produto e confirmou o recebimento no proprio pedido.",
          linkHref: "../perfil/pedidos/",
          linkLabel: "Ir para meus pedidos"
        };
    }
  }

  function reviewFormPanelMarkup(access) {
    if (!access?.allowed) {
      return "";
    }

    const copy = reviewAccessCopy(access);
    const receivedLabel = formatPtDate(access?.receivedConfirmedAt);
    return `
      <form class="review-form review-form--panel" data-review-form data-review-order-id="${escapeHtml(access.orderId || "")}">
        <div class="review-form-access">
          <strong>${escapeHtml(copy.title)}</strong>
          <p>${escapeHtml(copy.text)}</p>
          ${receivedLabel ? `<span>Recebimento confirmado em ${escapeHtml(receivedLabel)}.</span>` : ""}
        </div>
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
          <textarea name="text" rows="5" placeholder="Conte como foi sua experiencia com este produto." required></textarea>
        </label>
        <label class="review-photo-field">
          <span>Foto do produto (opcional)</span>
          <input type="file" name="photo" accept="image/*" data-review-photo-input />
        </label>
        ${reviewPhotoPreviewMarkup()}
        <p class="review-form-note">Envie uma foto mostrando a cor real, caimento ou acabamento do produto.</p>
        <button class="btn primary" type="submit">Enviar avaliacao</button>
      </form>
    `;
  }

  function sellerCardMarkup(seller) {
    if (!seller) return "";

    return `
      <aside class="product-seller-card">
        <div class="product-seller-card__head">
          <div>
            <p class="eyebrow">Loja responsavel</p>
            <h2>${escapeHtml(seller.name)}</h2>
          </div>
          <span class="review-badge">Parceiro</span>
        </div>

        <div class="product-seller-profile">
          <img src="${escapeHtml(seller.avatar)}" alt="Perfil da loja ${escapeHtml(seller.name)}" loading="lazy" />
          <strong>${escapeHtml(seller.name)}</strong>
          <span>${escapeHtml(seller.headline || "Loja parceira da plataforma")}</span>
          <small>${escapeHtml(seller.city || "")}</small>
        </div>

        <div class="product-seller-rating">
          <span class="rating-stars">${renderStars(seller.rating)}</span>
          <strong>${Number(seller.rating || 0).toFixed(1)}</strong>
          <span>${Number(seller.reviewCount || 0)} avaliacao(oes) na loja</span>
        </div>

        <div class="product-seller-stats">
          <article>
            <strong>${Number(seller.completedSales || 0)}</strong>
            <span>vendas da loja</span>
          </article>
          <article>
            <strong>${Number(seller.productSales || 0)}</strong>
            <span>vendas deste produto</span>
          </article>
          <article>
            <strong>${Number(seller.productCount || 0)}</strong>
            <span>produtos ativos</span>
          </article>
          <article>
            <strong>${Number(seller.productReviewCount || 0)}</strong>
            <span>comentarios no item</span>
          </article>
        </div>

        <p class="product-seller-card__copy">Esse produto esta sendo vendido por um comerciante parceiro dentro da sua loja.</p>
      </aside>
    `;
  }

  function cepModalMarkup() {
    if (!cepModalOpen) return "";

    const found = cepLookupResult;

    return `
      <div class="cep-modal" role="dialog" aria-modal="true" aria-label="Informar CEP para entrega">
        <button class="cep-modal__backdrop" type="button" data-cep-close aria-label="Fechar"></button>
        <div class="cep-modal__panel">
          <button class="cep-modal__close" type="button" data-cep-close aria-label="Fechar">&times;</button>
          <p class="eyebrow">CEP</p>
          <h3>Calcular entrega</h3>
          <p class="cep-modal__copy">Informe o CEP e o sistema reconhece rua, bairro, cidade e estado. Depois voce completa so o numero.</p>

          <form class="cep-form" data-cep-form>
            <div class="cep-form__row">
              <label>
                CEP
                <input type="text" name="cep" inputmode="numeric" placeholder="00000-000" value="${escapeHtml(cepDraft)}" data-cep-input />
              </label>
              <button class="btn secondary" type="button" data-cep-lookup ${cepLookupLoading ? "disabled" : ""}>${cepLookupLoading ? "Buscando..." : "Buscar CEP"}</button>
            </div>

            <div class="cep-form__result${found ? " is-visible" : ""}">
              <strong>${escapeHtml(found?.street || "Rua nao localizada ainda")}</strong>
              <span>${escapeHtml(found?.district || "Bairro")}</span>
              <span>${escapeHtml([found?.city || "", found?.state || ""].filter(Boolean).join(" - ") || "Cidade - UF")}</span>
            </div>

            <label>
              Numero da residencia
              <input type="text" name="number" inputmode="numeric" placeholder="Ex.: 320" value="${escapeHtml(numberDraft)}" data-address-number />
            </label>

            <p class="cep-form__message${cepLookupError ? " is-error" : ""}${cepLookupSuccess ? " is-success" : ""}">${escapeHtml(cepLookupMessage || "Digite um CEP valido para continuar.")}</p>

            <div class="cep-form__actions">
              <button class="btn secondary" type="button" data-cep-close>Cancelar</button>
              <button class="btn primary" type="submit" ${cepLookupLoading ? "disabled" : ""}>Salvar endereco</button>
            </div>
          </form>
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
    const seller = typeof catalog.getProductSeller === "function" ? catalog.getProductSeller(product.id) : null;
    const isFavorite = catalog.isFavorite(product.id);
    const reviewAccess = catalog.getProductReviewAccess(product.id);
    const variants = getDisplayVariants();
    const selectedVariant = ensureSelectedVariant();
    const sizes = getProductSizes();
    const selectedSizeLabel = ensureSelectedSize();
    const soldOut = !selectedVariant || Number(selectedVariant.stock || 0) <= 0;
    const selectedColorLabel = selectedVariant?.colorName || "Indisponivel";
    const reviewCount = reviews.length;
    const reviewAverage = reviewCount ? summary.average.toFixed(1) : "Novo";
    const reviewStars = reviewCount ? renderStars(summary.average) : renderStars(0);
    const soldCount = Math.max(0, Number(summary.sold || 0));
    const soldLabel = soldCount
      ? `+ ${soldCount} ${soldCount === 1 ? "venda confirmada" : "vendas confirmadas"}`
      : "+ novo na vitrine";
    if (!reviewAccess.allowed) {
      pendingReviewPhoto = "";
      pendingReviewPhotoName = "";
    }
    document.body.classList.toggle("has-product-gallery", galleryOpen);
    document.body.classList.toggle("has-cep-modal", cepModalOpen);

    renderTopHighlights(buildTopReferences());
    root.innerHTML = `
      <div class="product-detail-grid">
        <section class="product-detail-media">
          <img src="${selectedVariant?.image || product.image}" data-fallback-src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
        </section>

        <section class="product-detail-panel">
          <div class="product-detail-headbar">
            <div class="product-rating-ribbon" aria-label="Nota media do produto">
              <strong>${escapeHtml(reviewAverage)}</strong>
              <span class="rating-stars">${reviewStars}</span>
            </div>
            <button class="product-favorite-heart${isFavorite ? " is-active" : ""}" type="button" data-favorite-toggle aria-label="${favoriteHeartLabel(isFavorite)}" aria-pressed="${isFavorite ? "true" : "false"}">${favoriteHeartMarkup(isFavorite)}</button>
          </div>
          <p class="product-sales-copy">${escapeHtml(soldLabel)}</p>
          <h1>${escapeHtml(product.name)}</h1>

          <div class="product-quantity-box${soldOut ? " is-sold-out" : ""}">
            <div class="product-variant-stack">
              <div class="product-variant-current" aria-live="polite">
                <div class="product-variant-current__copy">
                  <strong>cor:</strong>
                  <span>${escapeHtml(selectedColorLabel)}</span>
                </div>
                <div class="product-variant-current__tools">
                  <small>${variants.length} cor(es)</small>
                  <button class="product-media-expand" type="button" data-gallery-open>Ampliar imagem</button>
                </div>
              </div>
              <div class="product-variant-list" role="list" aria-label="Variantes de cor disponiveis">
                ${variants.length ? variants.map((variant) => variantCard(variant, variant.id === selectedVariant?.id)).join("") : '<span class="product-variant-empty">Produto esgotado no momento.</span>'}
              </div>
              <div class="product-size-panel">
                <div class="product-size-panel__head">
                  <div class="product-size-panel__current" aria-live="polite">
                    <strong>Tamanho:</strong>
                    <span>${escapeHtml(selectedSizeLabel || "Indisponivel")}</span>
                  </div>
                  <small>${sizes.length} opcao(oes)</small>
                </div>
                <div class="product-size-list" role="list" aria-label="Tamanhos disponiveis">
                  ${sizes.length ? sizes.map((size) => sizeCard(size, normalizeSizeToken(size) === normalizeSizeToken(selectedSizeLabel))).join("") : '<span class="product-size-empty">Sem tamanhos cadastrados.</span>'}
                </div>
              </div>
              <span class="product-variant-status">${soldOut ? "Sem estoque nessa cor" : "Cor pronta para compra"}</span>
            </div>
          </div>

          <div class="product-purchase-box${soldOut ? " is-sold-out" : ""}">
            <div class="product-detail-price">
              <span class="product-detail-price__compare">${catalog.formatBRL(catalog.oldPrice(product.price))}</span>
              <div class="product-detail-price__pix">
                <strong>${catalog.formatBRL(catalog.pixPrice(product.price))}</strong>
                <span>no pix</span>
              </div>
              <small>ou ${catalog.formatBRL(product.price)}</small>
            </div>

            ${deliveryCardMarkup(1)}

            <div class="product-inline-qty">
              <span>Quantidade</span>
              <div class="quantity-stepper${soldOut ? " is-disabled" : ""}">
                <button type="button" data-qty-step="-1" ${soldOut ? "disabled" : ""}>-</button>
                <input id="product-qty" type="number" min="1" max="${Math.max(1, Number(selectedVariant?.stock || 1))}" value="1" ${soldOut ? "disabled" : ""} />
                <button type="button" data-qty-step="1" ${soldOut ? "disabled" : ""}>+</button>
              </div>
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
        <article class="product-reviews-card product-reviews-card--expanded">
          <div class="product-reviews-card__head">
            <div>
              <p class="eyebrow">Avaliacoes</p>
              <h2>O que clientes estao dizendo</h2>
              <p class="product-reviews-card__copy">Agora essa area fica focada em comentarios reais, estrelas e foto enviada pelos clientes.</p>
            </div>
            <span class="review-badge">${reviewCount} comentario(s)</span>
          </div>
          <div class="product-reviews-body">
            <div class="product-reviews-stream">
              <div class="product-reviews-overview">
                <div class="product-reviews-overview__score">
                  <strong>${reviewAverage}</strong>
                  <span class="rating-stars">${reviewStars}</span>
                </div>
                <p>${reviewCount ? "Avaliacoes com comentario, foto opcional e nota por estrelas." : "Seja o primeiro cliente a mandar comentario, estrelas e foto real do produto."}</p>
              </div>
              <div class="review-list">
                ${reviewCount ? reviews.slice(0, 8).map(reviewCard).join("") : '<article class="review-empty-card"><strong>Nenhuma avaliacao ainda.</strong><p>Esse espaco agora fica reservado para comentarios dos clientes com foto e estrelas.</p></article>'}
              </div>
            </div>

            ${reviewFormPanelMarkup(reviewAccess)}
          </div>
        </article>

        ${sellerCardMarkup(seller)}
      </section>

      <section class="related-products-block">
        <div class="related-products-head">
          <div>
            <p class="eyebrow">Relacionados</p>
            <h2>Adicionar mais produtos</h2>
          </div>
          <a class="btn secondary" href="/#produtos">Ver vitrine completa</a>
        </div>
        <div class="related-products-grid">
          ${related.map(relatedCard).join("")}
        </div>
      </section>

      ${galleryModalMarkup(variants)}
      ${cepModalMarkup()}
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
    const cepOpen = event.target instanceof Element ? event.target.closest("[data-cep-open]") : null;
    if (cepOpen) {
      openCepModal();
      renderProduct();
      return;
    }

    const cepClose = event.target instanceof Element ? event.target.closest("[data-cep-close]") : null;
    if (cepClose) {
      closeCepModal();
      renderProduct();
      return;
    }

    const cepLookup = event.target instanceof Element ? event.target.closest("[data-cep-lookup]") : null;
    if (cepLookup) {
      lookupCep(cepDraft);
      return;
    }

    const galleryOpenButton = event.target instanceof Element ? event.target.closest("[data-gallery-open]") : null;
    if (galleryOpenButton) {
      galleryOpen = true;
      galleryIndex = Math.max(0, getDisplayVariants().findIndex((variant) => variant.id === selectedVariantId));
      renderProduct();
      return;
    }

    const galleryClose = event.target instanceof Element ? event.target.closest("[data-gallery-close]") : null;
    if (galleryClose) {
      galleryOpen = false;
      renderProduct();
      return;
    }

    const galleryStep = event.target instanceof Element ? event.target.closest("[data-gallery-step]") : null;
    if (galleryStep) {
      const variants = getDisplayVariants();
      if (!variants.length) return;
      galleryIndex = Math.max(0, variants.findIndex((variant) => variant.id === selectedVariantId));
      galleryIndex = (galleryIndex + Number(galleryStep.getAttribute("data-gallery-step") || 0) + variants.length) % variants.length;
      selectedVariantId = String(variants[galleryIndex]?.id || selectedVariantId);
      updateVariantInUrl(selectedVariantId);
      galleryOpen = true;
      renderProduct();
      return;
    }

    const gallerySelect = event.target instanceof Element ? event.target.closest("[data-gallery-select]") : null;
    if (gallerySelect) {
      selectedVariantId = String(gallerySelect.getAttribute("data-gallery-select") || selectedVariantId);
      updateVariantInUrl(selectedVariantId);
      galleryOpen = false;
      renderProduct();
      return;
    }

    const variantButton = event.target instanceof Element ? event.target.closest("[data-variant-select]") : null;
    if (variantButton) {
      selectedVariantId = String(variantButton.getAttribute("data-variant-select") || "");
      updateVariantInUrl(selectedVariantId);
      renderProduct();
      showFeedback(Number(getSelectedVariant()?.stock || 0) > 0 ? `Cor ${getSelectedVariant()?.colorName || "selecionada"}.` : `Cor ${getSelectedVariant()?.colorName || "selecionada"} sem estoque no momento.`);
      return;
    }

    const sizeButton = event.target instanceof Element ? event.target.closest("[data-size-select]") : null;
    if (sizeButton) {
      selectedSize = normalizeSizeToken(sizeButton.getAttribute("data-size-select") || "");
      updateSizeInUrl(selectedSize);
      renderProduct();
      showFeedback(`Tamanho ${getSelectedSize() || "selecionado"} selecionado.`);
      return;
    }

    const step = event.target instanceof Element ? event.target.closest("[data-qty-step]") : null;
    if (step) {
      setQty(currentQty() + Number(step.getAttribute("data-qty-step") || 0));
      return;
    }

    const clearPhoto = event.target instanceof Element ? event.target.closest("[data-review-photo-clear]") : null;
    if (clearPhoto) {
      clearPendingReviewPhoto();
      showFeedback("Foto removida da avaliacao.");
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

  root.addEventListener("error", (event) => {
    const image = event.target instanceof HTMLImageElement ? event.target : null;
    if (!image) return;
    const fallback = String(image.getAttribute("data-fallback-src") || "").trim();
    if (!fallback) return;
    if (image.src === fallback) {
      image.removeAttribute("data-fallback-src");
      return;
    }
    image.src = fallback;
    image.removeAttribute("data-fallback-src");
  }, true);

  document.addEventListener("keydown", (event) => {
    if (cepModalOpen && event.key === "Escape") {
      closeCepModal();
      renderProduct();
      return;
    }

    if (!galleryOpen) return;

    if (event.key === "Escape") {
      galleryOpen = false;
      renderProduct();
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const variants = getDisplayVariants();
    if (!variants.length) return;

    galleryIndex = Math.max(0, variants.findIndex((variant) => variant.id === selectedVariantId));
    galleryIndex = (galleryIndex + (event.key === "ArrowRight" ? 1 : -1) + variants.length) % variants.length;
    selectedVariantId = String(variants[galleryIndex]?.id || selectedVariantId);
    updateVariantInUrl(selectedVariantId);
    galleryOpen = true;
    renderProduct();
  });

  root.addEventListener("input", (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target.closest("#product-qty") : null;
    if (input) {
      setQty(input.value || 1);
      return;
    }

    const cepInput = event.target instanceof HTMLInputElement ? event.target.closest("[data-cep-input]") : null;
    if (cepInput) {
      cepDraft = normalizeCep(cepInput.value || "");
      cepInput.value = cepDraft;
      if (digitsOnly(cepDraft).length !== 8) {
        cepLookupResult = null;
        cepLookupMessage = "";
        cepLookupError = false;
      }
      return;
    }

    const numberInput = event.target instanceof HTMLInputElement ? event.target.closest("[data-address-number]") : null;
    if (numberInput) {
      numberDraft = String(numberInput.value || "").trim();
    }
  });

  root.addEventListener("change", async (event) => {
    const input = event.target instanceof HTMLInputElement ? event.target.closest("[data-review-photo-input]") : null;
    if (input) {
      await handleReviewPhotoSelection(input.files?.[0] || null);
      return;
    }

    const cepInput = event.target instanceof HTMLInputElement ? event.target.closest("[data-cep-input]") : null;
    if (cepInput && digitsOnly(cepDraft).length === 8) {
      await lookupCep(cepDraft);
    }
  });

  root.addEventListener("submit", async (event) => {
    const cepForm = event.target instanceof HTMLFormElement ? event.target.closest("[data-cep-form]") : null;
    if (cepForm) {
      event.preventDefault();
      const formData = new FormData(cepForm);
      const cepValue = normalizeCep(String(formData.get("cep") || cepDraft));
      const number = String(formData.get("number") || numberDraft).trim();
      cepDraft = cepValue;
      numberDraft = number;

      let found = cepLookupResult;
      if (!found && digitsOnly(cepValue).length === 8) {
        found = await lookupCep(cepValue);
      }
      if (!found) {
        cepLookupError = true;
        cepLookupSuccess = false;
        cepLookupMessage = "Nao foi possivel localizar esse CEP.";
        renderProduct();
        return;
      }

      if (!number) {
        cepLookupError = true;
        cepLookupSuccess = false;
        cepLookupMessage = "Informe o numero da residencia.";
        renderProduct();
        return;
      }

      const current = loadShipTo();
      saveShipTo({
        ...current,
        ...found,
        number
      });
      cepLookupError = false;
      cepLookupSuccess = true;
      cepLookupMessage = "Endereco salvo com sucesso.";
      renderProduct();
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      closeCepModal();
      renderProduct();
      showFeedback("Endereco atualizado pelo CEP.");
      return;
    }

    const form = event.target instanceof HTMLFormElement ? event.target.closest("[data-review-form]") : null;
    if (!form) return;
    event.preventDefault();
    const access = catalog.getProductReviewAccess(product.id);
    if (!access.allowed) {
      clearPendingReviewPhoto();
      renderProduct();
      showFeedback(reviewAccessCopy(access).text);
      return;
    }
    const data = new FormData(form);
    const review = catalog.addProductReview(product.id, {
      name: loadProfileName(),
      rating: Number(data.get("rating") || 5),
      text: String(data.get("text") || ""),
      photo: pendingReviewPhoto,
      orderId: String(form.getAttribute("data-review-order-id") || access.orderId || "")
    });
    if (!review) {
      showFeedback("Essa avaliacao so pode ser enviada depois da confirmacao de recebimento do pedido.");
      return;
    }
    pendingReviewPhoto = "";
    pendingReviewPhotoName = "";
    renderProduct();
    showFeedback("Avaliacao enviada com sucesso.");
  });

  renderProduct();
})();
