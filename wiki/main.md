# Congress Chat — Master Article

The master wiki article. Agent-maintained; see `AGENTS.md` for the rules that govern this file.

## Current State (2026-07-20)

- **v1 code nuked** (Mitchell's call, 2026-07-20: "a dubious first pass"). Recoverable from git history. The mission is unchanged; a rebuild will be informed by the brainstorm below and the landscape research.
- Repo is currently knowledge-base-only. `docs/ui_mocks.txt` (the chat-UI mockups) was deliberately kept.
- Both research tasks are filed: [`sources/outrage-repo-analysis.md`](../sources/outrage-repo-analysis.md) and [`sources/civic-tech-landscape-2026.md`](../sources/civic-tech-landscape-2026.md). See "Landscape" below.

## Mission

Make it easy and fun to find out what's happening in Congress via C-SPAN-like sources. (Mitchell, 2026-07-20: goal unchanged from the start of the project.)

## Key Positions

*(Mitchell's positions, dated. Agent analysis is marked separately.)*

- **(Mitchell, 2026-07-20)** The core problem: the things that decide which laws pass — federal, state, city — are mostly really boring meetings that "the TikTok generation just cannot consume." AI summarization/curation can transform those events into a palatable form.
- **(Mitchell, 2026-07-20)** This is not a business and is not expected to monetize. The frame is "how can we make the U.S. better?" — which also means if someone else already does a piece well, we'd rather not duplicate them. Success metric: civic participation and efficacy.
- **(Mitchell, 2026-07-20)** **Focus on committee meetings and hearings, not floor speeches.** Floor speeches are long, hard to make palatable, and mostly inconsequential; committees are where the real work happens.
- **(Mitchell, 2026-07-20)** **Citation grounding is non-negotiable.** Everything published must be grounded in citations, with checks at multiple levels. (Promoted to AGENTS.md Design Philosophy #1.)
- **(Mitchell, 2026-07-20)** Congress is the test bed; local government may be the better long-term target, but we have to test and iterate somewhere, and Congress first is probably right.
- **(Mitchell, 2026-07-20)** Content strategy (e.g., "maybe we're making a TikTok channel") is deferred — fine either way, decide later.

## Product Ideas (brainstorm, Mitchell, 2026-07-20, via voice)

- **Chat thread with representatives as personas.** When stuff happens you get *pushed* a message, e.g. "Senator X talked for an hour about expanding the military." Click through for a bite-sized breakdown of what was actually said, compressed into easy chat messages. (This was the v1 concept too — see `docs/ui_mocks.txt`.)
- **Votes with the why.** When a bill gets voted on: who voted yes, who voted no, and *why* they voted that way. (Members' own vote explanations in the Congressional Record are an unsurfaced primary source — the dead ProPublica Represent precedent; see [`sources/civic-tech-landscape-2026.md`](../sources/civic-tech-landscape-2026.md).)
- **Personas as a query tool, not just a broadcast.** (Mitchell, 2026-07-20.) Beyond preprocessed summaries, let people *ask* the personas questions — "why did you vote for this?", "why did you say that?" — with answers backed strictly by things the member actually said in meetings, speeches, prior votes, and possibly their websites/social media. Preprocessing and interactive query are two faces of the same grounded corpus.
- **Merge with Outrage?** Mitchell's other project (`~/Desktop/outrage`) helps people figure out which representatives are responsible for a policy change they want, then draft and send messages / make calls. It's functional but has no user-acquisition story. Possible merge into one umbrella: "using AI to improve civic participation." (Tentative — Mitchell's phrasing was "maybe.") Analysis: [`sources/outrage-repo-analysis.md`](../sources/outrage-repo-analysis.md) — more shipped than "kind of works": active through Jan 2026, real users, and its Cicero rep-lookup already covers federal/state/**local** officials. Email/webform only; no calling despite the framing. *(Agent note, 2026-07-20.)*
- **Local governments too.** Start with the U.S. Congress, but the same treatment for state/city governments is interesting — see what they're doing, subscribe to alerts on certain topics.

## Landscape (as of 2026-07)

*(Agent analysis, from [`sources/civic-tech-landscape-2026.md`](../sources/civic-tech-landscape-2026.md).)* Four genuine gaps: (1) federal **proceedings** summarization for lay audiences — bill-text explainers are crowded, floor/hearing coverage is unserved; (2) the **group-chat persona format** — nobody does it anywhere; (3) **votes-with-why** — empty since ProPublica Represent died in 2024; (4) the **full loop** (notable moment → push → contact the responsible rep) — pieces exist (5 Calls, Resistbot, GovTrack trackers, citymeetings-class summarizers) but nobody chains them. Counterweight: **local**-meeting summarization is the crowded category (citymeetings.nyc, Aware/Sundays.news, SeeGov), and CRS's <3%-accuracy finding on AI bill summaries means faithfulness needs a human-in-the-loop story.

## Open Questions

- [x] Who else is already doing this well, and where are the real gaps? **Answered 2026-07-20** — see Landscape section above.
- Merge Outrage into this project, or keep them separate with links between them? **TBD**
- What is the beachhead audience — who reads Congress Chat first? **TBD**
- Consumption model: destination website vs. push-first vs. content channel (TikTok etc.)? Mitchell (2026-07-20): deferred — content strategy later. **Deferred**
- What does the multi-level citation-checking pipeline concretely look like (per Design Philosophy #1)? **TBD**
- Persona Q&A design tension *(agent, 2026-07-20)*: does the persona answer in first person as the member, or as a clearly-labeled AI digest of their record? First-person is more fun but risks (mis)impersonating a real, living person; labeling and strict grounding are the mitigations. **TBD**
- Committee data plumbing *(agent, 2026-07-20)*: official hearing transcripts (GovInfo CHRG) lag weeks-to-months; near-real-time likely means committee video/ASR. What's the freshness requirement? **TBD**
- Are the existing local summarizers actually good, or beatable "2022-era summarization"? **In progress** — teardown running 2026-07-20.
- Local government: which city/state first, when the time comes? **TBD** (Congress is the test bed first — Mitchell, 2026-07-20.)

## TODOs

- [x] File landscape-research findings as source cards and update Open Questions ([`sources/civic-tech-landscape-2026.md`](../sources/civic-tech-landscape-2026.md), 2026-07-20).
- [x] File Outrage repo analysis as a source card: [`sources/outrage-repo-analysis.md`](../sources/outrage-repo-analysis.md) (2026-07-20). Merge-vs-separate decision still open (Mitchell).
- [ ] Rewrite `vision.md` once the merge question and beachhead are settled.
- [ ] Mitchell: Railway service still points at this repo; deployment target for any rebuild is TBD (the old service will now fail to build — consider pausing it).
- [x] Bootstrap knowledge-base structure (2026-07-20).
