import crypto from "crypto";

// ---- Google service account: token + sheets helpers ----
let cachedToken = null, cachedExp = 0;
export async function saToken() {
  if (cachedToken && Date.now() < cachedExp - 60000) return cachedToken;
  const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_JSON_B64, "base64").toString());
  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + unsigned + "." + sig,
  });
  const d = await r.json();
  cachedToken = d.access_token; cachedExp = Date.now() + (d.expires_in || 3600) * 1000;
  return cachedToken;
}

const SHEET = () => process.env.SHEET_ID;

export async function sheetAppend(row) {
  const tok = await saToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  return r.ok;
}

export async function sheetReadAll() {
  const tok = await saToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values/A:L`, {
    headers: { Authorization: "Bearer " + tok },
  });
  const d = await r.json();
  return d.values || [];
}

export async function sheetUpdateCells(rowIndex1Based, updates) {
  // updates: {J: "1", L: "2026-07-12T..."} column letter -> value
  const tok = await saToken();
  const data = Object.entries(updates).map(([col, val]) => ({
    range: `${col}${rowIndex1Based}`, values: [[val]],
  }));
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values:batchUpdate`, {
    method: "POST",
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ valueInputOption: "RAW", data }),
  });
  return r.ok;
}

// ---- Resend helpers ----
export async function resendSend(payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) return null;
  return r.json();
}

export async function audienceAdd(email, firstName, unsubscribed) {
  try {
    await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, first_name: firstName || "", unsubscribed: !!unsubscribed }),
    });
  } catch (e) {}
}

export async function audienceUnsubscribe(email) {
  try {
    await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ unsubscribed: true }),
    });
  } catch (e) {}
}

// ---- lead logging (never throws; capture must not break UX) ----
export async function logLead({ email, name, biz, kind, cell, source, consent, utm }) {
  try {
    await sheetAppend([new Date().toISOString(), email, name || "", biz || "", kind || "", cell || "", source, consent ? "yes" : "no", utm || "", "0", "new", ""]);
  } catch (e) {}
  await audienceAdd(email, name, !consent);
}

// ---- unsubscribe link signing ----
export function unsubToken(email) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET).update(email.toLowerCase()).digest("hex").slice(0, 24);
}
export function unsubLink(email) {
  return `https://wellearnedreviews.com/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}
