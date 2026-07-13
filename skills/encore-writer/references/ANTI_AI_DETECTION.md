# Not reading as AI-generated: the method

The goal is simple to state and hard to fake: no page should read as, or be flagged as, AI-generated. Detectors and human editors both pick up on predictability and sameness. This file is the method that produced a portfolio that scores clean.

## What detectors actually measure

They score two things more than word choice:

1. **Perplexity / predictability.** If each next word is the statistically obvious one, it reads as a machine. Specific, slightly unexpected detail raises the bar.
2. **Burstiness / rhythm.** Humans vary sentence length a lot; models tend toward an even, medium cadence. Low variation is the tell.

Surface tells (em dashes, "delve," rule of three) matter too, but you can scrub all of them and still flag if the rhythm is flat. Fix both.

## Self-check you can run on any draft

- **Burstiness.** Look at the sentence lengths in a paragraph. If they cluster around the same word count, rewrite. Aim for a real mix: some sentences under six words, some over thirty. A useful proxy is the coefficient of variation of sentence length (standard deviation divided by mean); human prose usually sits above ~0.5. If you can script it, measure it; if not, read it aloud and listen for monotony.
- **Cross-page similarity (clone risk).** For templated page sets, compare any two pages' body text after stripping shared nav, header, and footer. If they share most of their 6-word sequences, they are clones in a detector's eyes. Strip the boilerplate, then make the bodies genuinely different.
- **Banned-vocab density.** Count AI-vocab hits per 1000 words. It should be near zero, and remember the false-positives below.
- **Dashes.** Grep the whole file for the em dash and en dash characters.

## The dash scan is bigger than the visible text

The no-dash rule applies to the entire file:

- Scrub dashes inside `<script type="application/ld+json">` schema, FAQ answer text especially. A gate that strips `<script>` before scoring will not catch these, but a reader's structured-data tools and the rule both will.
- Watch JS output strings, for example a calculator's empty-state `return '—'`. Replace with a hyphen or "to" unless it is purely functional display logic.
- Replacement: between words, a comma or a period; between numbers or for a range, "to" or a hyphen.

## Vocabulary false-positives

Do not blindly swap every listed word. "Leverage" and "navigate" as an ordinary noun or verb are fine (bargaining leverage, navigate the form, a statute). Only the AI-tell usage ("leverage X to drive Y," "navigate the ever-changing landscape") is banned. Real product and proper names (for example "seamless gutters") stay.

## Register map (which pieces get wit, which stay plain)

- **Plain, no wit.** Medical and health; cosmetic procedures (Botox, blepharoplasty, hair transplant, laser hair removal, mommy makeover, tattoo removal); death, funeral, and end-of-life (cremation, final expense, life insurance). Careful, sourced, non-promissory. A reader may be personally affected.
- **Witty but tasteful.** Fitness and diet (calories, exercise, pace, macros). Dry about the math and the gadgets, never about anyone's body, weight, or appearance; no restriction, crash-diet, or disordered-eating framing; keep guidance health-positive.
- **Witty.** Everything else non-sensitive: tax, legal, real estate, insurance (non-health), home services, auto, education, utilities, novelty tools.

When in doubt, default to plain.

## Re-voicing live pages (not drafting new ones)

When you rewrite an existing page, change prose only and preserve byte-for-byte: every `<script>` block (including any ZIP-code or rate-lookup estimator), all form-field ids, JSON-LD schema, slugs, numbers, links, citations, and author bylines. Do not touch privacy or terms pages. After editing, grep the file for dashes (prose, schema, and JS) and fix any.

## A workflow that scales

To re-voice or write across many sites without losing quality:
- Batch the work to subagents: roughly 6 multi-page sites, or about 10 tiny single-page sites, per subagent, each with the rules above and an explicit "preserve everything but prose" instruction.
- Gate every site before it ships: it must read as human (low banned-vocab, healthy burstiness, low cross-page similarity, zero dashes). If you have a scoring script, require a LOW rating; if not, do the manual self-check above.
- Deploy in small groups so large templated sites do not stall.

The principle behind all of it: keep the specifics, vary the rhythm, never ship two pages built from the same sentences.

## Gate it before you ship

Do not rely on having read carefully. Run a check on the finished output and treat it as a pass/fail gate. A lightweight script (Python, a few dozen lines) can score four things per page or per site, stripping shared nav, header, and footer first so you measure the article body only:

1. **Burstiness:** the coefficient of variation of sentence length (standard deviation / mean) in the body. Human prose usually sits above ~0.5. Flag below ~0.45.
2. **Cross-page body similarity:** the maximum Jaccard overlap of 6-word shingles between any two pages, after boilerplate is stripped. Flag above ~0.4; clones often hit 0.6 or higher.
3. **Banned-vocab density:** AI-vocab hits per 1000 words. Flag above ~0.6, but exclude the false-positives (ordinary "leverage"/"navigate", real product names).
4. **Dashes:** any em or en dash in the file (prose, JSON-LD schema, or JS strings) is an automatic fail.

Roll those into a rating: HIGH if several flags fire, MED if one or two, otherwise LOW. Require LOW before a page ships. Re-run after every fix. If you cannot script it, do the manual self-check at the top of this file and read the piece aloud listening for monotony. The gate is what turns "I tried to write human" into "this measurably reads human," and it is the step that catches the templated pages you would otherwise wave through.
