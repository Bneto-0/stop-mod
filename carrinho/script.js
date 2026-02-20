const CART_KEY = "stopmod_cart";

const products = [
  { id: 1, name: "Camiseta Oversized Street", price: 89.9 },
  { id: 2, name: "Calca Cargo Urban", price: 159.9 },
  { id: 3, name: "Jaqueta Jeans Vintage", price: 219.9 },
  { id: 4, name: "Moletom Essential Stop", price: 179.9 },
  { id: 5, name: "Vestido Casual Minimal", price: 139.9 },
  { id: 6, name: "Camisa Linho Leve", price: 129.9 },
  { id: 7, name: "Cardigan Tricot Cozy", price: 149.9 },
  { id: 8, name: "Blazer Minimal Preto", price: 249.9 },
  { id: 9, name: "Saia Midi Plissada", price: 119.9 },
  { id: 10, name: "Short Alfaiataria", price: 109.9 },
  { id: 11, name: "Tenis Street Clean", price: 239.9 },
  { id: 12, name: "Bolsa Tote Minimal", price: 189.9 }
];

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const feedback = document.getElementById("feedback");
const checkoutBtn = document.getElementById("checkout");
const clearBtn = document.getElementById("clear-cart");

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

function groupedCart(ids) {
  const map = {};
  ids.forEach((id) => {
    const p = products.find((item) => item.id === id);
    if (!p) return;
    if (!map[id]) map[id] = { ...p, qty: 0 };
    map[id].qty += 1;
  });
  return Object.values(map);
}

function renderCart() {
  const ids = loadCartIds();
  if (!ids.length) {
    cartItems.innerHTML = "<li>Seu carrinho está vazio.</li>";
    cartTotal.textContent = "0,00";
    checkoutBtn.disabled = true;
    return;
  }

  const grouped = groupedCart(ids);
  cartItems.innerHTML = grouped
    .map(
      (item) => `
      <li>
        <span>${item.name} (${item.qty}x)</span>
        <button class="remove" data-id="${item.id}">x</button>
      </li>
    `
    )
    .join("");

  const total = grouped.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatBRL(total);
  checkoutBtn.disabled = false;

  cartItems.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(Number(btn.getAttribute("data-id")));
    });
  });
}

function removeItem(id) {
  const ids = loadCartIds();
  const idx = ids.indexOf(id);
  if (idx !== -1) {
    ids.splice(idx, 1);
    saveCartIds(ids);
    renderCart();
  }
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

renderCart();
