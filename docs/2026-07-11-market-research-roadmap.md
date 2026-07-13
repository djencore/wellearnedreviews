# WellEarnedReviews — Competitive Market Research + Content Roadmap

**Date:** 2026-07-11. All data Semrush (US database), pulled today: SERP results for 7 money keywords, top-pages reports for 5 ranking competitors, authority scores for 5 domains.

## Who actually ranks, and with what

**SERP census across our target keywords.** Google's own properties (support/business/chromewebstore) plus Reddit and YouTube take 3-5 of every top 10. The remaining slots are won by two kinds of sites: free-tool pages and one-topic content sites. The platforms with sales teams (Podium, Birdeye) barely appear organically except where they run free tools themselves (birdeye.com's AI response generator ranks; their homepage doesn't, not for these terms).

**Authority needed: less than expected.**

| Domain | Authority Score | Ref domains | What ranks for them |
|---|---|---|---|
| repbot.ai | **8** | 131 | #2 for "ai review response generator" (free tool), 81% of their traffic |
| arrivala.com | 26 | 1,974 | review link generator tool page |
| rightresponseai.com | 27 | 916 | free AI review response generator |
| whitespark.ca | 40 | 8,093 | review link generator (972 visits/mo, 186 keywords from ONE page) |
| hovercode.com | 46 | 792 | review link generator tool |

repbot.ai at Authority Score 8 outranking everyone for a 150-260/mo commercial keyword is the whole thesis: **in this niche, free tools rank on usefulness, not authority.** A fresh domain can compete immediately on tool terms.

## Five competitor patterns worth copying

1. **Whitespark (the model).** Free tools are their top non-homepage pages: the review link generator alone pulls ~972 visits/mo across 186 keywords and earns the links that lift everything else. Tool = lead-gen front door for a paid service. Exactly our architecture.
2. **Repbot (the shortcut).** One free AI response generator + a cluster of "review response examples" posts (1-star, 3-star, 5-star, dealership) internally linking to it. Tiny site, focused cluster, ranks. Cheapest replicable win on this list.
3. **Trustmary (the mega-guide).** One comprehensive "Mastering Google My Business" guide drives 62% of their US organic traffic (~6,500 visits/mo). A single definitive GBP guide can carry a domain. Pairs perfectly with our guided-GBP-setup feature.
4. **Hatch / usehatchapp.com (the ICP magnet, and our closest true competitor).** Their review content is NOT what ranks. Their traffic comes from trade-specific template posts: HVAC service contract templates, roofing contract templates, holiday message templates. They fish where the customers are (contractors searching for free documents), then sell messaging automation. Smart, and directly stealable.
5. **Wiremo (the long tail).** QR/link generator page + support-style content ("manage and see my google reviews", "how to leave a google review") ranking on 170-315 keywords per page. End-user explainer content builds topical authority even though searchers aren't buyers.

## What this means: the roadmap

Ordered by effort-to-impact, each phase shippable independently. All copy through encore-writer; all pages answer-first with singular JSON-LD per the site standard.

**Phase A — Free tools (the Whitespark move).** /google-review-link-generator (link + QR in one tool, client-side, no signup), /ai-review-response-generator (free, no signup; repbot ranks with AS 8, we out-execute on UX and speed). These are the link magnets and the front door. Target: live within the site's first content sprint.

**Phase B — The response-examples cluster (the Repbot move).** 5-8 posts: negative review response examples, 1-star, 5-star, no-name-mentioned, plus 2 trades (contractor, dental). Every post internally links to the generator. Low volume each, but they stack and they convert.

**Phase C — Two cornerstone guides (the Trustmary move).** "How to get more Google reviews" (600/mo, KD 24-31, the category's head guide term) and a definitive Google Business Profile setup guide that doubles as marketing for the guided-setup feature. Long, sourced, answer-first, updated dates maintained.

**Phase D — Comparison pages.** /birdeye-alternative, /podium-alternative (KD 0-15, CPC $31-35). Honest feature/price tables; our angle is the $199 flat price and never-log-in simplicity vs their $299-399 platforms.

**Phase E — Trade template magnets (the Hatch move).** Review request templates by trade (roofers, HVAC, dental, auto), then seasonal/greeting message templates for local businesses if the trade pages work. This is ICP fishing, not review content, and it's Hatch's proven traffic engine.

**Ongoing:** the SERPs are full of Reddit and YouTube. One honest demo video per tool (YouTube ranks in 4 of our 7 target SERPs) is cheap distribution. No Reddit astroturfing, ever; if we participate it's disclosed.

## Watchouts recorded

- support.google.com and business.google.com occupy 2-3 slots on most of these SERPs; the realistic target is the top organic slot among non-Google results.
- Wiremo's biggest traffic page is an off-topic article; don't copy their sprawl, copy their tool.
- "Buy google reviews" adjacency: some SERP neighbors monetize gray-market intent. We never touch it; the brand IS the compliance story.
- Semrush traffic estimates are directional, not measured; treat page-level numbers as ratios, not absolutes.

## Phase A ship record (2026-07-11)

Live and verified same day: /google-review-link-generator (search + paste paths, QR download, print card, email-me-kit capture), /ai-review-response-generator (Claude Haiku behind /api/generate-response, guardrailed: never argues, never offers compensation, no invented details), /review-request-templates (live-personalized 3-message sequence + email + in-person script, text-me capture). Funnel: every tool has a contextual CTA to /signup and an email-capture that delivers the asset via Resend and notifies Chris of the lead. All three in sitemap + llms.txt + IndexNow pinged (200). Verified: all pages 200, AI generator returned a compliant response to a 2-star test review, toolkit email delivered.

Open item: /api/place-search returns ok:false until the GOOGLE_PLACES_API_KEY referrer allowlist includes wellearnedreviews.com (Chris, 2 minutes in Google Cloud Console → Credentials → that key → add wellearnedreviews.com/*). The paste-your-link path works for everyone meanwhile.
