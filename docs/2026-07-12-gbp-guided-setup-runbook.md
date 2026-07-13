# GBP Setup: Operator Runbook (Agency Model)

**Date:** 2026-07-12, v2. Updated same day after the Modern Roofers build proved the agency path end to end. For signups who answered "no Google Business Profile." The promise this enables: WER builds the entire profile; the owner's part is accepting one email invite and filming a 60-second video, live.

## The model (proven on Modern Roofers, 2026-07-12)

Build the ENTIRE listing under the WER/agency Google account, park it unverified, then transfer an Owner invite to the customer, who completes the one step Google demands from the business itself: live video verification. The customer never builds anything and needs a Google account only at the very end.

Two facts that shape everything, both learned the hard way:

1. **The verification video must be filmed LIVE inside Google's flow.** There is no "email me a video file and I'll upload it." The person at the business films it in real time from their own logged-in session. Plan the handoff around this.
2. **The handoff is an Owner-role invite** (Business Profile settings, People and access, Add, role = Owner, NOT Manager; Manager can't complete verification). Google emails the invite; the customer accepts it signed into their own Google account, then hits Get verified and films.

## Phase 1: WER builds the listing (no owner time)

Search Google Maps for the business first; claim an existing unclaimed listing instead of creating a duplicate. Then at business.google.com under the agency account:

- Name exactly as the business uses it (no keyword stuffing; suspension risk).
- Primary category: single most specific match. More later.
- Service-area business for home/mobile trades: answer "No" to the storefront question, list the service towns one by one (the dropdown needs a nudge sometimes; backspace and retype to retrigger autocomplete), address stays hidden. A mailing address goes on file for verification only.
- Phone (the number a human answers), website.
- Services: check everything they actually sell, including the storm/emergency variants.
- Hours per their site or the owner's answer; description under 750 chars, plain voice, license number if they have one.
- Photos: upload if you have them; otherwise leave for the owner later. Not blocking.
- At the verification prompt choose **Verify Later**. The dashboard shows "Not publicly visible - Get verified." That's the parked state. Do not submit any verification.

## Phase 2: the handoff (owner's 5 minutes)

1. Chris (in the UI): Business Profile settings > People and access > Add > owner's email > role **Owner**. (Access changes stay a human action, not an automation.)
2. Owner gets Google's invite email, accepts it signed into their own Google account (they create one if needed; this is the only point they need it).

### KNOWN GOOGLE BUG (as of July 2026): the invite email may never arrive

Verified live on the Encore Event Services dry run (2026-07-12): invites to two different recipients on separate mail systems both registered as PENDING in People and access but no email was ever generated (inbox, spam, and trash all empty past the one-hour window). Search Engine Roundtable reported the same breakage across GBP starting ~June 12, 2026, confirmed by Google Product Experts (seroundtable.com/google-business-profile-invites-broken-41504.html).

Workaround: the invited account does not need the email. Signed in as the invited account, go to **myaccount.google.com/brandaccounts** and open **Pending invitations**; the invite can be viewed and accepted right there. Two caveats: (a) the invite can take some minutes to appear after being sent, and (b) belt-and-suspenders, the invitee can also check notification settings at notifications.google.com/settings/brand_accounts and enable "You're invited to manage a Brand Account" so future emails deliver if Google fixes the pipeline.

Until Google fixes delivery, the outreach message to customers should send them to the Pending invitations link directly instead of telling them to watch their inbox.
3. Owner opens the listing, taps Get verified, and films the live video on their phone: signage or a street landmark near the address on file, the truck/equipment/branding, and a document tying the name to the address (license, bill, mail). One continuous take, 30-60 seconds.
4. Google reviews in roughly 1-5 business days. Listing flips public on its own.

Outreach template (adapt per customer):

> Hi [Name], I built out your Google Business Profile so you'll show up when people search "[trade] near me." Everything is done except the one step Google requires from you directly. I've sent you an owner invite from Google. Their invite emails are flaky right now, so instead of waiting on your inbox, sign into Google and open myaccount.google.com/brandaccounts, tap "Pending invitations," and accept it there (takes a minute). Then tap "Get verified" and film a short video on your phone, live: a street sign near [address], your truck or anything with your branding, and a document with your business name on it. 60 seconds, one take, only Google's review team ever sees it. It goes live a few days after. Text me if you want me on the phone while you film.

## Phase 3: WER finishes (after verification clears)

- Confirm the listing is public; add/finish photos (10+ real ones), holiday hours, anything skipped.
- **Get the place_id and VERIFY IT IS THE RIGHT LISTING** (fetch displayName and compare; the Round Table Pizza lesson).
- Update the business row in /admin: place_id + review link (https://search.google.com/local/writereview?placeid=...). Test the link in a browser.
- Only NOW load their contacts; sequences need the review link. Then send the invite email from /admin (the comp/welcome flow).
- First snapshot picks them up at the next 10am tick; baseline scan ingests existing reviews silently.

## Timeline to set with the owner

Day 0: WER builds and parks the listing, invite sent. Owner day: accept + film (5 minutes). Days 1-5: Google reviews. Live day: WER finishes the profile, engine on, first review requests out that afternoon if the customer list is in. Say this up front; unset expectations become "is it working?" texts.

## The simple video (record once, use everywhere)

One screen recording, Chris's voice, 3-4 minutes, embedded on /google-business-profile-setup and posted to YouTube. Same shot list as before with one addition: after the verification section, a 20-second beat showing the People and access screen: "and if this all looks like homework, we build the whole thing for you and send you one invite; your part is the 60-second video."

Shot list: (1) 15s intro "here's every screen"; (2) 60s name/category/service-area with the hide-your-address line said out loud; (3) 45s phone/website/skip-the-upsells; (4) 60s the verification screen + holding up a phone narrating the three-item filming checklist, live; (5) 20s People and access owner-invite beat; (6) 30s finished profile + "that's literally our job, link below." No editing beyond trimming.
