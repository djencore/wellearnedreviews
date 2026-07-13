# WellEarnedReviews (WER): Project Knowledge

**Updated 2026-07-12.** This is the chat-side context pack for the WellEarnedReviews project. The canonical, always-current state doc is `HANDOFF.md` at the root of the connected "Well Earned Reviews" folder; when this pack and the handoff disagree, the handoff wins. Per-decision history lives in `docs/`.

## The business

Done-for-you Google review generation for local businesses at **wellearnedreviews.com**. Customers sign up self-serve: $99 first 30 days, then $249/mo, or $174/mo billed annually ($2,088/yr; early cancel re-rates used months at $249). Intro month caps at TRIAL_CAP=50 enrolled customers with auto-promoting waitlist. Ongoing caps: 300 SMS + 3,000 email per business per month. Positioning: we never gate reviews (everyone gets the same link), the owner never logs into anything, we do about 95% of the work. Owner: Chris Terry (chris@encoreimages.us), under Encore Industries LLC.

## Voice and writing rules (apply to everything)

Deadpan, plainspoken, dry humor where approved. No AI-tell vocabulary. **No em dashes or en dashes anywhere**, including JSON-LD and code comments in shipped pages. Check drafts against Chris's writing style before delivering. Never put API keys, tokens, or passwords in chat, docs, or scheduled task prompts; reference file paths under `Home/credentials/` instead.

## What is live and verified (as of 2026-07-12)

- **Site:** 17 pages on Vercel (project `wellearnedreviews`, team chris-terry-hermes-projects). Landing with ROI calculator and FAQ (includes buying-reviews and no-guarantees answers), /signup 3-step wizard, /demo, /contact, /integrations, /privacy, /terms, /admin operator console. Free tools: Google review link generator (QR kit), AI review response generator, review request templates. 5 review-response-example posts. New star-check logo mark + favicons sitewide.
- **Engine (the product):** Google Sheet "WER Leads" is the data store (tabs: leads, businesses, contacts, events, snapshots). Businesses onboard at /admin, contacts arrive by admin paste or per-business HMAC webhook /api/hook (Zapier etc). Sequencer sends a 4-message sequence: check-in at 16h (asks for nothing), review ask at +24h with click-tracked link, reminders at +72h and +96h that skip anyone who clicked. Dry-humor templates approved by Chris. 9am-6pm PT send window, 8 sends/business/hour, STOP handling, email always, SMS only when enabled. Daily Google rating snapshots, Monday digests, magic-link scoreboards per business. Business #1: Encore Photo Booths.
- **Funnel:** every tool email-capture and signup writes a lead row + Resend audience entry; 4-email nurture drip; lead notifications to Chris.
- **Email:** sends as hello@wellearnedreviews.com via Resend Pro; receiving via Google Workspace secondary domain (hello@ aliases to Chris's Gmail).
- **SMS:** Twilio +19166196827 (approved sole-prop brand, fine for Encore/testing, NOT for client businesses yet). Public line +1 619 452 0435 (voip.ms, SMS-to-email).
- **Analytics:** GA4 (G-KJW8E3ZW0S) + Vercel Web Analytics, both verified live. GSC verified for wellearnedreviews.com plus the two redirect domains.
- **Domains:** hardearnedreviews.com and encore-reviews.com 301 to wellearnedreviews.com (Cloudflare rulesets, verified).
- **Trustpilot:** live free profile at trustpilot.com/review/wellearnedreviews.com. Invitations off until real customers.
- **Google Business Profile:** WellEarnedReviews profile created (Internet marketing service, California service area, address private). Verification pending Chris's video. Duplicate Encore Photo Booths listing removed.
- **Stripe:** built and verified END TO END in TEST mode ($99 intro checkout, webhook flips leads to converted). Go-live blocked on Chris adding the live key to Home/credentials/stripe.env, then: recreate catalog + webhook live, swap Vercel envs, verify a live checkout.

## Deliberately not built

No review gating ever (not even opt-in NPS routing). No customer-facing dashboard login. No per-feature upsell ladder; one price includes everything.

## Open items

**Chris:** pilot business + customer list; Twilio EIN brand (unlocks client SMS); record video narration; GBP verification video; Trustpilot logo upload; keep-or-remove call on the Encore Promotional Products GBP profile; Stripe live key.
**Build queue:** Event Mode kiosk capture (spec ready, acceptance test agreed, ~half day, docs/2026-07-12-event-mode-spec.md); review monitoring alerts; GBP OAuth auto-replies; Phase C/D content; review gap checker.

## Next build: the CRM (decisions made 2026-07-12)

Two faces: operator pipeline for Chris (leads → contacted → onboarding → active → at-risk → churned, revenue, source attribution, tasks) and a customer results portal grown from the magic-link scoreboards. **Decided:** stay on Google Sheets for storage; the operator UI extends /admin rather than becoming a new app; acceptance test is a working pipeline view where stage moves persist. **Still open:** Stripe integration point, how much portal ships in v1 vs the monthly report.
Top steals from competitor teardowns to fold in: review-detection exit rule (stop sequence when the review appears, not just on click), 180-day re-enrollment cooldown instead of permanent dedupe, per-source attribution (kiosk/QR vs SMS vs email), per-step funnel display, since-joining framing for all reports.

## Competitor intel (full docs in docs/)

- **GatherUp** (docs/2026-07-12-gatherup-teardown.md): NPS-gate flow with FTC hedging in their own UI copy; kiosk mode wears a survey costume; one-BCC-address integration story; $99/mo + caps model WER's caps are based on.
- **NiceJob** (docs/2026-07-12-nicejob-teardown.md): 4-touch default campaign validates WER's depth; day-0 link in first SMS; opt-in gating off by default; consent-free check-in kiosk (low compliance bar); Get Repeats reactivation is their $125/mo Pro upsell; review.new vanity links; testimonial-montage homepage video worth imitating once WER has customers.
- Pricing landscape: docs/2026-07-11-competitor-pricing-and-trial-cap.md. WER at $249 sits between the self-serve tools ($75-200) and Podium/Birdeye ($249-449) while being the only done-for-you.

## Working conventions (for build sessions)

Work happens in Cowork sessions with the "Well Earned Reviews" folder connected (and Home/credentials when secrets are needed). One active session per project; a new session continues from HANDOFF.md, never by retrying a dead session's prompt. Deploys go through the Vercel REST pattern (file-hash upload, ~30s, no CLI). Sheet writes go through the service account (talaria-sheets@hermes-integration-499005). Before reporting anything done: verify it live and point to the evidence. Build tasks get a one-line acceptance test agreed up front. Ask clarifying questions all at once, at the start.
