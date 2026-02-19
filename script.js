const CART_KEY = "stopmod_cart";
const PAYMENT_KEY = "stopmod_payment_method";

const paymentLabels = {
  pix: "Pix",
  credito: "Cartao de credito",
  debito: "Cartao de debito",
  boleto: "Boleto"
};

const products = [
  {
    id: 1,
    name: "Camiseta Oversized Street",
    category: "Camisetas",
    size: "P ao GG",
    price: 89.9,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Calca Cargo Urban",
    category: "Calcas",
    size: "36 ao 46",
    price: 159.9,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Jaqueta Jeans Vintage",
    category: "Jaquetas",
    size: "P ao XG",
    price: 219.9,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Moletom Essential Stop",
    category: "Moletons",
    size: "P ao GG",
    price: 179.9,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Vestido Casual Minimal",
    category: "Vestidos",
    size: "PP ao G",
    price: 139.9,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Camisa Linho Leve",
    category: "Camisas",
    size: "P ao GG",
    price: 129.9,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80"
  }
];

const cart = [];

const productGrid = document.getElementById("product-grid");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout");
const categoryFilter = document.getElementById("category-filter");
const searchInput = document.getElementById("search-input");
const paymentMethod = document.getElementById("payment-method");
const checkoutFeedback = document.getElementById("checkout-feedback");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function populateCategories() {
  const categories = [...new Set(products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function getFilteredProducts() {
  const activeCategory = categoryFilter.value;
  const term = searchInput.value.toLowerCase().trim();

  return products.filter((product) => {
    const categoryOk = activeCategory === "all" || product.category === activeCategory;
    const textOk = !term || product.name.toLowerCase().includes(term);
    return categoryOk && textOk;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="meta">${product.category} | Tam: ${product.size}</p>
          <p class="price">R$ ${formatBRL(product.price)}</p>
          <button class="btn" onclick="addToCart(${product.id})">Adicionar ao carrinho</button>
        </div>
      </article>
    `
    )
    .join("");
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
  const saved = localStorage.getItem(PAYMENT_KEY) || "";
  paymentMethod.value = saved;
}

function savePaymentMethod() {
  localStorage.setItem(PAYMENT_KEY, paymentMethod.value);
}

function updateCheckoutButtonState() {
  checkoutButton.disabled = !cart.length || !paymentMethod.value;
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  cart.push(product);
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = "<li>Seu carrinho esta vazio.</li>";
    cartTotal.textContent = "0,00";
    updateCheckoutButtonState();
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
  updateCheckoutButtonState();
}

categoryFilter.addEventListener("change", renderProducts);
searchInput.addEventListener("input", renderProducts);

paymentMethod.addEventListener("change", () => {
  savePaymentMethod();
  checkoutFeedback.textContent = "";
  updateCheckoutButtonState();
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) return;
  if (!paymentMethod.value) {
    alert("Escolha uma forma de pagamento para continuar.");
    return;
  }

  const method = paymentLabels[paymentMethod.value] || paymentMethod.value;
  const total = formatBRL(getCartTotal());

  checkoutFeedback.textContent = `Pedido confirmado via ${method}. Total: R$ ${total}.`;
  alert(`Pedido confirmado!\nForma de pagamento: ${method}\nTotal: R$ ${total}`);

  cart.length = 0;
  saveCart();
  renderCart();
});

populateCategories();
loadPaymentMethod();
loadCart();
renderProducts();
renderCart();
