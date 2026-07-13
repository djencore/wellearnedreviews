---
name: talaria-site-designer
description: >
  Give each Talaria site a distinct visual identity instead of the shared template look.
  Use when building a NEW site, redesigning one, or when a site "looks generic" or "like
  every other AI site." Also use to make sites "show up in AI," "get cited" by
  ChatGPT/Gemini/Perplexity, or be "future-proof"/"agent-ready" — carries the
  AI-discoverability pass (singular JSON-LD, answer-first liftable formatting, dataset
  pages, crawler access, AI share-of-voice; see references/ai-discoverability.md).
  Enforces anti-AI-slop rules: deterministic topic-anchored palette + font pairing +
  layout personality + one signature element per domain, density/variance dials, a
  plan-then-collide-test, and a screenshot self-critique gate. Covers the result
  experience and trust patterns winning calculator/cost sites use (live results,
  plain-language answers, worked solutions; see references/field-patterns.md). Pairs
  with encore-writer for copy. Output is hand-written HTML/CSS in the site's own files.
license: MIT
version: 1.5.2
---

# Talaria Site Designer

The Talaria network has a real problem and it is measurable in the CSS. Pull any three of
`network-sites/*/styles.css` or `imc-sites/*/styles.css` and you will find the **same
skeleton**: identical custom-property names (`--ink --ink2 --muted --line --line2 --bg
--card --accent --accent2 --accent-dk --good`), the same `Sora` + `Inter` pairing, the same
`--shadow`, the same `--radius:14px`, the same `border-bottom:3px solid var(--accent)` header.
Only the accent *hex* changes. That is exactly the "every AI site looks identical" pattern,
and across a link mesh it is also a **footprint risk** — a near-duplicate template repeated
across dozens of cross-linked domains is fingerprintable.

`hub-sites/concretecalctools.com` is the counter-example and the target standard: charcoal +
construction-orange, Oswald uppercase heads, industrial language. It looks like *that topic*,
not like a template. The job of this skill is to make every site feel that deliberate.

This skill shapes look-and-feel **and the result experience**. For pure-CSS restyles it
won't touch calculator logic, schema, the footer mesh, ad slots, or copy. But when a site
is being built or regenerated, it also specifies how the *result* behaves and reads —
because on a calculator page the result, not the hero, is the product (see
`references/field-patterns.md`). For copy/wording, use **encore-writer**.

---

## The rule: inverse the slop

AI design looks generic because models reach for the same defaults. Build the bad version in
your head, then ban each part of it. Every site this skill produces must clear all eight:

1. **Anchor everything to the subject's real world.** A freight-class calculator should feel
   like logistics (steel, stencil, weigh-station). A pet-insurance site should feel warm and
   domestic. A tax calculator should feel like a ledger. Never start from a blank template and
   recolor it — start from what the page is *about*.
2. **One bold thing, not everything.** Pick a single hero move — an oversized headline, one
   strong image, one animated number — and keep everything else calm around it. Slop shouts
   everything at once so nothing lands.
3. **One accent, used sparingly, on a calm ground.** A single strong color on a neutral
   background. **Banned defaults:** purple/violet gradients (`#8b5cf6`, `#7c3aed` and friends),
   cream-and-terracotta, the indigo→pink hero gradient, near-black + a single acid-green/vermilion accent, and a whole
   page built on dense hairline rules with zero radius (the broadsheet tell; hairlines stay a
   local tool, not the entire system). If the topic genuinely *is* purple,
   earn it; otherwise pick from the archetype table.
4. **A font with character.** Not Inter-on-Inter. Head and body must contrast, and the head
   font must say something about the topic (condensed/industrial, serif/authoritative,
   geometric/clinical, humanist/friendly). See `references/archetypes.md`.
5. **Room to breathe.** Real whitespace. Thin hairline rules (`1px` borders) instead of a drop
   shadow on every box. Most cards should have *no* shadow.
6. **A bit of movement — restrained.** One tasteful motion: a count-up on the hero figure, a
   subtle reveal on scroll, a hover lift on the primary tool card. Not everything bouncing.
   Respect `prefers-reduced-motion`.
7. **No emojis in headings, ever.** Instant AI tell. Use a small inline SVG or nothing.
8. **No identical-triplet card row** as the default layout. If you use cards, vary their
   size/role (one feature, two supporting) or pick a different layout entirely.

---

## The signature hero illustration

The hero's "one bold thing" (rule 2) is usually a graphic, and a flat geometric vector reads as
generic just like a gradient does. Make it an illustrated, subject-anchored mascot or object with
a dash of character:

**Two paths for the hero visual:** (a) an inline SVG mascot (default, lightweight, below), or
(b) a real AI-generated subject photo via the imagery pipeline (see "AI imagery pipeline" near
the end). Use the photo for pet, lifestyle, cosmetic, food, and most consumer topics where a
real image lands harder; keep the SVG mascot for abstract/utility topics or when no image-gen
key is available. A real, different photo per site is also unfingerprintable across the mesh.

- **Realistic + a dash of cartoonish.** Use SVG gradients and a ground shadow for dimensional
  shading (the "realistic"), and rounded friendly forms plus a simple face for the "cartoonish."
  Multi-stop shading *inside the illustration* is allowed even though the rest of the site stays
  flat — the art is the deliberate exception, not a license for gradient buttons.
- **Anchor it to the subject, literally.** GPA site → a pencil-graduate holding a report card.
  Freight-class site → an LTL box truck with the class stamped on the cargo. Tax site → a
  coin/ledger character. The mascot *is* the topic; never a generic blob or abstract swoosh.
- **Match the site palette exactly.** Pull fills from the archetype's tokens (navy/crimson/paper,
  or graphite/signal/amber, etc.). The illustration adds shading, not new brand colors.
- **Inline SVG, ~2–4 KB, accessible.** `role="img"` + a real `aria-label`; honor
  `prefers-reduced-motion` for any motion. No external image request for this.
- **A different mascot per site** is part of the anti-footprint win — a network of distinct
  characters cannot be fingerprinted as one template.
- Vector is the default. Photoreal raster needs an image-generation connector; only reach for it
  when the brand genuinely calls for photography. Worked examples live in the redesign previews
  (`gpacalctools-redesign/hero-graphic.svg`, `classyourfreight-redesign/hero-graphic.svg`).

See `references/archetypes.md` for a per-archetype mascot starting point.

---

## The result is the product (field-tested patterns)

The eight rules above make a page look deliberate. But the top-ranking calculator and cost
sites win on the **result experience** and **trust**, not just visuals. Apply these on every
calculator/cost page — full catalogue with attribution in `references/field-patterns.md`.

The five highest-leverage moves:

- **Tool-first, live results.** Put the working tool above the fold and recompute on every
  keystroke — no "Calculate" button. The tool is the hero; the mascot sits beside it.
- **Answer, then number.** Lead the result with one plain-language sentence ("Class 70 —
  typical for dense, durable goods"), then the figure. Cheapest credibility upgrade there is.
- **Show your work.** A "How we calculated this" block with the user's own numbers in the
  formula, ideally as a labeled, copyable pod.
- **Mono metadata + spec-sheet labels.** Set numbers, dates, codes, and stats in a monospace
  face with tabular figures; number sections like a technical doc (`01 — Method`). Biggest
  "looks crafted" gain for near-zero effort.
- **Quantified-authority strip.** Next to the tool, cite the data source/standard, scope, and
  a privacy note ("Based on the official NMFC standard · runs in your browser").

Plus: per-field `?` tooltips, a copy/print utility bar, a static reference table under a spec
label, and one blunt display-type sentence on a full-bleed accent band for personality.

Some of these are markup/JS, not CSS. On a CSS-only restyle, apply the visual ones and leave
the rest as recommendations; when building/regenerating a site, wire them all in. Wording
goes through **encore-writer**.

---

## Per-site identity is deterministic, not random

So two sites never collide, derive the identity from the domain rather than picking freely.

1. **Classify the topic** into one of the archetypes in `references/archetypes.md`
   (Legal, Insurance/Medical, Tax & Finance, Home & Construction, Pet & Lifestyle,
   Cosmetic/Health, Logistics/Industrial, Generic-Utility fallback).
2. **Take that archetype's base system** — head/body font pairing, layout personality,
   signature-element idea, shadow/edge treatment.
3. **Lock the accent by hashing the domain** so it's stable and distinct. Quick method:
   ```python
   import hashlib
   def site_hue(domain):
       h = int(hashlib.md5(domain.encode()).hexdigest(), 16)
       return h % 360            # HSL hue, 0–359
   ```
   Build the accent in HSL from that hue inside the archetype's allowed saturation/lightness
   band (the table gives the band, e.g. finance = muted/desaturated, pet = warm/bright). This
   guarantees `1031exchangecalc` and `estatetaxcalculator` get the same *family* but different
   hues — related, not cloned.
4. **Break the shared skeleton.** Do not reuse the `--ink/--accent/--accent2/--accent-dk`
   variable block verbatim. Rename tokens, change `--radius`, change the header treatment,
   change the hero structure. Identical variable *names* across sites are themselves part of
   the footprint — vary them.

---

## v1.3 process and rules (2026-06-28)

Distilled from Anthropic's frontend-design plugin, taste-skill, and a live cat-insurance.org
rebuild. Full rationale in repo `2026-06-28-talaria-design-upgrades.md`.

### Plan, then collide-test (BEFORE writing CSS)
Write a compact token plan first: palette (4-6 hex), type roles, a layout concept with a rough
ASCII wireframe, and the signature element. Then generate, in notes, the generic default you
would produce for this topic on autopilot. Compare; revise anything that matches the default and
write one line saying what you changed. Only then write CSS. This moves the anti-sameness check
from post-build to pre-build, where it is cheap.

### Per-site dials (extends the deterministic identity above)
Hash the domain to LAYOUT and DENSITY too, not just the accent hue, so sibling sites differ in
structure, not only color:
- VISUAL_DENSITY: airy / standard / dense. CAP at airy-to-standard on content and calculator
  sites. Dense ("cockpit") busts rule 2 (one bold thing) and reads as busy to a real visitor; a
  dense cat-insurance pass was rejected for exactly this ("really busy, do not know what to look
  at first"). Reserve dense for genuine data dashboards, which Talaria does not build.
- DESIGN_VARIANCE: centered / split-screen / gently-asymmetric. Apply above 760px only; always
  collapse to one clean column on mobile.
- MOTION stays low network-wide (Core Web Vitals + AdSense viewability). One restrained motion max.
  Never adopt perpetual/infinite card animations.

### Hard CSS and perf rules
- Never pure `#000`; use charcoal / zinc-950 for "black" ink.
- Animate only `transform` and `opacity`; never `top/left/width/height`.
- Full-height heroes use `min-height:100dvh`, never `100vh` (iOS Safari jump).
- Tint any unavoidable shadow to the background hue.
- Visible `:focus-visible` states on links, buttons, fields; never bare `outline:none`.
- Tactile press: primary buttons get `:active{ transform: scale(.98) }`.
- Monospace with tabular figures for all numeric data.

### Data realism (pairs with encore-writer)
Organic numbers (47.2%, not 50%; realistic phone formats). Real author name + a real headshot,
never "John Doe" or egg/Lucide-user avatars. No startup-slop brand names (Acme, Nexus) and no AI
filler words (Elevate, Seamless, Next-Gen). No Unsplash hotlinks; use a real asset or a seeded
placeholder.

### Footer pattern (HARD RULE: grid, never flex)
This has now shipped uneven TWICE despite a softer rule, so treat it as a hard gate. A footer
`.cols` styled with `display:flex; gap` sizes each column to its content, so unequal link counts
(a 2-link group beside a 4-link group) leave lopsided gaps. ALWAYS use a fixed grid with links
stacked as blocks, INCLUDING when restyling an existing site whose markup already uses a flex
footer (override it). Exact pattern:
```
footer .cols{display:grid;grid-template-columns:1.8fr 1fr 1fr;gap:32px;align-items:start}
footer .cols a{display:block;margin:0 0 9px}   /* scope to .cols so an inline related-mesh stays inline */
@media (max-width:760px){ footer .cols{grid-template-columns:1fr 1fr} }
```
Verify by scrolling the footer into the screenshot-critique; the columns must line up.

### Numbered markers
Use `01 / 02 / 03` only when the content is a real sequence (a process or ordered timeline).
Decorative numbering is a tell.

### Screenshot self-critique gate (required before ship)
Render the built page and look at the actual pixels (in Cowork: open it in the browser and
screenshot), then critique against the eight rules. This caught real issues a code review missed:
em dashes in copy, a busy layout, and an uneven footer.

### Reference build
The approved cat-insurance.org direction is the worked example: two-column hero (subject photo +
copy + byline on the LEFT for the emotional connection, calculator on the RIGHT as the action
element), charcoal + cool-cream, ONE accent pulled from the subject itself (emerald sampled from
the cat's eyes), Space Grotesk + Newsreader + JetBrains Mono for numbers, calm density, one focal
point per side. `border-radius` is a per-site lever (that build uses square tiles). Source:
repo `_demo-cat-insurance-redesign/after2.html`.

## AI imagery pipeline (per-site real image + favicon + logo)

Each site can get its OWN generated subject image, with a matching favicon and header logo, all
served as AVIF for high PageSpeed. Tool: repo `talaria_genassets.py`.

**Stage 1, GENERATE** with Google "Nano Banana" (Gemini 2.5 Flash Image). Keep the prompt
simple and subject-anchored, the way a person actually asks. Formula (`build_prompt()`):
"Create a cute, friendly {subject} image for a website, {archetype style cue}. Centered subject,
soft uncluttered background, photorealistic with a touch of warmth. Use {palette} tones.
Suitable as a wide website hero and for cropping a circular logo. No text, no watermark."
- {subject} comes from the topic (cat-insurance to a russian blue cat; freight to a friendly box
  truck; tax to a coin/ledger mascot). {archetype style cue} comes from the archetype.
- "centered subject" and "no text" are load-bearing: they make the logo crop clean and dodge the
  garbled-text AI tell. Match {palette} to the site so the hero and the design agree.
- Needs a Gemini API key (AIza...). The endpoint + call live in `generate()`. Or generate the
  image by hand in AI Studio and skip to Stage 2.

**Stage 2, PROCESS** (no key; runs locally via Pillow):
`python3 talaria_genassets.py process SOURCE OUTDIR --accent "#HEX" --subject cat`
From one source image it emits, at high PageSpeed:
- `hero.avif` + `hero.webp` + `hero.jpg` (serve via `<picture>`, AVIF first; AVIF is roughly
  2.5x smaller than JPG, e.g. 44 KB vs 115 KB).
- `logo.webp` / `logo.avif` / `logo.png` (round, accent-ring, cropped from the subject's face via
  OpenCV for animals, else a center-weighted square). The header uses `logo.webp` (~15 KB).
- `favicon.ico` (16/32/48) + `favicon-32.png` + `apple-touch-icon.png`.
It prints the `<head>` tags and the `<picture>`/`<img>` markup to paste in.

**Rules:**
- Always AVIF-first via `<picture>` with a JPG fallback. Never ship a raw PNG/JPG hero or a
  100 KB+ header logo; that defeats the PageSpeed goal that motivated the AVIF step.
- The logo's accent ring uses the site's hashed accent, tying the mark to the palette.
- favicon + apple-touch + header logo all come from the same crop, so the brand reads
  consistent across the browser tab, the home-screen icon, and the header bar.
- alt text describes the real image. Wording still goes through encore-writer.

## Future-proof for AI search and agents (v1.5)

Search is going zero-click and agent-mediated: ~68% of US Google searches now end without a
click (SparkToro 2026), and AI Mode has been Google's default search surface since May 2026.
On a calculator page the "customer" is increasingly an AI that reads the page, lifts the cost
answer, and repeats it to a user who never visits. So every build/redesign must also make the
page **machine-liftable and attributable** — get cited and recommended by the assistant, while
still converting the humans who do land. Full playbook, JSON-LD skeletons, and rationale in
`references/ai-discoverability.md`. The five moves, done in the same commit as the visual work:

1. **Structured data on every page.** Valid, **singular** JSON-LD (never double-emit the
   `ld+json` tag — known generator bug): `FAQPage`/`HowTo` on calculator pages, `Article` with a
   real author + `datePublished`/`dateModified` on guides, `Organization`/`WebSite` site-wide.
   Validate syntax with Google's Rich Results test before deploy. Note: FAQPage/HowTo earn **no
   SERP rich result** on commercial sites (Google removed them 2023) — we ship them for AI
   machine legibility, and every schema claim must also appear in the visible page content.
2. **Answer-first, liftable formatting.** Open the page and the result with one self-contained,
   machine-quotable sentence, under a question-phrased heading ("How much does X cost?"), then
   the number, then the tool. Include at least one liftable asset: a definition block,
   comparison table, or worked example. Extends the existing "answer, then number" pattern.
   LLMs select passages, not pages: the answer sits in the first ~60 words after the heading,
   and **every key stat** is written to survive extraction alone (number + unit + year + scope
   + source in one sentence).
3. **Original data = citation bait.** Publish per-site insight/methodology pages from real
   calculator aggregates or the underlying standard ("Average X cost by state, 2026"). LLMs cite
   original statistics far more than prose. **Never fabricate** — real model or cited source only.
   Each rebuilt site gets at least one page meeting the **dataset-page spec** (named + dated
   dataset in the title, stable URL, methodology, summary table, downloadable CSV, "cite this
   page" line), with primary sources (IRS/NAIC/NMFC etc.) named and dated on-page.
4. **Crawler access + machine entry points.** `robots.txt` allows GPTBot, ChatGPT-User,
   OAI-SearchBot, Google-Extended, PerplexityBot, ClaudeBot, CCBot and keeps its `Sitemap:` line
   (don't let a redesign silently drop it). Add `/llms.txt` (near-free optionality; evidence of
   AI use is thin — never rely on it). Submit new/updated URLs via IndexNow (feeds Bing →
   ChatGPT search/Copilot). Keep the answer in **server-rendered HTML** — many AI fetchers
   don't execute JS; a client-side-injected answer is invisible to them.
5. **Measure AI share-of-voice.** Baseline mention rate + share-of-voice per target prompt
   across ChatGPT/Gemini/Perplexity; wire into the repo `ai-visibility/` workflow. This replaces
   keyword rank as the headline metric.

Two guards — never autopilot these:

- **Per-site entity only.** No shared cross-network `Organization`/`sameAs` graph — that's the
  same fingerprintable footprint this skill fights in the CSS. Each site gets its own
  self-consistent entity. Consolidating a few flagships is a conscious trade Chris must approve.
- **Don't block on unsettled agent specs** (AP2 / ARD / NLWeb / MCP storefronts). Structured
  data captures ~80% of the agent-readability benefit today; treat the rest as
  watch-and-fast-follow, never a redesign blocker.

## Build / redesign checklist

When creating or fixing a site's `styles.css` + page HTML:

- [ ] Topic classified → archetype chosen (`references/archetypes.md`)
- [ ] Accent hue hashed from the domain; sits in the archetype's S/L band; **not** a banned default
- [ ] Head font has character and contrasts the body; pairing matches the archetype
- [ ] Hero has exactly **one** bold element; the rest is calm
- [ ] Hero graphic is an illustrated, subject-anchored mascot/object (shaded, palette-matched, inline SVG with `aria-label`) — not a flat geometric placeholder
- [ ] Cards mostly shadowless; hairline rules instead of drop shadows everywhere
- [ ] No emojis in any heading; no identical 3-card default row
- [ ] One restrained animation; `prefers-reduced-motion` handled
- [ ] CSS token names / `--radius` / header style **differ** from the sibling sites you sampled
- [ ] Mobile pass (the network breaks at 760px — keep that breakpoint working)
- [ ] Calculator markup, schema, footer mesh, ad slots **untouched**
- [ ] Plan written + collide-tested before any CSS
- [ ] Per-site density + layout-variance picked from the domain hash (density capped on content sites)
- [ ] `:focus-visible` states present; tactile `:active`; motion only on transform/opacity
- [ ] Footer uses an even grid (not content-width flex)
- [ ] If using a real image: hero is AVIF-first `<picture>`; favicon + apple-touch + header logo generated from it (talaria_genassets.py)
- [ ] Footer scrolled into the screenshot-critique; columns EVEN (grid, never content-width flex)
- [ ] Built page screenshotted and critiqued before ship
- [ ] Squint test: does it look like *this topic*, or like the template recolored?

On a calculator/cost page, also (see `references/field-patterns.md`):

- [ ] Tool is above the fold; results recompute live (no submit button)
- [ ] Result leads with a plain-language sentence, then the headline number in the display face
- [ ] "How we calculated this" shown with the user's own numbers
- [ ] Numbers/dates/codes in a monospace face; sections carry spec-sheet labels
- [ ] Quantified-authority strip (source/standard + scope + privacy) sits next to the tool
- [ ] `prefers-reduced-motion` honored for count-ups / reveals

### AI discoverability (every build/redesign — additive to the blocks above)

See `references/ai-discoverability.md` for the full playbook and JSON-LD skeletons.

- [ ] Valid **singular** JSON-LD: FAQPage/HowTo on calculator pages; Article + real author +
      datePublished/dateModified on guides; Organization/WebSite site-wide (no double-emitted
      `ld+json` tag — known generator bug)
- [ ] JSON-LD passes Google's Rich Results test before deploy
- [ ] Page and result open with one self-contained quotable answer sentence; heading is
      question-phrased ("How much does X cost?")
- [ ] Answer sentence sits in the first ~60 words after the heading; every key stat is a
      self-contained sentence (number + unit + year + scope + source)
- [ ] At least one liftable asset: definition block, comparison table, or worked example
- [ ] Original-data or methodology page published where possible (real aggregates or a cited
      source — never fabricated)
- [ ] Dataset page meets the spec: named + dated title, stable URL, methodology, summary table,
      downloadable CSV, "cite this page" line (see references/ai-discoverability.md)
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

## Sanity check before you ship

Open two existing sibling sites' `styles.css` next to the new one. If a stranger could tell
all three were the same template with a swapped accent, you haven't cleared the bar — go back
to step 4. The win condition (from the source idea): *every site looks like a different studio
made it, and people can't immediately tell it's AI.*

## Scope guard

If the user only wants the accent swapped, say so plainly — that's the exact mistake that
created the current sameness. Recoloring is not redesigning. The value is in the font, layout
personality, spacing, and signature element changing per topic.

## v1.5 network-rebuild rules + mandatory post-build audit (2026-06-28)

From the live loancalctools pilot + the batch of 10 (Chris's review). Apply on every calculator-site rebuild.

### Homepage hero
- Two columns: LEFT = eyebrow + h1 + sub + the AI subject photo; RIGHT = the live flagship calculator (lift it from the site's first nav tool), with a plain-language answer line, the headline figure in mono, an authority strip, a primary "open full tool" button, and the secondary "see all N calculators" button placed BELOW the calculator tile (not next to the headline).
- The photo FILLS the column width (no narrow max-width cap) and is bottom-aligned to the calculator tile: `.hero-grid{align-items:stretch}`, left col `display:flex;flex-direction:column`, photo `margin-top:auto`. Keep the hero column gap tight (~28px, not 42); too much gutter reads as broken.
- NO author byline on the homepage. Byline (name, title, headshot) belongs on article/guide pages only.

### Brand mark on the dark footer (both pieces must be made visible)
The header is light, so the mark square is dark ink (fine on paper). On the DARK footer that same mark and wordmark go invisible. Always add:
```
.site-footer .brand svg rect{fill:#fff}      /* mark square -> white badge, visible on dark */
.site-footer .brand .name{color:#fff}        /* wordmark -> white; dark-on-dark is invisible */
```

### tool-hero vs prose alignment
Making `.tool-hero` light removed the colored band that used to justify a full-width left title. On prose pages (body is `.wrap.prose`, 760 centered) the title then floats left of the centered body. Fix: constrain the tool-hero wrap to the prose width on prose pages (`<div class="wrap" style="max-width:760px">`) so the H1 lines up with the body. Leave it full-width on calculator pages (body is full-width `.calc-layout`).

### vercel.json MUST ship
`cleanUrls:true` lives in vercel.json. The Vercel deployment files API does NOT return vercel.json, so a prod-pull loses it; re-add vercel.json to the build or every clean-URL nav link 404s.

### MANDATORY post-build audit (required gate, do not skip)
After building and BEFORE calling a site done:
1. Link audit: crawl every internal href on the homepage (and about + a guide page) and confirm each returns 200. Catch dead nav, missing `/terms` (legal pages must exist, AdSense needs them), favicon path, and any tool card pointing to an unbuilt page.
2. Screenshot audit: render and eye-check the homepage, one prose page (about/guide), and the footer. Verify: footer logo + wordmark visible, hero photo fills column with a tight gap, prose top-section aligned with body, one accent on calm ground, even footer columns.
3. Fix everything found, redeploy, re-audit. A build is not done until the audit is clean.
