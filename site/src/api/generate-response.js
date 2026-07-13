export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = req.body || {};
  if (b.hp) return res.status(200).json({ ok: true, text: "Thanks so much for the kind words. We appreciate you taking the time." });
  const review = (b.review || "").toString().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, parseInt(b.rating) || 3));
  const tone = ["warm", "professional", "brief"].includes(b.tone) ? b.tone : "warm";
  const biz = (b.biz || "").toString().slice(0, 80);
  if (review.length < 10) return res.status(400).json({ ok: false });
  const toneLine = { warm: "warm and personal", professional: "straight and professional", brief: "short and gracious, two sentences at most" }[tone];
  const system = `You write public responses to customer reviews for small local businesses. Rules, all hard: never argue or get defensive; thank them for specifics; for negative reviews own only what the reviewer actually raised, say plainly what changes, and invite them to contact the business directly; never offer discounts, refunds, or compensation in public; never invent details the reviewer did not mention; never reveal anything about the customer's visit they did not state themselves; no emojis; no em dashes; write like a real business owner, not a PR department; keep it under 90 words unless the review demands more. Tone: ${toneLine}.`;
  const user = `Review (${rating} stars)${biz ? " for " + biz : ""}:\n"${review}"\n\nWrite the public response only, no preamble.`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 300, system, messages: [{ role: "user", content: user }] }),
    });
    const d = await r.json();
    const text = d.content && d.content[0] && d.content[0].text;
    if (!text) return res.status(502).json({ ok: false });
    return res.status(200).json({ ok: true, text: text.trim() });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
}
