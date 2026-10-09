/**
 * Auth + CORS + rate-limit helpers for Soohwa Intelligence API.
 * In-memory rate limit = best-effort (local / single instance).
 */

const rateBucket = new Map();

function parseOrigins(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAllowedOrigins() {
  const fromEnv = parseOrigins(process.env.ALLOWED_ORIGINS);
  if (fromEnv.length) return fromEnv;
  return [
    "http://127.0.0.1:9292",
    "http://localhost:9292",
    "https://soohwa.com",
    "https://www.soohwa.com",
    "https://dx8yyy-dq.myshopify.com"
  ];
}

export function applyCors(req, res) {
  const origin = req.headers.origin || "";
  const allowed = getAllowedOrigins();
  const ok = !origin || allowed.includes(origin) || allowed.includes("*");

  if (ok && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (allowed.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Soohwa-Analyze-Key"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  return ok;
}

export function getClientKey(req) {
  const auth = String(req.headers.authorization || "");
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return String(req.headers["x-soohwa-analyze-key"] || "").trim();
}

export function assertAnalyzeAuth(req, res) {
  const expected = String(process.env.ANALYZE_SECRET || "").trim();
  if (!expected) {
    res.status(500).json({
      success: false,
      error: "ANALYZE_SECRET missing on server"
    });
    return false;
  }

  const provided = getClientKey(req);
  if (!provided || provided !== expected) {
    res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
    return false;
  }
  return true;
}

function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.socket?.remoteAddress || "unknown";
}

/**
 * @returns {boolean} true if allowed
 */
export function assertRateLimit(req, res) {
  const limit = Number(process.env.ANALYZE_RATE_LIMIT || 20);
  const windowMs = Number(process.env.ANALYZE_RATE_WINDOW_MS || 60 * 60 * 1000);
  if (!Number.isFinite(limit) || limit <= 0) return true;

  const ip = clientIp(req);
  const now = Date.now();
  let entry = rateBucket.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateBucket.set(ip, entry);
  }
  entry.count += 1;

  if (entry.count > limit) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json({
      success: false,
      error: "Too many requests"
    });
    return false;
  }
  return true;
}

export function assertPayloadShape(payload, res) {
  if (!payload || typeof payload !== "object") {
    res.status(400).json({ success: false, error: "Invalid payload" });
    return false;
  }
  const photo = payload.photo?.base64;
  if (typeof photo === "string" && photo.length > 8_000_000) {
    res.status(413).json({ success: false, error: "Photo too large" });
    return false;
  }
  return true;
}
