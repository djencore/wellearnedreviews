// Customer login, passwordless: enter your email or cell, we send a sign-in
// link to every channel on file. Google Sign-In as the one-click option.
// POST { action, ... }. Sessions are HttpOnly cookies; tokens are stateless HMAC.
import { tabRead, rowsToObjects, smsSend, logEvent } from "./_engine.js";
import { resendSend } from "./_util.js";
import { makeToken, checkToken, sessionCookie, clearSessionCookie, sessionBiz } from "./_auth.js";

const GENERIC = { ok: true, message: "If that matches an account, a sign-in link is on its way to the email (and phone) we have on file." };
const norm = (s) => (s || "").toString().trim().toLowerCase();
const normCell = (s) => (s || "").toString().replace(/[^0-9]/g, "").replace(/^1(?=\d{10}$)/, "");

async function findBusiness(identifier) {
  const businesses = rowsToObjects(await tabRead("businesses"));
  const em = norm(identifier), cell = normCell(identifier);
  return businesses.find((x) =>
    (em.includes("@") && norm(x.owner_email) === em) ||
    (cell.length === 10 && normCell(x.owner_cell) === cell)
  ) || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = req.body || {};
  const action = (b.action || "").toString();

  if (action === "config") {
    return res.status(200).json({ ok: true, google_client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || null });
  }

  // ---- request a sign-in link: goes to email AND text when both are on file ----
  if (action === "request_link") {
    const biz = await findBusiness(b.identifier);
    if (!biz) { await new Promise((r) => setTimeout(r, 400)); return res.status(200).json(GENERIC); }
    const token = makeToken("login", biz.id, 15 * 60);
    const link = `https://wellearnedreviews.com/login?t=${encodeURIComponent(token)}`;
    let sent = [];
    if (biz.owner_email) {
      const r = await resendSend({ from: process.env.FROM_ADDR, to: [biz.owner_email], subject: "Your WellEarnedReviews sign-in link",
        html: `<p>Here's your sign-in link. It expires in 15 minutes.</p><p><a href="${link}">Open my dashboard</a></p><p>If you didn't request this, ignore it. Nothing happens without this link, and no password exists to steal.</p>` });
      if (r) sent.push("email");
    }
    if (biz.owner_cell && normCell(biz.owner_cell).length === 10) {
      const sid = await smsSend("+1" + normCell(biz.owner_cell), `WellEarnedReviews sign-in link (expires in 15 min): ${link}`);
      if (sid) sent.push("sms");
    }
    if (sent.length) await logEvent("auth_link", biz.id, norm(biz.owner_email) || normCell(biz.owner_cell), sent.join("+"));
    return res.status(200).json(GENERIC);
  }

  // ---- verify a link, start a 30-day session ----
  if (action === "verify") {
    const bizId = checkToken(b.token, "login");
    if (!bizId) return res.status(400).json({ ok: false, error: "That link expired. Request a fresh one below." });
    res.setHeader("Set-Cookie", sessionCookie(bizId));
    await logEvent("auth_login", bizId, "", "link");
    return res.status(200).json({ ok: true });
  }

  // ---- Google Sign-In (activates when GOOGLE_OAUTH_CLIENT_ID is set) ----
  if (action === "google") {
    const cid = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!cid) return res.status(400).json({ ok: false, error: "Google sign-in isn't enabled yet." });
    try {
      const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(b.credential || ""));
      const info = await r.json();
      if (!r.ok || info.aud !== cid || info.email_verified !== "true") throw new Error("bad token");
      const biz = await findBusiness(info.email);
      if (!biz) return res.status(401).json({ ok: false, error: "No WellEarnedReviews account uses that Google email. Try the sign-in link instead." });
      res.setHeader("Set-Cookie", sessionCookie(biz.id));
      await logEvent("auth_login", biz.id, norm(info.email), "google");
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(401).json({ ok: false, error: "Google sign-in didn't go through. Try the sign-in link instead." });
    }
  }

  if (action === "logout") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(200).json({ ok: true });
  }

  // ---- session check for the login page ----
  if (action === "whoami") {
    const bizId = sessionBiz(req);
    return res.status(200).json({ ok: true, signed_in: !!bizId });
  }

  return res.status(400).json({ ok: false });
}
