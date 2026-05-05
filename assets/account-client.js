(function () {
  const KEYS = Object.freeze({
    profile: "stopmod_profile",
    profileExtra: "stopmod_profile_extra",
    authToken: "stopmod_auth_token",
    authLastSeen: "stopmod_auth_last_seen",
    shipTo: "stopmod_ship_to",
    shipList: "stopmod_ship_list"
  });

  function loadJson(key, fallback = null) {
    try {
      const parsed = JSON.parse(localStorage.getItem(String(key || "")) || "null");
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(String(key || ""), JSON.stringify(value));
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

  function formatPhone(value) {
    const digits = digitsOnly(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function normalizeState(value) {
    return String(value || "").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
  }

  function getAuthToken() {
    return String(localStorage.getItem(KEYS.authToken) || "").trim();
  }

  function normalizeAddressForStorage(raw) {
    return {
      id: String(raw?.id || "").trim(),
      label: String(raw?.label || "Principal").trim() || "Principal",
      cep: formatCep(raw?.cep || ""),
      street: String(raw?.street || "").trim(),
      number: String(raw?.number || "").trim(),
      complement: String(raw?.complement || "").trim(),
      district: String(raw?.district || "").trim(),
      city: String(raw?.city || "").trim(),
      state: normalizeState(raw?.state || ""),
      isDefault: raw?.isDefault !== false
    };
  }

  function syncSession(session) {
    const payload = session && typeof session === "object" ? session : {};
    const currentProfile = loadJson(KEYS.profile, {}) || {};
    const token = String(payload?.token || getAuthToken()).trim();
    const profile = payload?.profile && typeof payload.profile === "object" ? payload.profile : {};
    const extra = payload?.extra && typeof payload.extra === "object" ? payload.extra : {};
    const addresses = Array.isArray(payload?.addresses) ? payload.addresses : [];
    const defaultAddress = payload?.defaultAddress || addresses[0] || null;

    if (token) localStorage.setItem(KEYS.authToken, token);
    localStorage.setItem(KEYS.authLastSeen, String(Date.now()));

    saveJson(KEYS.profile, {
      name: String(profile?.name || profile?.fullName || currentProfile?.name || "Cliente Uzuu").trim() || "Cliente Uzuu",
      email: String(profile?.email || currentProfile?.email || "").trim().toLowerCase(),
      picture: String(profile?.picture || currentProfile?.picture || "").trim()
    });

    saveJson(KEYS.profileExtra, {
      displayName: String(extra?.displayName || profile?.name || "").trim(),
      fullName: String(extra?.fullName || profile?.fullName || profile?.name || "").trim(),
      birthDate: String(extra?.birthDate || profile?.birthDate || "").trim(),
      cpf: digitsOnly(extra?.cpf || profile?.cpf || ""),
      cpfMasked: String(extra?.cpfMasked || profile?.cpfMasked || formatCpf(extra?.cpf || profile?.cpf || "")).trim(),
      email: String(extra?.email || profile?.email || "").trim().toLowerCase(),
      phone: digitsOnly(extra?.phone || profile?.phone || ""),
      username: String(extra?.username || "").trim(),
      role: String(extra?.role || profile?.role || "buyer").trim(),
      sellerId: String(extra?.sellerId || "").trim(),
      sellerSlug: String(extra?.sellerSlug || "").trim(),
      sellerStatus: String(extra?.sellerStatus || "").trim(),
      sellerStoreName: String(extra?.sellerStoreName || "").trim(),
      registrationComplete: true,
      googlePending: false
    });

    if (defaultAddress) {
      saveJson(KEYS.shipTo, normalizeAddressForStorage(defaultAddress));
    }
    if (addresses.length) {
      saveJson(KEYS.shipList, addresses.map((item) => normalizeAddressForStorage(item)));
    }

    window.dispatchEvent(new Event("stopmod:profile-updated"));
    window.dispatchEvent(new Event("stopmod:shipping-updated"));

    return payload;
  }

  function clearSession() {
    localStorage.removeItem(KEYS.profile);
    localStorage.removeItem(KEYS.profileExtra);
    localStorage.removeItem(KEYS.authToken);
    localStorage.removeItem(KEYS.authLastSeen);
    localStorage.removeItem(KEYS.shipTo);
    localStorage.removeItem(KEYS.shipList);
    window.dispatchEvent(new Event("stopmod:profile-updated"));
    window.dispatchEvent(new Event("stopmod:shipping-updated"));
  }

  function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function requestSession(path, options = {}) {
    if (!window.UzuuApi?.apiRequest) {
      throw new Error("API da conta indisponivel nessa pagina.");
    }

    try {
      const data = await window.UzuuApi.apiRequest(path, {
        method: options.method || "GET",
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {})
        },
        ...(Object.prototype.hasOwnProperty.call(options, "body") ? { body: options.body } : {})
      });

      syncSession(data);
      return data;
    } catch (error) {
      if (Number(error?.status || 0) === 401) {
        clearSession();
        const sessionError = new Error("Sua sessao expirou ou precisa ser renovada. Entre novamente.");
        sessionError.status = 401;
        throw sessionError;
      }
      throw error;
    }
  }

  async function fetchCurrentSession() {
    const token = getAuthToken();
    if (!token) throw new Error("Sessao nao autenticada.");
    return requestSession("/api/auth/me", { method: "GET" });
  }

  async function updateCurrentProfile(body) {
    return requestSession("/api/auth/me/profile", {
      method: "PATCH",
      body
    });
  }

  async function updateCurrentAddress(body) {
    return requestSession("/api/auth/me/address", {
      method: "PUT",
      body
    });
  }

  window.UzuuAccount = {
    keys: KEYS,
    loadJson,
    saveJson,
    digitsOnly,
    formatCpf,
    formatCep,
    formatPhone,
    normalizeState,
    getAuthToken,
    getAuthHeaders,
    syncSession,
    clearSession,
    fetchCurrentSession,
    updateCurrentProfile,
    updateCurrentAddress
  };
})();
