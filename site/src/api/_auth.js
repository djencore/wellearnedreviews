// Customer auth helpers: stateless HMAC tokens, sessions, scrypt passwords.
// Secrets derive from CRON_SECRET (already in the environment); no new env needed.
import crypto from "crypto";

const KEY = () => crypto.createHash("sha256").update("wer-auth:" + process.env.CRON_SECRET).digest();

function b64u(buf) { return Buffer.from(buf).toString("base64url"); }
function unb64u(s) { return Buffer.from(s, "base64url").toString(); }

// ---- one-time / session tokens: payload|exp|sig ----
export function makeToken(purpose, bizId, ttlSeconds) {
  const exp = Date.now() + ttlSeconds * 1000;
  const body = `${purpose}|${bizId}|${exp}`;
  const sig = crypto.createHmac("sha256", KEY()).update(body).digest("base64url");
  return b64u(body) + "." + sig;
}
export function checkToken(token, purpose) {
  try {
    const [b, sig] = String(token).split(".");
    const body = unb64u(b);
    const good = crypto.createHmac("sha256", KEY()).update(body).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
    const [p, bizId, exp] = body.split("|");
    if (p !== purpose || Date.now() > Number(exp)) return null;
    return bizId;
  } catch (e) { return null; }
}

// ---- session cookie ----
const SESSION_TTL = 30 * 24 * 3600; // 30 days
export function sessionCookie(bizId) {
  const t = makeToken("session", bizId, SESSION_TTL);
  return `wer_session=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`;
}
export function clearSessionCookie() {
  return "wer_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
}
export function sessionBiz(req) {
  const c = req.headers.cookie || "";
  const m = c.match(/(?:^|;\s*)wer_session=([^;]+)/);
  if (!m) return null;
  return checkToken(m[1], "session");
}
