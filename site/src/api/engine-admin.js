import { tabRead, tabAppend, tabUpdate, rowsToObjects, logEvent, scoreToken, hookToken, trialCap, bizAgeDays, smsSend } from "./_engine.js";
import { scanReviews } from "./_reviews.js";

const STAGES = ["lead", "contacted", "onboarding", "active", "at_risk", "churned", "lost"];

function colLetter(n) {
  let s = "", i = n + 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

export default async function handler(req, res) {
  if ((req.headers.authorization || "") !== "Bearer " + process.env.ADMIN_SECRET) return res.status(401).json({ ok: false });
  const b = req.body || {};
  if (req.method === "GET" || b.action === "list") {
    const businesses = rowsToObjects(await tabRead("businesses"));
    const contacts = rowsToObjects(await tabRead("contacts"));
    return res.status(200).json({ ok: true, businesses: businesses.map(x => ({...x, scoreboard: `https://wellearnedreviews.com/api/scoreboard?b=${x.id}&t=${scoreToken(x.id)}`, webhook: `https://wellearnedreviews.com/api/hook?b=${x.id}&k=${hookToken(x.id)}`})), contactCounts: contacts.reduce((m, c) => ((m[c.biz_id] = (m[c.biz_id] || 0) + 1), m), {}) });
  }
  if (b.action === "add_business") {
    const id = (b.name || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) + "-" + Math.floor(Date.now() / 1000).toString(36);
    const now = new Date().toISOString();
    const plan = b.comp ? "comp" : "";
    await tabAppend("businesses", [[id, b.name, b.owner_first, b.owner_cell || "", b.owner_email || "", b.review_link || "", b.place_id || "", b.sms_ok ? "yes" : "no", b.industry || "general", "active", now, b.comp ? now : "", "", "", "", "", plan, plan ? "0" : "", ""]]);
    await logEvent("business_added", id, b.owner_email || "", b.name + (b.comp ? " (comp)" : ""));
    return res.status(200).json({ ok: true, id, scoreboard: `https://wellearnedreviews.com/api/scoreboard?b=${id}&t=${scoreToken(id)}`, webhook: `https://wellearnedreviews.com/api/hook?b=${id}&k=${hookToken(id)}` });
  }
  if (b.action === "add_contacts") {
    const businesses = rowsToObjects(await tabRead("businesses"));
    const biz = businesses.find((x) => x.id === b.biz_id);
    if (!biz) return res.status(404).json({ ok: false, error: "unknown business" });
    const cRaw = await tabRead("contacts");
    const cHead = cRaw[0] || [];
    const mine = rowsToObjects(cRaw).filter((c) => c.biz_id === b.biz_id);
    const existing = mine.length;
    const inTrial = bizAgeDays(biz) < 30;
    const cap = trialCap();
    const cooldownDays = parseInt(biz.cooldown_days || "180") || 180;
    const norm = (s) => (s || "").replace(/[^0-9]/g, "").slice(-10);
    const leIdx = cHead.indexOf("last_enrolled_at"), rvIdx = cHead.indexOf("reviewed_at");
    const now = new Date().toISOString();
    let queued = 0, waitlisted = 0, reenrolled = 0, skipped = 0;
    const rows = [];
    for (const c of (b.contacts || []).slice(0, 500)) {
      const dup = mine.find((x) => (c.email && x.email && x.email.toLowerCase() === String(c.email).toLowerCase()) || (c.cell && x.cell && norm(x.cell) === norm(c.cell)));
      if (dup) {
        const enrolled = Date.parse(dup.last_enrolled_at || dup.added);
        if (dup.status !== "done" || (!isNaN(enrolled) && Date.now() - enrolled < cooldownDays * 86400000)) { skipped++; continue; }
        const up = { E: c.job || dup.job || "", F: now, G: "0", H: "queued", I: "", J: "", K: "" };
        if (leIdx >= 0) up[colLetter(leIdx)] = now;
        if (rvIdx >= 0) up[colLetter(rvIdx)] = "";
        await tabUpdate("contacts", dup._row, up);
        dup.status = "queued";
        await logEvent("re_enrolled", b.biz_id, c.email || c.cell, "via admin add, past cooldown");
        reenrolled++;
        continue;
      }
      const status = inTrial && existing + queued >= cap ? "waitlist" : "queued";
      if (status === "queued") queued++; else waitlisted++;
      const row = new Array(Math.max(cHead.length, 11)).fill("");
      [b.biz_id, c.first || "", c.cell || "", c.email || "", c.job || "", now, "0", status, "", "", ""].forEach((v, i) => (row[i] = v));
      if (leIdx >= 0) row[leIdx] = now;
      rows.push(row);
    }
    if (rows.length) await tabAppend("contacts", rows);
    if (rows.length || reenrolled) await logEvent("contacts_added", b.biz_id, "", `${queued} queued, ${waitlisted} waitlisted, ${reenrolled} re-enrolled, ${skipped} skipped`);
    return res.status(200).json({ ok: true, added: rows.length, queued, waitlisted, reenrolled, skipped });
  }
  if (b.action === "invite") {
    const businesses = rowsToObjects(await tabRead("businesses"));
    const biz = businesses.find((x) => x.id === b.biz_id);
    if (!biz) return res.status(404).json({ ok: false, error: "no such business" });
    const sent = [];
    const first = biz.owner_first || "there";
    if (biz.owner_email) {
      const { resendSend } = await import("./_util.js");
      const r = await resendSend({ from: process.env.FROM_ADDR, to: [biz.owner_email], reply_to: process.env.TO_ADDR,
        subject: "Your WellEarnedReviews account is live",
        html: `<p>Hi ${first},</p>
<p>${biz.name} is set up on WellEarnedReviews. Here's the whole system:</p>
<p><b>1. After a job, send us the customer.</b> Text a name and number to (619) 452-0435, or forward the invoice. We send a friendly check-in, then the review ask, then up to two spaced reminders to whoever hasn't clicked. Everyone gets the same Google link; nothing is filtered.</p>
<p><b>2. Watch it work, if you feel like it.</b> Your dashboard shows your rating, review growth, and every request: <a href="https://wellearnedreviews.com/login">wellearnedreviews.com/login</a>. Enter this email and we'll send you a sign-in link. No password exists, which is safer than one.</p>
<p><b>3. New reviews get answered.</b> Good ones get a thank-you posted automatically; anything rough lands on your phone with a reply already drafted. Nothing posts without your OK.</p>
<p>That's it. Reply to this email with your first customer if you want to see it run today.</p>
<p>Chris<br>WellEarnedReviews</p>` });
      if (r) sent.push("email");
    }
    if (biz.owner_cell && biz.sms_ok === "yes") {
      const sid = await smsSend("+1" + biz.owner_cell.replace(/[^0-9]/g, "").replace(/^1(?=\d{10}$)/, ""), `${biz.name} is live on WellEarnedReviews. Text customer names to this number after each job and we handle the rest. Dashboard: https://wellearnedreviews.com/login`);
      if (sid) sent.push("sms");
    }
    await logEvent("invite_sent", biz.id, biz.owner_email || biz.owner_cell || "", sent.join("+") || "none");
    return res.status(200).json({ ok: true, sent });
  }
  if (b.action === "review_scan") {
    const businesses = rowsToObjects(await tabRead("businesses")).filter((x) => x.status === "active" && (!b.biz_id || x.id === b.biz_id));
    const out = await scanReviews(businesses);
    return res.status(200).json({ ok: true, ...out });
  }
  if (b.action === "pipeline") {
    const leadObjs = rowsToObjects(await tabRead("leads"));
    const businesses = rowsToObjects(await tabRead("businesses"));
    const leads = leadObjs.map((o) => {
      const stage = STAGES.includes(o.stage) ? o.stage : (o.status === "converted" ? "onboarding" : "lead");
      const { email, name, biz, kind, cell, source, utm, status, stage_at, next_action, next_due, notes, business_id } = o;
      return { row: o._row, ts: o.timestamp || o.ts || "", email, name, biz, kind, cell, source, utm, status, stage, stage_at, next_action, next_due, notes, business_id };
    });
    const bizMap = businesses.reduce((m, x) => ((m[x.id] = { name: x.name, mrr: x.mrr || "", status: x.status }), m), {});
    return res.status(200).json({ ok: true, stages: STAGES, leads, businesses: bizMap });
  }
  if (b.action === "move_stage") {
    if (!STAGES.includes(b.to)) return res.status(400).json({ ok: false, error: "invalid stage" });
    const rows = await tabRead("leads");
    const head = rows[0] || [];
    const emailIdx = head.indexOf("email");
    const stageIdx = head.indexOf("stage");
    const stageAtIdx = head.indexOf("stage_at");
    const bizIdIdx = head.indexOf("business_id");
    const r = rows[b.row - 1];
    if (!r || (r[emailIdx] || "").toLowerCase() !== (b.email || "").toLowerCase()) return res.status(409).json({ ok: false, error: "stale, reload" });
    const oldStage = r[stageIdx] || "";
    await tabUpdate("leads", b.row, { [colLetter(stageIdx)]: b.to, [colLetter(stageAtIdx)]: new Date().toISOString() });
    await logEvent("stage_move", r[bizIdIdx] || "", b.email, oldStage + " -> " + b.to);
    return res.status(200).json({ ok: true, stage: b.to });
  }
  if (b.action === "set_next") {
    const rows = await tabRead("leads");
    const head = rows[0] || [];
    const emailIdx = head.indexOf("email");
    const nextActionIdx = head.indexOf("next_action");
    const nextDueIdx = head.indexOf("next_due");
    const r = rows[b.row - 1];
    if (!r || (r[emailIdx] || "").toLowerCase() !== (b.email || "").toLowerCase()) return res.status(409).json({ ok: false, error: "stale, reload" });
    await tabUpdate("leads", b.row, { [colLetter(nextActionIdx)]: b.next_action || "", [colLetter(nextDueIdx)]: b.next_due || "" });
    return res.status(200).json({ ok: true });
  }
  return res.status(400).json({ ok: false, error: "unknown action" });
}
