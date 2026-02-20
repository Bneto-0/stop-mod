const CART_KEY = "stopmod_cart";
const MAX_CART_ITEMS = 2000;

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
const cartTotal = document.getElementById("cart-total");
const feedback = document.getElementById("feedback");
const checkoutBtn = document.getElementById("checkout");
const clearBtn = document.getElementById("clear-cart");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadCartIds();
  cartCount.textContent = String(ids.length);
  cartCount.style.display = ids.length ? "inline-flex" : "none";
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

function renderCart() {
  const ids = loadCartIds();
  updateCartCount();

  if (!ids.length) {
    cartItems.innerHTML = "<li class=\"empty\">Seu carrinho esta vazio.</li>";
    cartTotal.textContent = "0,00";
    checkoutBtn.disabled = true;
    feedback.textContent = "";
    return;
  }

  const term = (searchInput?.value || "").toLowerCase().trim();
  const grouped = groupedCart(ids).filter((item) =>
    !term ? true : item.name.toLowerCase().includes(term)
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

  const total = groupedCart(ids).reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatBRL(total);
  checkoutBtn.disabled = false;

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
  feedback.textContent = "Pedido enviado! Obrigado pela compra.";
  saveCartIds([]);
  renderCart();
});

clearBtn.addEventListener("click", () => {
  saveCartIds([]);
  renderCart();
});

searchInput?.addEventListener("input", renderCart);

renderCart();
