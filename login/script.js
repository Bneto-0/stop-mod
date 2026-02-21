const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const USERS_KEY = "stopmod_users";

const loginForm = document.getElementById("login-form");
const loginId = document.getElementById("login-id");
const loginPass = document.getElementById("login-pass");
const pwToggle = document.getElementById("pw-toggle");
const forgotBtn = document.getElementById("forgot");
const smsBtn = document.getElementById("sms");
const fbBtn = document.getElementById("fb");
const googleBtn = document.getElementById("google");
const msg = document.getElementById("msg");

const registerCard = document.getElementById("register-card");
const goRegister = document.getElementById("go-register");
const goLogin = document.getElementById("go-login");
const registerForm = document.getElementById("register-form");
const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPhone = document.getElementById("reg-phone");
const regPass = document.getElementById("reg-pass");
const regPwToggle = document.getElementById("reg-pw-toggle");
const regMsg = document.getElementById("reg-msg");

function setMsg(el, text, isErr = false) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.toggle("err", !!isErr);
}

function loadUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

function saveProfile(name, email, picture = "") {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, email, picture }));
}

function saveExtra(displayName, phone) {
  localStorage.setItem(PROFILE_EXTRA_KEY, JSON.stringify({ displayName, phone }));
}

function showRegister(show) {
  registerCard.hidden = !show;
  document.querySelector(".card[aria-label=\"Login\"]").hidden = !!show;
}

function togglePw(input, btn) {
  const isPw = input.type === "password";
  input.type = isPw ? "text" : "password";
  btn.textContent = isPw ? "ocultar" : "ver";
  btn.setAttribute("aria-label", isPw ? "Ocultar senha" : "Mostrar senha");
}

pwToggle?.addEventListener("click", () => togglePw(loginPass, pwToggle));
regPwToggle?.addEventListener("click", () => togglePw(regPass, regPwToggle));

goRegister?.addEventListener("click", () => {
  showRegister(true);
  setMsg(msg, "");
});

goLogin?.addEventListener("click", () => {
  showRegister(false);
  setMsg(regMsg, "");
});

forgotBtn?.addEventListener("click", () => {
  setMsg(msg, "Recuperacao de senha: em breve.", true);
});

smsBtn?.addEventListener("click", () => {
  setMsg(msg, "Login com SMS: em breve.", true);
});

fbBtn?.addEventListener("click", () => {
  setMsg(msg, "Login com Facebook: em breve.", true);
});

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

function jwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = atob(b64 + pad);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function googleSignIn() {
  const clientId = String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim();
  if (!clientId) {
    setMsg(msg, "Falta configurar o Google Client ID. Abra Perfil e salve o Client ID.", true);
    return;
  }

  ensureGoogleScript(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      setMsg(msg, "Nao foi possivel carregar o Google. Tente novamente.", true);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          if (!resp || !resp.credential) {
            setMsg(msg, "Falha no login Google.", true);
            return;
          }
          const p = jwtPayload(resp.credential) || {};
          const name = String(p.name || "Cliente Stop mod");
          const email = String(p.email || "");
          const picture = String(p.picture || "");
          saveProfile(name, email, picture);
          saveExtra(name, "");
          window.location.href = "../perfil/";
        }
      });

      // Prompt One Tap (se permitido) ou popup.
      window.google.accounts.id.prompt();
      setMsg(msg, "Abrindo login Google...", false);
    } catch {
      setMsg(msg, "Erro ao iniciar Google. Verifique o Client ID.", true);
    }
  });
}

googleBtn?.addEventListener("click", googleSignIn);

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = String(regName?.value || "").trim();
  const email = String(regEmail?.value || "").trim();
  const phone = String(regPhone?.value || "").trim();
  const pass = String(regPass?.value || "");

  if (!name || !pass) {
    setMsg(regMsg, "Preencha nome e senha.", true);
    return;
  }

  const users = loadUsers();
  const key = norm(email || phone || name);
  if (!key) {
    setMsg(regMsg, "Informe email, telefone ou nome.", true);
    return;
  }
  if (users.some((u) => norm(u.key) === key)) {
    setMsg(regMsg, "Conta ja existe. Clique em Entrar.", true);
    return;
  }

  users.unshift({ key, name, email, phone, pass });
  saveUsers(users.slice(0, 200));
  saveProfile(name, email, "");
  saveExtra(name, phone);
  window.location.href = "../perfil/";
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = String(loginId?.value || "").trim();
  const pass = String(loginPass?.value || "");

  if (!id || !pass) {
    setMsg(msg, "Preencha usuario e senha.", true);
    return;
  }

  const users = loadUsers();
  const key = norm(id);
  const user = users.find((u) =>
    norm(u.key) === key ||
    norm(u.email) === key ||
    norm(u.phone) === key ||
    norm(u.name) === key
  );

  if (!user || String(user.pass) !== pass) {
    setMsg(msg, "Login invalido. Verifique usuario e senha.", true);
    return;
  }

  saveProfile(String(user.name || "Cliente Stop mod"), String(user.email || ""), "");
  saveExtra(String(user.name || ""), String(user.phone || ""));
  window.location.href = "../perfil/";
});

// Default state
showRegister(false);

