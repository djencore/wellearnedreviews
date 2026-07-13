import { tabRead, tabAppend, tabUpdate, rowsToObjects, logEvent, logSend, smsSend } from "./_engine.js";
import { resendSend } from "./_util.js";

function colLetter(n) {
  let s = "", i = n + 1;
  while (i > 0) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

const normName = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");

// Conservative fuzzy first-name match: exact after normalization, or prefix with both sides >= 3 chars.
export function firstNameMatch(a, b) {
  const x = normName(a), y = normName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return x.length >= 3 && y.length >= 3 && (x.startsWith(y) || y.startsWith(x));
}

// Newest reviews for a place. Legacy Places API first (supports reviews_sort=newest,
// needs the API-restricted GOOGLE_PLACES_LEGACY_KEY since referer-restricted keys are
// rejected there); falls back to Places v1 (relevance-sorted, still 5 max).
// Returns { reviews, source } so callers can report which path served.
export async function placeReviews(placeId) {
  const legacyKey = process.env.GOOGLE_PLACES_LEGACY_KEY;
  if (legacyKey) {
    try {
      const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&reviews_sort=newest&key=${legacyKey}`);
      if (r.ok) {
        const d = await r.json();
        if (d.status === "OK" && d.result) {
          return { source: "legacy-newest", reviews: (d.result.reviews || []).map((rv) => ({
            id: `${rv.time || ""}-${normName(rv.author_name).slice(0, 20)}`,
            author: rv.author_name || "",
            rating: rv.rating || 0,
            published: rv.time ? new Date(rv.time * 1000).toISOString() : "",
            text: (rv.text || "").slice(0, 1500),
          })) };
        }
      }
    } catch (e) {}
  }
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=reviews`, {
      headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY, Referer: "https://wellearnedreviews.com/" },
    });
    if (!r.ok) return null;
    const d = await r.json();
    return { source: "v1-relevance", reviews: (d.reviews || []).map((rv) => ({
      id: (rv.name || "").split("/").pop() || `${rv.publishTime || ""}-${normName(rv.authorAttribution && rv.authorAttribution.displayName).slice(0, 20)}`,
      author: (rv.authorAttribution && rv.authorAttribution.displayName) || "",
      rating: rv.rating || 0,
      published: rv.publishTime || "",
      text: ((rv.text && rv.text.text) || (rv.originalText && rv.originalText.text) || "").slice(0, 1500),
    })) };
  } catch (e) {
    return null;
  }
}

async function draftReply(reviewText, rating, bizName) {
  try {
    const r = await fetch("https://wellearnedreviews.com/api/generate-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review: reviewText || "(The customer left this rating without a written review.)", rating, tone: "warm", biz: bizName }),
    });
    if (!r.ok) return "";
    const d = await r.json();
    return (d.text || "").trim();
  } catch (e) {
    return "";
  }
}

// Daily review scan: diff newest reviews against the reviews tab, then
// (1) exit rule: fuzzy first-name match against contacts in sequence, review dated after enrollment;
// (2) alerts: 3 stars or less emails Chris + owner with a guardrailed draft (SMS if sms_ok);
// (3) first scan per business ingests everything as baseline, no exits, no alerts.
export async function scanReviews(businesses) {
  const out = { checked: 0, newReviews: 0, baselined: 0, matched: 0, alerts: 0, errors: [] };
  const revRaw = await tabRead("reviews");
  if (!revRaw.length) { out.errors.push("reviews tab missing or headerless"); return out; }
  const reviewRows = rowsToObjects(revRaw);
  const cRaw = await tabRead("contacts");
  const cHead = cRaw[0] || [];
  const contacts = rowsToObjects(cRaw);
  const revAtIdx = cHead.indexOf("reviewed_at");
  // source-independent dedupe: legacy and v1 assign different review ids to the same
  // review, so key on publish time (second granularity) + normalized author instead
  const dedupeKey = (bizId, published, author, fallbackId) =>
    bizId + "|" + (published ? String(published).slice(0, 19) + "|" + normName(author) : fallbackId);
  const known = new Set(reviewRows.map((r) => dedupeKey(r.biz_id, r.published, r.author, r.review_id)));
  out.sources = {};
  for (const b of businesses) {
    if (!b.place_id) continue;
    const got = await placeReviews(b.place_id);
    if (!got) { out.errors.push("fetch failed " + b.id); continue; }
    const revs = got.reviews;
    out.sources[b.id] = got.source;
    out.checked++;
    const hasBaseline = reviewRows.some((r) => r.biz_id === b.id);
    if (!hasBaseline && !revs.length) {
      await tabAppend("reviews", [[new Date().toISOString(), b.id, "(none)", "", "", "", "", "", "baseline-empty"]]);
      out.baselined++;
      continue;
    }
    for (const rv of revs) {
      const key = dedupeKey(b.id, rv.published, rv.author, rv.id);
      if (known.has(key)) continue;
      known.add(key);
      let matchedContact = "";
      const kind = hasBaseline ? "new" : "baseline";
      if (kind === "new") {
        out.newReviews++;
        // exit rule
        const cands = contacts.filter((c) => {
          if (c.biz_id !== b.id || ["done", "opted_out", "undeliverable"].includes(c.status)) return false;
          const enrolled = Date.parse(c.last_enrolled_at || c.added);
          if (isNaN(enrolled) || !rv.published || Date.parse(rv.published) <= enrolled) return false;
          return firstNameMatch(c.first, (rv.author || "").split(" ")[0]);
        });
        if (cands.length === 1) {
          const c = cands[0];
          matchedContact = c.email || c.cell || c.first;
          const up = { H: "done" };
          if (revAtIdx >= 0) up[colLetter(revAtIdx)] = new Date().toISOString();
          await tabUpdate("contacts", c._row, up);
          c.status = "done";
          await logEvent("review_matched", b.id, matchedContact, `${rv.rating}-star by ${rv.author}, sequence stopped`);
          out.matched++;
        } else if (cands.length > 1) {
          await logEvent("review_ambiguous", b.id, rv.author, `${cands.length} contacts match, no exit applied`);
        }
        // alerts: 3 stars or less goes out now; 4 and up rolls into the Monday digest
        if (rv.rating && rv.rating <= 3) {
          const draft = await draftReply(rv.text, rv.rating, b.name);
          const stars = rv.rating + " star" + (rv.rating === 1 ? "" : "s");
          const when = rv.published ? " (" + rv.published.slice(0, 10) + ")" : "";
          const body = `${rv.author || "Someone"} left ${b.name} a ${stars} review on Google${when}.\n\n"${rv.text || "No written review, just the rating."}"\n\nHere is a draft reply. Post it as-is or edit it first:\n\n${draft || "Draft unavailable right now. Reply from your Google Business Profile."}\n\nTo post it, open your Google Business Profile and reply to the review. Replying fast matters more than replying perfectly.\n\nWellEarnedReviews`;
          if (b.owner_email) {
            const sent = await resendSend({ from: process.env.FROM_ADDR, to: [b.owner_email], subject: `New ${stars} Google review for ${b.name}`, text: body });
            if (sent) await logSend("alert", b.id, b.owner_email, "email", sent.id);
          }
          if (b.sms_ok === "yes" && b.owner_cell) {
            const sid = await smsSend(b.owner_cell, `New ${stars} Google review for ${b.name}${rv.author ? " from " + rv.author : ""}. A draft reply is in your email.`);
            if (sid) await logSend("alert", b.id, b.owner_cell, "sms", sid);
          }
          if (process.env.TO_ADDR && process.env.TO_ADDR !== b.owner_email) {
            await resendSend({ from: process.env.FROM_ADDR, to: [process.env.TO_ADDR], subject: `WER alert: ${stars} review for ${b.name}`, text: `Low review detected, owner alerted.\n\n${body}` });
          }
          await logEvent("review_alert", b.id, rv.author, `${rv.rating}-star, owner alerted`);
          out.alerts++;
        }
      } else {
        out.baselined++;
      }
      await tabAppend("reviews", [[new Date().toISOString(), b.id, rv.id, rv.author, String(rv.rating || ""), rv.published, (rv.text || "").slice(0, 300), matchedContact, kind]]);
    }
  }
  return out;
}
