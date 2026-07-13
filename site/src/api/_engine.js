import crypto from "crypto";
import { saToken, resendSend } from "./_util.js";

const SHEET = () => process.env.SHEET_ID;

export async function tabRead(tab) {
  const tok = await saToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values/${tab}!A:Z`, { headers: { Authorization: "Bearer " + tok } });
  const d = await r.json();
  return d.values || [];
}
export async function tabAppend(tab, rows) {
  const tok = await saToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values/${tab}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ values: rows }),
  });
  return r.ok;
}
export async function tabUpdate(tab, rowIndex1, updates) {
  const tok = await saToken();
  const data = Object.entries(updates).map(([col, val]) => ({ range: `${tab}!${col}${rowIndex1}`, values: [[val]] }));
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET()}/values:batchUpdate`, {
    method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ valueInputOption: "RAW", data }),
  });
  return r.ok;
}
export async function logEvent(type, bizId, who, detail) {
  try { await tabAppend("events", [[new Date().toISOString(), type, bizId, who, (detail || "").toString().slice(0, 300)]]); } catch (e) {}
}

// ---- Twilio ----
export async function smsSend(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = Buffer.from(process.env.TWILIO_API_KEY_SID + ":" + process.env.TWILIO_API_KEY_SECRET).toString("base64");
  const form = new URLSearchParams({ To: to, From: process.env.TWILIO_FROM, Body: body });
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST", headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.sid || null;
}

// ---- send log (never throws) ----
export async function logSend(campaign, bizId, identifier, channel, messageId) {
  try {
    await tabAppend("sends", [[new Date().toISOString(), bizId, identifier, campaign, channel, messageId || "", "sent"]]);
  } catch (e) {}
}

// ---- suppressions ----
export async function loadSuppressions() {
  try {
    return rowsToObjects(await tabRead("suppressions"));
  } catch (e) {
    return [];
  }
}
export function isSuppressed(supps, bizId, identifier) {
  const id = (identifier || "").toLowerCase();
  return supps.some((s) => (s.business === "*" || s.business === bizId) && (s.identifier || "").toLowerCase() === id);
}
export async function addSuppression(supps, bizId, identifier, reason, source) {
  if (isSuppressed(supps, bizId, identifier)) return false;
  try {
    const business = bizId || "*";
    await tabAppend("suppressions", [[business, identifier, reason, new Date().toISOString(), source]]);
    supps.push({ business, identifier, reason, ts: new Date().toISOString(), source });
    return true;
  } catch (e) {
    return false;
  }
}

// ---- message templates ----
const JOBS = { general: "the work", contractor: "the job", dental: "your visit", salon: "your appointment", auto: "the repair", events: "your event" };
export function renderMsg(stage, biz, contact, clickUrl) {
  const job = contact.job || JOBS[biz.industry] || "the work";
  const f = contact.first;
  if (stage === 0) return `Hey ${f}, it's ${biz.owner_first} from ${biz.name}. Wanted to make sure everything looks good after ${job}. If anything's off, tell me and I'll fix it. If it's perfect, I also accept that news.`;
  if (stage === 1) return `Glad it all worked out, ${f}. If you've got 30 seconds, a Google review helps us more than you'd think: ${clickUrl} No pressure. Well, some. The polite amount.`;
  if (stage === 2) return `Hey ${f}, ${biz.owner_first} again. Floating that review link back up in case it got buried, texts move fast: ${clickUrl} 30 seconds whenever suits. Thank you either way.`;
  return `Okay ${f}, final one, I promise. 30 seconds, and ${biz.name} owes you one: ${clickUrl} After this I retire from reminding. Thanks either way.`;
}
export function renderEmail(stage, biz, contact, clickUrl) {
  const f = contact.first;
  if (stage === 0) return { subject: "Everything look good?", text: `Hi ${f},\n\nThis is ${biz.owner_first} from ${biz.name}. Wanted to make sure everything looks good after the job. If anything needs a second look, reply here and I'll take care of it. If it's perfect, I'll happily take that news too.\n\n${biz.owner_first}` };
  if (stage === 1) return { subject: "Quick favor?", text: `Hi ${f},\n\nThanks again for your business. If you were happy with how everything turned out, would you take 30 seconds to share it in a Google review? It's the single biggest way people find us.\n\n${clickUrl}\n\nNo pressure. Well, some. The polite amount. And if anything wasn't right, reply here and I'll fix it personally.\n\n${biz.owner_first}\n${biz.name}` };
  if (stage === 2) return { subject: "In case it got buried", text: `Hi ${f},\n\n${biz.owner_first} again. Floating that review link back up in case it got buried, inboxes move fast:\n\n${clickUrl}\n\n30 seconds whenever suits. Thank you either way.\n\n${biz.owner_first}\n${biz.name}` };
  return { subject: "Last one, I promise", text: `Hi ${f},\n\nFinal one, I promise. It takes 30 seconds, it helps ${biz.name} more than you'd think, and after this I retire from reminding:\n\n${clickUrl}\n\nThank you either way.\n\n${biz.owner_first}\n${biz.name}` };
}
export function clickToken() { return crypto.randomBytes(6).toString("hex"); }
export function hookToken(bizId) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET).update("hook:" + bizId).digest("hex").slice(0, 20);
}
export function scoreToken(bizId) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET).update("score:" + bizId).digest("hex").slice(0, 20);
}
export function trialCap() { return parseInt(process.env.TRIAL_CAP || "50"); }
export function bizAgeDays(biz) {
  const t = Date.parse(biz.created || "");
  return isNaN(t) ? 999 : (Date.now() - t) / 86400000;
}
export function inSendWindow() {
  const h = parseInt(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Los_Angeles" }).format(new Date()));
  return h >= 9 && h < 18;
}
export function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const head = rows[0];
  return rows.slice(1).map((r, i) => {
    const o = { _row: i + 2 };
    head.forEach((h, j) => (o[h] = r[j] || ""));
    return o;
  });
}
export async function placeDetails(placeId) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount`, {
    headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY, "Referer": "https://wellearnedreviews.com/" },
  });
  if (!r.ok) return null;
  return r.json();
}
