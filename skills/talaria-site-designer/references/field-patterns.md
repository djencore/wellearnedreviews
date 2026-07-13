# Field-tested patterns

Twenty design moves observed on high-ranking sites (12 calculator / cost / freight
tools + 8 design exemplars), distilled into things to apply on Talaria pages. The
visual rules in SKILL.md handle *look*; this file adds what the top tool sites actually
win on — the **result experience**, **trust**, and **craft details** — plus a few
confirmations of rules already in the skill.

Full teardown with swatches: `2026-06-27-design-research-20-sites.html` (repo root).

Tags: **[CSS]** pure styling · **[BUILD]** needs markup/JS (coordinate with the
generator / Hermes) · **[COPY]** wording — pair with **encore-writer**.

---

## A. The result experience (where tool sites win)

This is the biggest gap between the skill's old rules and what ranks. On a calculator
page the *result*, not the hero, is the product.

1. **The tool is the hero.** [BUILD]
   *Calculator.net, NerdWallet, Bankrate, Freightos, Wise.* Put working inputs above the
   fold; the page is usable before any scroll. The archetype mascot sits *beside* the
   tool, never replaces it. (Refines SKILL.md rule 2 for calculator pages specifically.)

2. **Live recalculation, no submit button.** [BUILD]
   *Bankrate, Omni, Wise.* Recompute on every `input`/`change`; delete the "Calculate"
   button. Most Talaria calculators already compute in-browser — just bind the events.
   This is motion that *is* the function (satisfies rule 6).

3. **One headline number, then the breakdown.** [CSS]
   *NerdWallet, Bankrate, The Calculator Site.* The primary answer is the single largest
   element on the page — set it in the display face. Secondary figures sit below in a
   calm table.

4. **A plain-language sentence under every result.** [COPY][BUILD]
   *Omni, NerdWallet.* Turn the number into an answer: "Class 70 — typical for dense,
   durable goods like food and tools." Cheapest credibility upgrade across the network.

5. **Show the worked solution.** [BUILD][COPY]
   *CalculatorSoup, WolframAlpha.* A "How we calculated this" block with the user's own
   numbers plugged into the formula. Strong for trust, SEO, and cost-guide legitimacy.

6. **Modular result "pods."** [CSS][BUILD]
   *WolframAlpha.* Segment the answer into labeled, individually copyable cards —
   `Result` · `How it's calculated` · `Assumptions` · `Related`. Each can target its own
   snippet.

7. **Per-field "?" help tooltips.** [BUILD][COPY]
   *GIGACalculator.* One-line explainer on each input. Fewer errors, more perceived
   authority, trivially templatable.

8. **A static reference table beside the tool.** [CSS] *(already standard)*
   *RapidTables, Calculator.net.* The lookup table/chart is the SEO moat and keeps the
   page useful with zero interaction. Talaria freight/finance pages already do this —
   make it a deliberate companion to *every* calculator, under a spec-sheet label (#16).

11. **A per-tool utility bar.** [BUILD]
   *The Calculator Site.* A small row: copy-link · print · share. Cheap, useful,
   templatable.

---

## B. Trust (legitimizing programmatic content)

9. **Quantified-authority strip under the tool.** [CSS][COPY]
   *Freightos, GIGACalculator, The Calculator Site.* A 3-icon row citing the data
   source + method + scope: e.g. "Based on the official NMFC standard · 18 classes
   (50–500) · Runs in your browser." Plant the methodology *next to the tool*, not in an
   About page.

10. **Author byline + reviewed/updated date.** [CSS] *(partly present)*
   *NerdWallet, Bankrate.* The Chris Terry author box already does this on articles. Add
   a small "Updated [date]" near the top of *tool* pages too.

---

## C. Type & color craft (from the design exemplars)

12. **Restrained base + ONE ownable accent.** [CSS] *(already in skill)*
   *All 20.* The upgrade is courage: pick an unexpected, ownable hue per site (Wise lime,
   Wolfram orange) rather than a safe blue. Reinforces SKILL.md rule 3.

13. **Use the accent as a full-bleed background, not a timid link.** [CSS]
   *Wise, Mailchimp, Duolingo.* Flood one section in the accent. A single confident hue
   instantly separates a page from the grey/blue AI default.

14. **Type carries the personality.** [CSS] *(already in skill, rule 4)*
   *Figma, Mailchimp, Apple, Stripe.* One characterful display face set large; neutral
   body; a dramatic H1→body size jump with little in between.

15. **Monospace for metadata & numbers.** [CSS]
   *Vercel (Geist Mono), WolframAlpha, Linear.* Set dates, codes, stats, and result
   figures in a mono face with tabular figures. Reads as engineering precision — a
   natural fit for calculators. (The industrial archetype already uses IBM Plex Mono;
   extend the habit to every archetype's metadata.)

16. **Spec-sheet section labelling.** [CSS]
   *Linear ("FIG 0.2"), Vercel.* Number and label sections like a technical doc:
   `01 — Method`, `02 — Class table`. Free structure; reads deliberate. Strongest for the
   Logistics/Industrial and Tax/Finance archetypes.

18. **One soft signature gradient — earned, not default.** [CSS] *(sharpens rule 3's ban)*
   *Stripe (diagonal), Vercel (bottom glow).* The banned thing is the *purple default*
   gradient. A single low-saturation diagonal/again in the brand accent, bleeding off one
   corner of a dark hero, is the tasteful version.

---

## D. Personality without illustration

13b. (see #13 — accent flood is also a personality device)

17. **Pressable buttons: hard bottom border, not drop shadow.** [CSS] *(already in skill)*
   *Duolingo.* A 4px solid darker-shade bottom edge reads as physical and intentional —
   the opposite of a slop drop-shadow. (Note: this is the *one* place a "fake 3-D" edge is
   allowed, because it's a tactile component, not decoration.)

19. **Voice as a design element.** [COPY][CSS]
   *Basecamp.* Let one blunt sentence be a full-width display-type section
   ("Get the class wrong and the carrier bills you back. Don't guess."). Personality with
   zero illustration budget. Pair with **encore-writer** for the line.

---

## E. Motion

20. **Quiet, functional motion only.** [CSS] *(already in skill, rule 6)*
   *Stripe, Apple, Linear, Awwwards, Wise.* No bounce, no carousels. Allowed: slow
   gradient drift, scroll-fade-up, hover-reveal on cards, count-up on the result, live
   recalculation. Always honor `prefers-reduced-motion`.

---

## The hybrid calculator-page anatomy

Stack the winners. Archetype palette + mascot still vary per site; this structure is shared.

| Zone | What goes there |
|---|---|
| Header | Archetype palette · one ownable accent · mono brand tag · pressable CTA (#17) |
| Hero | Tool live above the fold (#1) · mascot beside it · one earned gradient on dark heroes (#18) · display-face headline (#14) |
| Result | Live recalc (#2) → headline number in display face (#3) → plain-language sentence (#4) → mono spec rows (#15) → copy/print bar (#11) |
| Inputs | Per-field "?" tooltips (#7) |
| Method | "How we calculated this" with the user's numbers (#5), as a copyable pod (#6) |
| Trust | Quantified-authority strip (#9) · "Updated" date (#10) |
| Reference | The static lookup table (#8) under a spec-sheet label (#16) |
| Voice band | One blunt display sentence on a full-bleed accent band (#13, #19) |

## Scope note

Patterns tagged [BUILD] extend this skill beyond pure CSS into markup/JS (live recalc,
tooltips, pods, utility bar). When a task is CSS-only, apply the [CSS] patterns and leave
[BUILD] ones as recommendations. When building/regenerating a site through the generator
or Hermes, wire the [BUILD] patterns in too. [COPY] wording always goes through
**encore-writer**.
