const CART_KEY = "stopmod_cart";
const PAYMENT_KEY = "stopmod_payment_method";

const paymentLabels = {
  pix: "Pix",
  credito: "Cartao de credito",
  debito: "Cartao de debito",
  boleto: "Boleto"
};

const products = [
  { id: 1, name: "Camiseta Oversized Street", price: 89.9 },
  { id: 2, name: "Calca Cargo Urban", price: 159.9 },
  { id: 3, name: "Jaqueta Jeans Vintage", price: 219.9 },
  { id: 4, name: "Moletom Essential Stop", price: 179.9 },
  { id: 5, name: "Vestido Casual Minimal", price: 139.9 },
  { id: 6, name: "Camisa Linho Leve", price: 129.9 }
];

const cart = [];

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count-page");
const checkoutButton = document.getElementById("checkout");
const paymentMethod = document.getElementById("payment-method");
const checkoutFeedback = document.getElementById("checkout-feedback");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function saveCart() {
  const ids = cart.map((item) => item.id);
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    saved.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) cart.push(product);
    });
  } catch (err) {
    console.warn("Falha ao carregar carrinho", err);
  }
}

function loadPaymentMethod() {
  paymentMethod.value = localStorage.getItem(PAYMENT_KEY) || "";
}

function savePaymentMethod() {
  localStorage.setItem(PAYMENT_KEY, paymentMethod.value);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function updateCheckoutState() {
  checkoutButton.disabled = !cart.length || !paymentMethod.value;
}

function renderCart() {
  cartCount.textContent = String(cart.length);

  if (!cart.length) {
    cartItems.innerHTML = "<li>Seu carrinho esta vazio.</li>";
    cartTotal.textContent = "0,00";
    updateCheckoutState();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
      <li>
        <span>${item.name}</span>
        <button class="remove" onclick="removeFromCart(${index})">x</button>
      </li>
    `
    )
    .join("");

  cartTotal.textContent = formatBRL(getCartTotal());
  updateCheckoutState();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

paymentMethod.addEventListener("change", () => {
  savePaymentMethod();
  checkoutFeedback.textContent = "";
  updateCheckoutState();
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) return;
  if (!paymentMethod.value) return;

  const method = paymentLabels[paymentMethod.value] || paymentMethod.value;
  const total = formatBRL(getCartTotal());
  checkoutFeedback.textContent = `Pedido confirmado via ${method}. Total: R$ ${total}.`;
  alert(`Pedido confirmado!\nForma de pagamento: ${method}\nTotal: R$ ${total}`);

  cart.length = 0;
  saveCart();
  renderCart();
});

loadPaymentMethod();
loadCart();
renderCart();
