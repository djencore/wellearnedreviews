# Client SMS rails: per-client A2P registration runbook, 2026-07-13

Status: recommended model + runbook, drafted after the HighLevel teardown confirmed per-client brand registration is the industry-standard ISV pattern (docs/2026-07-13-highlevel-teardown.md). Chris confirms on first external client. Supersedes the old open-item framing ("WER standard EIN brand unlocks client SMS"); a WER umbrella brand is the wrong shape because the texts speak as the client, so carriers expect the registered brand to BE the client.

Fees and limits below verified 2026-07-13 against Twilio docs and HighLevel's published pass-through fee table. Re-verify amounts in the Twilio console at filing time; carriers adjust fees yearly (T-Mobile changed fees Jan 2026).

## The model in one paragraph

Every client business gets its own A2P brand (their legal identity), its own campaign (review requests), and its own local 10DLC number, all registered under WER's Twilio account as the ISV. WER files everything; the owner supplies five fields on the onboarding form and taps one verification text. Replies and STOPs stay per-business (the engine already keys STOP handling this way), one client's spam complaints cannot poison another's deliverability, and the ask arrives from a local number that plausibly IS the business.

## Route selection

- **Route A, default: 10DLC sole-prop brand.** For clients without an EIN or where we want zero friction. $24.50 one-time (bundled brand registration + campaign vetting + fast-track), $2.00/mo campaign fee, exactly ONE local number per campaign, 3,000 SMS segments/day cap. WER's MONTHLY_SMS_CAP is 300 per business per MONTH, so the daily cap is 100x headroom.
- **Route B: Low Volume Standard brand.** For clients WITH an EIN who give it willingly. Same $24.50 one-time, $1.50/mo campaign, multi-number capable, 6,000 segments/day. Slightly cheaper monthly and sturdier identity. Requires legal business name exactly as IRS-registered.
- **Route C, fallback: verified toll-free number.** No brand/campaign registration, per-number verification instead. Since Feb 17, 2026 toll-free verification requires a business registration number (EIN) for all business types EXCEPT sole proprietorships, so it remains open to EIN-less clients. Trade: an 8XX number reads less personal for a review ask. Use only if 10DLC vetting stalls.

## Onboarding form fields to collect (add to the WER onboarding call script / form)

1. Legal business name (Route B: exactly as IRS-registered; Route A: the DBA works)
2. Business address (the CLIENT's, never WER's; TCR caps an address at 10 registrations)
3. Owner email (the CLIENT's, never WER's or an alias we control; TCR caps an email at 10 registrations across all vendors)
4. Owner mobile number (receives the one-time verification text; a mobile can back at most THREE sole-prop brands ever, including registrations made through other vendors, so a serial entrepreneur may hit this)
5. EIN yes/no, and the EIN if yes (routes to B)

Tell the owner on the call: "You'll get one text from the carriers' registry; tap or reply within 24 hours." That is their entire job.

## Filing steps (console first; script against Twilio's TrustHub API once volume justifies it)

1. In the Twilio console (Encore Photobooths account), Messaging > Regulatory Compliance: create a secondary customer profile for the client, then the A2P brand (Route A sole prop or Route B LVS) with the five fields above.
2. Sole prop only: the OTP text goes to the owner's mobile at submission. Brand approval is typically minutes once the OTP is confirmed.
3. Buy a LOCAL number in the client's area code (~$1.15/mo). Set its inbound SMS webhook to /api/sms-inbound.
4. Register the campaign under the brand. Use case: review requests / customer care. Opt-in description: customers provide their phone number to the business at purchase or booking and consent to service messages about their visit. Sample messages: pull two real templates from api/_engine.js and include the "Reply STOP to opt out" line. Campaign vetting: fast-track is bundled, plan on ~3 business days, and Twilio's own docs hedge to "several weeks" worst case, so FILE AT CONTRACT SIGNING, not launch day. Sequences run email-only (sms_ok=no) until the campaign clears.
5. Attach the number to the campaign. Send a live test to Chris's cell, confirm the sends row logs the Twilio SID, confirm STOP flips the contact to opted_out.
6. Flip the business's sms_ok to yes and record from_number on the businesses row.

## Engine change required (small, ride along with any CRM phase)

- businesses tab: add `from_number` column. smsSend uses it when present, falls back to the env TWILIO_FROM otherwise, so nothing breaks today.
- /api/sms-inbound: resolve business by the inbound To number (currently single-number). STOP then opts out per-business, which also future-proofs two clients sharing a customer.
- Acceptance test: with two businesses carrying different from_numbers, a tick sends each business's SMS from its own number, and a STOP reply to number A opts the contact out of business A only, with event rows proving both.

## Cost per client (Route A, at the 300/mo cap)

$24.50 one-time. Monthly: $2.00 campaign + ~$1.15 number + ~$0.90 carrier surcharges (~$0.003/msg) + ~$2.40 Twilio message fees = roughly $6.50/mo against their $249. Immaterial; do not bother metering it.

## Pilot notes

- Encore Photo Booths' existing approved sole-prop brand + campaign + number (+19166196827) keeps covering Chris's OWN businesses for the pilot. Strictly, Encore Entertainment is a different DBA on the same owner; acceptable for self-owned pilot traffic, register it properly if it ever matters.
- The voip.ms DID (619 452 0435) stays what it is: the public contact line, not an automated sender.
- First EXTERNAL client is what triggers this runbook, and the filing belongs in the onboarding window (day 0-3) while contacts are being collected.

## Sources (fees/rules as read 2026-07-13)

- Twilio, Direct Sole Proprietor Registration Overview (one number per sole-prop campaign, OTP within 24h, mobile capped at 3 brands, email/address capped at 10, brand approval in minutes, campaign vetting manual): twilio.com/docs/messaging/compliance/a2p-10dlc/direct-sole-proprietor-registration-overview
- HighLevel A2P fee pass-through table (bundled $24.50 sole prop / LVS, $71.91 high-volume standard, $2.00 sole-prop campaign monthly, $1.50 LVM, $10 standard, carrier surcharges ~$0.003, daily caps 3,000 / 6,000 / 600,000): help.gohighlevel.com/support/solutions/articles/155000005200
- Twilio changelog, Business Registration Numbers Required for Toll-Free Messaging (EIN required for new toll-free verifications from Feb 17, 2026, sole props exempt): twilio.com/en-us/changelog/business-registration-numbers-required-for-toll-free-messaging-p
