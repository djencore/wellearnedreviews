# WellEarnedReviews (WER)

Private backup and cross-machine handoff repo for the WellEarnedReviews project. This is a personal repo (single owner, multiple computers), not a team repo. Push from one machine, pull on another, and an AI agent picks up exactly where the last session left off.

## Everyday use

Two commands, run from the repo folder:

- `./start` when you sit down to work. Pulls the latest version from your other computer.
- `./done` when you finish. Saves everything and backs it up to GitHub. Use `./done ship` to also put the site live.

The rule of thumb: `./start` at the beginning, `./done` at the end. That keeps both computers in sync. (Both are thin wrappers over `git pull` and `git add/commit/push`; you can run those directly if you prefer.)

## Start here

1. Read `HANDOFF.md` at the repo root. It is the canonical, always-current state doc. When anything else disagrees with it, the handoff wins.
2. Read `WER-PROJECT-KNOWLEDGE.md` for the context pack (business model, what is live, conventions).
3. Per-decision history and competitor teardowns live in `docs/`.

## What is in here

- `HANDOFF.md` — current state, open items, next build.
- `WER-PROJECT-KNOWLEDGE.md` — project context pack.
- `docs/` — dated decision docs, specs, competitor teardowns, runbooks.
- `site/src/` — the live site as real, editable files (HTML pages, the `api/` serverless functions, images). This is the working source. The site runs on Vercel (project `wellearnedreviews`).
- `site/archive-zips/` — frozen dated snapshots of the site from before it was unpacked into `src/`. History only; do not edit.
- `site/` also holds the demo videos and narration script.
- `automation/` — deploy and migration scripts.
- `gatherup.com screenshots/` — competitor reference captures.
- Logo and favicon source files at the root.
- `skills/` — the three Cowork skills this project relies on, so an agent on another machine has them without a separate install (see below).

## Working on the site

Edit files directly under `site/src/` and commit. Git tracks line-level diffs, so changes are reviewable and merge cleanly between machines. Do not add new whole-site zips; `site/archive-zips/` is closed history.

To deploy to Vercel production, run `automation/deploy.sh` from the repo root. It uploads `site/src/` to the `wellearnedreviews` project by file hash (no zip) and waits for READY. It reads `VERCEL_TOKEN` from the environment, or from `vercel.env` in your credentials dir (default `~/Documents/Projects/Home/credentials`, override with `WER_CREDENTIALS`).

## Skills

`skills/` holds copies of the Cowork skills used to build and maintain WER:

- `encore-writer` — the voice and anti-AI-detector writing rules. WER copy runs through this. Note the hard project rule: no em dashes or en dashes anywhere, including JSON-LD and code comments.
- `talaria-site-designer` — site design and AI-discoverability approach used for the site.
- `humanizer` — removes AI-writing tells from prose.

These are snapshots for reference and handoff. To make them active in a Cowork session, drop them into the machine's skills directory (`~/.claude/skills/`).

## Secrets

No credentials are stored in this repo (`.gitignore` blocks `*.env` and similar). API keys, tokens, and the Google service-account JSON live outside the repo in `Home/credentials/` on each machine, referenced by path from the docs. Set those up on any new machine before running automation.

## Conventions

Work happens in Cowork sessions with the project folder connected (and `Home/credentials` when secrets are needed). One active session per project; a new session continues from `HANDOFF.md`, never by retrying a dead session. Before reporting anything done, verify it live and point to the evidence. Build tasks get a one-line acceptance test agreed up front.
