import { tabRead, tabAppend, tabUpdate, rowsToObjects, logEvent, hookToken, trialCap, bizAgeDays } from "./_engine.js";

function colLetter(n) {
  let s = "", i = n + 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const bizId = ((req.query.b || "") + "").slice(0, 60);
  const key = (req.query.k || "") + "";
  if (!bizId || key !== hookToken(bizId)) return res.status(401).json({ ok: false, error: "bad credentials" });
  const businesses = rowsToObjects(await tabRead("businesses"));
  const biz = businesses.find((x) => x.id === bizId && x.status === "active");
  if (!biz) return res.status(404).json({ ok: false, error: "unknown business" });
  const b = req.body || {};
  // flexible field mapping for Zapier/CRM/POS payloads
  const pick = (...keys) => { for (const k of keys) { if (b[k]) return String(b[k]).slice(0, 120).trim(); } return ""; };
  let first = pick("first", "first_name", "firstname", "given_name");
  if (!first) { const full = pick("name", "full_name", "customer_name", "customer"); first = full.split(" ")[0] || ""; }
  const cell = pick("cell", "phone", "mobile", "phone_number", "customer_phone").replace(/[^0-9+]/g, "");
  const email = pick("email", "customer_email", "email_address");
  const job = pick("job", "service", "job_type", "description", "line_item").slice(0, 80);
  if (!first || (!cell && !email)) return res.status(400).json({ ok: false, error: "need first name plus phone or email" });
  // dedupe with re-enrollment cooldown: opted_out/undeliverable never re-enroll,
  // in-sequence and in-cooldown are ignored, done + past cooldown re-enrolls in place
  const cRaw = await tabRead("contacts");
  const cHead = cRaw[0] || [];
  const all = rowsToObjects(cRaw);
  const contacts = all.filter((c) => c.biz_id === bizId);
  const norm = (s) => (s || "").replace(/[^0-9]/g, "").slice(-10);
  const dup = contacts.find((c) => (email && c.email && c.email.toLowerCase() === email.toLowerCase()) || (cell && c.cell && norm(c.cell) === norm(cell)));
  const now = new Date().toISOString();
  if (dup) {
    if (["opted_out", "undeliverable"].includes(dup.status)) return res.status(200).json({ ok: true, queued: 0, note: "suppressed, not re-enrolled" });
    if (dup.status !== "done") return res.status(200).json({ ok: true, queued: 0, note: "already enrolled" });
    const cooldownDays = parseInt(biz.cooldown_days || "180") || 180;
    const enrolled = Date.parse(dup.last_enrolled_at || dup.added);
    if (!isNaN(enrolled) && Date.now() - enrolled < cooldownDays * 86400000) return res.status(200).json({ ok: true, queued: 0, note: "in cooldown" });
    const up = { E: job || dup.job || "", F: now, G: "0", H: "queued", I: "", J: "", K: "" };
    const leIdx = cHead.indexOf("last_enrolled_at"), rvIdx = cHead.indexOf("reviewed_at");
    if (leIdx >= 0) up[colLetter(leIdx)] = now;
    if (rvIdx >= 0) up[colLetter(rvIdx)] = "";
    await tabUpdate("contacts", dup._row, up);
    await logEvent("re_enrolled", bizId, email || cell, "via webhook, past cooldown");
    return res.status(200).json({ ok: true, queued: 1, note: "re-enrolled" });
  }
  const inTrial = bizAgeDays(biz) < 30;
  const status = inTrial && contacts.length >= trialCap() ? "waitlist" : "queued";
  const row = new Array(Math.max(cHead.length, 11)).fill("");
  [bizId, first, cell, email, job, now, "0", status, "", "", ""].forEach((v, i) => (row[i] = v));
  const leIdx = cHead.indexOf("last_enrolled_at");
  if (leIdx >= 0) row[leIdx] = now;
  await tabAppend("contacts", [row]);
  await logEvent("hook_contact", bizId, email || cell, "via webhook " + status);
  return res.status(200).json({ ok: true, queued: status === "queued" ? 1 : 0, waitlisted: status === "waitlist" ? 1 : 0 });
}
