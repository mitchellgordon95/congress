# Congress Chat — Master Article

The master wiki article. Agent-maintained; see `AGENTS.md` for the rules that govern this file.

## Current State (2026-07-20)

- **v1 code nuked** (Mitchell's call, 2026-07-20: "a dubious first pass"). Recoverable from git history. The mission is unchanged; a rebuild will be informed by the brainstorm below and the landscape research.
- Repo is currently knowledge-base-only. `docs/ui_mocks.txt` (the chat-UI mockups) was deliberately kept.
- Landscape research on existing civic-tech projects and an analysis of the Outrage repo are in progress (2026-07-20); findings will be filed in `sources/`.

## Mission

Make it easy and fun to find out what's happening in Congress via C-SPAN-like sources. (Mitchell, 2026-07-20: goal unchanged from the start of the project.)

## Key Positions

*(Mitchell's positions, dated. Agent analysis is marked separately.)*

- **(Mitchell, 2026-07-20)** The core problem: the things that decide which laws pass — federal, state, city — are mostly really boring meetings that "the TikTok generation just cannot consume." AI summarization/curation can transform those events into a palatable form.
- **(Mitchell, 2026-07-20)** This is not a business and is not expected to monetize. The frame is "how can we make the U.S. better?" — which also means if someone else already does a piece well, we'd rather not duplicate them.

## Product Ideas (brainstorm, Mitchell, 2026-07-20, via voice)

- **Chat thread with representatives as personas.** When stuff happens you get *pushed* a message, e.g. "Senator X talked for an hour about expanding the military." Click through for a bite-sized breakdown of what was actually said, compressed into easy chat messages. (This was the v1 concept too — see `docs/ui_mocks.txt`.)
- **Votes with the why.** When a bill gets voted on: who voted yes, who voted no, and *why* they voted that way.
- **Merge with Outrage?** Mitchell's other project (`~/Desktop/outrage`) helps people figure out which representatives are responsible for a policy change they want, then draft and send messages / make calls. It's functional but has no user-acquisition story. Possible merge into one umbrella: "using AI to improve civic participation." (Tentative — Mitchell's phrasing was "maybe.")
- **Local governments too.** Start with the U.S. Congress, but the same treatment for state/city governments is interesting — see what they're doing, subscribe to alerts on certain topics.

## Open Questions

- Who else is already doing this well, and where are the real gaps? **In progress** — landscape research running 2026-07-20.
- Merge Outrage into this project, or keep them separate with links between them? **TBD**
- What is the beachhead audience — who reads Congress Chat first? **TBD**
- Consumption model: destination website vs. push-first (alerts, feeds, maybe distribution on existing platforms)? Mitchell's brainstorm leans push. **TBD**
- How is translation/summarization quality validated (faithfulness to the actual record)? **TBD**
- For "why they voted no": what's the honest source — floor statements, press releases, inference? Risk of putting words in members' mouths. **TBD**
- Local government: which city/state first, and is the data even available in a C-SPAN-like form there? **TBD**

## TODOs

- [ ] File landscape-research findings as source cards and update Open Questions.
- [ ] File Outrage repo analysis as a source card; decide merge vs. separate.
- [ ] Rewrite `vision.md` once the merge question and beachhead are settled.
- [ ] Mitchell: Railway service still points at this repo; deployment target for any rebuild is TBD (the old service will now fail to build — consider pausing it).
- [x] Bootstrap knowledge-base structure (2026-07-20).
