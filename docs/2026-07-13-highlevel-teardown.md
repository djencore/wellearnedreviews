# HighLevel teardown, 2026-07-13

Read-only walkthrough of Chris's GoHighLevel trial (agency "Encore", sub-account "Encore", Lincoln CA). No accounts connected, no sends, no integrations touched, no A2P registration started. Trial stays clean for a second pass. Companion docs: 2026-07-12-gatherup-teardown.md, 2026-07-12-nicejob-teardown.md.

## Billing flag, act before Aug 10

The trial is **Agency Pro at $497/mo** (their top tier; $97 Starter and $297 Unlimited exist below it). Signed up Jul 11, 2026, 30-day trial, and the billing page says the card **auto-charges when the trial ends around Aug 10**. Same playbook as GatherUp's Jul 25 charge: decide or cancel by ~Aug 8. Their billing line: +1 (888) 732-4197. HIPAA add-on pitched at $297/mo (ignore). They also push a free 1:1 onboarding call; harmless, and their team will answer A2P questions on it if Chris ever wants a free consult.

## What HighLevel is

The agency-in-a-box platform. One agency account, unlimited client sub-accounts (on the $297+ tiers), every module white-labelable. SaaS Configurator lets an agency resell the whole platform as its own product with automatic Stripe billing, and a Reselling page sets markups on HighLevel's wholesale prices: AI Employee $97, SEO (Search Atlas) $79, Prospecting $29, WhatsApp $10, dedicated sending IP $59 with 1x/1.5x/3x markup presets, "up to 10x markup" marketing on wallet rebilling (phone, email, AI). Their pitch page claims 10K+ agencies earning $300M/yr in SaaS mode. This is the seat WER occupies (GatherUp's /agency URL made the same point), industrialized.

## Reputation module, tab by tab

Lives per sub-account: Overview, Requests, Reviews, Video Testimonials, Widgets, Listings, GBP Optimization, Settings.

**Overview.** Two sub-tabs, My Stats and Competitor Analysis. Before anything is connected it auto-detected both Encore listings by business name and teased "Connect accounts to unlock 182 reviews" (Google listing showing 75, a second platform showing 107). Dashboard panels: reviews and ratings trend, review response (coverage + response time), review request volume and conversion split by Email/SMS/WhatsApp, video testimonials, widget impressions and submissions, QR code scans, plus a listings upsell. A 6-step Get Started checklist (connect GBP, review link, Reviews AI, widget, first request, more platforms). Sloppy detail: merely viewing the widget page checked off "Create a Review Widget."

**Competitor Analysis.** Up to 3 competitors across Google, Yelp, Facebook. Features: website Score (load time, vitals), Competitive Grid, Sentiment Heat-map by category, Rating by Source. This is the productized version of WER's parked "competitor tracking" idea.

**Requests.** One-off manual sends only (search or create a contact, pick Email/SMS/WhatsApp, optional per-send review-link override). Every channel is OFF until enabled in Settings. The recurring cadence is NOT here; it is assembled in Automation workflows or the per-channel settings below.

**Settings > SMS / Email / WhatsApp Requests.** Their entire cadence model in three dropdowns: "When to send after check-in?" (default Immediately), "Until clicked, repeat this every" (default Don't Repeat), "Maximum retries" (default 1). Exit rule is CLICK-based only. Toggles ship OFF. One stock SMS template ("Would you be willing to take 30 seconds..."), zero email templates. Default email sender is the signup Gmail (electricimages619@gmail.com), so out of the box a client would send review requests from a random Gmail. WhatsApp needs the $10/mo add-on.

**Settings > Reviews AI.** Three modes: Auto Responses (sends AI replies unattended), Suggestive (drafts), Off. Configurable wait time before responding so replies don't look instant. "Respond to Reviews, Drip Mode" for clearing a backlog gradually (gated on GBP connect). Multiple "AI agents" segmentable by review rating, source, and tone. This is the mature version of the reply-posting WER has queued behind GBP OAuth.

**Settings > Review Link / QR / Spam.** Review Balancing toggle distributes requests across multiple platforms to even out review counts. QR code generator with scan tracking. AI spam detection for incoming reviews (off by default): flagged reviews get no auto-reply, stay out of widgets and dashboard, human can override.

**Settings > Integrations.** ~50 platforms importable, mostly by pasting a page link (Yelp, TripAdvisor, BBB, The Knot, WeddingWire, Thumbtack, Trustpilot, app stores, plus custom links). Only Google and Facebook are true OAuth connects.

**Widgets.** Embeddable review widget family with templates, live preview, embed code. Confirms the widget gap noted in both prior teardowns (NiceJob ships these too; WER has none).

**Video Testimonials.** New module: branded "collector" pages where customers record video, a responses inbox, video widgets. Neither GatherUp nor NiceJob has this.

**Listings.** Yext-style paid add-on (95+ directories, sync, duplicate suppression, "premium backlinks") behind a "Scan my business for FREE" hook. The free-scan-as-lead-magnet pattern again.

**GBP Optimization.** Completely empty until the owner OAuths Google. Same dependency NiceJob has, and the same ammo for WER comparison pages: WER's dashboard fills itself from day one with no owner login.

## Automation and Prospecting

Workflows are the real sequencing engine: a template library with recipes ("Send Review Request", "Appointment Confirmation + Reminder + Survey + Review Request", missed-call text-back, no-show nurture) plus a chat-with-AI workflow builder in beta. Nothing runs until someone assembles and enables it.

Prospecting (agency level): enter a local business, generate a marketing audit report to pitch them, 5 premium reports on the trial, report builder and embeddable audit widgets on paid tiers. It is WER's planned review-gap-checker aimed outbound at prospects instead of self-serve.

## Phone system and A2P (the part relevant to Chris's Twilio problem)

Each sub-account has a full phone system (LC Phone, HighLevel's Twilio ISV wrapper): Phone Numbers, Regulatory Bundles, Messaging, Voice, Trust Center, Additional Settings. The Trust Center is a self-serve wizard per sub-account covering A2P brand + campaign registration, SHAKEN/STIR, CNAM, and Voice Integrity. I did not click Start Registration (would create a draft filing), but the structure confirms the model: **every client business registers its own A2P brand and campaign; the platform just automates the paperwork as an ISV**. Nobody rides a shared umbrella brand. WER's path for client SMS is the same shape: per-client sole-prop brands (like Encore's already-approved one) registered under WER's Twilio account as ISV, manual for the first handful of clients, scriptable later via Twilio's TrustHub API. HighLevel proves the per-client wizard is boring, standard practice, not a WER-specific burden.

## Steal for WER

1. **"Unlock N reviews" onboarding tease.** They show detected listings and review counts before anything is connected. WER already pulls Places data; show a prospect their own numbers on /signup or in the review-gap-checker before asking for anything.
2. **Reply wait-time + drip mode + per-rating tone.** Fold into the GBP OAuth reply-posting design now: a configurable delay before posting AI replies, drip-clearing of reply backlog at onboarding, harsher-rating replies routed for approval.
3. **Competitor panel framing.** Up to 3 named competitors, rating by source, sentiment by category. Keep on the build queue for the monthly report; even a Places-only version (rating + count deltas for 3 chosen competitors) beats nothing.
4. **Prospecting-style outbound audit.** The review-gap-checker doubles as Chris's outbound weapon: run it against a prospect before a call, send the report. HighLevel charges $29/mo for this as a module.
5. **A2P Trust Center shape.** Productize per-client brand registration as an onboarding step in the WER runbook (collect legal name, EIN or sole-prop info, submit, wait, flip sms_ok to yes).
6. **Review Balancing** (spread asks across platforms) and **video testimonials**: log as far-future candidates, not current work.

## Reject, or WER already ahead

1. **Assembly required everywhere.** Channels off, no email template, cadence dropdowns at Don't Repeat, workflows unbuilt, sender defaulting to a signup Gmail. A business owner buying HighLevel gets a parts kit. This is the strongest validation yet of WER's "live in a day, owner never logs into anything" positioning, and it is exactly the NiceJob dashboard point again but worse, because HighLevel is aimed at agencies, not owners.
2. **Click-based exit only.** "Until clicked, repeat this every" is their whole stop logic. WER has click-skip AND review-detection exit with re-enrollment cooldown, which is strictly smarter than the $497/mo platform.
3. **Deliverability defaults.** WER sends from a verified brand domain with suppression handling; HighLevel's default is the signup Gmail until someone configures dedicated sending (and they upsell a $59/mo dedicated IP with markup).
4. **GBP-gated everything.** Reviews AI, GBP Optimization, and most of the dashboard are dead until owner OAuth. WER comparison-page line practically writes itself: their dashboard is empty until you do the work; WER's fills itself before your first coffee.
5. **No NPS gating in the core flow.** Their request flow sends the review link directly (no visible filter step), so the no-gating positioning holds against HighLevel too; the contrast to market is done-for-you vs kit-of-parts, not gating.

## Use-as-infrastructure verdict

No. Running WER on HighLevel would mean $497/mo (or $297 minus SaaS mode), porting a live, verified engine into their workflow model, giving up the review-detection exit and the owner-less onboarding that differentiate WER, and building on the platform WER sells against. The one thing worth taking is knowledge: the A2P per-client registration pattern, which WER can implement directly on Twilio for the cost of the carrier fees. Decision point: cancel the trial by ~Aug 8 unless a second pass finds something new; keeping it costs $497 on ~Aug 10.

## Second-pass candidates (trial clean until ~Aug 10)

Open the A2P Trust Center wizard one screen deep to note exactly what fields it collects (with Chris's OK to create a draft). Connect nothing else. Look at Account Snapshots (prebuilt sub-account templates) if WER ever productizes multi-client onboarding, and the branded client portal app if the customer-portal roadmap grows teeth.
