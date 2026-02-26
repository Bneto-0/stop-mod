const CART_KEY = "stopmod_cart";
const COUPON_KEY = "stopmod_coupons";
const NOTES_KEY = "stopmod_notifications";
const SHIP_KEY = "stopmod_ship_to";
const PROFILE_KEY = "stopmod_profile";

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
const menuLocation = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");

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

function loadShipTo() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHIP_KEY) || "{}");
    return {
      street: String(raw?.street || "").trim(),
      number: String(raw?.number || "").trim(),
      city: String(raw?.city || "").trim(),
      cep: String(raw?.cep || "").trim()
    };
  } catch {
    return { street: "", number: "", city: "", cep: "" };
  }
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadShipTo();
  const street = String(to.street || "").trim();
  const number = String(to.number || "").trim();
  const streetLine = street ? [street, number].filter(Boolean).join(", ") : "";
  menuLocation.textContent = streetLine || "Rua nao informada";
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function renderTopProfile() {
  if (!profileTopName || !profileTopLink) return;
  const profile = loadProfile();
  if (!profile) {
    profileTopName.textContent = "Perfil";
    profileTopLink.classList.remove("logged");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.removeAttribute("src");
      profileTopPhoto.alt = "";
    }
    return;
  }

  const displayName = String(profile.name || "").trim() || "Perfil";
  const picture = String(profile.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.classList.add("logged");
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

function saveCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  localStorage.setItem(COUPON_KEY, JSON.stringify(normalized ? [normalized] : []));
}

function loadNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(Array.isArray(notes) ? notes : []));
}

function userKey() {
  const p = loadProfile();
  return String(p?.email || "").trim().toLowerCase();
}

function addCouponNotification(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return;

  if (window.StopModNotifications && typeof window.StopModNotifications.add === "function") {
    window.StopModNotifications.add({
      id: `coupon-activated-${userKey() || "guest"}-${normalized}`,
      scope: "individual",
      type: "cupom",
      userKey: userKey(),
      title: `Cupom ativado: ${normalized}`,
      text: "Seu cupom esta pronto para uso no carrinho.",
      href: "/carrinho/",
      date: "Agora"
    });
    if (typeof window.StopModNotifications.sync === "function") {
      window.StopModNotifications.sync();
    }
    return;
  }

  const notes = loadNotes();
  const id = `coupon-activated-${userKey() || "guest"}-${normalized}`;
  const next = {
    id,
    scope: "individual",
    type: "cupom",
    userKey: userKey(),
    title: `Cupom ativado: ${normalized}`,
    text: "Seu cupom esta pronto para uso no carrinho.",
    href: "/carrinho/",
    date: "Agora",
    createdAt: new Date().toISOString()
  };
  const idx = notes.findIndex((n) => String(n?.id || "") === id);
  if (idx >= 0) notes[idx] = { ...notes[idx], ...next };
  else notes.unshift(next);
  saveNotes(notes.slice(0, 500));
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
      addCouponNotification(code);
      feedback.textContent = `Cupom ativado: ${code.toUpperCase()}`;
      render();
    });
  });
}

searchInput?.addEventListener("input", render);
updateCartCount();
render();
renderMenuLocation();
renderTopProfile();

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) updateCartCount();
  if (event.key === SHIP_KEY) renderMenuLocation();
  if (event.key === PROFILE_KEY) renderTopProfile();
});
