const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const DEFAULT_GOOGLE_CLIENT_ID = "887504211072-0elgoi3dbg80bb9640vvlqfl7cp8guq5.apps.googleusercontent.com";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const USERS_KEY = "stopmod_users";
const OTP_KEY = "stopmod_otp";
const FACEBOOK_APP_ID_KEY = "stopmod_facebook_app_id";
const DEFAULT_FACEBOOK_APP_ID = "484889158765114";
const FACEBOOK_OAUTH_STATE_KEY = "stopmod_facebook_oauth_state";
const FACEBOOK_PENDING_NEXT_KEY = "stopmod_facebook_pending_next";

const loginForm = document.getElementById("login-form");
const loginId = document.getElementById("login-id");
const loginPass = document.getElementById("login-pass");
const pwToggle = document.getElementById("pw-toggle");
const forgotBtn = document.getElementById("forgot");
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

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

function setMsg(el, text, isErr = false) {
  if (!el) return;
  el.textContent = text || "";
  el.classList.toggle("err", !!isErr);
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function phoneDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function saveProfile(name, email, picture = "") {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, email, picture }));
}

function saveExtra(displayName, phone) {
  localStorage.setItem(PROFILE_EXTRA_KEY, JSON.stringify({ displayName, phone }));
}

function setAuthSessionActive() {
  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(Date.now()));
}

function loadFacebookAppId() {
  const raw = String(localStorage.getItem(FACEBOOK_APP_ID_KEY) || "").trim();
  if (/^\d+$/.test(raw)) return raw;
  if (/^\d+$/.test(DEFAULT_FACEBOOK_APP_ID)) return DEFAULT_FACEBOOK_APP_ID;
  return "";
}

function saveFacebookAppId(appId) {
  localStorage.setItem(FACEBOOK_APP_ID_KEY, String(appId || "").trim());
}

function normalizeNextPath(raw) {
  const next = String(raw || "").trim();
  if (!next) return "";
  if (/^[a-z]+:\/\//i.test(next)) return "";
  if (next.startsWith("../") || next.startsWith("./") || next.startsWith("/")) return next;
  return "";
}

function resolveRequestedPostLoginUrl() {
  try {
    const raw = String(new URLSearchParams(window.location.search).get("next") || "").trim();
    return normalizeNextPath(raw) || "../perfil/";
  } catch {
    return "../perfil/";
  }
}

function resolvePostLoginUrl() {
  const pending = normalizeNextPath(localStorage.getItem(FACEBOOK_PENDING_NEXT_KEY) || "");
  if (pending) {
    localStorage.removeItem(FACEBOOK_PENDING_NEXT_KEY);
    return pending;
  }
  return resolveRequestedPostLoginUrl();
}

function randomStateToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function clearOAuthHashFromUrl() {
  if (!window.location.hash) return;
  const clean = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", clean);
}

function startFacebookOAuthFallback(appId) {
  window.location.href = buildFacebookLoginUrl(appId);
}

function getFacebookRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

function buildFacebookLoginUrl(appId) {
  localStorage.setItem(FACEBOOK_PENDING_NEXT_KEY, resolveRequestedPostLoginUrl());
  const redirectUri = getFacebookRedirectUri();
  const state = randomStateToken();
  localStorage.setItem(FACEBOOK_OAUTH_STATE_KEY, state);

  const oauthUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", appId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("response_type", "token");
  oauthUrl.searchParams.set("scope", "public_profile,email");
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("display", "popup");
  oauthUrl.searchParams.set("locale", "pt_BR");

  const loginUrl = new URL("https://www.facebook.com/login.php");
  loginUrl.searchParams.set("skip_api_login", "1");
  loginUrl.searchParams.set("api_key", appId);
  loginUrl.searchParams.set("kid_directed_site", "0");
  loginUrl.searchParams.set("app_id", appId);
  loginUrl.searchParams.set("signed_next", "1");
  loginUrl.searchParams.set("locale", "pt_BR");
  loginUrl.searchParams.set("next", oauthUrl.toString());
  return loginUrl.toString();
}

async function consumeFacebookOAuthCallback() {
  const hash = String(window.location.hash || "");
  if (!hash.startsWith("#")) return false;

  const params = new URLSearchParams(hash.slice(1));
  const accessToken = String(params.get("access_token") || "").trim();
  const error = String(params.get("error") || params.get("error_reason") || "").trim();
  const state = String(params.get("state") || "").trim();
  if (!accessToken && !error) return false;

  const expectedState = String(localStorage.getItem(FACEBOOK_OAUTH_STATE_KEY) || "").trim();
  localStorage.removeItem(FACEBOOK_OAUTH_STATE_KEY);
  clearOAuthHashFromUrl();

  if (error) {
    setMsg(msg, "Login Facebook cancelado ou nao autorizado.", true);
    return true;
  }
  if (expectedState && state !== expectedState) {
    setMsg(msg, "Falha de seguranca no retorno do Facebook. Tente novamente.", true);
    return true;
  }

  setMsg(msg, "Finalizando login Facebook...", false);
  try {
    const profileUrl =
      "https://graph.facebook.com/me?fields=id,name,email,picture.width(256).height(256)" +
      `&access_token=${encodeURIComponent(accessToken)}`;
    const profileResp = await fetch(profileUrl, { cache: "no-store" }).then((resp) => {
      if (!resp.ok) throw new Error("facebook_graph_error");
      return resp.json();
    });
    if (!profileResp || profileResp.error) throw new Error("facebook_profile_error");

    const name = String(profileResp.name || "Cliente Stop mod");
    const email = String(profileResp.email || "");
    const picture = String(profileResp?.picture?.data?.url || "");
    const accountKey = email ? norm(email) : `fb:${String(profileResp.id || "").trim()}`;
    const user = upsertUser({ key: accountKey, name, email, phone: "", pass: "", picture });
    finishLogin({ ...user, name, email, picture });
    return true;
  } catch {
    setMsg(msg, "Falha ao carregar dados da conta Facebook.", true);
    return true;
  }
}

function openModal(title, html) {
  if (!modal || !modalBody || !modalTitle) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.hidden = false;
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  if (modalBody) modalBody.innerHTML = "";
}

modal?.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.hidden) closeModal();
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data || {};
  if (data.source !== "stopmod-login-success") return;
  const target = String(data.target || resolvePostLoginUrl());
  window.location.href = target;
});

window.addEventListener("storage", (event) => {
  if (event.key === PROFILE_KEY && event.newValue) {
    window.location.href = resolvePostLoginUrl();
  }
});

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

function saveOtp(purpose, to, code) {
  const payload = { purpose, to, code, createdAt: Date.now() };
  localStorage.setItem(OTP_KEY, JSON.stringify(payload));
  return payload;
}

function loadOtp() {
  try {
    return JSON.parse(localStorage.getItem(OTP_KEY) || "null");
  } catch {
    return null;
  }
}

function clearOtp() {
  localStorage.removeItem(OTP_KEY);
}

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpStillValid(otp) {
  if (!otp || !otp.createdAt) return false;
  return Date.now() - Number(otp.createdAt) < 10 * 60 * 1000;
}

function findUserByAny(id) {
  const users = loadUsers();
  const key = norm(id);
  const digits = phoneDigits(id);
  return users.find((u) =>
    norm(u.key) === key ||
    norm(u.email) === key ||
    norm(u.name) === key ||
    (digits && phoneDigits(u.phone) === digits)
  );
}

function upsertUser(user) {
  const users = loadUsers();
  const key = norm(user.key || user.email || user.phone || user.name);
  const digits = phoneDigits(user.phone);
  const idx = users.findIndex((u) =>
    norm(u.key) === key ||
    (digits && phoneDigits(u.phone) === digits) ||
    (user.email && norm(u.email) === norm(user.email))
  );
  if (idx >= 0) {
    // Keep stable key, but move updated user to the top (so return value is correct).
    const merged = { ...users[idx], ...user, key: users[idx].key || key };
    users.splice(idx, 1);
    users.unshift(merged);
  } else {
    users.unshift({ ...user, key });
  }
  saveUsers(users.slice(0, 200));
  return users[0];
}

function finishLogin(user) {
  saveProfile(String(user.name || "Cliente Stop mod"), String(user.email || ""), String(user.picture || ""));
  saveExtra(String(user.name || ""), String(user.phone || ""));
  setAuthSessionActive();
  const target = resolvePostLoginUrl();
  if (window.opener && window.opener !== window) {
    try {
      window.opener.postMessage({ source: "stopmod-login-success", target }, window.location.origin);
    } catch {}
    window.close();
    return;
  }
  window.location.href = target;
}

forgotBtn?.addEventListener("click", () => {
  openModal(
    "Recuperar senha",
    `
    <div class="modal-body">
      <p class="hint">Digite seu email, telefone ou usuario. Vamos gerar um codigo (demo) para trocar sua senha.</p>
      <input id="fp-id" type="text" placeholder="Email/Telefone/Usuario" autocomplete="username" />
      <button id="fp-send" class="btn primary" type="button">Enviar codigo</button>
      <div id="fp-step2" hidden>
        <div class="codebox" id="fp-codebox"></div>
        <input id="fp-code" type="text" inputmode="numeric" placeholder="Codigo (6 digitos)" />
        <input id="fp-new" type="password" placeholder="Nova senha" autocomplete="new-password" />
        <div class="actions">
          <button id="fp-confirm" class="btn primary" type="button">Salvar senha</button>
          <button class="btn ghost" type="button" data-close="1">Cancelar</button>
        </div>
      </div>
      <p id="fp-msg" class="msg"></p>
    </div>
    `
  );

  const fpId = document.getElementById("fp-id");
  const fpSend = document.getElementById("fp-send");
  const fpStep2 = document.getElementById("fp-step2");
  const fpCodeBox = document.getElementById("fp-codebox");
  const fpCode = document.getElementById("fp-code");
  const fpNew = document.getElementById("fp-new");
  const fpConfirm = document.getElementById("fp-confirm");
  const fpMsg = document.getElementById("fp-msg");

  fpSend?.addEventListener("click", () => {
    const id = String(fpId?.value || "").trim();
    const user = findUserByAny(id);
    if (!user) {
      setMsg(fpMsg, "Conta nao encontrada.", true);
      return;
    }
    const code = genCode();
    // Store either phone digits or normalized id, so it can be found again.
    const digits = phoneDigits(id);
    const to = digits.length >= 10 ? digits : norm(id);
    saveOtp("forgot", to, code);
    fpStep2.hidden = false;
    fpCodeBox.textContent = `Codigo enviado (demo): ${code}`;
    setMsg(fpMsg, "Codigo gerado. Digite acima para trocar a senha.", false);
  });

  fpConfirm?.addEventListener("click", () => {
    const otp = loadOtp();
    if (!otpStillValid(otp) || otp.purpose !== "forgot") {
      setMsg(fpMsg, "Codigo expirou. Gere um novo.", true);
      return;
    }
    const code = String(fpCode?.value || "").trim();
    if (code !== String(otp.code)) {
      setMsg(fpMsg, "Codigo incorreto.", true);
      return;
    }
    const newPass = String(fpNew?.value || "");
    if (!newPass || newPass.length < 4) {
      setMsg(fpMsg, "Senha muito curta (min 4).", true);
      return;
    }
    const user = findUserByAny(otp.to);
    if (!user) {
      setMsg(fpMsg, "Conta nao encontrada.", true);
      return;
    }
    upsertUser({ ...user, pass: newPass });
    clearOtp();
    setMsg(fpMsg, "Senha atualizada. Voce ja pode entrar.", false);
  });
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
  const clientId = String(localStorage.getItem(GOOGLE_CLIENT_KEY) || DEFAULT_GOOGLE_CLIENT_ID || "").trim();
  if (!clientId) {
    openModal(
      "Configurar Google",
      `
      <div class="modal-body">
        <p class="hint">Para login Google funcionar em site estatico, voce precisa do Client ID.</p>
        <input id="gcid" type="text" placeholder="ex: 123.apps.googleusercontent.com" />
        <div class="actions">
          <button id="gcid-save" class="btn primary" type="button">Salvar</button>
          <button class="btn ghost" type="button" data-close="1">Cancelar</button>
        </div>
        <p class="hint">Voce tambem pode configurar em Perfil.</p>
        <p id="gcid-msg" class="msg"></p>
      </div>
      `
    );
    const gcid = document.getElementById("gcid");
    const gcidSave = document.getElementById("gcid-save");
    const gcidMsg = document.getElementById("gcid-msg");
    gcidSave?.addEventListener("click", () => {
      const v = String(gcid?.value || "").trim();
      if (!v) {
        setMsg(gcidMsg, "Informe o Client ID.", true);
        return;
      }
      localStorage.setItem(GOOGLE_CLIENT_KEY, v);
      setMsg(gcidMsg, "Salvo. Abrindo login Google...", false);
      setTimeout(() => {
        closeModal();
        googleSignIn();
      }, 450);
    });
    return;
  }

  // Persist default so Perfil page can render the Google button without extra steps.
  if (!String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim() && DEFAULT_GOOGLE_CLIENT_ID) {
    localStorage.setItem(GOOGLE_CLIENT_KEY, DEFAULT_GOOGLE_CLIENT_ID);
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
          finishLogin({ name, email, picture, phone: "" });
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
  finishLogin({ name, email, phone, picture: "" });
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = String(loginId?.value || "").trim();
  const pass = String(loginPass?.value || "");

  if (!id || !pass) {
    setMsg(msg, "Preencha usuario e senha.", true);
    return;
  }

  const user = findUserByAny(id);

  if (!user || String(user.pass) !== pass) {
    if (user && !String(user.pass || "")) {
      setMsg(msg, "Essa conta foi criada por login social (Google). Use o botao Google.", true);
      return;
    }
    setMsg(msg, "Login invalido. Verifique usuario e senha.", true);
    return;
  }

  finishLogin({
    name: String(user.name || "Cliente Stop mod"),
    email: String(user.email || ""),
    phone: String(user.phone || ""),
    picture: ""
  });
});

// Default state
void consumeFacebookOAuthCallback();
showRegister(false);
