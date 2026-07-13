# WellEarnedReviews — Feature Spec v1

**Date:** 2026-07-11. Companion to 2026-07-11-PLAN.md.
**Inputs:** HighLevel docs/pricing research, 2024-26 user-complaint research (G2/Capterra/Trustpilot/Reddit), and a firsthand walkthrough of Chris's live HighLevel account (agency view + Encore sub-account Reputation module).

## What HighLevel actually offers for this exact business

Reputation module (seen live in the account): review request campaigns over SMS/email/WhatsApp, a Requests log with status and sent-via tracking, unified review feed, Reviews AI with two modes (Auto Responses with a wait-time setting, Suggestive drafts) plus configurable "AI agents" with tones, review link + QR generator, review widgets for client sites, video testimonials, listings management, GBP optimization, competitor analysis, spam-review flagging. Around it: contacts/CRM, workflow builder (the "job complete → wait 2h → SMS → wait 2d → email → reminder" recipe), snapshots (prebuilt account templates like Erhart's Agency OS), sub-accounts, white-label, LeadConnector client app. Pricing $97/$297/$497 plus usage fees and add-ons (Reviews AI sits in the ~$97/mo AI Employee bundle).

## Why we're not cloning it

The complaint record is consistent: 2-4 weeks to feel confident, "like 6 different software in one login," 15+ nav items, features buried in settings, surprise usage costs on top of base price, and constant UI churn that breaks client training. Chris's own fresh sub-account showed 16 left-nav items and a 6-step reputation onboarding checklist before the first request can send. NiceJob wins its segment by advertising the opposite: one purpose, 60-second setup, set-and-forget. Our product IS the simplification.

## Design principles (every feature must pass all five)

1. **One purpose.** Reviews only. Anything else is scope creep, no matter how adjacent.
2. **No login required.** The owner's entire experience works from their existing phone and inbox. A dashboard exists, reached by magic link (no password, ever). HighLevel's biggest client-side failure is requiring an enterprise CRM login to check a review.
3. **Ten-second comprehension.** The dashboard is one screen, four numbers, plain English. If a roofer can't explain it to his wife after one look, redesign it.
4. **Done-for-you defaults.** Zero settings exposed to clients. Every knob (timing, tone, pacing) has a default Chris's admin controls. "Configure your AI agent's tone" is our competitor's UX, not ours.
5. **Flat price, no meters.** $297/mo includes messages, AI, everything. No usage-fee surprises, which is a documented HighLevel resentment.

## Client-facing features (what the business owner gets)

1. **One-page scoreboard** (magic link): current Google rating, total reviews, new reviews this month, and "requests sent → clicked → reviewed" this month. One before/after line since joining.
2. **Weekly digest email/SMS**: new reviews (with stars), what we posted in response, how many requests went out. The product is legible without ever opening the dashboard.
3. **Add-a-customer, three dumb-simple ways**: (a) text the customer's first name + cell number to their WellEarnedReviews number; (b) forward any invoice/booking confirmation email to their magic address (we parse it); (c) one-field web form. Bulk CSV is our job, not theirs.
4. **Review link + QR pack** at onboarding: direct Google review link, printable counter card PDF, sticker file. (Their HighLevel equivalent is buried in Settings → Reviews QR.)
5. **AI review responses, safety-split**: 4-5 star reviews get an on-brand response auto-posted after a 10-15 min delay. 1-3 star reviews NEVER auto-post; owner gets an instant text with a drafted reply and one-tap approve/edit. HighLevel exposes this as agent/tone/mode configuration; we ship it as behavior.
6. **Negative-review alert**: the ≤3-star text above, within minutes of the review appearing.
7. **Review widget** for their website: star badge + latest reviews, one script tag, installed by us.

## Engine features (invisible; Chris + AI operate via admin)

8. **The 3-message sequence** (SMS + email, per plan): personalized check-in, same-link-to-everyone request (no gating), click-checked reminder. Quiet hours, per-business send windows, STOP/unsubscribe suppression baked in.
9. **Reactivation drip**: one button per client, 2-3 sends per 20 min through past-customer lists.
10. **Contact ingestion**: CSV import, invoice-email parsing, and export recipes for QuickBooks/Jobber/Housecall Pro (API integrations deferred).
11. **Attribution**: request → link click → new-review time-correlation, so the scoreboard's "requests → reviews" number and the measured conversion rate (HighLevel cites 10-25%) are real, not vibes.
12. **Review monitoring**: poll the client's Google profile for new reviews; feeds alerts, AI responses, and attribution.
13. **Monthly report**, auto-generated, plain English, emailed: growth, response rate, and a competitor line (count + rating of 3 named local competitors, tracked lightly; their Competitor Analysis tab, reduced to one sentence).
14. **15-minute onboarding wizard** (Chris-facing, mirrors HighLevel's 6-step checklist but pre-wired): business lookup → Place ID → review link/QR generated → sender number + email domain assigned → list imported → industry message template previewed → live. Industry template packs = our "snapshots."
15. **Multi-tenant admin board**: every client's status, sequence health, deliverability, opt-outs, A2P status, message logs. One screen.

## Feature 16: Guided Google Setup ("Get on Google", added 2026-07-11)

For businesses with no Google Business Profile at all. Owner does ~25 minutes; we do the rest. Included in the plan, not an add-on, because zero-review businesses produce the most dramatic before/after case studies.

- **A. Intake (owner, ~10 min, by text):** business name, address or service area, hours, phone, and ~10 phone photos (truck, signage, work, team).
- **B. Build (us):** category selection, keyword-aware description, services list, photo edit/selection, hours/attributes, and the correct answer to Google's business-model classification step (new Feb 2026: storefront vs service-area vs online-only; wrong picks cause compliance trouble).
- **C. Creation (10-min guided call):** owner clicks through profile creation on their own Google account with our pre-filled cheat sheet. Their account owns the profile from day one; we never hold ownership.
- **D. Verification (owner, ~5 min):** video verification with a trade-specific 60-second shot list, us on the phone during filming. The one step only the owner can do.
- **E. Finish (us):** after approval (typically a few days), take manager access via invite, finalize, generate review link + QR kit, start sequences on a slow ramp (new profiles that get sudden review bursts trip Google's spam filters; pace the first 3-4 weeks).

Signup asks "do you have a Google listing?" so these leads self-identify at the front door.

## Explicitly NOT building (the anti-HighLevel list)

Funnels, websites, calendars/booking, sales pipelines, unified inbox, email marketing, memberships, payments, voice AI, prospecting tools, white-label reseller mode, workflow builder UI (workflows exist in code, not as a client-facing canvas). Each of these is why HighLevel takes 2-4 weeks to learn.

## Deferred to later phases

Facebook review sources, video testimonials, listings sync, GBP post scheduling, missed-call text-back (good upsell, real scope), WhatsApp channel, self-serve signup + Stripe billing + client-managed settings (phase 4 per plan), QuickBooks/Jobber/Housecall Pro API integrations.

## Sources

- HighLevel Reputation docs: help.gohighlevel.com/support/solutions/48000449583; Reviews AI guide (155000001074); pricing gohighlevel.com/pricing
- Firsthand: Chris's HighLevel account, agency view + Encore sub-account Reputation module (2026-07-11)
- Complaints: g2.com/products/highlevel/reviews; netpartners.marketing/gohighlevel-disadvantages; worqstrap.com 2025 review; trustpilot.com/review/www.gohighlevel.com
- Simplicity positioning: get.nicejob.com; starloop.com
