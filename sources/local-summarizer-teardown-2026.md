---
type: source-card
title: "Teardown: citymeetings.nyc, Aware/Sundays, SeeGov"
origin: Product teardown via web (July 2026)
url: https://citymeetings.nyc
date_added: 2026-07-20
last_checked: 2026-07-20
---

*(Agent-compiled teardown, Madison, 2026-07-20, from browsing each product's real public output. Verdicts are agent analysis. Prompted by Mitchell's question: are these good, or beatable "2022-era summarization"?)*

## Summary

Three different animals. **citymeetings.nyc** is the grounding gold standard (chapters with permalinks, video cued to timestamp, speaker-labeled clickable transcripts, human review, 24h turnaround) but has zero interactivity, no topic alerts, NYC-only, one-person throughput. **Aware/Sundays.news** is the opposite: massive automated scale (claims 3,835 cities), weekly newsletters and the only chat Q&A of the three ("Ask Aware") — but citation-light: no named members, no quotes, no links in the free product; verification is paywalled ($12/mo). **SeeGov** is a human-curated video-clip tool for newsrooms (60+ partners) — good unaltered-source linking, but a curation tool, not a comprehension product.

## Verdicts

- citymeetings: **state-of-the-art grounding UX** — emulate, don't compete.
- Aware: **beatable** — exactly the "2022-era" pattern Mitchell suspected: fluent recaps with trust asserted, not demonstrated.
- SeeGov: adequate B2B, not a direct competitor.

## Emulate

- The **citation trinity**: chapter permalink + video cued to the timestamp + speaker-labeled transcript. Every AI claim clicks through to it.
- Named-speaker chapter titles; typed segments (VOTE / TESTIMONY / Q&A).
- Visible human-review posture + an error-report link; unaltered-source-video links.
- Aware's distribution mechanics (weekly cadence, audio recap, "omitted items" transparency) — but citations free, never paywalled.

## Open gaps confirmed

1. **Cited chat over proceedings** — Aware has chat without visible grounding; citymeetings has grounding without chat. Nobody has both. This is Congress Chat's persona-query lane.
2. **Topic/entity-level event-driven push** ("alert me when X comes up in any hearing") — nobody.
3. Congressional committees — all three are local-only.

## Cross-References

- [`civic-tech-landscape-2026.md`](civic-tech-landscape-2026.md) — the broader sweep this teardown drills into.
- `wiki/main.md` — Landscape section and the "are local summarizers good?" open question (now answered).
- `AGENTS.md` Design Philosophy #1 — the citation trinity is its concrete implementation pattern.
