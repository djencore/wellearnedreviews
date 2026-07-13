export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  try {
    const { email, plan } = req.body || {};
    if (!email || !email.includes("@")) return res.status(400).json({ ok: false, error: "email required" });
    const monthly = plan !== "annual";
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer_email", email);
    params.append("line_items[0][price]", monthly ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_ANNUAL);
    params.append("line_items[0][quantity]", "1");
    if (monthly && process.env.STRIPE_COUPON_INTRO) params.append("discounts[0][coupon]", process.env.STRIPE_COUPON_INTRO);
    params.append("success_url", "https://wellearnedreviews.com/welcome");
    params.append("cancel_url", "https://wellearnedreviews.com/signup");
    params.append("subscription_data[metadata][source]", "wer-signup");
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(process.env.STRIPE_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const d = await r.json();
    if (!r.ok || !d.url) return res.status(502).json({ ok: false, error: "stripe error" });
    return res.status(200).json({ ok: true, url: d.url });
  } catch (e) {
    return res.status(400).json({ ok: false, error: "bad request" });
  }
}
