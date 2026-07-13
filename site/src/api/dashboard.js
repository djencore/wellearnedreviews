// Logged-in landing: session cookie -> the business's live scoreboard.
import { scoreToken } from "./_engine.js";
import { sessionBiz } from "./_auth.js";

export default async function handler(req, res) {
  const bizId = sessionBiz(req);
  if (!bizId) {
    res.setHeader("Location", "/login");
    return res.status(302).end();
  }
  res.setHeader("Location", `/api/scoreboard?b=${encodeURIComponent(bizId)}&t=${scoreToken(bizId)}`);
  return res.status(302).end();
}
