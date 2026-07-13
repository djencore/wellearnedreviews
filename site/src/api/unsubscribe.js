import { sheetReadAll, sheetUpdateCells, audienceUnsubscribe, unsubToken } from "./_util.js";

export default async function handler(req, res) {
  const email = ((req.query.e || "") + "").toLowerCase().slice(0, 120);
  const t = (req.query.t || "") + "";
  if (!email || t !== unsubToken(email)) return res.status(400).send("Invalid link.");
  try {
    const rows = await sheetReadAll();
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][1] || "").toLowerCase() === email) await sheetUpdateCells(i + 1, { K: "unsubscribed" });
    }
  } catch (e) {}
  await audienceUnsubscribe(email);
  res.setHeader("Content-Type", "text/html");
  return res.status(200).send('<html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center"><h2>You\'re unsubscribed.</h2><p>No more marketing emails from WellEarnedReviews. The free tools stay free.</p><p><a href="https://wellearnedreviews.com/">wellearnedreviews.com</a></p></body></html>');
}
