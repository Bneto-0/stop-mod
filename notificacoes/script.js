const CART_KEY = "stopmod_cart";
const COUPON_KEY = "stopmod_coupons";
const NOTES_KEY = "stopmod_notifications";

const listEl = document.getElementById("list");
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

function loadNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) || "null");
    if (Array.isArray(raw) && raw.length) return raw;
  } catch {
    // ignore
  }
  const seed = [
    { id: "n1", type: "promo", title: "Nova promocao: Blazers com desconto", text: "Acesse a aba Descontos e confira.", date: "Hoje", claimed: false },
    { id: "n2", type: "premio", title: "Voce ganhou um cupom!", text: "Resgate o cupom STOP10.", date: "Hoje", claimed: false, coupon: "STOP10" },
    { id: "n3", type: "news", title: "Colecao 2026 atualizada", text: "Novas pecas disponiveis na loja.", date: "Ontem", claimed: false }
  ];
  localStorage.setItem(NOTES_KEY, JSON.stringify(seed));
  return seed;
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function saveCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return;
  localStorage.setItem(COUPON_KEY, JSON.stringify([normalized]));
}

function filteredNotes(notes) {
  const term = (searchInput?.value || "").toLowerCase().trim();
  if (!term) return notes;
  return notes.filter((n) =>
    String(n.title || "").toLowerCase().includes(term) ||
    String(n.text || "").toLowerCase().includes(term)
  );
}

function render() {
  const notes = loadNotes();
  const list = filteredNotes(notes);
  listEl.innerHTML = list
    .map((n) => {
      const chip =
        n.type === "premio"
          ? `<span class="chip win">Premio</span>`
          : n.type === "promo"
          ? `<span class="chip">Promocao</span>`
          : `<span class="chip">Atualizacao</span>`;
      const action =
        n.coupon && !n.claimed
          ? `<button class="btn" data-claim="${n.id}">Resgatar cupom</button>`
          : n.coupon && n.claimed
          ? `<span class="meta">Cupom resgatado</span>`
          : "";
      return `
        <article class="note">
          <strong>${n.title}</strong>
          <div class="meta">${n.text}</div>
          <div class="row">
            <div style="display:flex; gap:.45rem; flex-wrap:wrap; align-items:center;">
              ${chip}
              <span class="meta">${n.date}</span>
            </div>
            ${action}
          </div>
        </article>
      `;
    })
    .join("");

  listEl.querySelectorAll("button[data-claim]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.getAttribute("data-claim"));
      const notes2 = loadNotes();
      const n = notes2.find((x) => x.id === id);
      if (!n || !n.coupon || n.claimed) return;
      saveCoupon(n.coupon);
      n.claimed = true;
      saveNotes(notes2);
      feedback.textContent = `Cupom ativado: ${String(n.coupon).toUpperCase()}`;
      render();
    });
  });
}

searchInput?.addEventListener("input", render);
updateCartCount();
render();

