import { tabRead, tabUpdate, rowsToObjects, logEvent } from "./_engine.js";

export default async function handler(req, res) {
  const token = ((req.query.c || "") + "").slice(0, 20);
  let dest = "https://www.google.com/maps";
  try {
    const contacts = rowsToObjects(await tabRead("contacts"));
    const c = contacts.find((x) => x.click_token === token);
    if (c) {
      const businesses = rowsToObjects(await tabRead("businesses"));
      const biz = businesses.find((x) => x.id === c.biz_id);
      if (biz && biz.review_link) dest = biz.review_link;
      if (!c.clicked_at) {
        await tabUpdate("contacts", c._row, { J: new Date().toISOString() });
        await logEvent("click", c.biz_id, c.email || c.cell, token);
      }
    }
  } catch (e) {}
  res.setHeader("Location", dest);
  return res.status(302).end();
}
