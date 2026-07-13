import { tabRead, rowsToObjects, scoreToken } from "./_engine.js";

// Portal v1 (CRM Phase 5): growth chart from snapshots (baseline-anchored),
// per-touch funnel, usage meters vs monthly caps, empty-state coaching.
// Same magic link, no login, renders fresh from the sheet on every load.

const C = {
  accent: "#00714b", ink: "#182620", sec: "#6e8279", warm: "#4a4335",
  surface: "#f6faf7", card: "#fff", border: "#d7e4dc", grid: "#e3ece6", track: "#dcebe3", wash: "rgba(0,113,75,.1)",
};
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
const fmtD = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

function growthChart(points) {
  // points: [{t: ms, count: int, label: string}], ascending, length >= 2
  const W = 720, H = 220, PAD = { l: 34, r: 14, t: 12, b: 26 };
  const xs = points.map((p) => p.t), ys = points.map((p) => p.count);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y1 - y0 < 4) { y1 = y0 + 4; } y0 = Math.max(0, y0 - 1);
  const X = (t) => PAD.l + ((t - x0) / Math.max(1, x1 - x0)) * (W - PAD.l - PAD.r);
  const Y = (v) => H - PAD.b - ((v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const ticks = [];
  const step = Math.max(1, Math.ceil((y1 - y0) / 3));
  for (let v = Math.ceil(y0); v <= y1; v += step) ticks.push(v);
  const line = points.map((p, i) => (i ? "L" : "M") + X(p.t).toFixed(1) + " " + Y(p.count).toFixed(1)).join(" ");
  const area = line + ` L${X(x1).toFixed(1)} ${(H - PAD.b).toFixed(1)} L${X(x0).toFixed(1)} ${(H - PAD.b).toFixed(1)} Z`;
  const last = points[points.length - 1];
  const dots = points.map((p, i) => {
    const cx = X(p.t).toFixed(1), cy = Y(p.count).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="${C.accent}" stroke="${C.surface}" stroke-width="2"></circle>
<circle cx="${cx}" cy="${cy}" r="12" fill="transparent" class="pt" data-tip="${esc(p.label)}: ${p.count} review${p.count === 1 ? "" : "s"}"></circle>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Google review count over time" style="width:100%;height:auto;display:block">
${ticks.map((v) => `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"></line>
<text x="${PAD.l - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="11" fill="${C.sec}" font-variant-numeric="tabular-nums">${v}</text>`).join("")}
<text x="${PAD.l}" y="${H - 8}" font-size="11" fill="${C.sec}">${esc(points[0].label)}</text>
<text x="${W - PAD.r}" y="${H - 8}" text-anchor="end" font-size="11" fill="${C.sec}">${esc(last.label)}</text>
<path d="${area}" fill="${C.wash}"></path>
<path d="${line}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
${dots}
<text x="${Math.min(X(last.t), W - PAD.r - 4).toFixed(1)}" y="${(Y(last.count) - 12).toFixed(1)}" text-anchor="end" font-size="12" font-weight="600" fill="${C.ink}">${last.count}</text>
</svg>`;
}

function funnelBars(rows) {
  // rows: [{label, value}], bars scaled to max, 20px thick, 4px rounded data-end
  const max = Math.max(1, ...rows.map((r) => r.value));
  return rows.map((r) => {
    const pct = (r.value / max) * 100;
    return `<div style="display:grid;grid-template-columns:110px 1fr 44px;gap:10px;align-items:center;margin:7px 0">
<span style="font-size:.85rem;color:${C.warm}">${esc(r.label)}</span>
<div style="height:20px;position:relative"><div class="pt" data-tip="${esc(r.label)}: ${r.value}" style="position:absolute;left:0;top:0;bottom:0;width:${Math.max(pct, r.value ? 2 : 0).toFixed(1)}%;background:${C.accent};border-radius:0 4px 4px 0"></div></div>
<span style="font-size:.9rem;font-weight:600;color:${C.ink};font-variant-numeric:tabular-nums">${r.value}</span>
</div>`;
  }).join("");
}

function meter(label, used, cap, note) {
  const pct = Math.min(100, (used / cap) * 100);
  return `<div style="margin:12px 0">
<div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:5px"><span style="color:${C.warm}">${esc(label)}</span><span style="color:${C.sec};font-variant-numeric:tabular-nums">${used.toLocaleString()} of ${cap.toLocaleString()}</span></div>
<div class="pt" data-tip="${esc(label)}: ${used.toLocaleString()} used, ${(cap - used).toLocaleString()} left this month" style="height:10px;background:${C.track};border-radius:5px;overflow:hidden"><div style="height:100%;width:${pct.toFixed(1)}%;background:${C.accent};border-radius:5px"></div></div>
${note ? `<p style="font-size:.8rem;color:${C.sec};margin:5px 0 0">${esc(note)}</p>` : ""}
</div>`;
}

const card = (title, inner) => `<div style="background:${C.card};border:1px solid ${C.border};border-radius:6px;padding:20px;margin-top:14px">
<p style="font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:${C.sec};font-weight:700;margin:0 0 12px">${esc(title)}</p>${inner}</div>`;
const coach = (msg) => `<p style="font-size:.92rem;color:${C.warm};margin:4px 0">${esc(msg)}</p>`;

export default async function handler(req, res) {
  const bizId = ((req.query.b || "") + "").slice(0, 50);
  const t = (req.query.t || "") + "";
  if (!bizId || t !== scoreToken(bizId)) return res.status(403).send("Invalid link.");
  const businesses = rowsToObjects(await tabRead("businesses"));
  const biz = businesses.find((x) => x.id === bizId);
  if (!biz) return res.status(404).send("Not found.");
  const contacts = rowsToObjects(await tabRead("contacts")).filter((c) => c.biz_id === bizId);
  const snaps = rowsToObjects(await tabRead("snapshots")).filter((s) => s.biz_id === bizId);
  const events = rowsToObjects(await tabRead("events")).filter((e) => e.biz_id === bizId);
  let sends = [];
  try { sends = rowsToObjects(await tabRead("sends")).filter((s) => s.biz_id === bizId); } catch (e) {}

  const latest = snaps[snaps.length - 1] || {};
  const first = snaps[0] || {};
  const mo = Date.now() - 30 * 86400000;
  const sent30 = contacts.filter((c) => parseInt(c.seq_stage || 0) > 0 && Date.parse(c.last_send || 0) > mo).length;
  const clicked30 = contacts.filter((c) => c.clicked_at && Date.parse(c.clicked_at) > mo).length;
  const tile = (k, v, d) => `<div style="background:${C.card};border:1px solid ${C.border};border-radius:6px;padding:20px"><p style="font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:${C.sec};font-weight:700;margin:0">${k}</p><p style="font-size:2.1rem;font-weight:700;font-family:monospace;margin:6px 0 2px">${v}</p><p style="font-size:.85rem;color:${C.accent};margin:0">${d}</p></div>`;

  // growth chart points: baseline anchors the left edge when present
  const pts = [];
  const baseCount = parseInt(biz.baseline_count || "");
  const joined = Date.parse(biz.joined_at || biz.created || "");
  if (!isNaN(baseCount) && !isNaN(joined)) pts.push({ t: joined, count: baseCount, label: fmtD(new Date(joined).toISOString()) + " (joined)" });
  for (const s of snaps) {
    const st = Date.parse(s.date);
    const c = parseInt(s.review_count || "");
    if (!isNaN(st) && !isNaN(c)) pts.push({ t: st, count: c, label: fmtD(s.date) });
  }
  const chart = pts.length >= 2 ? growthChart(pts)
    : coach(pts.length === 1
      ? "One data point so far. The chart needs two, and your review count gets photographed once a day, so tomorrow this becomes a line."
      : "Your review count gets photographed once a day starting the morning after setup. Give it a day or two and a line shows up here.");

  // per-touch funnel from send events + click/review state
  const touchNames = ["Check-in", "The ask", "Reminder", "Final nudge"];
  const touches = [0, 0, 0, 0];
  for (const e of events) {
    if (e.type !== "send") continue;
    const m = /stage (\d)/.exec(e.detail || "");
    if (m) touches[parseInt(m[1])] = (touches[parseInt(m[1])] || 0) + 1;
  }
  const clicked = contacts.filter((c) => c.clicked_at).length;
  // only count matches whose contact still exists, so cleaned-up test rows drop out
  const ids = new Set(contacts.flatMap((c) => [c.email, c.cell].filter(Boolean).map((x) => x.toLowerCase())));
  const reviewed = new Set(events.filter((e) => e.type === "review_matched" && ids.has((e.contact_email_or_cell || "").toLowerCase())).map((e) => (e.contact_email_or_cell || "").toLowerCase())).size;
  const anySends = touches.some((v) => v > 0);
  const funnel = anySends
    ? funnelBars([...touchNames.map((label, i) => ({ label, value: touches[i] })), { label: "Clicked the link", value: clicked }, { label: "Left a review", value: reviewed }])
      + `<p style="font-size:.8rem;color:${C.sec};margin:10px 0 0">Reminders only go to people who have not clicked, and the whole sequence stops the moment someone's review shows up.</p>`
    : coach("No requests sent yet. Send us your customer list, or wire up the webhook, and this fills in on its own. You do nothing else.");

  // usage meters, month to date, from the sends log
  const m0 = new Date(); m0.setUTCDate(1); m0.setUTCHours(0, 0, 0, 0);
  const emailUsed = sends.filter((s) => s.channel === "email" && s.campaign === "sequence" && Date.parse(s.ts) >= m0.getTime()).length;
  const smsUsed = sends.filter((s) => s.channel === "sms" && s.campaign === "sequence" && Date.parse(s.ts) >= m0.getTime()).length;
  const EMAIL_CAP = parseInt(process.env.MONTHLY_EMAIL_CAP || "3000");
  const SMS_CAP = parseInt(process.env.MONTHLY_SMS_CAP || "300");
  const meters = meter("Email requests this month", emailUsed, EMAIL_CAP, emailUsed === 0 ? "Nothing used yet. The cap is generous on purpose." : "")
    + (biz.sms_ok === "yes" ? meter("Text requests this month", smsUsed, SMS_CAP, "") : `<p style="font-size:.8rem;color:${C.sec};margin:8px 0 0">Text messaging is off for your account. Say the word and we turn it on.</p>`);

  const growthNote = !isNaN(baseCount)
    ? `You joined with ${baseCount} review${baseCount === 1 ? "" : "s"}. Everything above that line is since.`
    : "";

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(biz.name)}: Scoreboard</title></head>
<body style="font-family:-apple-system,sans-serif;background:${C.surface};color:${C.ink};margin:0;padding:22px">
<div style="max-width:760px;margin:0 auto">
<a href="https://wellearnedreviews.com/" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:${C.accent};font-size:.82rem;text-transform:uppercase;letter-spacing:.14em;font-weight:700"><img src="https://wellearnedreviews.com/img/wer-mark.png" alt="WellEarnedReviews logo" width="26" height="26" style="display:block">WellEarnedReviews</a>
<h1 style="font-size:1.7rem;margin:4px 0 6px">${esc(biz.name)}</h1>
<p style="margin:0 0 18px;font-size:.92rem">${biz.place_id ? `<a href="https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(biz.place_id)}" target="_blank" rel="noopener" style="color:${C.accent};font-weight:600">See your listing on Google &rarr;</a>` : ""}${biz.review_link ? ` &nbsp;&middot;&nbsp; <a href="${esc(biz.review_link)}" target="_blank" rel="noopener" style="color:${C.accent};font-weight:600">Your review link</a>` : ""}</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px">
${tile("Google rating", latest.rating || "&mdash;", first.rating ? "was " + first.rating : "tracking daily")}
${tile("Total reviews", latest.review_count || "&mdash;", !isNaN(baseCount) && latest.review_count ? "+" + Math.max(0, parseInt(latest.review_count) - baseCount) + " since joining" : "tracking daily")}
${tile("Requests sent", String(sent30), "last 30 days")}
${tile("Link clicks", String(clicked30), "last 30 days")}
</div>
${card("Reviews since you joined", chart + (growthNote ? `<p style="font-size:.8rem;color:${C.sec};margin:8px 0 0">${esc(growthNote)}</p>` : ""))}
${card("How requests turn into reviews", funnel)}
${card("Monthly usage", meters)}
<div style="background:${C.card};border:1px solid ${C.border};border-radius:6px;padding:20px;margin-top:26px">
<p style="font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:${C.sec};font-weight:700;margin:0 0 8px">Give a month, get a month</p>
<p style="margin:0 0 12px;font-size:.95rem">Know another owner who should stop chasing reviews by hand? Send them your link below. If they sign up, your next month is free and their first month is $99. No cap: two referrals, two free months.</p>
<p style="margin:0 0 10px"><span id="refLink" style="font-family:monospace;font-size:.88rem;word-break:break-all;background:${C.surface};padding:6px 10px;border-radius:4px;display:inline-block">https://wellearnedreviews.com/signup?ref=${encodeURIComponent(biz.id)}</span></p>
<button onclick="navigator.clipboard.writeText(document.getElementById('refLink').textContent).then(()=>{this.textContent='Copied'})" style="background:${C.accent};color:#fff;border:0;border-radius:4px;padding:8px 14px;font-weight:700;cursor:pointer">Copy my referral link</button>
</div>
<p style="margin-top:26px;font-size:.94rem;color:${C.warm}">This page updates automatically. Questions? Reply to any of our emails.</p>
</div>
<div id="tip" style="position:fixed;display:none;background:${C.ink};color:#fff;font:.8rem -apple-system,sans-serif;padding:6px 9px;border-radius:5px;pointer-events:none;z-index:9;max-width:240px"></div>
<script>
(function(){var tip=document.getElementById('tip');
function show(e){var t=e.target.closest('.pt');if(!t){tip.style.display='none';return;}
tip.textContent=t.getAttribute('data-tip');tip.style.display='block';
var x=Math.min(e.clientX+12,window.innerWidth-tip.offsetWidth-8),y=e.clientY+14;
if(y+tip.offsetHeight>window.innerHeight-8)y=e.clientY-tip.offsetHeight-10;
tip.style.left=x+'px';tip.style.top=y+'px';}
document.addEventListener('mousemove',show);document.addEventListener('touchstart',function(e){var t=e.target.closest('.pt');if(t){tip.textContent=t.getAttribute('data-tip');tip.style.display='block';tip.style.left='16px';tip.style.top='12px';setTimeout(function(){tip.style.display='none';},2200);}},{passive:true});})();
</script>
</body></html>`);
}
