# GatherUp Teardown

**Date:** 2026-07-12. Sources: live walkthrough of Chris's 14-day trial (business Encore Photo Booths, id 172760) plus 18 onboarding screenshots in `gatherup.com screenshots/`. Read-only tour; no sends, no settings changed, toll-free registration skipped.

## Onboarding (signup to ready in 4 wizard steps)

Signup: email, then password page (12 char minimum) asking "How many locations are you setting up today?", then hard email-verification gate before the dashboard. Wizard framing is "Say hello to your new reputation coach."

- **Step 1, location.** Type your business name, they match it from Google and pre-fill everything: name, address, timezone, phone, even the website (it pulled encorephotobooths.com/sacramento, a subpage). You confirm rather than enter. Business Category is the one required field they cannot pull. Note under the form: editing here will not touch your Google profile.
- **Step 2, texting opt-in.** "Businesses that send texts alongside email generate 80% more reviews per request than businesses that rely on email alone." Saying yes starts toll-free number registration: owner name, business-domain email required (they warn against gmail and against agency contacts), legal name, DBA, business type, EIN, registration authority. Carrier verification, per location. Skippable, and the dashboard then nags with a persistent banner.
- **Step 3, Google connect.** OAuth "Log in with Google" to enable replying to reviews from their dashboard. If you skip, fallback asks you to confirm your Google listing link so they can import existing reviews. Either way they import your review history DURING onboarding ("We're rounding up your existing reviews"), so the dashboard has data before you send anything.
- **Step 4, request template.** Upload logo, pick brand color, pick rating type (NPS default), and send yourself a test request. Done screen pushes you to check your own inbox.
- A compliance modal appears mid-wizard: AI Data Processing Notice about enabling PHI/PII filtering before using AI features on first-party reviews (HIPAA/GDPR). Their AI reply features ship with the legal burden pushed to the customer.

## The request program

Three flow types in Request Setup: **Survey & Reviews Flow (preferred)**, Ratings & Reviews Flow, Public Reviews Flow. The preferred default is the NPS funnel:

1. **Rating Request** (email/SMS): subject "Hi [first name], just a few questions", NPS 0-10 "How likely would you recommend..." No review link yet.
2. **First Rating Reminder**: ON by default, sends 2 days after the request if no rating.
3. **Second Rating Reminder**: exists, OFF by default.
4. **Review Request**: sends 4 hours after positive feedback, asks for the public review.
5. **Second Review Reminder** (email): OFF by default.
6. **Negative Flow**: Apology Page ("apologize and ask for details"), Negative Feedback Page (private detail capture), Submission Confirmation, Apology Email ON (immediate follow-up).

The tell: the Apology Page description says it "shows public review site links to comply with FTC guidelines." The whole architecture routes unhappy people into a private channel first, then displays the public links because the law requires it. That is the soft gate WER positions against, spelled out in their own UI copy.

Template anatomy: business logo, brand color, NPS buttons, business name and full address in the footer, unsubscribe link, "Powered by GatherUp" (their product is a lead channel on every send). Sender is GatherUp infrastructure, not the owner's number/address.

## SMS architecture

One toll-free number per location, carrier-verified with the owner's EIN and legal details. Compare WER: A2P 10DLC brand + campaign on Twilio. Their trial caps: 300 SMS and 50 emails per month (published paid caps are 300 SMS + 3,000 email per location). Send Mode toggle: Automatic or manual. Requests are counted against visible monthly meters right on the activity screen.

## Kiosk Mode (opened 2026-07-12, second pass)

Per-location kiosk URL (app.gatherup.com/k-172760) meant for an iPad handed to the customer at checkout; pitched at restaurants, medical offices, handyman trades. The tablet captures contact info and the NPS rating on-site, but never asks for the public review there. A separate "Positive Email: Review Request" goes out later (default timing 4 hours after feedback, toggle ships OFF), with their own copy explaining the delay gives the customer time "before being asked for optional Online Reviews." The real reason: reviews posted from one device on the business's wifi look like a review station and get filtered. Negative kiosk feedback routes to the apology flow. Templates: Feedback Landing Page (questions inherit from Request Setup), Positive Thank You Page, Positive Review Request email, Negative Apology.

WER takeaway: the capture half is worth stealing as an "event mode." A tablet or QR at the booth/counter capturing name + cell with a consent line, posting into /api/hook, feeds the normal 4-touch sequence with zero owner effort. Perfect fit for Encore Photo Booths events, dental counters, auto shops. Keep their two compliance details: consent at capture (TCPA basis for the texts) and never soliciting the public review from the on-premise device.

## SMS Requests page and TextBack (opened 2026-07-12, second pass)

SMS Settings: a single editable SMS template (channel affinity rule: if the initial request goes out by text, reminders follow by text). Message types are credit-priced in the UI, SMS 1 credit with a 160 character cap, MMS 2 credits at 306. The character counter deducts for customer name, feedback URL, and the auto-appended "Text STOP to opt out" (their default copy sits at 130 of 160). SMS quiet window is 9am to 9pm in the business's LOCAL timezone; queued sends roll to the next day. Send-test-to-self button with a "devices may display differently" disclaimer.

TextBack: inbound keyword enrollment. A customer texts a keyword (default "feedback", multiple keywords selectable) to the business's number and an auto-reply starts the feedback flow. Ships OFF until the toll-free number exists. Customer-initiated, so consent posture is as clean as it gets.

WER takeaways: (1) Keyword enrollment is the no-tablet Event Mode; /api/sms-inbound already handles STOP, teaching it per-business join keywords would auto-create consented contacts and belongs on the event card next to the QR. (2) Quiet-hours contrast: WER sends 9am to 6pm PT globally, GatherUp to 9pm business-local; per-business timezone and a later cutoff will matter beyond California, especially for evening trades like photo booth events. (3) Segment cost: WER's stage-1 SMS with link and STOP line exceeds 160 chars, so it is a 2-segment send, roughly $4.50/mo extra per maxed business at Twilio rates. Keep the voice, cost is known and trivial.

## Dashboard (relevant to the WER CRM portal)

- Stat cards: NPS score, Send Mode, Monthly Requests as used/cap for SMS and email separately, Customer Profiles count.
- Customer Activity table: name, rating type, feedback (with auto-tagging), status, publishing, type, source. Filter by location, date range, export.
- Location Dashboard (beta): Progress card with a 1st Party / 3rd Party toggle, Requests card with count sent, Replies card. Empty states are coached ("All great things had small beginnings").
- Sidebar gamification: "Set up your location 1/6" progress meter. Also in nav: Reports, Publish (widgets/social), Integrations, Listings Hub, Review Defense (monitoring/alerts naming).
- "Insights Incoming" holding state while review import runs.

## Full app audit (2026-07-12, every section opened)

**Reports suite (8 reports, all PDF-exportable, date-ranged):**
- Smart Insights: AI analysis of collected feedback producing "Areas for improvement" lists. Empty until data exists; Generate button.
- Performance Report: NPS gauge with Poor/Average/Good/Excellent bands, the promoters-minus-detractors math shown as an equation, survey question ratings, month-to-month NPS chart.
- Reviews Report: overall rating circle, star histogram, per-source ratings (Google badge), reviews-by-month chart, +last-30-days and +since-joining deltas. Comparison tab.
- NPS Report: same cards plus customer CSV export and a comparison tab.
- Success Report: "a one-page summary of your reputation's growth since joining," NPS + 3rd-party reviews + 1st-party reviews cards, everything framed as growth since they showed up. This is their retention artifact; WER's Monday digest and monthly report should steal the since-joining framing.
- Business Report: the funnel table. Per location: requests sent, opens, open rate, feedback received, feedback rate, response rate, review clicks, new reviews, total reviews. Label filter, email CSV. Green/red trend coloring.
- Q&A Report: Google Q&A monitoring and management (question totals, unanswered count, per-location, CSV). A whole GBP surface WER has not considered.
- Competitor Report: opt-in "competitor ratings, volume, and recency" insights (left disabled).

**Requests section extras:** Add Customer form has communication preference radio (email/SMS/both), custom ID and job ID, tags, private notes, "send feedback request immediately" checkbox, and a heavyweight consent checkbox making the BUSINESS attest it has a privacy policy and express customer consent (TCPA burden pushed downstream at data entry; import has the same gate). Import: CSV/XLS, 2MB, sample template. Email Signature Survey: an NPS 0-10 widget embedded in the owner's email signature, passive collection channel, large/small sizes, custom prompt text.

**Integrations: exactly one.** Universal Email Integration: BCC a per-business address (name-id@reviewability.com format, their legacy domain) on any transactional email and a review request gets scheduled. WER's "forward the invoice email" is the same play and already shipped.

**Publish suite (the social-proof machinery):** Review Widget (vertical/horizontal/full-page layouts, 4-step wizard, embed code), Tag Widget (mini widgets per service/product/area linking to the main widget), Review Badge (Clean/Modern/Minimal rating+count badge), Social Sharing (connect Facebook/Instagram/Google Posts, share any review as a post from the activity screen, plus Create Automation for auto-posting), Conversion Pop-Up (best-reviews popup injected by pixel on chosen URLs, exact/partial match, shows only when 3+ reviews match, 1st-party toggle, click-through URL). This whole section is the widget gap WER has nothing for; NiceJob teardown should compare here.

**Settings worth recording:** AI Reply Prompts: three separately customizable prompt layers (Smart Reply for manual writing, Suggested Reply for approval queue, Auto Reply), defaults per client, per-location override. Auto-Tagging: keyword rules auto-tag reviews for reporting. Auto-Replies: auto-respond to positive 3rd-party Google/Facebook reviews after OAuth. Notifications: essential vs advanced, per-type recipients (1st-party, 3rd-party, suggested reply). Online Review Links: multiple destination sites, each with independent "ask on this URL" and "monitor this URL" flags, drag to reorder, "choose at least 2 review sites" advice. Feedback Settings: reply-to custom or owner, repeat-customer cooldown (default 30 days, 1-365, suppresses re-recording feedback from the same customer), default send method for dual-channel contacts, and a permanent per-location Leave Feedback URL (app.gatherup.com/f-172760) with QR, pitched for receipts, invoices, business cards, signatures; works without knowing the customer's name or email.

**Review Defense:** fake-review detection and dispute assist. Cards: total lifetime reviews split active/suspicious/in dispute/removed, a "Suspected AI Reviews" percentage donut, impressions impact of legitimate vs suspicious, and an "Audit My Business for Suspicious Reviews" run button (not clicked). Positioned as TOS-violation protection.

**Listings Hub:** separate listings-sync product (manage/update/dedupe directory listings from one place), upsell gate.

**Business Dashboard:** the URL is /agency. Multi-business rollup table (rating, requests sent, open rate, feedback, clicks to review sites, total reviews, trend colors, labels, export). The platform is agency-shaped under the hood, which is exactly the seat WER occupies for its clients; their per-location toll-free billing is what makes agency margins hard, and WER's shared A2P + done-for-you model is the counter.

**New feature candidates from the audit:** since-joining growth framing in every report; Google Q&A monitoring; a free "review audit" tool in the Review Defense vein as a WER lead magnet (scan a GBP for suspicious review patterns, deliver by email); per-business AI reply prompt overrides in the CRM; repeat-customer cooldown as an engine setting when repeat-job trades onboard; auto-posting 5-star reviews to socials; the widget/badge/popup family (confirmed gap, evaluate against NiceJob's version).

**Not touched during audit:** Competitor Report enable, Review Defense audit run, Listings Hub access, all social/Google connects, toll-free registration.

## What WER takes from this

**Reject, and say so in marketing:** the NPS-first funnel is a soft gate with an FTC hedge written into their own interface. WER sends every customer the same public review link. The comparison page practically writes itself; quote their apology-page copy.

**Worth copying:**
1. Import existing reviews at onboarding so the customer portal is never empty. WER already snapshots Places data; the portal should backfill rating and count history from day one.
2. Confirm-from-Google instead of asking the owner to type their own address. WER's guided setup does this by text; keep it.
3. Send-yourself-a-test during onboarding. Cheap trust builder; a WER onboarding call equivalent is texting the owner their own first check-in.
4. Visible usage meters (sent vs cap). Honest and calming; belongs in the WER scoreboard once caps matter.
5. Empty-state coaching lines in the portal instead of blank tables.

**Where WER is already ahead:** direct 4-touch ask with no survey detour, owner never logs in (GatherUp is a full SaaS the owner must operate), no "Powered by" line on customer-facing messages, personal sender identity (owner's name, reply-to the owner) instead of platform-branded NPS surveys, and a $99 first month instead of a 14-day trial that nags with Upgrade banners.

**Their claim worth stealing as a stat (verify before publishing):** texts alongside email generate 80% more reviews per request than email alone. If our own data eventually shows similar, that is signup-page material.

## Open follow-ups

- Trial has 13 days left; worth one more session inside Reports and Review Defense once real data lands in their import.
- Do not complete their toll-free registration; it files carrier paperwork for Encore Photo Booths that duplicates the Twilio brand work.
