(function () {
  const API_BASE_KEY = "stopmod_api_base";
  const DEFAULT_LOCAL_API_BASE = "http://localhost:8787";

  function isLocalHost() {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  }

  function normalizeApiBase(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    return raw.replace(/\/+$/, "");
  }

  function resolveForcedApiBase() {
    const fromWindow = normalizeApiBase(window.__UZUU_API_BASE__ || "");
    if (fromWindow) return fromWindow;
    const fromDocument = normalizeApiBase(document.documentElement?.getAttribute("data-api-base") || "");
    if (fromDocument) return fromDocument;
    return "";
  }

  function resolveApiBase() {
    const forced = resolveForcedApiBase();
    if (forced) return forced;
    const stored = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || "");
    if (stored) return stored;
    if (isLocalHost()) return DEFAULT_LOCAL_API_BASE;
    return "";
  }

  function buildApiUrl(path) {
    const cleanPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
    const base = resolveApiBase();
    if (!base) return cleanPath;
    if (base.startsWith("/") && /^\/api(\/|$)/i.test(cleanPath)) {
      return `${base}${cleanPath.replace(/^\/api/i, "")}`;
    }
    if (/\/api$/i.test(base) && /^\/api(\/|$)/i.test(cleanPath)) {
      return `${base}${cleanPath.replace(/^\/api/i, "")}`;
    }
    return `${base}${cleanPath}`;
  }

  async function apiRequest(path, options = {}) {
    const requestInit = {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };

    const response = await fetch(buildApiUrl(path), requestInit);
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = String(data?.message || data?.error || text || `HTTP ${response.status}`);
      const error = new Error(message);
      error.status = response.status;
      error.code = String(data?.error || "");
      throw error;
    }

    return data || {};
  }

  window.UzuuApi = {
    apiRequest,
    buildApiUrl,
    resolveApiBase
  };
})();
