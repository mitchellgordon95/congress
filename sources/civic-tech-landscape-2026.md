---
type: source-card
title: "Civic-Tech Landscape: AI-Summarized Proceedings & Engagement Tools"
origin: Web research sweep (July 2026)
url: https://citymeetings.nyc
date_added: 2026-07-20
last_checked: 2026-07-20
---

*(Agent-compiled research, Madison, 2026-07-20. Web sweep across six categories; URLs inline. Gap analysis at the end is agent analysis.)*

## Summary

Federal *bill-text* summarization is a crowded-but-shallow AI-app space; federal *proceedings* summarization for lay audiences is essentially unserved. Local-meeting summarization is the most active category (citymeetings.nyc, Aware, SeeGov). Contact-your-rep tools are alive and big (5 Calls, Resistbot) but disconnected from "what just happened." Votes-with-why died with ProPublica Represent (2024) and nobody picked it up. No one anywhere is doing a chat-persona / social-feed format for real proceedings.

## Key Details

- **Federal:** GovTrack (active, no AI storytelling; email bill trackers). Congress.gov/CRS: a June 2026 House hearing revealed CRS tested ~3,000 AI bill summaries and **<3% met accuracy standards** (cha.house.gov; legis1.com) — AI summarization is debated inside Congress, not shipped. Bill-explainer apps: Hilltelligence, whatsinthatbill.org, CivicAlign, Civio, BillTrack50 (paid) — all bill text, none proceedings, none with traction.
- **Local (crowded):** **citymeetings.nyc** (Vikram Oberoi) — AI + human-review chapterization of NYC Council within 24h; trusted by journalists; the quality benchmark. **Aware / Sundays.news** (awarenow.ai) — claims 3,835 cities, weekly newsletters, sells to governments. **SeeGov** — B2B video highlights for 60+ newsrooms, Knight-funded. **Council Data Project** — open-source, ~dormant since 2023.
- **Contact tools:** **5 Calls** (surging; ~700k calls in one week, Feb 2025), **Resistbot** (10M users, 50M letters). Causes.com is a shell of old Countable. All are action layers with editorial issue-picking, not event-driven.
- **Votes + why:** ProPublica Represent had members' vote explanations from the Record — shut down July 2024; niche empty since. congressvotetracker.org / watch.vote: scorecards, no "why."
- **Alerts:** GovTrack/LegiScan/FastDemocracy/BillTrack50 — email digests, bill-metadata-triggered, wonk-oriented. No "notable moment just happened" pushes.
- **Chat/gamified format:** nothing found, multiple targeted searches.

## Gap Analysis (agent analysis)

1. Federal **proceedings** (floor + hearings) for lay audiences — open.
2. **Group-chat persona format** — nobody doing it; differentiator, but must sit on a citymeetings-grade faithfulness foundation.
3. **Votes + why** — clear, valuable, unclaimed since ProPublica folded.
4. **The full loop** — proceeding → notable moment → push → contact the responsible rep: pieces exist separately (summarizers, trackers, 5 Calls/Resistbot); nobody chains them.
5. **Credibility caution:** the CRS <3% accuracy finding will be cited against any AI summarizer; human-in-the-loop verification is near-mandatory.

## Cross-References

- `wiki/main.md` — Open Questions ("who else is doing this") and Product Ideas.
- [`outrage-repo-analysis.md`](outrage-repo-analysis.md) — Outrage supplies the "contact the responsible rep" leg of gap #4.
- `vision.md` — "don't duplicate others' good work": local summarization (Aware/SeeGov/citymeetings) is where duplication risk is highest.
