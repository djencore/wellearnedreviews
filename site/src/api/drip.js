import { sheetReadAll, sheetUpdateCells, resendSend, unsubLink } from "./_util.js";
import { loadSuppressions, isSuppressed, logSend } from "./_engine.js";

const STAGES = [
  { day: 2, subject: "The math on your last job", body: (n, unsub) => `Hi${n ? " " + n : ""},

Quick math worth a minute. Say your average job is $3,000. A business with 40 more Google reviews than its competitor picks up, conservatively, one extra customer a month from ranking and trust alone. That's $36,000 a year, from asking politely.

Most businesses never ask. The ones that do, win slowly and then all at once.

You already made your review link. The next step is getting it in front of every customer, every time, without thinking about it.

WellEarnedReviews does exactly that for $249 a month (30% off annually), first 30 days $99: https://wellearnedreviews.com/signup

Chris
WellEarnedReviews

Unsubscribe: ${unsub}` },
  { day: 5, subject: "Why we send the same link to everyone", body: (n, unsub) => `Hi${n ? " " + n : ""},

Some review services quietly filter: they ask happy customers for a public review and steer unhappy ones to a private form. Google calls that review gating and bans it. Businesses get their reviews wiped for it.

We send every customer the same link. No sorting, no gating. The rough feedback comes to you first with a drafted reply, but everyone gets the same chance to speak.

It's slower by a little and safer by a lot, and it's why reviews earned this way stick.

See how the whole thing runs: https://wellearnedreviews.com/demo

Chris
WellEarnedReviews

Unsubscribe: ${unsub}` },
  { day: 8, subject: "$99 to see it work", body: (n, unsub) => `Hi${n ? " " + n : ""},

Here's the offer, plainly. Your first 30 days of WellEarnedReviews cost $99. In that month we set up your number, import your customer list, run the reactivation campaign through your past customers, and start the ask-politely-twice sequence on every new job you text us.

Most businesses see their first new reviews inside two weeks. If it's not working, you cancel with a text and we give the $99 back. Thirty-day money-back guarantee, no forms.

After the first month it's $249 flat, or 30% less on the annual plan. No usage fees, everything included.

Start here: https://wellearnedreviews.com/signup

Chris
WellEarnedReviews

Unsubscribe: ${unsub}` },
  { day: 14, subject: "Last one from me", body: (n, unsub) => `Hi${n ? " " + n : ""},

This is the last email in this little series, promise.

If the timing isn't right, no hard feelings, and the free tools stay free: the link generator, the response writer, the templates. Use them as long as you like.

If you ever want the whole thing handled, the door's open: https://wellearnedreviews.com/signup

Either way, go get the reviews you've earned.

Chris
WellEarnedReviews

Unsubscribe: ${unsub}` },
];

export default async function handler(req, res) {
  const auth = req.headers.authorization || "";
  if (auth !== "Bearer " + process.env.CRON_SECRET) return res.status(401).json({ ok: false });
  const rows = await sheetReadAll();
  if (rows.length < 2) return res.status(200).json({ ok: true, sent: 0 });
  // conversion set: any email that has a signup row
  const converted = new Set();
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i][6] || "") === "signup") converted.add((rows[i][1] || "").toLowerCase());
  }
  let sent = 0;
  const seen = new Set();
  const supps = await loadSuppressions();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = (r[1] || "").toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    if (isSuppressed(supps, "*", email)) continue;
    const consent = (r[7] || "") === "yes";
    const stage = parseInt(r[9] || "0");
    const status = r[10] || "new";
    const source = r[6] || "";
    if (!consent || source === "signup" || ["unsubscribed", "converted", "done"].includes(status)) continue;
    if (converted.has(email)) { await sheetUpdateCells(i + 1, { K: "converted" }); continue; }
    if (stage >= STAGES.length) { await sheetUpdateCells(i + 1, { K: "done" }); continue; }
    const ageDays = (Date.now() - Date.parse(r[0])) / 86400000;
    if (isNaN(ageDays) || ageDays < STAGES[stage].day) continue;
    const unsub = unsubLink(email);
    const ok = await resendSend({
      from: process.env.FROM_ADDR,
      to: [email],
      subject: STAGES[stage].subject,
      text: STAGES[stage].body(r[2] || "", unsub),
      headers: { "List-Unsubscribe": "<" + unsub + ">" },
    });
    if (ok) {
      sent++;
      await sheetUpdateCells(i + 1, { J: String(stage + 1), L: new Date().toISOString(), K: stage + 1 >= STAGES.length ? "done" : "nurturing" });
      await logSend("drip", "", email, "email", ok.id);
    }
    if (sent >= 80) break; // stay well under function time limits
  }
  return res.status(200).json({ ok: true, sent });
}
