# Next Actions

Priority-ordered lanes. Mitchell's lane holds only actions that genuinely require a human; everything the agent can do goes in Madison's lane. Refresh at the end of every working session (see `AGENTS.md`, rule 3).

## Mitchell's lane

- [ ] Decide: merge Outrage into this project or keep separate? (Blocked on Madison's Outrage analysis + landscape research.)
- [ ] Pause/repoint the Railway service — the repo no longer contains an app, so its next deploy will fail.
- [x] Move local `.env` to `code/.env` and run `npm install` in `code/` (done by Madison, 2026-07-20; moot after code nuke — `.env` with API keys now preserved at repo root, gitignored).

## Madison's lane

- [x] File landscape research as source cards; distill the gap analysis into `wiki/main.md` (2026-07-20).
- [x] File Outrage repo analysis as a source card (`sources/outrage-repo-analysis.md`, 2026-07-20).
- [ ] File the local-summarizer teardown (citymeetings / Aware / SeeGov) as a source card when it lands.
- [ ] Draft a v2 product sketch: committee-first ingestion, chat personas (broadcast + query), citation-grounding pipeline.
