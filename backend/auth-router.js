import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_TOKEN_TTL_SEC = 2 * 60 * 60;
const DEFAULT_CPF_CHECK_TIMEOUT_MS = 6000;
const AUTH_RATE_WINDOW_MS = 10 * 60 * 1000;
const AUTH_RATE_LIMIT_LOGIN = 20;
const AUTH_RATE_LIMIT_REGISTER = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

export function createAuthRouter(options = {}) {
  const router = express.Router();
  const storePath = path.join(options.dataDir || process.cwd(), "users.json");
  const tokenSecret = String(options.tokenSecret || "").trim();
  const authEnabled = tokenSecret.length >= 32;
  const tokenTtlSec = toInt(options.tokenTtlSec, DEFAULT_TOKEN_TTL_SEC);
  const cpfCheckMode = normalizeCpfCheckMode(options.cpfCheckMode);
  const cpfCheckUrl = String(options.cpfCheckUrl || "").trim();
  const cpfCheckToken = String(options.cpfCheckToken || "").trim();
  const cpfCheckTimeoutMs = toInt(options.cpfCheckTimeoutMs, DEFAULT_CPF_CHECK_TIMEOUT_MS);
  const limiterLogin = createMemoryRateLimiter(AUTH_RATE_LIMIT_LOGIN, AUTH_RATE_WINDOW_MS);
  const limiterRegister = createMemoryRateLimiter(AUTH_RATE_LIMIT_REGISTER, AUTH_RATE_WINDOW_MS);

  let writeQueue = Promise.resolve();

  router.post("/register", limiterRegister, async (req, res) => {
    if (!authEnabled) {
      return res.status(500).json({
        error: "auth_not_configured",
        message: "Configure AUTH_JWT_SECRET com no minimo 32 caracteres."
      });
    }

    const parsed = parseRegisterBody(req.body || {});
    if (!parsed.ok) {
      return res.status(400).json({ error: "invalid_register_payload", message: parsed.message });
    }

    const input = parsed.value;
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(input.password, 12);

    const civilCheck = await verifyCpfCivilMatch({
      mode: cpfCheckMode,
      url: cpfCheckUrl,
      token: cpfCheckToken,
      timeoutMs: cpfCheckTimeoutMs,
      cpf: input.cpf,
      fullName: input.fullName,
      birthDate: input.birthDate
    });

    if (!civilCheck.accepted && cpfCheckMode === "strict") {
      return res.status(422).json({
        error: "cpf_civil_mismatch",
        message: "Nao foi possivel confirmar CPF com nome/data de nascimento no verificador civil.",
        civilCheck
      });
    }

    try {
      const { user } = await enqueueWrite(async () => {
        const store = await readStore(storePath);
        const emailExists = store.users.some((u) => normalizeEmail(u.email) === input.email);
        if (emailExists) {
          const err = new Error("Email ja cadastrado.");
          err.code = "EMAIL_EXISTS";
          throw err;
        }

        const cpfExists = store.users.some((u) => digitsOnly(u.cpf) === input.cpf);
        if (cpfExists) {
          const err = new Error("CPF ja cadastrado.");
          err.code = "CPF_EXISTS";
          throw err;
        }

        const user = {
          id: randomUUID(),
          fullName: input.fullName,
          birthDate: input.birthDate,
          cpf: input.cpf,
          email: input.email,
          phone: input.phone,
          passwordHash,
          addresses: [input.address],
          defaultAddressId: input.address.id,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          civilCheck
        };

        store.users.unshift(user);
        await writeStore(storePath, store);
        return { user };
      });

      const token = signAuthToken(tokenSecret, tokenTtlSec, user);
      return res.status(201).json({
        ok: true,
        token,
        ...serializeSessionUser(user),
        civilCheck
      });
    } catch (error) {
      if (error?.code === "EMAIL_EXISTS" || error?.code === "CPF_EXISTS") {
        return res.status(409).json({ error: error.code.toLowerCase(), message: String(error.message || "Conflito.") });
      }
      return res.status(500).json({ error: "register_failed", message: String(error?.message || "Falha ao cadastrar.") });
    }
  });

  router.post("/login", limiterLogin, async (req, res) => {
    if (!authEnabled) {
      return res.status(500).json({
        error: "auth_not_configured",
        message: "Configure AUTH_JWT_SECRET com no minimo 32 caracteres."
      });
    }

    const identifier = normalizeIdentifier(req.body?.identifier || req.body?.email || req.body?.cpf || "");
    const password = String(req.body?.password || "");
    if (!identifier || !password) {
      return res.status(400).json({ error: "invalid_login_payload", message: "Informe identificador (email/cpf) e senha." });
    }

    const store = await readStore(storePath);
    const user = store.users.find((item) => matchIdentifier(item, identifier));
    if (!user || !String(user.passwordHash || "")) {
      return res.status(401).json({ error: "invalid_credentials", message: "Email/CPF ou senha invalidos." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "invalid_credentials", message: "Email/CPF ou senha invalidos." });
    }

    const now = new Date().toISOString();
    await enqueueWrite(async () => {
      const latest = await readStore(storePath);
      const index = latest.users.findIndex((item) => String(item.id) === String(user.id));
      if (index >= 0) {
        latest.users[index].lastLoginAt = now;
        latest.users[index].updatedAt = now;
        await writeStore(storePath, latest);
      }
    });

    const token = signAuthToken(tokenSecret, tokenTtlSec, user);
    return res.json({ ok: true, token, ...serializeSessionUser(user) });
  });

  router.get("/me", requireAuth(tokenSecret), async (req, res) => {
    const store = await readStore(storePath);
    const user = store.users.find((item) => String(item.id) === String(req.auth?.sub || ""));
    if (!user) {
      return res.status(404).json({ error: "user_not_found", message: "Usuario nao encontrado." });
    }
    return res.json({ ok: true, ...serializeSessionUser(user) });
  });

  router.post("/address", requireAuth(tokenSecret), async (req, res) => {
    const normalized = normalizeAddress(req.body?.address || req.body || {});
    const valid = validateAddress(normalized);
    if (!valid.ok) {
      return res.status(400).json({ error: "invalid_address", message: valid.message });
    }

    const now = new Date().toISOString();
    await enqueueWrite(async () => {
      const store = await readStore(storePath);
      const index = store.users.findIndex((item) => String(item.id) === String(req.auth?.sub || ""));
      if (index < 0) {
        const err = new Error("Usuario nao encontrado.");
        err.code = "USER_NOT_FOUND";
        throw err;
      }

      const user = store.users[index];
      const fp = addressFingerprint(normalized);
      const addrIndex = Array.isArray(user.addresses)
        ? user.addresses.findIndex((item) => addressFingerprint(normalizeAddress(item)) === fp)
        : -1;

      if (!Array.isArray(user.addresses)) user.addresses = [];
      if (addrIndex >= 0) {
        user.addresses[addrIndex] = { ...user.addresses[addrIndex], ...normalized, id: user.addresses[addrIndex].id || normalized.id };
        user.defaultAddressId = user.addresses[addrIndex].id;
      } else {
        user.addresses.unshift(normalized);
        user.defaultAddressId = normalized.id;
      }

      user.updatedAt = now;
      await writeStore(storePath, store);
    }).catch((error) => {
      if (error?.code === "USER_NOT_FOUND") throw error;
      throw error;
    });

    const store = await readStore(storePath);
    const user = store.users.find((item) => String(item.id) === String(req.auth?.sub || ""));
    if (!user) {
      return res.status(404).json({ error: "user_not_found", message: "Usuario nao encontrado." });
    }
    return res.json({ ok: true, ...serializeSessionUser(user) });
  });

  return router;

  function enqueueWrite(task) {
    writeQueue = writeQueue.then(task, task);
    return writeQueue;
  }
}

export function authHealth(config = {}) {
  const tokenSecret = String(config.tokenSecret || "").trim();
  const cpfCheckMode = normalizeCpfCheckMode(config.cpfCheckMode);
  const cpfCheckUrl = String(config.cpfCheckUrl || "").trim();
  return {
    enabled: tokenSecret.length >= 32,
    tokenSecretConfigured: tokenSecret.length >= 32,
    cpfCivilCheckMode: cpfCheckMode,
    cpfCivilCheckConfigured: !!cpfCheckUrl
  };
}

async function readStore(storePath) {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !Array.isArray(data.users)) {
      return { version: 1, users: [] };
    }
    return { version: 1, users: data.users.map(normalizeStoredUser).filter(Boolean) };
  } catch {
    return { version: 1, users: [] };
  }
}

async function writeStore(storePath, data) {
  const safe = {
    version: 1,
    users: Array.isArray(data?.users) ? data.users.map(normalizeStoredUser).filter(Boolean) : []
  };
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tmp = `${storePath}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(safe, null, 2)}\n`, "utf8");
  await fs.rename(tmp, storePath);
}

function normalizeStoredUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const fullName = normalizeFullName(raw.fullName || raw.name || "");
  const birthDate = normalizeBirthDate(raw.birthDate || "");
  const cpf = normalizeCpf(raw.cpf || "");
  const email = normalizeEmail(raw.email || "");
  const passwordHash = String(raw.passwordHash || "").trim();
  if (!id || !fullName || !birthDate || !cpf || !email || !passwordHash) return null;

  const addresses = Array.isArray(raw.addresses)
    ? raw.addresses.map((item) => normalizeAddress(item)).filter((item) => validateAddress(item).ok)
    : [];

  const defaultAddressId = String(raw.defaultAddressId || addresses[0]?.id || "").trim();
  return {
    id,
    fullName,
    birthDate,
    cpf,
    email,
    phone: normalizePhone(raw.phone || ""),
    passwordHash,
    addresses,
    defaultAddressId,
    civilCheck: normalizeCivilCheck(raw.civilCheck),
    createdAt: normalizeIsoDate(raw.createdAt),
    updatedAt: normalizeIsoDate(raw.updatedAt),
    lastLoginAt: normalizeIsoDate(raw.lastLoginAt)
  };
}

function serializeSessionUser(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const defaultAddress = resolveDefaultAddress(user);
  return {
    profile: {
      id: String(user?.id || ""),
      name: String(user?.fullName || ""),
      fullName: String(user?.fullName || ""),
      birthDate: String(user?.birthDate || ""),
      cpf: String(user?.cpf || ""),
      cpfMasked: maskCpf(user?.cpf || ""),
      email: String(user?.email || ""),
      phone: String(user?.phone || ""),
      picture: ""
    },
    extra: {
      displayName: String(user?.fullName || ""),
      fullName: String(user?.fullName || ""),
      birthDate: String(user?.birthDate || ""),
      cpf: String(user?.cpf || ""),
      cpfMasked: maskCpf(user?.cpf || ""),
      email: String(user?.email || ""),
      phone: String(user?.phone || ""),
      username: String(user?.email || "").split("@")[0] || "cliente"
    },
    addresses,
    defaultAddress
  };
}

function resolveDefaultAddress(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const id = String(user?.defaultAddressId || "").trim();
  return addresses.find((item) => String(item?.id || "") === id) || addresses[0] || null;
}

function signAuthToken(secret, ttlSec, user) {
  const payload = {
    sub: String(user.id || ""),
    email: String(user.email || ""),
    name: String(user.fullName || ""),
    type: "customer"
  };
  return jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: Number(ttlSec) || DEFAULT_TOKEN_TTL_SEC });
}

function requireAuth(secret) {
  return (req, res, next) => {
    if (String(secret || "").trim().length < 32) {
      return res.status(500).json({
        error: "auth_not_configured",
        message: "Configure AUTH_JWT_SECRET com no minimo 32 caracteres."
      });
    }
    const authHeader = String(req.headers.authorization || "").trim();
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      return res.status(401).json({ error: "missing_auth_token", message: "Envie Authorization: Bearer <token>." });
    }
    try {
      const decoded = jwt.verify(token, secret);
      req.auth = decoded;
      return next();
    } catch {
      return res.status(401).json({ error: "invalid_auth_token", message: "Token invalido ou expirado." });
    }
  };
}

function parseRegisterBody(raw) {
  const fullName = normalizeFullName(raw.fullName || raw.name || "");
  if (!fullName || fullName.length < 6) {
    return { ok: false, message: "Informe nome completo." };
  }

  const birthDate = normalizeBirthDate(raw.birthDate || raw.dateOfBirth || "");
  if (!birthDate) {
    return { ok: false, message: "Data de nascimento invalida (use YYYY-MM-DD)." };
  }

  const cpf = normalizeCpf(raw.cpf || "");
  if (!cpf || !isValidCpf(cpf)) {
    return { ok: false, message: "CPF invalido." };
  }

  const email = normalizeEmail(raw.email || "");
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, message: "Email invalido." };
  }

  const password = String(raw.password || "");
  if (!PASSWORD_RE.test(password)) {
    return {
      ok: false,
      message: "Senha fraca. Use 8+ caracteres com maiuscula, minuscula, numero e simbolo."
    };
  }

  const phone = normalizePhone(raw.phone || raw.cel || "");
  const address = normalizeAddress(raw.address || {});
  const validAddress = validateAddress(address);
  if (!validAddress.ok) {
    return { ok: false, message: validAddress.message };
  }

  return {
    ok: true,
    value: {
      fullName,
      birthDate,
      cpf,
      email,
      password,
      phone,
      address
    }
  };
}

function normalizeAddress(raw) {
  const street = cleanText(raw.street || raw.rua || "", 120);
  const number = cleanText(raw.number || raw.numero || "", 30);
  const district = cleanText(raw.district || raw.bairro || "", 90);
  const city = cleanText(raw.city || raw.cidade || "", 90);
  const state = String(raw.state || raw.uf || "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 2);
  const cepDigits = digitsOnly(raw.cep || "").slice(0, 8);
  const cep = cepDigits.length === 8 ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}` : "";
  const complement = cleanText(raw.complement || raw.complemento || "", 120);
  const label = cleanText(raw.label || "Endereco principal", 60) || "Endereco principal";
  const id = cleanText(raw.id || "", 80) || `addr_${randomUUID().slice(0, 12)}`;

  return { id, label, street, number, district, city, state, cep, complement };
}

function validateAddress(address) {
  if (!address?.street) return { ok: false, message: "Informe a rua do endereco." };
  if (!address?.number) return { ok: false, message: "Informe o numero do endereco." };
  if (!address?.district) return { ok: false, message: "Informe o bairro do endereco." };
  if (!address?.city) return { ok: false, message: "Informe a cidade do endereco." };
  if (!/^[A-Z]{2}$/.test(String(address?.state || ""))) return { ok: false, message: "Informe UF com 2 letras." };
  if (!/^\d{5}-\d{3}$/.test(String(address?.cep || ""))) return { ok: false, message: "Informe CEP valido (00000-000)." };
  return { ok: true };
}

async function verifyCpfCivilMatch(input) {
  const mode = normalizeCpfCheckMode(input.mode);
  if (mode === "off") {
    return { mode, checked: false, accepted: true, reason: "disabled" };
  }

  const url = String(input.url || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return {
      mode,
      checked: false,
      accepted: mode === "warn",
      reason: "provider_not_configured"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), toInt(input.timeoutMs, DEFAULT_CPF_CHECK_TIMEOUT_MS));

  try {
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (String(input.token || "").trim()) {
      headers.Authorization = `Bearer ${String(input.token).trim()}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        cpf: String(input.cpf || ""),
        fullName: String(input.fullName || ""),
        birthDate: String(input.birthDate || "")
      }),
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const match =
      response.ok &&
      (data?.match === true ||
        data?.matches === true ||
        String(data?.status || "").toLowerCase() === "approved" ||
        String(data?.status || "").toLowerCase() === "valid");

    return {
      mode,
      checked: true,
      accepted: match || mode === "warn",
      match: !!match,
      providerStatus: Number(response.status) || 0
    };
  } catch (error) {
    return {
      mode,
      checked: true,
      accepted: mode === "warn",
      reason: error?.name === "AbortError" ? "timeout" : "provider_error"
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCpfCheckMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "strict" || mode === "warn" || mode === "off") return mode;
  return "off";
}

function normalizeCivilCheck(raw) {
  if (!raw || typeof raw !== "object") return { mode: "off", checked: false, accepted: true };
  return {
    mode: normalizeCpfCheckMode(raw.mode),
    checked: !!raw.checked,
    accepted: !!raw.accepted,
    match: raw.match === true,
    reason: cleanText(raw.reason || "", 60),
    providerStatus: toInt(raw.providerStatus, 0)
  };
}

function normalizeIdentifier(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const asCpf = normalizeCpf(text);
  if (asCpf) return asCpf;
  return normalizeEmail(text);
}

function matchIdentifier(user, identifier) {
  const id = String(identifier || "").trim();
  if (!id) return false;
  if (id.includes("@")) return normalizeEmail(user?.email || "") === id;
  return normalizeCpf(user?.cpf || "") === id;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 120);
}

function normalizePhone(value) {
  const digits = digitsOnly(value).slice(0, 13);
  return digits;
}

function normalizeFullName(value) {
  return cleanText(value, 140);
}

function normalizeBirthDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  if (year < 1900) return "";
  const out = `${year}-${month}-${day}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out)) return "";
  return out;
}

function normalizeCpf(value) {
  const cpf = digitsOnly(value).slice(0, 11);
  return cpf.length === 11 ? cpf : "";
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function maskCpf(value) {
  const cpf = normalizeCpf(value);
  if (!cpf) return "";
  return `***.***.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function isValidCpf(cpfValue) {
  const cpf = normalizeCpf(cpfValue);
  if (!cpf || /^(\d)\1{10}$/.test(cpf)) return false;

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

function addressFingerprint(address) {
  return [
    cleanText(address?.street || "", 120).toLowerCase(),
    cleanText(address?.number || "", 30).toLowerCase(),
    cleanText(address?.district || "", 90).toLowerCase(),
    cleanText(address?.city || "", 90).toLowerCase(),
    String(address?.state || "").toUpperCase(),
    digitsOnly(address?.cep || "")
  ].join("|");
}

function cleanText(value, max) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max || 120);
}

function normalizeIsoDate(value) {
  const text = String(value || "").trim();
  if (!text) return new Date().toISOString();
  const d = new Date(text);
  if (!Number.isFinite(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function toInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return Number(fallback) || 0;
  return Math.round(n);
}

function createMemoryRateLimiter(limit, windowMs) {
  const hits = new Map();
  const maxHits = Math.max(1, Number(limit) || 1);
  const ttl = Math.max(1000, Number(windowMs) || 60000);

  return (req, res, next) => {
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
      .split(",")[0]
      .trim();
    const route = String(req.path || "");
    const key = `${ip}:${route}`;
    const now = Date.now();
    const current = hits.get(key);

    if (!current || now > current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + ttl });
      return next();
    }

    if (current.count >= maxHits) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "too_many_requests",
        message: "Muitas tentativas. Aguarde e tente novamente."
      });
    }

    current.count += 1;
    hits.set(key, current);
    return next();
  };
}
