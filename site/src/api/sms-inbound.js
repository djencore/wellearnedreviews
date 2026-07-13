import { tabRead, tabUpdate, rowsToObjects, logEvent } from "./_engine.js";

export default async function handler(req, res) {
  const from = ((req.body && req.body.From) || "").toString();
  const body = ((req.body && req.body.Body) || "").toString().trim().toUpperCase();
  try {
    if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(body)) {
      const contacts = rowsToObjects(await tabRead("contacts"));
      const norm = (s) => (s || "").replace(/[^0-9]/g, "").slice(-10);
      for (const c of contacts) {
        if (norm(c.cell) === norm(from)) await tabUpdate("contacts", c._row, { H: "opted_out" });
      }
      await logEvent("opt_out", "", from, "STOP");
    } else {
      await logEvent("inbound_sms", "", from, body.slice(0, 200));
    }
  } catch (e) {}
  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send("<Response></Response>");
}
