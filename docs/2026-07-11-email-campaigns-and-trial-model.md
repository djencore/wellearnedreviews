# Email Campaigns Architecture + Trial Model Comparison

**Date:** 2026-07-11. Written as input for the CRM build session.

## Part 1: Usage caps (implemented + live-verified)

GatherUp model adopted: **300 SMS + 3,000 emails per business per calendar month** (env: MONTHLY_SMS_CAP, MONTHLY_EMAIL_CAP). Enforced per-channel in engine-tick: a business at its email cap stops getting emails but SMS continues (and vice versa); a contact with no available channel simply defers without losing sequence position, and counters reset on the 1st. Send events now log channels ("stage 1 email+sms") so usage is countable. Verified live: cap=1 with two due contacts produced exactly one send, second deferred. Stacked with the existing trial cap (50 enrollments in the intro month, waitlist auto-promotes at day 30) and the 8 sends/business/hour pacing.

For sizing: a full 3-message sequence costs at most 3 emails + 3 SMS per contact, so the monthly caps support ~1,000 email contacts or ~100 SMS-sequenced contacts per business per month. Far above honest use, low enough to stop list-blasting.

## Part 2: How email campaigns work (current + CRM requirements)

**Today's pipeline (all Resend, one API):**
1. Sequence emails (engine-tick): from FROM_ADDR, reply_to = business owner, plain text, click-tracked links.
2. Nurture drip (marketing, /api/drip): 4 stages, consent-gated, HMAC unsubscribe + List-Unsubscribe header.
3. Transactional: signup confirmations, tool asset deliveries, lead notifications, Monday digests, contact-form.

**Known constraints the CRM must design around:**
- **Resend free tier = 100 emails/day, 3,000/month for the whole account.** ONE business at its full email cap consumes the entire account. The $20/mo Pro tier (50,000/mo) is required before the pilot scales, and it also unlocks verifying wellearnedreviews.com as the sending domain (free tier already holds encorepromotionalproducts.com as its one domain). This is now a launch prerequisite, not a nice-to-have.
- **Sender identity:** current from is leads@encorepromotionalproducts.com. Post-upgrade: sequences@wellearnedreviews.com for engine mail, hello@ for drip/digests, with per-business friendly-from ("Mike at Ridgeline Roofing") and reply-to the owner. Per-client subdomains are overkill until deliverability data says otherwise.
- **Compliance split, keep it hard:** sequence emails to a business's customers are transactional-ish service messages sent on the business's behalf (no marketing consent needed from the end customer, but honoring unsubscribes is mandatory and currently handled via reply + suppression). Drip emails to OUR leads are marketing (consent checkbox, unsubscribe link). The CRM must never blur these pools.
- **Missing plumbing to build in the CRM:** Resend webhooks for bounces/complaints (a hard-bounced address should auto-suppress and mark the contact undeliverable; a spam complaint should suppress across the business), per-business suppression lists as first-class data (today STOP handles SMS; email suppression is implicit), send-log with message IDs for support ("did Sarah get the email?"), and campaign entities (the reactivation drip should be a named campaign with its own stats: sent/delivered/clicked/reviewed).
- **Data model sketch for CRM:** businesses, contacts, campaigns (type: sequence | reactivation | digest), sends (contact, campaign, channel, message_id, status), events (clicks, bounces, complaints, opt-outs), monthly_usage (biz, month, email_count, sms_count). The Sheets tabs map onto these tables 1:1 when we move to a DB.
- **Warm-up note:** when wellearnedreviews.com starts sending, ramp volume over 2-3 weeks (Resend reputation is shared but domain reputation is ours); the per-business hourly pacing already produces a natural ramp.

## Part 3: Trial models compared (Chris to decide)

| Model | Who uses it | Mechanics | Fit for WER |
|---|---|---|---|
| 14-day free trial | Starloop, GatherUp, NiceJob | Free, usually full features, no CC at NiceJob | Weak fit alone: WER is done-for-you, so a free trial means we do real onboarding labor (number, import, sequences) for $0, and 14 days is too short to show a review-count story |
| 30-day money-back guarantee | Starloop (on top of trial) | Pay, refundable within 30 days | Strong fit: costs nothing unless someone's unhappy, removes the same risk a trial removes, and the customer is committed enough to take onboarding seriously |
| $99 intro month (current) | Nobody else does this | Paid-but-cheap full month, capped at 50 enrollments | Already more generous than the market: a real month of a done-for-you service for less than half price |

**Recommendation:** keep the $99 intro month and ADD a Starloop-style 30-day money-back guarantee on top ("$99 for month one, and if you're not happy we give the $99 back"). That is strictly stronger than Starloop's offer (their guarantee protects $197, ours protects $99 and includes a month of human labor), costs nothing at honest churn rates, and gives sales copy a clean line: "Your risk is zero dollars and one text message." A free 14-day trial is the one model to avoid: it invites the exact churn-and-burn behavior the trial cap exists to stop, and two weeks isn't enough for reviews to visibly land. Not implemented; awaiting Chris's call.

Sources: blog.starloop.com/starloop-vs-birdeye-which-one-to-choose ($197 flat, 14-day trial, 30-day guarantee, unlimited customers), gatherup.com/pricing ($99/location, +$60/addl, 20% annual, 14-day trial, "Up to 300 SMS + 3,000 email credits per location per month"; rollover/overage terms unpublished).
