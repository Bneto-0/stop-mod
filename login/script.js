const PROFILE_KEY = "stopmod_profile";
const PROFILE_EXTRA_KEY = "stopmod_profile_extra";
const AUTH_LAST_SEEN_KEY = "stopmod_auth_last_seen";
const AUTH_TOKEN_KEY = "stopmod_auth_token";
const SHIP_KEY = "stopmod_ship_to";
const SHIP_LIST_KEY = "stopmod_ship_list";
const API_BASE_KEY = "stopmod_api_base";
const PAGBANK_API_BASE_KEY = "stopmod_pagbank_api_base";

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
const regBirth = document.getElementById("reg-birth");
const regCpf = document.getElementById("reg-cpf");
const regEmail = document.getElementById("reg-email");
const regPhone = document.getElementById("reg-phone");
const regPass = document.getElementById("reg-pass");
const regPwToggle = document.getElementById("reg-pw-toggle");
const regCep = document.getElementById("reg-cep");
const regStreet = document.getElementById("reg-street");
const regNumber = document.getElementById("reg-number");
const regComplement = document.getElementById("reg-complement");
const regDistrict = document.getElementById("reg-district");
const regCity = document.getElementById("reg-city");
const regState = document.getElementById("reg-state");
const regMsg = document.getElementById("reg-msg");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

let resolvedApiBase = "";

function setMsg(el, text, isErr = false) {
  if (!el) return;
  el.textContent = String(text || "");
  el.classList.toggle("err", !!isErr);
}

function setLoading(formEl, loading, buttonText) {
  if (!formEl) return;
  const submit = formEl.querySelector("button[type='submit']");
  if (!(submit instanceof HTMLButtonElement)) return;
  submit.disabled = !!loading;
  if (loading) {
    submit.dataset.label = submit.textContent || "";
    submit.textContent = String(buttonText || "Aguarde...");
  } else if (submit.dataset.label) {
    submit.textContent = submit.dataset.label;
  }
}

function togglePw(input, btn) {
  if (!input || !btn) return;
  const isPw = input.type === "password";
  input.type = isPw ? "text" : "password";
  btn.textContent = isPw ? "ocultar" : "ver";
  btn.setAttribute("aria-label", isPw ? "Ocultar senha" : "Mostrar senha");
}

function showRegister(show) {
  if (!registerCard) return;
  registerCard.hidden = !show;
  const loginCard = document.querySelector(".card[aria-label='Login']");
  if (loginCard) loginCard.hidden = !!show;
  setMsg(msg, "");
  setMsg(regMsg, "");
}

function normalizeNextPath(raw) {
  const next = String(raw || "").trim();
  if (!next) return "";
  if (/^[a-z]+:\/\//i.test(next)) return "";
  if (next.startsWith("../") || next.startsWith("./") || next.startsWith("/")) return next;
  return "";
}

function resolvePostLoginUrl() {
  try {
    const raw = String(new URLSearchParams(window.location.search).get("next") || "").trim();
    return normalizeNextPath(raw) || "../perfil/";
  } catch {
    return "../perfil/";
  }
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCpf(value) {
  const cpf = digitsOnly(value).slice(0, 11);
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function formatCep(value) {
  const cep = digitsOnly(value).slice(0, 8);
  if (cep.length <= 5) return cep;
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

function normalizeState(value) {
  return String(value || "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeApiBase(raw) {
  const text = String(raw || "").trim().replace(/\/+$/, "");
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith("/")) return text;
  return "";
}

function buildApiUrl(base, endpoint) {
  const root = normalizeApiBase(base);
  const path = `/${String(endpoint || "").replace(/^\/+/, "")}`;
  if (!root) return path;
  return `${root}${path}`;
}

async function isHealthy(base, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 3500);
  try {
    const healthUrl = buildApiUrl(base, "/api/health");
    const resp = await fetch(healthUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!resp.ok) return false;
    const data = await resp.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveApiBase() {
  if (resolvedApiBase) return resolvedApiBase;

  const configured = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || localStorage.getItem(PAGBANK_API_BASE_KEY) || "");
  if (configured) {
    resolvedApiBase = configured;
    return resolvedApiBase;
  }

  if (await isHealthy("")) {
    resolvedApiBase = "";
    return resolvedApiBase;
  }

  const local = "http://localhost:8787";
  if (await isHealthy(local)) {
    resolvedApiBase = local;
    localStorage.setItem(API_BASE_KEY, local);
    localStorage.setItem(PAGBANK_API_BASE_KEY, local);
    return resolvedApiBase;
  }

  resolvedApiBase = "";
  return resolvedApiBase;
}

async function postJson(endpoint, payload, timeoutMs = 12000) {
  const base = await resolveApiBase();
  const url = buildApiUrl(base, endpoint);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 12000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload || {}),
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = String(data?.message || data?.error || text || `HTTP ${response.status}`);
      throw new Error(message);
    }

    return data || {};
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Tempo esgotado para conectar ao backend.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeAddressForLocalStorage(raw) {
  return {
    street: String(raw?.street || "").trim(),
    number: String(raw?.number || "").trim(),
    district: String(raw?.district || "").trim(),
    city: String(raw?.city || "").trim(),
    state: normalizeState(raw?.state || ""),
    cep: formatCep(raw?.cep || ""),
    complement: String(raw?.complement || "").trim()
  };
}

function applySession(session) {
  const token = String(session?.token || "").trim();
  const profile = session?.profile || {};
  const extra = session?.extra || {};
  const addresses = Array.isArray(session?.addresses) ? session.addresses : [];
  const defaultAddress = session?.defaultAddress || addresses[0] || null;

  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      name: String(profile?.name || profile?.fullName || "Cliente Stop mod"),
      email: String(profile?.email || ""),
      picture: String(profile?.picture || "")
    })
  );

  localStorage.setItem(
    PROFILE_EXTRA_KEY,
    JSON.stringify({
      displayName: String(extra?.displayName || profile?.fullName || profile?.name || ""),
      fullName: String(extra?.fullName || profile?.fullName || profile?.name || ""),
      birthDate: String(extra?.birthDate || profile?.birthDate || ""),
      cpf: String(extra?.cpf || profile?.cpf || ""),
      cpfMasked: String(extra?.cpfMasked || profile?.cpfMasked || ""),
      email: String(extra?.email || profile?.email || ""),
      phone: String(extra?.phone || profile?.phone || ""),
      username: String(extra?.username || profile?.email || "").split("@")[0] || "cliente"
    })
  );
  localStorage.setItem(AUTH_LAST_SEEN_KEY, String(Date.now()));

  if (defaultAddress) {
    localStorage.setItem(SHIP_KEY, JSON.stringify(normalizeAddressForLocalStorage(defaultAddress)));
  }
  if (addresses.length) {
    localStorage.setItem(SHIP_LIST_KEY, JSON.stringify(addresses.map(normalizeAddressForLocalStorage)));
  }
}

function openModal(title, html) {
  if (!modal || !modalTitle || !modalBody) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.hidden = false;
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  if (modalBody) modalBody.innerHTML = "";
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const payload = {
    fullName: String(regName?.value || "").trim(),
    birthDate: String(regBirth?.value || "").trim(),
    cpf: digitsOnly(regCpf?.value || ""),
    email: String(regEmail?.value || "").trim().toLowerCase(),
    phone: digitsOnly(regPhone?.value || ""),
    password: String(regPass?.value || ""),
    address: {
      cep: digitsOnly(regCep?.value || ""),
      street: String(regStreet?.value || "").trim(),
      number: String(regNumber?.value || "").trim(),
      complement: String(regComplement?.value || "").trim(),
      district: String(regDistrict?.value || "").trim(),
      city: String(regCity?.value || "").trim(),
      state: normalizeState(regState?.value || "")
    }
  };

  if (!payload.fullName || !payload.birthDate || !payload.cpf || !payload.email || !payload.password) {
    setMsg(regMsg, "Preencha nome, nascimento, CPF, email e senha.", true);
    return;
  }

  if (
    !payload.address.cep ||
    !payload.address.street ||
    !payload.address.number ||
    !payload.address.district ||
    !payload.address.city ||
    !payload.address.state
  ) {
    setMsg(regMsg, "Preencha o endereco completo.", true);
    return;
  }

  setLoading(registerForm, true, "Criando conta...");
  setMsg(regMsg, "");

  try {
    const data = await postJson("/api/auth/register", payload, 18000);
    applySession(data);

    const civil = data?.civilCheck;
    if (civil?.checked && civil?.accepted === false) {
      setMsg(regMsg, "Conta criada, mas verificacao civil CPF ficou pendente.", false);
    } else {
      setMsg(regMsg, "Conta criada com sucesso.", false);
    }
    window.location.href = resolvePostLoginUrl();
  } catch (error) {
    setMsg(regMsg, `Falha no cadastro: ${String(error?.message || "tente novamente.")}`, true);
  } finally {
    setLoading(registerForm, false);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const identifier = String(loginId?.value || "").trim();
  const password = String(loginPass?.value || "");
  if (!identifier || !password) {
    setMsg(msg, "Informe email/CPF e senha.", true);
    return;
  }

  setLoading(loginForm, true, "Entrando...");
  setMsg(msg, "");
  try {
    const data = await postJson("/api/auth/login", { identifier, password }, 14000);
    applySession(data);
    setMsg(msg, "Login realizado com sucesso.", false);
    window.location.href = resolvePostLoginUrl();
  } catch (error) {
    setMsg(msg, `Falha no login: ${String(error?.message || "tente novamente.")}`, true);
  } finally {
    setLoading(loginForm, false);
  }
}

pwToggle?.addEventListener("click", () => togglePw(loginPass, pwToggle));
regPwToggle?.addEventListener("click", () => togglePw(regPass, regPwToggle));
goRegister?.addEventListener("click", () => showRegister(true));
goLogin?.addEventListener("click", () => showRegister(false));
loginForm?.addEventListener("submit", handleLoginSubmit);
registerForm?.addEventListener("submit", handleRegisterSubmit);

regCpf?.addEventListener("input", () => {
  regCpf.value = formatCpf(regCpf.value);
});
regCep?.addEventListener("input", () => {
  regCep.value = formatCep(regCep.value);
});
regState?.addEventListener("input", () => {
  regState.value = normalizeState(regState.value);
});

forgotBtn?.addEventListener("click", () => {
  openModal(
    "Recuperar senha",
    `
      <p class="hint">Para seguranca, a recuperacao deve ser feita no backend com envio de email/SMS.</p>
      <p class="hint">Se quiser, eu implemento esse fluxo completo no proximo passo.</p>
      <div class="actions">
        <button class="btn ghost" type="button" data-close="1">Fechar</button>
      </div>
    `
  );
});

googleBtn?.addEventListener("click", () => {
  setMsg(msg, "Login Google permanece opcional. O cadastro seguro principal e por email/CPF.", false);
});

modal?.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("[data-close='1']") : null;
  if (target) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) closeModal();
});

showRegister(false);
