import { tabRead, tabAppend, tabUpdate, logEvent, smsSend, renderMsg, renderEmail, clickToken, inSendWindow, rowsToObjects, placeDetails, scoreToken, bizAgeDays, logSend, loadSuppressions, isSuppressed } from "./_engine.js";
import { resendSend } from "./_util.js";
import { scanReviews } from "./_reviews.js";

const H = 3600000;
const GAPS = [16 * H, 24 * H, 72 * H, 96 * H]; // min age for msg1; then gaps between msgs 2, 3, 4
const PER_BIZ_CAP = 8;

export default async function handler(req, res) {
  const auth = req.headers.authorization || "";
  if (auth !== "Bearer " + process.env.CRON_SECRET) return res.status(401).json({ ok: false });
  const out = { sends: 0, snapshots: 0, digests: 0 };
  const bizRows = await tabRead("businesses");
  const businesses = rowsToObjects(bizRows).filter((b) => b.status === "active");
  const bizById = Object.fromEntries(businesses.map((b) => [b.id, b]));

  // ---- sequencer ----
  if (inSendWindow()) {
    const EMAIL_CAP = parseInt(process.env.MONTHLY_EMAIL_CAP || "3000");
    const SMS_CAP = parseInt(process.env.MONTHLY_SMS_CAP || "300");
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const evs = rowsToObjects(await tabRead("events"));
    const supps = await loadSuppressions();
    const used = {};
    for (const e of evs) {
      if (e.type !== "send" || Date.parse(e.ts) < monthStart.getTime()) continue;
      used[e.biz_id] = used[e.biz_id] || { email: 0, sms: 0 };
      const d = e.detail || "";
      if (d.includes("email") || !d.includes("sms")) used[e.biz_id].email++;
      if (d.includes("sms")) used[e.biz_id].sms++;
    }
    const cRows = await tabRead("contacts");
    const contacts = rowsToObjects(cRows);
    const sentPerBiz = {};
    for (const c of contacts) {
      const biz = bizById[c.biz_id];
      if (!biz) continue;
      if (["done", "opted_out", "undeliverable"].includes(c.status)) continue;
      if (c.status === "waitlist") {
        if (bizAgeDays(biz) >= 30) { await tabUpdate("contacts", c._row, { H: "queued" }); }
        continue;
      }
      sentPerBiz[c.biz_id] = sentPerBiz[c.biz_id] || 0;
      if (sentPerBiz[c.biz_id] >= PER_BIZ_CAP) continue;
      const stage = parseInt(c.seq_stage || "0");
      if (stage >= 4) { await tabUpdate("contacts", c._row, { H: "done" }); continue; }
      // reminders (stages 2 and 3) are skipped for clickers
      if ((stage === 2 || stage === 3) && c.clicked_at) { await tabUpdate("contacts", c._row, { H: "done" }); continue; }
      const anchor = stage === 0 ? Date.parse(c.added) : Date.parse(c.last_send || c.added);
      if (isNaN(anchor) || Date.now() - anchor < GAPS[stage]) continue;
      // ensure click token exists
      let token = c.click_token;
      if (!token) { token = clickToken(); await tabUpdate("contacts", c._row, { I: token }); }
      const clickUrl = "https://wellearnedreviews.com/r/" + token;
      const u = (used[c.biz_id] = used[c.biz_id] || { email: 0, sms: 0 });
      const channels = [];
      if (c.email && c.email.includes("@") && u.email < EMAIL_CAP && !isSuppressed(supps, c.biz_id, c.email)) {
        const em = renderEmail(stage, biz, c, clickUrl);
        const sent = await resendSend({ from: process.env.FROM_ADDR, to: [c.email], reply_to: biz.owner_email || undefined, subject: em.subject, text: em.text });
        if (sent) { channels.push("email"); u.email++; await logSend("sequence", c.biz_id, c.email, "email", sent.id); }
      }
      if (c.cell && biz.sms_ok === "yes" && u.sms < SMS_CAP && !isSuppressed(supps, c.biz_id, c.cell)) {
        const sid = await smsSend(c.cell, renderMsg(stage, biz, c, clickUrl) + (stage === 1 ? " Reply STOP to opt out." : ""));
        if (sid) { channels.push("sms"); u.sms++; await logSend("sequence", c.biz_id, c.cell, "sms", sid); }
      }
      if (channels.length) {
        out.sends++;
        sentPerBiz[c.biz_id]++;
        await tabUpdate("contacts", c._row, { G: String(stage + 1), H: stage + 1 >= 4 ? "done" : "active", K: new Date().toISOString() });
        await logEvent("send", c.biz_id, c.email || c.cell, "stage " + stage + " " + channels.join("+"));
      }
      if (out.sends >= 60) break;
    }
  }

  // ---- daily snapshot at ~10am PT (UTC 17) ----
  const utcH = new Date().getUTCHours();
  const today = new Date().toISOString().slice(0, 10);
  if (utcH === 17) {
    const snaps = rowsToObjects(await tabRead("snapshots"));
    for (const b of businesses) {
      if (!b.place_id) continue;
      if (snaps.some((s) => s.date === today && s.biz_id === b.id)) continue;
      const d = await placeDetails(b.place_id);
      if (d) { await tabAppend("snapshots", [[today, b.id, String(d.rating || ""), String(d.userRatingCount || "")]]); out.snapshots++; }
    }
    // review detection rides the snapshot job: diff, exit rule, low-review alerts
    out.reviewScan = await scanReviews(businesses);
  }

  // ---- Monday digest at ~8am PT (UTC 15) ----
  if (new Date().getUTCDay() === 1 && utcH === 15) {
    const snaps = rowsToObjects(await tabRead("snapshots"));
    const contacts = rowsToObjects(await tabRead("contacts"));
    const events = rowsToObjects(await tabRead("events"));
    const reviews = rowsToObjects(await tabRead("reviews"));
    const wk = Date.now() - 7 * 86400000;
    for (const b of businesses) {
      if (!b.owner_email) continue;
      const mySnaps = snaps.filter((s) => s.biz_id === b.id).slice(-8);
      const latest = mySnaps[mySnaps.length - 1], weekAgo = mySnaps[0];
      const newReviews = latest && weekAgo ? (parseInt(latest.review_count || 0) - parseInt(weekAgo.review_count || 0)) : 0;
      const sends = events.filter((e) => e.type === "send" && e.biz_id === b.id && Date.parse(e.ts) > wk).length;
      const clicks = contacts.filter((c) => c.biz_id === b.id && c.clicked_at && Date.parse(c.clicked_at) > wk).length;
      const queued = contacts.filter((c) => c.biz_id === b.id && !["done", "opted_out"].includes(c.status)).length;
      const score = `https://wellearnedreviews.com/api/scoreboard?b=${b.id}&t=${scoreToken(b.id)}`;
      const wkRevs = reviews.filter((r) => r.biz_id === b.id && r.kind === "new" && Date.parse(r.ts) > wk);
      const revLine = wkRevs.length ? ` This week's arrivals: ${wkRevs.map((r) => `${r.rating} star${r.rating === "1" ? "" : "s"} from ${r.author || "a customer"}`).join(", ")}.` : "";
      const text = `Morning, ${b.owner_first}.\n\nLast week for ${b.name}: ${newReviews >= 0 ? newReviews : 0} new Google review${newReviews === 1 ? "" : "s"}${latest ? `, rating now ${latest.rating}` : ""}.${revLine} We sent ${sends} request${sends === 1 ? "" : "s"}, ${clicks} ${clicks === 1 ? "person" : "people"} clicked the review link. ${queued} ${queued === 1 ? "customer is" : "customers are"} in the queue this week.\n\nYour scoreboard: ${score}\n\nNothing needs your attention. Reply to this email if anything looks off.\n\nWellEarnedReviews`;
      const sent = await resendSend({ from: process.env.FROM_ADDR, to: [b.owner_email], subject: `${b.name}: your week in reviews`, text });
      if (sent) await logSend("digest", b.id, b.owner_email, "email", sent.id);
      out.digests++;
    }
  }
  return res.status(200).json({ ok: true, ...out });
}
