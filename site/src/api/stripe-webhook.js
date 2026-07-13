import { sheetReadAll, sheetUpdateCells, resendSend } from "./_util.js";
import { tabRead, tabUpdate, logEvent } from "./_engine.js";

const STAGES = ["lead", "contacted", "onboarding", "active", "at_risk", "churned", "lost"];

function colLetter(n) {
  let s = "", i = n + 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

// Authenticity: instead of raw-body HMAC (fragile behind body parsing), we take
// the event id from the payload and re-fetch the event from Stripe with our
// secret key. A forged id either 404s or returns a different event type.
async function stripeGet(path) {
  const r = await fetch("https://api.stripe.com/v1" + path, {
    headers: { Authorization: "Basic " + Buffer.from(process.env.STRIPE_SECRET_KEY + ":").toString("base64") },
  });
  if (!r.ok) return null;
  return r.json();
}

// Subscription-style events (invoice.payment_failed, customer.subscription.deleted)
// only carry a customer id, not an email, so look the customer up. Tolerates
// any failure by returning "", never throws.
async function resolveCustomerEmail(customerId) {
  if (!customerId) return "";
  try {
    const customer = await stripeGet("/customers/" + customerId);
    return ((customer && customer.email) || "").toLowerCase();
  } catch (e) {
    return "";
  }
}

// Move every leads-tab row for this email to a new pipeline stage. Same
// header-index + colLetter idiom as engine-admin.js's move_stage action.
// opts.onlyFrom, when given, restricts the move to rows currently sitting in
// one of those stages (a blank stage counts as "lead"), so a Stripe event
// never demotes an account that is already further along. Returns the count
// of rows moved and never throws, sheet hiccups just mean fewer rows moved.
async function stageMoveByEmail(email, to, opts) {
  opts = opts || {};
  let moved = 0;
  if (!email || !STAGES.includes(to)) return moved;
  try {
    const rows = await tabRead("leads");
    const head = rows[0] || [];
    const emailIdx = head.indexOf("email");
    const stageIdx = head.indexOf("stage");
    const stageAtIdx = head.indexOf("stage_at");
    const bizIdIdx = head.indexOf("business_id");
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if ((r[emailIdx] || "").toLowerCase() !== email.toLowerCase()) continue;
      const oldStage = r[stageIdx] || "lead";
      if (opts.onlyFrom && !opts.onlyFrom.includes(oldStage)) continue;
      await tabUpdate("leads", i + 1, { [colLetter(stageIdx)]: to, [colLetter(stageAtIdx)]: new Date().toISOString() });
      await logEvent("stage_move", r[bizIdIdx] || "", email, oldStage + " -> " + to + " (stripe)");
      moved++;
    }
  } catch (e) {}
  return moved;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const id = (req.body || {}).id || "";
  if (!/^evt_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ ok: false });
  const event = await stripeGet("/events/" + id);
  if (!event) return res.status(400).json({ ok: false });

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const email = ((s.customer_details && s.customer_details.email) || s.customer_email || "").toLowerCase();
    const amount = ((s.amount_total || 0) / 100).toFixed(2);
    // flip every lead row for this email to converted (and catch referral credit)
    let flipped = 0, referralNote = "";
    try {
      const rows = await sheetReadAll();
      for (let i = 1; i < rows.length; i++) {
        if ((rows[i][1] || "").toLowerCase() === email && (rows[i][10] || "") !== "converted") {
          await sheetUpdateCells(i + 1, { K: "converted", L: new Date().toISOString() });
          flipped++;
          const m = (rows[i][8] || "").match(/(?:^|[?&|])ref=([a-z0-9-]+)/i);
          if (m && !referralNote) {
            try {
              const { tabRead, rowsToObjects, logEvent } = await import("./_engine.js");
              const referrer = rowsToObjects(await tabRead("businesses")).find((x) => x.id === m[1]);
              if (referrer) {
                referralNote = `\n\nREFERRAL: this signup used ${referrer.name}'s link (ref=${m[1]}). Credit ${referrer.name} one free month (Stripe: add a 100% off coupon for one cycle, or a $249 account credit).`;
                await logEvent("referral_conversion", m[1], email, "credit one free month to " + referrer.name);
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {}

    // resolve plan + mrr from the subscription's price
    let plan = "unknown", mrr = "";
    try {
      const sub = s.subscription ? await stripeGet("/subscriptions/" + s.subscription) : null;
      const priceId = sub && sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
      if (priceId === process.env.STRIPE_PRICE_MONTHLY) { plan = "monthly"; mrr = "249"; }
      else if (priceId === process.env.STRIPE_PRICE_ANNUAL) { plan = "annual"; mrr = "174"; }
    } catch (e) {}

    // an already-active account should never get demoted back to onboarding
    const moved = await stageMoveByEmail(email, "onboarding", { onlyFrom: ["lead", "contacted"] });

    // stamp the linked business row(s), if any, with the Stripe ids + plan
    try {
      const leadRows = await tabRead("leads");
      const leadHead = leadRows[0] || [];
      const leadEmailIdx = leadHead.indexOf("email");
      const leadBizIdIdx = leadHead.indexOf("business_id");
      const bizIds = new Set();
      for (let i = 1; i < leadRows.length; i++) {
        const r = leadRows[i];
        const bizId = r[leadBizIdIdx] || "";
        if (bizId && (r[leadEmailIdx] || "").toLowerCase() === email) bizIds.add(bizId);
      }
      if (bizIds.size) {
        const bizRows = await tabRead("businesses");
        const bizHead = bizRows[0] || [];
        const idIdx = bizHead.indexOf("id");
        const custIdx = bizHead.indexOf("stripe_customer_id");
        const subIdx = bizHead.indexOf("stripe_sub_id");
        const planIdx = bizHead.indexOf("plan");
        const mrrIdx = bizHead.indexOf("mrr");
        for (let i = 1; i < bizRows.length; i++) {
          if (bizIds.has(bizRows[i][idIdx])) {
            await tabUpdate("businesses", i + 1, {
              [colLetter(custIdx)]: s.customer || "",
              [colLetter(subIdx)]: s.subscription || "",
              [colLetter(planIdx)]: plan,
              [colLetter(mrrIdx)]: mrr,
            });
          }
        }
      }
    } catch (e) {}

    await resendSend({
      from: process.env.FROM_ADDR,
      to: [process.env.TO_ADDR],
      subject: "WER payment: " + email + " ($" + amount + ")",
      text: `Stripe checkout completed.\n\nCustomer: ${email}\nAmount: $${amount}\nCustomer id: ${s.customer || "?"}\nSubscription: ${s.subscription || "?"}\nLead rows marked converted: ${flipped}\nLead rows moved to onboarding: ${moved}\nPlan: ${plan}${mrr ? " ($" + mrr + " MRR)" : ""}\n\nNext: onboard them at https://wellearnedreviews.com/admin${referralNote}`,
    });
  }

  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object;
    const email = await resolveCustomerEmail(inv.customer);
    const moved = await stageMoveByEmail(email, "at_risk", { onlyFrom: ["onboarding", "active"] });
    const amountDue = ((inv.amount_due || 0) / 100).toFixed(2);
    await resendSend({
      from: process.env.FROM_ADDR,
      to: [process.env.TO_ADDR],
      subject: "WER payment failed: " + email,
      text: `Stripe invoice payment failed.\n\nCustomer id: ${inv.customer || "?"}\nCustomer email: ${email || "unknown"}\nAmount due: $${amountDue}\nLead rows moved to at_risk: ${moved}\n\nCheck the dashboard: https://wellearnedreviews.com/admin`,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const email = await resolveCustomerEmail(sub.customer);
    const moved = await stageMoveByEmail(email, "churned", { onlyFrom: ["onboarding", "active", "at_risk"] });
    await resendSend({
      from: process.env.FROM_ADDR,
      to: [process.env.TO_ADDR],
      subject: "WER cancellation: subscription " + sub.id,
      text: `A subscription was canceled.\n\nSubscription: ${sub.id}\nCustomer: ${sub.customer}\nCustomer email: ${email || "unknown"}\nLead rows moved to churned: ${moved}\nCheck the dashboard for the annual re-rate policy if this was an annual plan canceled early.`,
    });
  }

  return res.status(200).json({ ok: true });
}
