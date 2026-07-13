# WellEarnedReviews — SEO Launch: Keyword Map + Search Engine Registration

**Date:** 2026-07-11. Talaria-method pass (deterministic identity, answer-first, AI discoverability) applied to wellearnedreviews.com.

## Registration state (all verified live today)

- **Google Search Console:** domain property `sc-domain:wellearnedreviews.com` verified via DNS TXT (Site Verification API, hermes service account talaria-sheets@hermes-integration-499005). Sitemap submitted (HTTP 204). Owners on the property: chris@encorepromo.us, chris@encoreimages.us, and the service account, so it appears in Chris's GSC UI.
- **Bing / ChatGPT Search / Copilot / Yandex / Naver / Seznam:** IndexNow ping accepted (HTTP 202) for all 5 URLs. Key file hosted at /22bb0a098910216dc5035cf930468daa.txt (key also in this folder's notes; container copy at indexnow-key.txt).
- **AI crawlers:** robots.txt allows GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, PerplexityBot, ClaudeBot, CCBot, with Sitemap line. /llms.txt live with a liftable service description. FAQPage + Organization JSON-LD on the landing page, claims matching visible content.
- **Answer-first formatting:** already in the build (self-contained pricing/no-gating sentences, question-phrased FAQ headings).

## Keyword map (Ahrefs + Semrush, US, pulled 2026-07-11)

Format: keyword, Ahrefs vol/KD, Semrush vol/KD, Semrush CPC.

### P1 — Homepage (current page, already targets these)
- get more google reviews: 500/6 | 480/39 | $12.96
- google review service: 200/7 | 260/43 | $12.81
- google review automation: 40/3 | 110/13 | $10.24
- automated review requests: n/a | 50/22 | $19.16

### P2 — Comparison pages (build next; near-zero difficulty, $13-35 CPC, buyer intent)
- birdeye alternative: 150/0 | 110/15 | $35.23 → /birdeye-alternative
- podium alternative: 40/0 | 90/11 | $31.55 → /podium-alternative
- Positioning writes itself: they're $299-399/mo platforms you have to learn; we're $199 and you never log in.

### P3 — Cornerstone guide
- how to get more google reviews: 600/31 | 480/24 | $7.93 → /how-to-get-more-google-reviews, answer-first, with the 3-message sequence published openly (liftable asset, cites us as source).

### P4 — Free tool pages (lead-gen; data from the 2026-07-11 qualification doc, Talaria folder)
- google review qr code: 1800/8 (Ahrefs), 1900/40 (Semrush) → /google-review-qr-code
- google review link generator: 600/9 | 720/22 → /google-review-link-generator
- review request templates cluster (KD 0-4) → /review-request-templates
- Removal guides, the highest-CPC content in the space ($8-12 Semrush, $3.50-6 Ahrefs): /how-to-get-a-google-review-removed

### P5 — Category head terms (harder; revisit once DR exists)
- review management software: n/a | 1,900/44 | $26.03
- online review management: n/a | 1,300/52 | $23.57
- review management service: 2,100/56 | 1,300/37 | $13.07
- google review management: 700/12 | 590/50 | $14.64 (TP 4,600; the Ahrefs KD says try earlier via a dedicated page)

### Never target
- buy google reviews (2,100/2): toxic intent, policy-violating audience, brand poison for a "well earned" positioning.

## Next moves (not done today)
1. Build P2 comparison pages and P3 guide (encore-writer voice, answer-first).
2. Build P4 tool pages (client-side JS, zero marginal cost) once the engine work starts.
3. Baseline AI share-of-voice for prompts like "best google review service for small business" across ChatGPT/Gemini/Perplexity (ai-visibility workflow in the Talaria repo).
4. Request indexing of the homepage in GSC UI after a few days if crawl hasn't happened.
5. Verify wellearnedreviews.com as a Resend sending domain (currently sending from encorepromotionalproducts.com).
