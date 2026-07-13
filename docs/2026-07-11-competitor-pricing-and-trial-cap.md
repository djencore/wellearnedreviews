# Competitor Pricing Research + Trial Cap Decision

**Date:** 2026-07-11. Research via sonnet agent, sources inline.

## Competitor pricing (published, 2025-26)

| Vendor | Price | Trial | Usage caps | Contract |
|---|---|---|---|---|
| NiceJob | $75-174/mo (+$199 setup on Sites) | 14-day free, no CC | none published | month-to-month |
| Podium | $249-599/mo | inconsistent/none | none published | annual billing complaints common |
| Birdeye | $299-449/mo PER LOCATION | none | none published | annual minimum, some 3-yr; cancel only on renewal date |
| Starloop | $197/mo flat | 14-day + 30-day guarantee | explicitly unlimited | none |
| GatherUp | $99/mo + $60/addl location | 14-day | **300 SMS + 3,000 email/location/mo** | 20% off annual |
| Signpost | $199-749/mo (+$199 setup) | undisclosed | AI-minutes based | undisclosed |
| ReviewGrower | $37-199/mo | free tier | **SMS tiers: 200/2,000/7,500/unlimited** | month-to-month |

Sources: get.nicejob.com/pricing, trustradius.com/products/podium/pricing, costbench.com + replifast.com (Birdeye), blog.starloop.com, gatherup.com/pricing, signpost.com/pricing, reviewgrower.com/pricing.

## Where WER sits

$249/mo = Podium Essentials money for a done-for-you service Podium doesn't offer (they sell software you operate). Under Birdeye's per-location floor. Above the self-serve tools (NiceJob, GatherUp, ReviewGrower), justified by zero-login fulfillment. The $99 full working month is more generous than anything in the field (most give 14 days or nothing), which is exactly why it needs the cap. Annual 30% off ($174/mo) undercuts Starloop's flat $197 while remaining done-for-you.

## The abuse-protection landscape

Only GatherUp and ReviewGrower publish hard send caps; the big players use annual contracts as the abuse gate instead. No public evidence of trial-blast-and-cancel as a widespread pattern, but WER's $99 intro month is uniquely exposed: a 500-contact reactivation blast at 10-25% conversion would deliver 50-125 reviews for $99.

## Decision: TRIAL_CAP = 50 (implemented + verified 2026-07-11)

Intro month covers the business's first 50 enrolled customers (~11-12 expected reviews at the 23% demo rate: real proof of value, useless for farming). Contacts beyond 50 auto-waitlist and begin sequences the day the trial month ends; the reactivation campaign is positioned as a regular-rate feature. Enforced in /api/hook and admin add_contacts; hourly tick promotes waitlist after day 30; env var TRIAL_CAP on Vercel. Live-verified: with cap 5 and 2 existing contacts, a 5-contact batch returned queued:3, waitlisted:2. Disclosed on pricing fine print, FAQ, signup step 3, and terms.
