import { logLead } from "./_util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  try {
    const body = req.body || {};
    if (body.hp) return res.status(200).json({ ok: true }); // honeypot: pretend success
    const need = ["biz", "city", "kind", "name", "cell", "email"];
    for (const k of need) {
      if (!body[k] || String(body[k]).trim().length < 2) return res.status(400).json({ ok: false, error: "missing " + k });
    }
    const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    const html = `
      <h2>New WellEarnedReviews signup</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><b>Business</b></td><td>${esc(body.biz)}</td></tr>
        <tr><td><b>City</b></td><td>${esc(body.city)}</td></tr>
        <tr><td><b>Trade</b></td><td>${esc(body.kind)}</td></tr>
        <tr><td><b>Owner</b></td><td>${esc(body.name)}</td></tr>
        <tr><td><b>Cell</b></td><td>${esc(body.cell)}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(body.email)}</td></tr>
        <tr><td><b>Google profile</b></td><td>${esc(body.gbp || "unknown")}</td></tr>
      </table>
      <p>Promised: text within one business hour to finish setup. Intro price $99 first 30 days, then $249/mo or $174/mo billed annually.</p>`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_ADDR,
        to: [process.env.TO_ADDR],
        reply_to: body.email,
        subject: "WER signup: " + body.biz + " (" + body.city + ")",
        html,
      }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "mail failed" });
    await logLead({ email: body.email, name: body.name, biz: body.biz, kind: body.kind, cell: body.cell, source: "signup", consent: true, utm: (body.utm || "").toString().slice(0, 300) });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ ok: false, error: "bad request" });
  }
}
