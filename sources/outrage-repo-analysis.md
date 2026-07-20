---
type: source-card
title: "Outrage — Repository Analysis"
origin: Code review (repo at ~/Desktop/outrage, github.com/mitchellgordon95/Outrage)
url: https://github.com/mitchellgordon95/Outrage
date_added: 2026-07-20
last_checked: 2026-07-20
---

*(Agent analysis, Madison, 2026-07-20 — based on reading the code and git history. `CLAUDE.md`/README in that repo have doc drift; the code was treated as ground truth.)*

## Summary

Outrage is a shipped, actively developed (191 commits, May 2025 – Jan 2026) single-author Next.js 14 app on Vercel: enter your address, describe what's on your mind, and Claude selects the relevant representatives (via Cicero API lookup) and drafts a personalized email to each. Sending is client-side `mailto:` / .gov webform (with an optional Chrome extension that auto-fills webforms) — the server never sends on the user's behalf. A campaigns layer adds shareable, moderated, QR-coded reusable campaigns with view/sent counters, magic-link auth (Auth.js + Resend), and a live Stripe + Prodigi sticker-monetization experiment.

## Key Details

- **Rep lookup is the crown jewel:** Cicero API (`src/app/api/lookup-representatives/route.ts`, `src/services/representatives.ts`) returns **federal, state, AND local** officials from an address — names, party, photos, emails, webform URLs, socials — normalized and cached. Chosen over Google Civic (reps endpoint discontinued April 2025).
- **LLM infra worth reusing:** model tiering (Haiku for classify/moderate, Sonnet for drafting), cache-keyed `unstable_cache` around LLM calls, a two-pass refusal-detection → assertive-retry guard, JSON-extraction parsing, and a "given these demands and officials, who has jurisdiction?" selection prompt.
- **No calling:** despite the framing, there is no phone/Twilio/`tel:` flow. Email + webform only.
- **Dead feature:** a YouTube-demands ingestion pipeline (Apify transcripts, daily cron in `vercel.json`) is orphaned — cron route doesn't exist, service imported nowhere. Reference only.
- **Signs of real use:** production-fix commits, analytics, engagement counters, live payment webhooks; thin tests (one Vitest file).

## Cross-References

- `wiki/main.md` → Product Ideas → "Merge with Outrage?" (Mitchell, 2026-07-20).
- Local-government ambition in `vision.md`: Cicero already resolving local officials is direct leverage for it.
- Landscape research source card (pending) for how Outrage compares to 5 Calls / Resistbot-class tools.
