# NiceJob Teardown

**Date:** 2026-07-12. Read-only audit on a fresh 14-day trial (Encore Photo Booths, Rocklin CA), no Google/Facebook connected, no sends triggered. Companion to the same-day GatherUp teardown. Purpose: harvest features for WER and the CRM project.

## The marketing site, before the app

The hero video is the headline finding. It is a multi-customer testimonial montage, real owners on camera saying what happened to their review counts. No product shots, no dashboard tour. The entire video budget went to proof, not features. WER's demo video (55s, dashboard walkthrough) is the opposite; when Chris records his VO, the stronger long-term play is collecting 3 or 4 customer clips and cutting a proof montage, with the dashboard demo demoted to a secondary page.

Claims used throughout signup and app: "Get reviews 4.2 times faster" and "4x more Google reviews." Specific, sticky, unverifiable. WER's honest equivalent is the 23% demo click-to-review rate and the ROI calculator.

## Signup and onboarding

Phone-first form with Google and Xero SSO options. Granular marketing consents at signup (separate checkboxes rather than one blanket agree). After signup: connect Google prompt (skippable with "I'll connect later"), company name + address with autocomplete (the Continue button silently requires picking the autocomplete suggestion), then straight into the app with the Get Reviews campaign already built and toggled Live. Zero-state design: every section sells you the connection or upgrade that lights it up. Total time to "live campaign" was under 3 minutes, which is the bar WER's onboarding call model should be measured against.

## Campaign architecture (the core harvest)

Campaigns are objects with: Objective, Entry rules (+add rule), Options, Exit rule, then N steps. The default Get Reviews campaign:

- **Options:** Allow repeat enrollments ON, minimum time between enrollments **180 days**. That is their answer to over-messaging repeat customers. GatherUp exposes the same idea as a repeat-customer cooldown setting. WER currently dedupes by cell per business forever; a 180-day re-enrollment window is the better model for real businesses with returning customers and belongs in the CRM build.
- **Exit rule:** "Review time created is after the campaign enrollment started." They detect the review and stop the sequence. Smarter than WER's click-based stop, since a click is a proxy but a review is the goal. Requires review-author matching (fuzzy name match against new Google reviews). Already flagged as a feature candidate; the daily Places snapshot plus first-name matching gets WER 80% there.
- **Steps (default):** 1. SMS day 0, 2. Email "Please recommend {Company}" after 2 days, 3. Email "Mind helping out {Company}?" after 5 days, 4. Email "{Owner first} from {Company}" after 5 more days. Four touches total, which independently validates WER's 4-message depth. Their spacing (0/2/7/12 days) is slower than WER's (16h/40h/112h/208h).
- **Full SMS template (step 1):** "Hi {First name}! If you loved {Company name}, would you mind leaving us a review? Thanks, we really appreciate it! Here's the link: {Company review invite link}" plus an optional insert of "the recipient's latest published story." 270-character limit in the editor. Two things to note: the review link lands in the very first message (no check-in touch, day-0 ask), and the phrasing is conditional ("If you loved") which quietly filters unhappy customers without a gate. WER leads with an ungated check-in instead; keep that, it is the differentiator.
- **Step editor:** each step = action + optional step rules + delay in days. Templates support merge fields and the story insert. Per-step funnel metrics (Sent, Clicks, Conversion rate) directly on each card.

The campaign insights view charts the per-step funnel, which is a good pattern for the WER customer portal: show request → click → review per touch, not just totals.

## Feedback routing: they gate too, but off by default

Settings > Reviews. "Feedback routing" toggle, OFF by default: "We'll ask customers an NPS survey. Low NPS scores highlight private feedback, while high scores highlight public reviews." Threshold configurable, default 7 and below (1-10 scale) goes private. Same FTC-aware hedging language as GatherUp (highlight, prioritize, never block). So the two biggest self-serve tools both ship optional gating. WER's no-gating stance remains a real market differentiator, and the copy on wellearnedreviews.com claiming competitors gate is accurate for their opt-in modes.

Auto-publishing is separate and ON by default: reviews auto-publish to microsite and website widgets only at 4 stars or better. The gate lives at the republish layer, not the ask layer. That is a defensible pattern WER could copy someday for a testimonial widget (publish everything to Google, curate what you amplify).

## The review link machine

Every business gets **https://review.new/{slug}**, a branded short domain with QR code, plus a hosted invite page at nicejob.com/{slug}/invite. The invite flow: Google / Facebook buttons, then "Don't use these sites? No problem, write us a manual review," a first-party form (stars, text, name, email) that feeds their microsite. Manual reviews become content even when the customer will not touch Google. WER equivalent today is the direct Google deep link + QR kit. A per-business vanity link (wer.reviews/{slug} or similar) is cheap and makes print collateral cleaner; the first-party fallback form is a bigger build and belongs on the CRM roadmap, not now.

## Check-ins: their kiosk, and Event Mode validation

Settings > Microsite, bottom section. "Check-ins": a public page at nicejob.com/{slug}/check-in with First name, Last name, Cell phone, Email and a Check in button. Toggle "Send review invites after check-in" (OFF by default), "Delay before sending: 60 minutes" default.

Verified on the live public page: **no consent checkbox, no TCPA language, nothing**. Four fields and a button that leads to automated SMS. GatherUp's kiosk at least frames itself as a survey. WER's Event Mode spec (same-day doc) with explicit consent copy, no on-device review ask, and the next-day check-in first touch is both more compliant and better positioned. The 60-minute default delay also confirms the industry norm is "ask fast"; GatherUp waits 4 hours, NiceJob waits 1, WER waits 16+. Keep 16.

## Contact ingestion

People section: "Connect an app" or "Import a CSV file." Native integrations (16): AccuLynx, Clio, CompanyCam, DataCandy, FreshBooks, Housecall Pro, HubSpot, Intercom, Jobber, Mindbody, PayPal, QuickBooks, ResponsiBid, Square, Stripe, Xero. Partner/how-it-works (11 more): ConvertLabs, FieldPulse, JobTread, Libro, Markate, SendJim, ServiceMinder, ServiceMonster, The Seal, UEAT, Vonigo. Positioning line: "your customers will get review invites automatically when you finish the job." The trigger is job completion or invoice paid from the connected tool. Payment processors as triggers (Stripe, Square, PayPal, QuickBooks) is the notable one: "invoice paid" is a universal moment across verticals and WER's /api/hook via Zapier already reaches all of these. Worth a one-page integration recipe doc per vertical later, no new code.

## Get Repeats (their reactivation product)

Pro-gated campaign: "NiceJob will automatically encourage all your customers to book again after their last service." Trigger: N months after last service, default 3. Templates: SMS "Hi {First name}! It's time to schedule your next service call with {Company name}. You can text or call us at {Company phone number}"; email adds urgency ("We're filling up fast so please book with us soon"). This is exactly WER's planned reactivation campaign, and NiceJob monetizes it as the top-tier upsell. Validates the decision to position reactivation blasts as a regular-rate feature (the TRIAL_CAP=50 rationale) and later as its own paid add-on.

## Pricing and packaging

Trial lands on the "Reviews" plan. In-app upsell: **Pro $125/mo**, "Everything in Reviews +" Get Repeats campaign, Get Referrals campaign, Welcome New Customers campaign, Reward Loyal Customers campaign, Auto + Manual social share, Competitor Insights, Review replies, **AI review replies**. Note review replies (including AI) are Pro-only; GatherUp includes AI replies in core, WER includes done-for-you replies in the base service. Broadcast (email/SMS blasts) and Competitor Insights are also Pro-gated. Sites is a separate service: custom-built website, $99/mo + $99 one-time setup, "guaranteed to win at least 10% more leads*".

Packaging lesson: their base plan is review generation only; every lifecycle campaign is upsell. WER's single-price done-for-you bundle is simpler to sell against ("everything included, and a human does it").

## Widgets and microsite (their embed surface)

All embeds ride one JS SDK (cdn.nicejob.co/js/sdk.min.js?id={company-uuid}) with CSS-class triggers:

- **Engage:** social-proof toasts on the business site ("John just left a 5 star review," "New booking by John"), left/right position, mobile toggle. Sold as "win at least 10% more sales by adding social proof."
- **Trust badge:** aggregate rating card (4.8, review count, per-network stars) + recent reviews, nj-badge div.
- **Collect reviews:** the invite funnel as an on-site widget, nj-review class.
- **Collect leads:** "Get an instant estimate" form (name, email, phone, description, contact-consent checkbox, "We receive your request instantly via SMS and usually respond within minutes"), nj-lead class.
- **Stories:** published review/story feed widget.
- **Microsite:** hosted profile at nicejob.com/{slug} with lead form (button text, form title, submit button all editable).

WER has no embed surface today. The cheapest counterpart: a read-only trust badge fed from the daily Places snapshots. Low priority; noted for the CRM portal era.

## Insights section

Report tabs: Reviews, Leaderboard (team/employee attribution), Campaigns, Sites, Referrals, Gifts, Competitors (Pro), NPS (Beta), QR code reviews (Beta). Compare mode and compare-companies mode in the filter model. The **QR code reviews report** tracks Total scans, Click rate, Reviews, Average rating from QR code, with a scans-vs-reviews time chart. That per-source attribution (QR vs SMS vs email) is worth stealing for Event Mode: count kiosk captures and attribute resulting reviews to the event source in the scoreboard. The `source=kiosk` column in the Event Mode spec already enables this.

Also noted: NPS is Beta here while GatherUp has it core, and "Gifts" exists as a loyalty/rewards report (they send gift cards via DataCandy et al). Gifting is out of scope for WER.

## AI reply settings

Radio presets only: Tone (Professional / Friendly / Authentic), Voice (Customer Service / Operations / Management), Length (Brief / Moderate / Lengthy). GatherUp gives a free-text AI prompt per business, which is strictly more flexible and matches WER's per-business guardrailed drafting. Nothing to copy.

## Copy list (adopt for WER)

1. **Review-detection exit rule** for the sequencer: stop the sequence when a matching review appears, not just on click. Fuzzy first-name match against daily snapshot deltas. (CRM build queue, high value.)
2. **Re-enrollment cooldown** (their 180 days) instead of permanent dedupe by cell. (CRM data model.)
3. **Per-source attribution** like the QR report: kiosk/event captures tracked scan → contact → review. (Fold into Event Mode v1 scoreboard counts.)
4. **Per-step funnel display** (sent/clicks/conversion per touch) in the customer portal.
5. **Proof-montage video** strategy for the homepage once 3-4 customers exist.
6. **Vanity review short link** per business (cheap, print-friendly).
7. **Invoice-paid triggers** documented as Zapier recipes for Stripe/Square/QuickBooks/PayPal verticals.

## Reject list (deliberately not copying)

- Day-0 review ask with link in the first SMS ("If you loved..." conditional phrasing). WER's ungated 16h check-in is the brand.
- NPS/feedback routing, even opt-in. No gating, period.
- Consent-free check-in page. Event Mode ships with explicit consent or not at all.
- Campaign-builder UI complexity for customers. WER customers never log in; the 4-touch sequence is the product.
- Per-feature upsell ladder. One price, everything included.

## Already ahead

- Compliance posture: explicit consent capture, STOP handling, quiet hours, per-business caps, TCPA-aware Event Mode spec. NiceJob's check-in page shows the bar is low.
- Sequence speed: 16h to first ask beats their day-0-then-slow-drip on time-to-review without looking like a review station.
- Done-for-you: their whole app assumes an owner doing dashboard work. WER's pitch is that the dashboard does not exist for the customer.
- Voice: their templates are polite filler; WER's dry-humor sequence is distinctive and A/B-able.

## Session hygiene note

Audit was read-only: no invites sent, no test contacts created, no apps connected, campaign Live toggle untouched, no settings saved. The trial (14 days) remains clean for any follow-up look.
