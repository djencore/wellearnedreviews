import { logLead } from "./_util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = req.body || {};
  const email = (b.email || "").toString().slice(0, 120);
  if (email.indexOf("@") < 1) return res.status(400).json({ ok: false });
  const tool = (b.tool || "tool").toString().slice(0, 30);
  const biz = (b.biz || "").toString().slice(0, 120);
  const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  let subject, html, attachments;
  if (tool === "contact") {
    if (b.hp) return res.status(200).json({ ok: true });
    const msg = (b.message || "").toString().slice(0, 2000);
    if (msg.length < 5) return res.status(400).json({ ok: false });
    // notify owner with the message, confirm to sender
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.FROM_ADDR, to: [process.env.TO_ADDR], reply_to: email, subject: "WER contact: " + (b.name || email), html: `<p><b>${esc(b.name || "")}</b> ${biz ? "(" + esc(biz) + ")" : ""} &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(msg)}</p>` }),
    });
    subject = "We got your message";
    html = `<p>Hi ${esc(b.name || "there")},</p><p>Your message is in. A real person (Chris) will reply within one business day. If it's urgent, text (619) 452-0435.</p><p>WellEarnedReviews</p>`;
  } else if (tool === "qr-kit") {
    subject = "Your Google review link + QR code";
    html = `<p>Here's your review kit${biz ? " for <b>" + esc(biz) + "</b>" : ""}.</p>
      <p><b>Your direct review link:</b><br><a href="${esc(b.link || "")}">${esc(b.link || "")}</a></p>
      <p>Your QR code is attached. Print it, stick it where happy customers stand still, and scan it once yourself to test it.</p>
      <p>When you're ready to have review requests sent for you automatically: <a href="https://wellearnedreviews.com/signup">wellearnedreviews.com/signup</a> ($99 first month).</p>
      <p>WellEarnedReviews</p>`;
    if (b.qr && b.qr.startsWith("data:image/png;base64,")) {
      attachments = [{ filename: "google-review-qr.png", content: b.qr.split(",")[1] }];
    }
  } else if (tool === "report") {
    const rating = esc(b.rating || ""), count = esc(b.count || ""), to45 = parseInt(b.to45) || 0, to48 = parseInt(b.to48) || 0;
    subject = "Your Google reputation report" + (biz ? " for " + biz : "");
    let move = "";
    if (to45 > 0) move = `<p><b>Getting past 4.5 takes about ${to45} five-star review${to45 === 1 ? "" : "s"}</b>${to48 ? " and reaching 4.8 takes about " + to48 : ""}.</p>`;
    else if (to48 > 0) move = `<p><b>You clear 4.5 already.</b> About ${to48} more five-star review${to48 === 1 ? "" : "s"} would push you past 4.8.</p>`;
    else move = `<p><b>Your average is excellent.</b> The job now is keeping fresh reviews arriving so the listing never looks dormant.</p>`;
    html = `<p>Here are today's numbers${biz ? " for <b>" + esc(biz) + "</b>" : ""}:</p>
      <p style="font-size:1.2rem"><b>${rating} stars</b> across <b>${count}</b> reviews</p>
      ${move}
      <p><b>Your direct review link</b> (send it to a happy customer today):<br><a href="${esc(b.link || "")}">${esc(b.link || "")}</a></p>
      <p>Check back in three months and compare. Or skip the manual asking: <a href="https://wellearnedreviews.com/signup">we send the requests for you</a> ($99 first month, money-back guaranteed).</p>
      <p>WellEarnedReviews</p>`;
  } else {
    subject = "Your review request templates";
    html = `<p>Here are your personalized review request templates${biz ? " for <b>" + esc(biz) + "</b>" : ""}:</p>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f6faf7;padding:14px;border-radius:6px">${esc(b.templates || "")}</pre>
      <p>Or skip the copy-paste forever: <a href="https://wellearnedreviews.com/signup">we send these for you automatically</a> ($99 first month).</p>
      <p>WellEarnedReviews</p>`;
  }
  try {
    const payload = { from: process.env.FROM_ADDR, to: [email], subject, html };
    if (attachments) payload.attachments = attachments;
    const r1 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // lead notification to owner (best effort)
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.FROM_ADDR, to: [process.env.TO_ADDR], subject: "WER tool lead: " + tool, html: `<p>${esc(email)} used ${esc(tool)}${biz ? " for " + esc(biz) : ""}.</p>` }),
    }).catch(() => {});
    if (!r1.ok) return res.status(502).json({ ok: false });
    await logLead({ email, biz, source: tool, consent: !!b.consent, utm: (b.utm || "").toString().slice(0, 300) });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
}
