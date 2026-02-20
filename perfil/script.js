const CART_KEY = "stopmod_cart";
const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const PROFILE_KEY = "stopmod_profile";

const cartCount = document.getElementById("cart-count");
const clientInput = document.getElementById("google-client");
const saveClientBtn = document.getElementById("save-client");
const clientMsg = document.getElementById("client-msg");
const loginMsg = document.getElementById("login-msg");
const gbtn = document.getElementById("gbtn");
const me = document.getElementById("me");
const logoutBtn = document.getElementById("logout");

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

function loadClientId() {
  return String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim();
}

function saveClientId(id) {
  localStorage.setItem(GOOGLE_CLIENT_KEY, String(id || "").trim());
}

function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function renderMe() {
  const p = loadProfile();
  if (!p) {
    me.textContent = "Nao logado.";
    return;
  }
  me.textContent = `Logado: ${p.name || "Usuario"} (${p.email || "sem email"})`;
}

function ensureGoogleScript(cb) {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    cb();
    return;
  }
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = cb;
  document.head.appendChild(s);
}

function initGoogle() {
  const clientId = loadClientId();
  if (!clientId) return;

  ensureGoogleScript(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      loginMsg.textContent = "Nao foi possivel carregar o Google. Tente novamente.";
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          // Sem backend: vamos apenas confirmar login basico e salvar um perfil fake.
          // Para validar token de verdade, precisa backend.
          if (!resp || !resp.credential) {
            loginMsg.textContent = "Falha ao entrar.";
            return;
          }
          // Nome/email reais exigem decodificar o JWT; aqui mantemos simples.
          saveProfile({ name: "Cliente Stop mod", email: "google@cliente" });
          loginMsg.textContent = "Login realizado.";
          renderMe();
        }
      });

      gbtn.innerHTML = "";
      window.google.accounts.id.renderButton(gbtn, {
        theme: "outline",
        size: "large",
        text: "continue_with"
      });
    } catch {
      loginMsg.textContent = "Erro ao iniciar Google. Verifique o Client ID.";
    }
  });
}

saveClientBtn?.addEventListener("click", () => {
  const v = String(clientInput?.value || "").trim();
  saveClientId(v);
  clientMsg.textContent = v ? "Client ID salvo." : "Client ID removido.";
  initGoogle();
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem(PROFILE_KEY);
  renderMe();
});

clientInput.value = loadClientId();
updateCartCount();
renderMe();
initGoogle();

