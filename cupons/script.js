const CART_KEY = "stopmod_cart";
const COUPON_KEY = "stopmod_coupons";

// Admin edita esta lista e publica no site.
const coupons = [
  { code: "STOP10", title: "10% OFF", desc: "Desconto em produtos selecionados.", expires: "31/12/2026" },
  { code: "FRETEGRATIS", title: "Frete gratis", desc: "Frete gratis em compras elegiveis.", expires: "31/12/2026" },
  { code: "VIP15", title: "15% VIP", desc: "Cupom especial para clientes VIP.", expires: "31/12/2026" }
];

const grid = document.getElementById("coupon-grid");
const feedback = document.getElementById("feedback");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");

function loadCartIds() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
}

function saveCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  localStorage.setItem(COUPON_KEY, JSON.stringify(normalized ? [normalized] : []));
}

function loadCoupon() {
  try {
    const raw = JSON.parse(localStorage.getItem(COUPON_KEY) || "[]");
    return Array.isArray(raw) && raw[0] ? String(raw[0]).toUpperCase() : "";
  } catch {
    return "";
  }
}

function filteredCoupons() {
  const term = (searchInput?.value || "").toLowerCase().trim();
  if (!term) return coupons;
  return coupons.filter((c) =>
    c.code.toLowerCase().includes(term) ||
    c.title.toLowerCase().includes(term) ||
    c.desc.toLowerCase().includes(term)
  );
}

function render() {
  const active = loadCoupon();
  const list = filteredCoupons();
  grid.innerHTML = list
    .map((c) => {
      const isActive = active === c.code.toUpperCase();
      return `
        <article class="coupon">
          <div>
            <div class="code">${c.code} <span style="color: var(--muted); font-weight: 800;">${isActive ? "(Em uso)" : ""}</span></div>
            <div class="desc">${c.title} - ${c.desc}</div>
            <div class="meta2">Valido ate: ${c.expires}</div>
          </div>
          <div>
            <button class="btn" data-code="${c.code}">${isActive ? "Ativo" : "Ativar"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  grid.querySelectorAll("button[data-code]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = String(btn.getAttribute("data-code") || "");
      saveCoupon(code);
      feedback.textContent = `Cupom ativado: ${code.toUpperCase()}`;
      render();
    });
  });
}

searchInput?.addEventListener("input", render);
updateCartCount();
render();

