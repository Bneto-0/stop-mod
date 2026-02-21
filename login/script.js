const GOOGLE_CLIENT_KEY = "stopmod_google_client_id";
const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const USERS_KEY = "stopmod_users";
const OTP_KEY = "stopmod_otp";

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
  saveProfile(String(user.name || "Cliente Stop mod"), String(user.email || ""), "");
  saveExtra(String(user.name || ""), String(user.phone || ""));
  window.location.href = "../perfil/";
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

smsBtn?.addEventListener("click", () => {
  openModal(
    "Login com SMS",
    `
    <div class="modal-body">
      <p class="hint">Digite seu telefone. Vamos gerar um codigo (demo) para entrar.</p>
      <input id="sms-phone" type="text" placeholder="Telefone" inputmode="tel" autocomplete="tel" />
      <button id="sms-send" class="btn primary" type="button">Enviar codigo</button>
      <div id="sms-step2" hidden>
        <div class="codebox" id="sms-codebox"></div>
        <input id="sms-code" type="text" inputmode="numeric" placeholder="Codigo (6 digitos)" />
        <div class="actions">
          <button id="sms-confirm" class="btn primary" type="button">Entrar</button>
          <button class="btn ghost" type="button" data-close="1">Cancelar</button>
        </div>
      </div>
      <p id="sms-msg" class="msg"></p>
    </div>
    `
  );

  const smsPhone = document.getElementById("sms-phone");
  const smsSend = document.getElementById("sms-send");
  const smsStep2 = document.getElementById("sms-step2");
  const smsCodeBox = document.getElementById("sms-codebox");
  const smsCode = document.getElementById("sms-code");
  const smsConfirm = document.getElementById("sms-confirm");
  const smsMsg = document.getElementById("sms-msg");

  smsSend?.addEventListener("click", () => {
    const phone = String(smsPhone?.value || "").trim();
    const digits = phoneDigits(phone);
    if (digits.length < 10) {
      setMsg(smsMsg, "Informe um telefone valido.", true);
      return;
    }
    const code = genCode();
    saveOtp("sms", digits, code);
    smsStep2.hidden = false;
    smsCodeBox.textContent = `Codigo (demo): ${code}`;
    setMsg(smsMsg, "Codigo gerado. Digite acima para entrar.", false);
  });

  smsConfirm?.addEventListener("click", () => {
    const otp = loadOtp();
    if (!otpStillValid(otp) || otp.purpose !== "sms") {
      setMsg(smsMsg, "Codigo expirou. Gere um novo.", true);
      return;
    }
    const code = String(smsCode?.value || "").trim();
    if (code !== String(otp.code)) {
      setMsg(smsMsg, "Codigo incorreto.", true);
      return;
    }
    const digits = String(otp.to || "");
    let user = findUserByAny(digits);
    if (!user) {
      user = upsertUser({ name: "Cliente Stop mod", phone: digits, email: "", pass: "" });
    }
    clearOtp();
    finishLogin(user);
  });
});

fbBtn?.addEventListener("click", () => {
  openModal(
    "Continuar com Facebook",
    `
    <div class="modal-body">
      <p class="hint">Como o site e estatico, este login funciona em modo demo. Digite seu nome/email para continuar.</p>
      <input id="fb-name" type="text" placeholder="Nome" autocomplete="name" />
      <input id="fb-email" type="email" placeholder="Email" autocomplete="email" />
      <div class="actions">
        <button id="fb-ok" class="btn primary" type="button">Continuar</button>
        <button class="btn ghost" type="button" data-close="1">Cancelar</button>
      </div>
      <p id="fb-msg" class="msg"></p>
    </div>
    `
  );

  const fbName = document.getElementById("fb-name");
  const fbEmail = document.getElementById("fb-email");
  const fbOk = document.getElementById("fb-ok");
  const fbMsg = document.getElementById("fb-msg");

  fbOk?.addEventListener("click", () => {
    const name = String(fbName?.value || "").trim();
    const email = String(fbEmail?.value || "").trim();
    if (!name) {
      setMsg(fbMsg, "Informe seu nome.", true);
      return;
    }
    const user = upsertUser({ name, email, phone: "", pass: "" });
    finishLogin(user);
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
  const clientId = String(localStorage.getItem(GOOGLE_CLIENT_KEY) || "").trim();
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

  const user = findUserByAny(id);

  if (!user || String(user.pass) !== pass) {
    if (user && !String(user.pass || "")) {
      setMsg(msg, "Essa conta foi criada por login social (SMS/Facebook/Google). Use um desses botoes.", true);
      return;
    }
    setMsg(msg, "Login invalido. Verifique usuario e senha.", true);
    return;
  }

  saveProfile(String(user.name || "Cliente Stop mod"), String(user.email || ""), "");
  saveExtra(String(user.name || ""), String(user.phone || ""));
  window.location.href = "../perfil/";
});

// Default state
showRegister(false);
