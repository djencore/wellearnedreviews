# AI discoverability: get cited, not just ranked

Playbook for future-proofing every Talaria site for AI search and agent-mediated discovery.
Source: 2026-06 research/fact-check thread (repo `2026-06-29-ai-discoverability-rollout-brief.md`).
Apply on every build/redesign, in the same commit as the visual work — this is additive to the
visual and result-experience checklists in `SKILL.md`, not a replacement.

## Why this exists (verified, mid-2026)

- **Zero-click is the norm.** ~68% of US Google searches end with no click (mobile ~77%);
  under a third still send one (SparkToro 2026). The page often never gets the visit.
- **AI Mode is Google's default search surface** since the May 2026 redesign — Google's own
  "biggest change in 25 years" framing. The answer, not the blue link, is what most users see.
- **Google's May 2026 generative-AI optimization guide** says unique, expert-led content
  influences generative presence "more than any other suggestion." Recycled AI-spun filler loses.
- **The agent stack is real and shipping** (A2A 2025, Gemini Spark at I/O 2026, AP2 2025,
  Agentic Resource Discovery spec) — but there is **no small-publisher button** that "deploys
  your site as an agent." Google's "Knowledge Catalog" is rebranded Dataplex (enterprise data
  governance), not a public business profile. The practical, available version of all of it is
  structured data + answer-first content.

**The reframe:** the website doesn't die — it becomes the machine-readable source of truth. On
a calculator page the "customer" is increasingly an AI that reads the page, extracts the cost
answer, and repeats it to a user who never clicks. The goal shifts from *rank + convert a human*
to **get cited and recommended by the assistant**, while still converting the humans who do land.
A cost/calculator network is unusually well-placed here — cost answers are exactly what people
ask assistants — but only if every page is structured so a machine can lift the answer and
attribute it.

## The five moves (every build/redesign)

### 1. Structured data on every page

Valid JSON-LD, **emitted once** — the generator has a known double-emit bug for the
`<script type="application/ld+json">` tag; check for it on every build. Validate syntax with
Google's Rich Results test before deploy.

- Calculator pages: `FAQPage` and/or `HowTo`.
- Guides/articles: `Article` with a **real author** and real `datePublished` / `dateModified`.
- Site-wide: `Organization` + `WebSite`.

**Know what the markup buys.** Google removed HowTo rich results (Sept 2023) and restricted
FAQPage rich results to gov/health sites (Aug 2023), so on Talaria sites this markup earns **no
SERP rich result**. We ship it anyway for **machine legibility** — a clean Q→A structure AI
fetchers can parse — not for SERP decoration. Set expectations accordingly and never contort
page content to chase a rich result that can't appear.

**Schema must match the visible page.** Every claim in the JSON-LD (author, dates, answers,
organization details) must appear in the rendered content. Schema-only "facts" are a trust and
spam signal; audit for mismatches, not just syntax.

Skeletons (fill from the site's real data; wording via encore-writer):

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"How much does X cost?",
  "acceptedAnswer":{"@type":"Answer","text":"X typically costs $A–$B, depending on Y and Z."}}]}
</script>
```

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article",
 "headline":"...","author":{"@type":"Person","name":"<real byline>"},
 "datePublished":"2026-06-01","dateModified":"2026-06-29"}
</script>
```

A reusable, singular FAQPage/HowTo/Article/Organization block in the site generator (one source
feeding all ~94 sites) is the right long-term fix — flagged as a first task, not yet built.

### 2. Answer-first, liftable formatting

Open the page and the result with **one self-contained, machine-quotable sentence** — e.g.
"Re-grouting a standard shower typically costs $400–$900, depending on tile size and mold
removal." — then the number, then the tool. Use a question-phrased heading ("How much does X
cost?"). Add at least one liftable asset: a definition block, a comparison table, or a worked
example — tables and crisp definitions get pulled into AI answers disproportionately. This
extends the existing "answer, then number" field pattern; the quotable sentence must survive
being lifted with zero surrounding context.

**Liftability is per-passage, not per-page.** LLMs don't rank pages; they select passages. So:

- The answer sentence sits in the **first ~60 words** after the question-phrased heading.
- The full answer block under that heading works as a **self-contained ~135–165-word unit**
  (sentence, then supporting figures/caveats) — the passage size AI answers typically lift.
- **Every key statistic** on the page is written to survive extraction alone: number, unit,
  year, scope, and source in one sentence ("The average U.S. homeowner paid $1,428/yr for home
  insurance in 2026, per NAIC filings."), not a number stranded in a paragraph of context.

### 3. Original data = citation bait (the network's unfair advantage)

Publish per-site insight or methodology pages built from real calculator aggregates or the
underlying standard ("Average X cost by state, 2026"). LLMs cite original statistics far more
than prose — unique numbers are the best way to become the source an AI repeats. A calculator
network can publish numbers nothing else on the web has; treat this as its own workstream, not
a checkbox. **Never fabricate** — derive from the real model or a cited source.

**Dataset-page spec** (a named dataset gets cited; numbers buried in prose get paraphrased
without attribution). Each rebuilt site gets at least one page with:

- A **named, dated dataset** in the title and H1: "2026 Gutter Installation Cost Index, by state."
- A **stable URL** that survives redesigns (this is the address other sites and LLMs will cite).
- A methodology section: where the numbers come from (model constants, named primary source),
  when last updated.
- A summary table near the top plus a **downloadable CSV** of the underlying table.
- A short "cite this page" line (site name, page title, year, URL).

**Cite primaries on-page.** Name and date the underlying sources (IRS tables, NAIC filings, the
NMFC standard) inline. A page that visibly cites its primaries reads as a verifiable secondary
source — the chain of trust retrieval rewards — and it compounds with the editorial-standards
page. The network already holds real primary data (NAIC, state tax tables, NMFC); use it.

### 4. Crawler access + machine entry points

- `robots.txt` allows **GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, PerplexityBot,
  ClaudeBot, CCBot** and keeps its `Sitemap:` line. (`OAI-SearchBot` is the distinct token for
  ChatGPT search.) Most sites already comply — the risk is a redesign silently dropping it, so
  re-check on every pass.
- Add `/llms.txt` (short plain-text/markdown index: what the site is, its key tools and data
  pages, who writes it). **Weight it honestly:** evidence of AI systems actually reading it is
  thin (Google says it doesn't; observed AI-bot request share ~0.1%). Ship it because it's
  nearly free optionality — never count on it as a lever.
- Submit new/updated pages via **IndexNow** (feeds Bing, which feeds ChatGPT search and Copilot)
  alongside the existing Google indexing workflow.
- Keep the answer in **server-rendered HTML**. Many AI fetchers don't execute JS, so an answer
  injected client-side is invisible to them. The live-recompute calculator is fine — but the
  default/typical answer sentence and the reference tables must be in the static markup.
  Talaria's hand-written HTML is already correct here; don't regress it.

### 5. Measure AI share-of-voice

Baseline, per target prompt, across ChatGPT / Gemini / Perplexity:

- **Mention rate** — does the assistant name the site at all?
- **Share-of-voice** — how often, versus competitors?

Wire results into the repo `ai-visibility/` workflow. This replaces keyword rank as the headline
metric. Prefer a real AI-visibility tool (Profound, Otterly, or Peec) over ad-hoc prompting —
you can't improve what you don't measure.

## Two guards — do NOT autopilot these

1. **Per-site entity only; no shared cross-network entity.** Stamping one consolidated
   `Organization`/`sameAs` graph across dozens of cross-linked domains is fingerprintable — the
   exact footprint risk this skill already fights in the CSS. Each site gets its own
   self-consistent entity: its own `Organization`, its real author, `sameAs` pointing to its own
   real profiles. Per-site authority, not one factory's catalog. If Chris later wants a few
   flagship sites to build consolidated brand authority, that's a conscious trade — flag it,
   never default to it.
2. **Don't block on unsettled agent specs.** AP2 / ARD / NLWeb / MCP storefronts are real but
   moving, and there's no first-party small-publisher deployment path today. Structured data
   (move 1) captures ~80% of the agent-readability benefit now. Treat the discovery/payment
   specs as watch-and-fast-follow, never a redesign blocker.

## Beyond the five moves

- **Off-site presence drives AI recommendation as much as on-site content.** Assistants weight
  what the web says *about* a site — Reddit, forums, review sites, Wikipedia. Light digital-PR /
  citation-seeding on the top domains moves being *recommended*, separately from owning good pages.
- **Freshness signals.** AI answers favor recently-dated content, and prompts containing a year
  ("in 2026") trigger live search essentially every time — so the year in a title is a query
  surface, not decoration. `dateModified` must actually update when a page changes; dataset
  pages carry the current year in the title and get a scheduled annual refresh. **Never leave a
  stale year in a title** — a "2025" page in 2027 is an anti-citation signal.
- **Corroboration, flagships only.** Sites present on multiple platforms are cited far more
  (~2.8x for 4+ channels), but doing PR for the whole network recreates the footprint problem.
  Seed dataset pages for a few flagship sites (pitch the stats to writers, answer relevant
  forum/Reddit threads with the data); per-site entities stay separate per guard 1.
- **Measure per engine.** Only ~11% of cited domains overlap between ChatGPT and Perplexity —
  baseline and track mention rate per engine, not as one blended number. When a competitor gets
  cited instead, look at the passage being lifted and build the better liftable version.

## Checklist — AI discoverability (per site)

Additive: the build must still clear the visual and result-experience checklists in `SKILL.md`.

- [ ] Valid **singular** JSON-LD: FAQPage/HowTo on calculator pages; Article + real author +
      datePublished/dateModified on guides; Organization/WebSite site-wide (no double-emitted
      `ld+json` tag)
- [ ] JSON-LD passes Google's Rich Results test before deploy
- [ ] Page and result open with one self-contained quotable answer sentence; heading is
      question-phrased
- [ ] Answer sentence sits in the first ~60 words after the heading; every key stat is a
      self-contained sentence (number + unit + year + scope + source)
- [ ] At least one liftable asset: definition block, comparison table, or worked example
- [ ] Original-data or methodology page published where possible (real aggregates or a cited
      source — never fabricated)
- [ ] Dataset page meets the spec: named + dated title, stable URL, methodology, summary table,
      downloadable CSV, "cite this page" line
- [ ] Primary sources named and dated on-page (IRS/NAIC/NMFC etc.)
- [ ] Titles carry the current year where dated; no stale years anywhere on the site
- [ ] `robots.txt` allows GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, PerplexityBot,
      ClaudeBot, CCBot and keeps its `Sitemap:` line
- [ ] `/llms.txt` present (optionality only — not a lever)
- [ ] Schema claims all appear in the visible page content (no schema-only "facts")
- [ ] New/updated URLs submitted via IndexNow in addition to Google indexing
- [ ] The answer exists in server-rendered HTML, not injected client-side
- [ ] `dateModified` actually updates when the page changes
- [ ] **Per-site entity only** — own Organization, real author, own `sameAs`; no shared
      cross-network entity graph
- [ ] AI mention rate + share-of-voice baselined for the site's target prompts
      (ChatGPT/Gemini/Perplexity → `ai-visibility/`)

## Rollout order

Bundle into the redesign queue, not a separate pass: each site already getting a visual/result
redesign gets the five moves in the same commit. For sites not yet queued, prioritize the
highest-traffic / highest-AI-citation-opportunity domains first.
