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
let regCpfLookupTimer = null;
let regCpfLookupSeq = 0;
let regCepLookupTimer = null;
let regCepLookupSeq = 0;

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

function isValidCpfDigits(cpfValue) {
  const cpf = digitsOnly(cpfValue).slice(0, 11);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10) first = 0;
  if (first !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10) second = 0;
  return second === Number(cpf[10]);
}

function formatCep(value) {
  const cep = digitsOnly(value).slice(0, 8);
  if (cep.length <= 5) return cep;
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

function normalizeCepDigits(value) {
  return digitsOnly(value).slice(0, 8);
}

function isValidCepDigits(value) {
  return /^\d{8}$/.test(String(value || ""));
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

async function lookupCpfByBackend(cpfDigits, timeoutMs = 12000) {
  const base = await resolveApiBase();
  const url = buildApiUrl(base, "/api/auth/cpf/lookup");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 12000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ cpf: String(cpfDigits || "") }),
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
      const err = new Error(String(data?.message || data?.error || text || `HTTP ${response.status}`));
      err.code = String(data?.error || "");
      err.status = response.status;
      throw err;
    }
    return data || {};
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Tempo esgotado na consulta CPF.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function lookupCpfAndFillRegisterName(forceFeedback = false) {
  if (!regCpf) return;
  const cpfDigits = digitsOnly(regCpf.value).slice(0, 11);
  if (!cpfDigits) return;

  if (cpfDigits.length !== 11) {
    if (forceFeedback) setMsg(regMsg, "CPF incompleto.", true);
    return;
  }
  if (!isValidCpfDigits(cpfDigits)) {
    setMsg(regMsg, "CPF invalido.", true);
    return;
  }

  const lookupSeq = ++regCpfLookupSeq;
  setMsg(regMsg, "Validando CPF...", false);
  try {
    const data = await lookupCpfByBackend(cpfDigits);
    if (lookupSeq !== regCpfLookupSeq) return;
    const fullName = String(data?.name || "").trim();
    if (!fullName) {
      setMsg(regMsg, "CPF valido, mas sem nome retornado.", true);
      return;
    }

    if (regName) regName.value = fullName;
    const birthDate = String(data?.birthDate || "").trim();
    if (regBirth && !String(regBirth.value || "").trim() && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      regBirth.value = birthDate;
    }

    setMsg(regMsg, "CPF confirmado. Nome preenchido automaticamente.", false);
  } catch (error) {
    if (lookupSeq !== regCpfLookupSeq) return;
    const code = String(error?.code || "");
    if (code === "cpf_lookup_not_configured") {
      setMsg(regMsg, "Consulta externa de CPF nao configurada no backend.", true);
      return;
    }
    if (code === "cpf_name_not_found") {
      setMsg(regMsg, "CPF consultado, mas sem nome retornado.", true);
      return;
    }
    if (forceFeedback) {
      setMsg(regMsg, `Falha na consulta CPF: ${String(error?.message || "tente novamente.")}`, true);
    }
  }
}

async function fetchJsonWithTimeout(url, timeoutMs = 5200) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs) || 5200);
  try {
    const response = await fetch(String(url || ""), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeLookupAddress(raw, fallbackCepDigits) {
  if (!raw || typeof raw !== "object") return null;
  const street = String(raw.street || raw.logradouro || "").trim();
  const district = String(raw.district || raw.bairro || "").trim();
  const city = String(raw.city || raw.localidade || "").trim();
  const state = normalizeState(raw.state || raw.uf || "");
  const cepDigits = normalizeCepDigits(raw.cep || fallbackCepDigits);
  if (!street && !district && !city && !state) return null;
  if (!isValidCepDigits(cepDigits)) return null;
  return {
    cep: formatCep(cepDigits),
    street,
    district,
    city,
    state
  };
}

async function lookupCepViaCep(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://viacep.com.br/ws/${cepDigits}/json/`, 5200);
  if (data?.erro) return null;
  return normalizeLookupAddress(data, cepDigits);
}

async function lookupCepBrasilApi(cepDigits) {
  const data = await fetchJsonWithTimeout(`https://brasilapi.com.br/api/cep/v1/${cepDigits}`, 5400);
  return normalizeLookupAddress(data, cepDigits);
}

async function lookupCepAndFillRegisterAddress(forceFeedback = false) {
  const cepDigits = normalizeCepDigits(regCep?.value || "");
  if (!cepDigits) return;

  if (!isValidCepDigits(cepDigits)) {
    if (forceFeedback) setMsg(regMsg, "CEP invalido. Use 8 digitos.", true);
    return;
  }

  const seq = ++regCepLookupSeq;
  setMsg(regMsg, "Consultando CEP...", false);

  const providers = [lookupCepViaCep, lookupCepBrasilApi];
  let found = null;
  for (const provider of providers) {
    try {
      const value = await provider(cepDigits);
      if (value) {
        found = value;
        break;
      }
    } catch {
      // tenta o proximo provedor
    }
  }

  if (seq !== regCepLookupSeq) return;

  if (!found) {
    if (forceFeedback) setMsg(regMsg, "CEP nao encontrado. Verifique e tente novamente.", true);
    return;
  }

  if (regCep) regCep.value = String(found.cep || formatCep(cepDigits));
  if (regStreet) regStreet.value = String(found.street || regStreet.value || "");
  if (regDistrict) regDistrict.value = String(found.district || regDistrict.value || "");
  if (regCity) regCity.value = String(found.city || regCity.value || "");
  if (regState) regState.value = normalizeState(found.state || regState.value || "");
  setMsg(regMsg, "CEP valido. Endereco preenchido automaticamente.", false);
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

  if (!isValidCepDigits(payload.address.cep)) {
    setMsg(regMsg, "Informe CEP valido com 8 digitos.", true);
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
  const cpfDigits = digitsOnly(regCpf.value).slice(0, 11);
  regCpf.value = formatCpf(cpfDigits);
  if (regCpfLookupTimer) clearTimeout(regCpfLookupTimer);
  if (cpfDigits.length !== 11) return;
  regCpfLookupTimer = setTimeout(() => {
    void lookupCpfAndFillRegisterName(false);
  }, 600);
});
regCpf?.addEventListener("blur", () => {
  if (regCpfLookupTimer) clearTimeout(regCpfLookupTimer);
  void lookupCpfAndFillRegisterName(true);
});
regCep?.addEventListener("input", () => {
  const cepDigits = normalizeCepDigits(regCep.value);
  regCep.value = formatCep(cepDigits);
  if (regCepLookupTimer) clearTimeout(regCepLookupTimer);
  if (!isValidCepDigits(cepDigits)) return;
  regCepLookupTimer = setTimeout(() => {
    void lookupCepAndFillRegisterAddress(false);
  }, 450);
});
regCep?.addEventListener("blur", () => {
  if (regCepLookupTimer) clearTimeout(regCepLookupTimer);
  void lookupCepAndFillRegisterAddress(true);
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
  setMsg(msg, "");
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
