const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;
const SHIP_KEY = "stopmod_ship_to";
const LEGACY_SHIP_KEY = "stopmod_ship_cep";
const COUPON_KEY = "stopmod_coupons";
const PAY_KEY = "stopmod_payment";
const ORDERS_KEY = "stopmod_orders";

const products = [
  { id: 1, name: "Camiseta Oversized Street", category: "Camisetas", size: "P ao GG", price: 89.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Calca Cargo Urban", category: "Calcas", size: "36 ao 46", price: 159.9, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Jaqueta Jeans Vintage", category: "Jaquetas", size: "P ao XG", price: 219.9, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Moletom Essential Stop", category: "Moletons", size: "P ao GG", price: 179.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Vestido Casual Minimal", category: "Vestidos", size: "PP ao G", price: 139.9, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Camisa Linho Leve", category: "Camisas", size: "P ao GG", price: 129.9, image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Cardigan Tricot Cozy", category: "Casacos", size: "P ao G", price: 149.9, image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Blazer Minimal Preto", category: "Blazers", size: "P ao GG", price: 249.9, image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=700&q=80" },
  { id: 9, name: "Saia Midi Plissada", category: "Saias", size: "PP ao G", price: 119.9, image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=700&q=80" },
  { id: 10, name: "Short Alfaiataria", category: "Shorts", size: "36 ao 44", price: 109.9, image: "https://images.unsplash.com/photo-1542293787938-4d273c37c18d?auto=format&fit=crop&w=700&q=80" },
  { id: 11, name: "Tenis Street Clean", category: "Calcados", size: "37 ao 43", price: 239.9, image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=700&q=80" },
  { id: 12, name: "Bolsa Tote Minimal", category: "Acessorios", size: "Unico", price: 189.9, image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=700&q=80" }
];

const productById = new Map(products.map((p) => [p.id, p]));

const cartItems = document.getElementById("cart-items");
const productsBeforeWrap = document.getElementById("products-before-wrap");
const productsBeforeMain = document.getElementById("products-before-main");
const productsBeforeCents = document.getElementById("products-before-cents");
const productsNowMain = document.getElementById("products-now-main");
const productsNowCents = document.getElementById("products-now-cents");
const cartTotalMain = document.getElementById("cart-total-main");
const cartTotalCents = document.getElementById("cart-total-cents");
const itemsCount = document.getElementById("items-count");
const shippingValue = document.getElementById("shipping-value");
const freeShipCount = document.getElementById("free-ship-count");
const couponCount = document.getElementById("coupon-count");
const feedback = document.getElementById("feedback");
const checkoutBtn = document.getElementById("checkout");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const shipSummary = document.getElementById("ship-summary");
const paymentSelected = document.getElementById("payment-selected");
const checkoutModal = document.getElementById("checkout-modal");
const paymentForm = document.getElementById("payment-form");
const confirmPaymentBtn = document.getElementById("confirm-payment");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function moneyParts(value) {
  const fixed = (Number(value) || 0).toFixed(2);
  const [a, b] = fixed.split(".");
  const main = Number(a).toLocaleString("pt-BR");
  return { main, cents: b || "00" };
}

function loadCartIds() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCartIds(ids) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function loadShipTo() {
  // New format: JSON { city, cep }
  try {
    const raw = localStorage.getItem(SHIP_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") {
        return {
          city: String(obj.city || "").trim(),
          cep: normalizeCep(String(obj.cep || "")),
        };
      }
    }
  } catch {
    // ignore
  }

  // Legacy: stored CEP string
  const legacy = String(localStorage.getItem(LEGACY_SHIP_KEY) || "").trim();
  if (legacy) {
    const to = { city: "", cep: normalizeCep(legacy) };
    try {
      localStorage.setItem(SHIP_KEY, JSON.stringify(to));
    } catch {
      // ignore
    }
    return to;
  }
  return { city: "", cep: "" };
}

function shipSummaryText(to) {
  const city = String(to?.city || "").trim();
  const cep = String(to?.cep || "").trim();
  if (city && cep) return `${city} ${cep}`;
  if (cep) return cep;
  if (city) return city;
  return "Selecionar endereco";
}

function normalizeCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function isCepValid(value) {
  return String(value || "").replace(/\D/g, "").length === 8;
}

function loadCoupons() {
  try {
    const raw = JSON.parse(localStorage.getItem(COUPON_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((c) => String(c || "").trim().toUpperCase()).filter(Boolean);
  } catch {
    return [];
  }
}

function saveCoupons(coupons) {
  localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
}

function loadOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function loadPayment() {
  return String(localStorage.getItem(PAY_KEY) || "pix");
}

function savePayment(method) {
  localStorage.setItem(PAY_KEY, method);
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function openStoreProductSearch() {
  const query = String(searchInput?.value || "").trim();
  const target = query ? `../index.html?q=${encodeURIComponent(query)}#produtos` : "../index.html#produtos";
  window.location.href = target;
}

function groupedCart(ids) {
  const map = new Map();
  ids.forEach((id) => {
    const p = productById.get(id);
    if (!p) return;
    const cur = map.get(id) || { ...p, qty: 0 };
    cur.qty += 1;
    map.set(id, cur);
  });
  return Array.from(map.values());
}

function addOne(id) {
  const ids = loadCartIds();
  if (ids.length >= MAX_CART_ITEMS) {
    feedback.textContent = "Limite de 2000 itens no carrinho atingido.";
    return;
  }
  ids.push(id);
  saveCartIds(ids);
  renderCart();
}

function removeOne(id) {
  const ids = loadCartIds();
  const idx = ids.indexOf(id);
  if (idx === -1) return;
  ids.splice(idx, 1);
  saveCartIds(ids);
  renderCart();
}

function calcShipping(subtotal, itemCount, cep) {
  if (!isCepValid(cep)) return null;
  const free = subtotal >= 249.9 || itemCount >= 5;
  return free ? 0 : 19.9;
}

function calcDiscount(subtotal, coupons) {
  const unique = Array.from(new Set(coupons)).slice(0, 1);
  if (!unique.length) return 0;
  // Simples: 10% com 1 cupom (demo).
  return subtotal * 0.1;
}

function genOrderId() {
  const rnd = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `SM-${Date.now().toString(36).toUpperCase()}-${rnd}`;
}

function genTrackingCode() {
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BR${rnd}`;
}

function createOrder(paymentMethod) {
  const ids = loadCartIds();
  if (!ids.length) return null;

  const shipTo = loadShipTo();
  const coupons = loadCoupons();
  const grouped = groupedCart(ids);
  const subtotal = grouped.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = calcShipping(subtotal, ids.length, shipTo.cep);
  const discount = calcDiscount(subtotal, coupons);
  const total = Math.max(0, Math.max(0, subtotal - discount) + (shipping ?? 0));

  const order = {
    id: genOrderId(),
    createdAt: new Date().toISOString(),
    payment: String(paymentMethod || "pix"),
    shipTo,
    coupon: coupons[0] || "",
    totals: { subtotal, shipping: shipping ?? 0, discount, total },
    tracking: { code: genTrackingCode(), status: "Preparando" },
    items: grouped.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      qty: it.qty,
      image: it.image || "",
      category: it.category || "",
      size: it.size || ""
    }))
  };

  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders.slice(0, 100));
  return order;
}

function setCartExtraSpace(itemCount) {
  const extra = Math.round(Math.min(600, 120 + itemCount * 0.24));
  document.documentElement.style.setProperty("--cart-extra", `${extra}px`);
}

function updatePaymentUI(method) {
  if (!paymentSelected) return;
  const labels = {
    pix: "Pix",
    credito: "Cartao de credito",
    debito: "Cartao de debito",
    boleto: "Boleto"
  };
  paymentSelected.textContent = `com ${labels[method] || "Pix"}`;
}

function openModal() {
  if (!checkoutModal) return;
  checkoutModal.hidden = false;
}

function closeModal() {
  if (!checkoutModal) return;
  checkoutModal.hidden = true;
}

function syncPaymentRadios() {
  if (!paymentForm) return;
  const cur = loadPayment();
  const radios = paymentForm.querySelectorAll("input[name=\"pay\"]");
  radios.forEach((r) => {
    r.checked = String(r.value) === cur;
  });
}

function selectedPaymentFromModal() {
  if (!paymentForm) return "pix";
  const checked = paymentForm.querySelector("input[name=\"pay\"]:checked");
  return checked ? String(checked.value) : "pix";
}

function renderCart() {
  const ids = loadCartIds();
  updateCartCount();
  setCartExtraSpace(ids.length);

  if (!ids.length) {
    cartItems.innerHTML = "<li class=\"empty\">Seu carrinho esta vazio.</li>";
    checkoutBtn.disabled = true;
    feedback.textContent = "";
    if (itemsCount) itemsCount.textContent = "0";
    if (freeShipCount) freeShipCount.textContent = "0";
    if (shippingValue) {
      shippingValue.textContent = "--";
      shippingValue.classList.remove("free");
    }
    if (couponCount) couponCount.textContent = String(loadCoupons().length);
    if (productsBeforeWrap) productsBeforeWrap.hidden = true;
    if (productsNowMain && productsNowCents) {
      productsNowMain.textContent = "0";
      productsNowCents.textContent = "00";
    }
    if (cartTotalMain && cartTotalCents) {
      cartTotalMain.textContent = "0";
      cartTotalCents.textContent = "00";
    }
    return;
  }

  const shipTo = loadShipTo();
  if (shipSummary) shipSummary.textContent = shipSummaryText(shipTo);
  const cep = shipTo.cep;

  const term = normalizeText(searchInput?.value);
  const grouped = groupedCart(ids).filter((item) =>
    !term ? true : normalizeText(`${item.name} ${item.category} ${item.size}`).includes(term)
  );
  if (!grouped.length) {
    cartItems.innerHTML = "<li class=\"empty\">Nenhum item encontrado.</li>";
  } else {
    cartItems.innerHTML = grouped
      .map((item) => {
        const meta = [item.category, item.size].filter(Boolean).join(" | ");
        return `
        <li class="cart-item">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="cart-item-body">
            <strong>${item.name}</strong>
            ${meta ? `<div class="cart-item-meta">${meta}</div>` : ""}
            <div class="cart-item-row">
              <div class="qty-controls" aria-label="Quantidade">
                <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir">-</button>
                <span class="qty-val" aria-label="Quantidade">${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar">+</button>
              </div>
              <span class="cart-item-price">R$ ${formatBRL(item.price)}</span>
            </div>
            <div class="cart-item-meta">Subtotal: R$ ${formatBRL(item.price * item.qty)}</div>
          </div>
        </li>
      `;
      })
      .join("");
  }

  const subtotal = groupedCart(ids).reduce((sum, item) => sum + item.price * item.qty, 0);
  const coupons = loadCoupons();
  const shipping = calcShipping(subtotal, ids.length, cep);
  const discount = calcDiscount(subtotal, coupons);

  const productsBefore = subtotal;
  const productsNow = Math.max(0, subtotal - discount);
  const totalFinal = Math.max(0, productsNow + (shipping ?? 0));

  const pNow = moneyParts(productsNow);
  if (productsNowMain) productsNowMain.textContent = pNow.main;
  if (productsNowCents) productsNowCents.textContent = pNow.cents;

  if (productsBeforeWrap && productsBeforeMain && productsBeforeCents) {
    if (discount > 0.01) {
      const pBefore = moneyParts(productsBefore);
      productsBeforeMain.textContent = pBefore.main;
      productsBeforeCents.textContent = pBefore.cents;
      productsBeforeWrap.hidden = false;
    } else {
      productsBeforeWrap.hidden = true;
    }
  }

  if (cartTotalMain && cartTotalCents) {
    const t = moneyParts(totalFinal);
    cartTotalMain.textContent = t.main;
    cartTotalCents.textContent = t.cents;
  }

  if (itemsCount) itemsCount.textContent = String(ids.length);
  if (couponCount) couponCount.textContent = String(coupons.length);

  if (shippingValue) {
    if (shipping === null) {
      shippingValue.textContent = "Selecionar";
      shippingValue.classList.remove("free");
    } else if (shipping === 0) {
      shippingValue.textContent = "Gratis";
      shippingValue.classList.add("free");
    } else {
      shippingValue.textContent = `R$ ${formatBRL(shipping)}`;
      shippingValue.classList.remove("free");
    }
  }

  if (freeShipCount) {
    freeShipCount.textContent = String(shipping === 0 ? ids.length : 0);
  }

  checkoutBtn.disabled = false;
  updatePaymentUI(loadPayment());

  cartItems.querySelectorAll("button[data-action][data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      const action = String(btn.getAttribute("data-action"));
      if (action === "inc") addOne(id);
      if (action === "dec") removeOne(id);
    });
  });
}

checkoutBtn.addEventListener("click", () => {
  const ids = loadCartIds();
  if (!ids.length) return;
  if (!isCepValid(loadShipTo().cep)) {
    feedback.textContent = "Selecione o endereco de entrega antes de finalizar.";
    return;
  }
  feedback.textContent = "";
  syncPaymentRadios();
  openModal();
});

searchInput?.addEventListener("input", renderCart);
searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  openStoreProductSearch();
});

checkoutModal?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

paymentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const method = selectedPaymentFromModal();
  savePayment(method);
  updatePaymentUI(method);
  const order = createOrder(method);
  feedback.textContent = order ? `Pedido confirmado: ${order.id}` : "Pedido enviado! Obrigado pela compra.";
  saveCartIds([]);
  // Consome o cupom (1 por compra).
  saveCoupons([]);
  closeModal();
  renderCart();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && checkoutModal && !checkoutModal.hidden) {
    closeModal();
  }
});

renderCart();
