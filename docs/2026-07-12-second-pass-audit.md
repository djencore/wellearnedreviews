# Second-pass competitor audit, post-CRM build

**Date:** 2026-07-12, morning, logged-in pass through GatherUp and NiceJob after CRM Phases 0-5 shipped. Purpose: find what the first teardowns missed now that WER has a pipeline board, sends log, review detection, and portal to compare against. First teardowns (2026-07-12-gatherup-teardown.md, 2026-07-12-nicejob-teardown.md) stay canonical for everything they cover; this doc is only the deltas. Trial hygiene held: no sends, no Google/Facebook connects, no toll-free registration, Review Defense audit button left unclicked.

## Housekeeping first (money)

GatherUp's signup put a card on file: "Thanks for subscribing" from Chargebee shows trial end 25-Jul-2026 and a $99.00 charge on activation. A scheduled reminder exists (trig_016XBEsJSZyJPPXzXpiNqA9w, fires Jul 23, 9am PT, push + email) to cancel unless Chris keeps it. NiceJob has no card on file and just lapses. Both trial accounts are now email-verified and reachable (GatherUp dashboard business 172760; NiceJob app on the Encore Photo Booths profile).

## New findings, mapped to the CRM

1. **Email opens are a funnel step WER does not have.** GatherUp's Business Report is per-location: Requests Sent, Opens, Open Rate, Feedback Received, Feedback Rate, Response Rate, Review Clicks, New Reviews, Total Reviews. WER's sends tab records sent/delivered/bounced/complained but never opened, so the portal funnel jumps from "sent" to "clicked." Resend emits an email.opened webhook event; adding it is one case in /api/resend-webhook (update the sends row to `opened`) plus one funnel row. Cheap, and it answers the owner question "are people even seeing these?" Caveat worth keeping from the teardown mindset: opens are pixel-based and undercount, so label honestly ("opened, at least"). Candidate: fold into Phase 6 or a half-day polish pass.

2. **Response Rate: nobody at WER tracks whether the owner actually replied.** GatherUp scores the owner's reply coverage on new reviews. WER's Phase 4 alert emails a draft and then forgets; the reviews tab has no replied state. Until GBP OAuth lands there is no API way to know, but the reviews tab should grow a `replied_at` column now (manual mark via an admin action, automatic once GBP OAuth is approved), and the Monday digest can then say "2 new reviews, both replied to" which is the number that proves the service earns its fee. Candidate: column + admin action now, automation with the GBP OAuth phase.

3. **Industry benchmark framing.** GatherUp's dashboard banner on a fresh import: "The average Google rating for other locations in this industry is 4.6 stars. You're 9% above the baseline." One static number per industry category turns a bare rating into a standing. WER already stores `industry` per business; a small lookup table (even hand-maintained for the handful of industries WER serves) gives the portal and monthly report a "you vs your industry" line. Candidate: Phase 6 report copy, portal later.

4. **Review Defense is a dispute WORKFLOW, not just an audit.** The live screen tracks reviews as Active / Suspicious / In Dispute / Removed, plus a "Suspected AI Reviews" percentage and an impressions-impact bar. The first teardown logged the free-audit lead-magnet idea; the new detail is the state machine: they manage removal disputes as a pipeline. For WER this strengthens the review-gap-checker tool concept (build queue) and suggests the eventual paid tier could include "we file the removal requests." No near-term build.

5. **Import-without-OAuth is a real differentiator vs NiceJob.** NiceJob's entire Insights section (Reviews, Leaderboard, Campaigns, Sites, NPS, QR code reviews) is a blank wall until the owner connects Google or Facebook. GatherUp imports from the listing without OAuth (Encore's 2 reviews were in their Business Report before any connect). WER's Places-based snapshot/review pipeline matches GatherUp's zero-effort posture and beats NiceJob's, and now that Phase 4/5 exist this belongs in comparison-page copy: "your dashboard fills itself the morning after you join; nobody logs into anything."

## Confirmed already-covered (no action)

The since-joining Success Report framing, visible usage meters, empty-state coaching, review-history backfill, kiosk capture, keyword SMS enrollment, per-source QR attribution, Q&A monitoring, and the FTC-hedged gating flows are all in the first teardowns and either shipped in Phases 0-5 (meters, coaching, baselines, since-joining chart) or sit on the build queue (Event Mode, keyword enrollment, Q&A, widgets).

## Follow-ups

- Decide GatherUp keep-or-cancel before Jul 25 (reminder set).
- Opens tracking (#1) and replied_at (#2) are small enough to ride along with Phase 6.
- Benchmark line (#3) needs an industry-averages source; start with a hand-set constant per industry and a "rough industry average" label.
