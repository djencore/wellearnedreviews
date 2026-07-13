# Event Mode Spec (kiosk-style capture for WER)

**Date:** 2026-07-12. Status: spec, not built. Prompted by the GatherUp Kiosk Mode teardown; this is the WER version with the survey costume removed.

## What it is

A per-business capture page a guest can use in ten seconds on a tablet or phone at the point of service: photo booth table, front counter, service truck. It collects first name and cell (email optional), records consent, and drops the contact into the existing 4-touch sequence. The kiosk device never shows a review link. The first thing the guest ever receives is the next-day check-in from the owner's name, which asks for nothing.

That ordering is the whole point. GatherUp delays its on-site review ask by 4 hours to avoid looking like a review station. WER's normal sequence already waits 16+ hours and leads with service recovery, so event mode inherits compliance instead of bolting it on.

## Guest flow

1. Guest opens the page (tablet handed over, or QR on a table card).
2. Sees the business name and one sentence: "Leave your number and {owner first} will check in with you tomorrow."
3. Fields: first name (required), cell (required, US), email (optional, collapsed behind "add email instead/too").
4. Consent checkbox, unchecked by default, required to submit: "I agree that {Business Name} may text and email me about my visit, including an invitation to leave a review. Message and data rates may apply. Reply STOP to any text to opt out."
5. Big submit. Thank-you screen ("You're in. {owner first} says thanks.") auto-resets to a blank form after 8 seconds for the next guest.
6. Duplicate cell for that business: same thank-you, no duplicate row, no error shown to the guest.

No NPS question, no star picker, no review link, no app. One page.

## URLs and auth

- Capture page: `/e/<bizId>?k=<kioskKey>` served by a small serverless function that validates the key before rendering (bad key = generic 404 page, no business info leaked).
- `kioskKey = HMAC(CRON_SECRET, "kiosk:" + bizId)` truncated to 20 hex chars, same pattern as the existing hookToken and scoreToken but a distinct namespace, so handing a venue a kiosk URL never exposes the Zapier webhook key. Note the shared limitation: HMAC-of-id keys rotate only by salting the scheme; acceptable at current scale, recorded here so nobody is surprised later.

## Backend

- New `/api/kiosk` POST (thin wrapper over the same contact-insert path /api/hook uses): validates kiosk key, honeypot field, normalizes cell to +1E164, dedupes by cell per business, enforces TRIAL_CAP waitlist exactly like /api/hook, writes the contact row with `source=kiosk` and a new `consent` column (value like `kiosk 2026-07-12T20:14:00Z`), logs an `event` row of type `capture`.
- Rate limit: 10 submissions per minute per IP with overflow logged, not blocked hard (a wedding exit rush is legitimate burst traffic; the log is for spotting abuse patterns, not stopping guests).
- Engine changes: none. The sequencer picks the contact up like any other. STOP, quiet hours, caps, and click suppression all apply unchanged.
- Sheet changes: one new `consent` header column on `contacts` (L). Engine ignores it; the CRM will want it.

## Owner-facing surface

- /admin business view gains: the kiosk URL with a copy button, and a "Download event card" button producing a printable PDF/PNG: QR of the kiosk URL, business name, and a caption ("Tap in and {owner first} will check in tomorrow"). Reuses the QR generation already built for the review-link kit.
- Scoreboard: captures show up in the existing request/click funnel once the sequence runs; a later portal version can add a "captured at events" count from the `capture` events.

## Anti-abuse and edge cases

Honeypot hidden field silently drops bots. Missing or non-US cell: inline error, nothing saved. Guest on the opt-out list: accepted silently, engine skips them as it already does. Venue wifi flakiness (v1.1, optional): queue failed submits in localStorage and retry, with a small "1 saved, will send when back online" note; v1 ships without it.

## Non-goals

No on-device review ask ever, no rating widget, no native app, no multi-question survey, no photo capture, no per-guest kiosk analytics. If a business wants gating, they want a different vendor.

## Sales angle

This turns "we do everything for you" into a physical object: a table card at every event feeding the machine. For Encore Photo Booths it means every booth event quietly builds the review pipeline with zero staff effort. For dental/auto/salon it replaces the front-desk "please review us" card that never works. It also makes the $99 first month tangible: put the card out, watch the scoreboard move.

## Effort and acceptance

Rough size: one capture page, one endpoint, one admin addition, one sheet column. About a half-day build plus verification.

Proposed acceptance test: submitting a name and cell on the live kiosk page creates a consented `source=kiosk` contact row (or waitlists it past the trial cap), the tablet shows the thank-you and resets, the kiosk page contains no review link anywhere, and the check-in goes out in the next send window from the owner's identity.
