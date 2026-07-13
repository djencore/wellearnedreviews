import { tabRead, tabUpdate, logEvent, loadSuppressions, addSuppression } from "./_engine.js";

function colLetter(n) {
  let s = "", i = n + 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

const EMAIL_ID_RE = /^[A-Za-z0-9-]+$/;
const ACTIONABLE = ["email.delivered", "email.bounced", "email.complained"];
const STATE_BY_EVENT = { bounced: "bounced", complained: "complained", delivered: "delivered" };

// Authenticity: no shared-secret verification of the webhook body. Instead,
// same philosophy as stripe-webhook.js: take the id out of the payload and
// re-fetch the object from Resend with our own API key. The TRUE state is
// whatever the re-fetched object's last_event says, never the webhook claim.
// A forged or stale id either fails to fetch or carries a last_event that
// does not match, and either way we fall back to ignoring the event.
async function resendGet(emailId) {
  try {
    const r = await fetch("https://api.resend.com/emails/" + emailId, {
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY },
    });
    if (!r.ok) return null;
    return r.json();
  } catch (e) {
    return null;
  }
}

// Flip the matching contacts row (biz_id + email) to a terminal status so the
// sequencer stops sending. Never throws, a sheet hiccup here should not turn
// a webhook 200 into a 500 that Resend will just retry into the same hiccup.
async function markContact(bizId, email, status) {
  try {
    const rows = await tabRead("contacts");
    const head = rows[0] || [];
    const bizIdx = head.indexOf("biz_id");
    const emailIdx = head.indexOf("email");
    const statusIdx = head.indexOf("status");
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[bizIdx] === bizId && (r[emailIdx] || "").toLowerCase() === (email || "").toLowerCase()) {
        await tabUpdate("contacts", i + 1, { [colLetter(statusIdx)]: status });
      }
    }
  } catch (e) {}
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const type = (req.body || {}).type;
  if (!ACTIONABLE.includes(type)) return res.status(200).json({ ok: true, ignored: true });

  const emailId = req.body && req.body.data && req.body.data.email_id;
  if (!emailId || typeof emailId !== "string" || !EMAIL_ID_RE.test(emailId)) return res.status(400).json({ ok: false });

  const email = await resendGet(emailId);
  if (!email) return res.status(200).json({ ok: true, ignored: true });
  const state = STATE_BY_EVENT[email.last_event];
  if (!state) return res.status(200).json({ ok: true, ignored: true });

  const out = { ok: true, delivered: 0, bounced: 0, complained: 0 };
  try {
    const rows = await tabRead("sends");
    const head = rows[0] || [];
    const bizIdx = head.indexOf("biz_id");
    const contactIdx = head.indexOf("contact");
    const campaignIdx = head.indexOf("campaign");
    const statusIdx = head.indexOf("status");
    const msgIdx = head.indexOf("message_id");

    let row = null, rowIdx = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][msgIdx] === emailId) { row = rows[i]; rowIdx = i; break; }
    }
    if (!row) return res.status(200).json({ ok: true, ignored: true });

    const bizId = row[bizIdx] || "";
    const identifier = row[contactIdx] || "";
    const campaign = row[campaignIdx] || "";
    const curStatus = row[statusIdx] || "";

    if (state === "delivered") {
      if (curStatus === "sent") {
        await tabUpdate("sends", rowIdx + 1, { [colLetter(statusIdx)]: "delivered" });
        out.delivered = 1;
      }
    } else if (state === "bounced") {
      await tabUpdate("sends", rowIdx + 1, { [colLetter(statusIdx)]: "bounced" });
      const supps = await loadSuppressions();
      await addSuppression(supps, bizId || "*", identifier, "bounce", "resend-webhook");
      if (campaign === "sequence" && bizId) await markContact(bizId, identifier, "undeliverable");
      await logEvent("email_bounced", bizId, identifier, emailId);
      out.bounced = 1;
    } else if (state === "complained") {
      await tabUpdate("sends", rowIdx + 1, { [colLetter(statusIdx)]: "complained" });
      const supps = await loadSuppressions();
      await addSuppression(supps, bizId || "*", identifier, "complaint", "resend-webhook");
      if (campaign === "sequence" && bizId) await markContact(bizId, identifier, "opted_out");
      await logEvent("email_complained", bizId, identifier, emailId);
      out.complained = 1;
    }
  } catch (e) {}

  return res.status(200).json(out);
}
