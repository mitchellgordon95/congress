# Congress Chat — Master Article

The master wiki article. Agent-maintained; see `AGENTS.md` for the rules that govern this file.

## Current State (2026-07-20)

- Initial implementation of the app is complete and has been through several rounds of UI fixes (see git history in `code/`).
- The app follows the text mockups in `docs/ui_mocks.txt`.
- Repo restructured today: app moved to `code/`, knowledge-base structure (this wiki, `sources/`, `log/`, `meetings/`, `vision.md`) bootstrapped.
- Deployment target is Railway (`code/railway.json`); pipeline processes Congressional Record transcripts via GovInfo and syncs members via Congress.gov.

## Key Positions

*(Mitchell's standing positions on product and design, dated. None recorded yet — capture them as they come up, per the attribution rule in `AGENTS.md`.)*

## Open Questions

- What is the beachhead audience — who reads Congress Chat first? **TBD**
- How is translation quality validated (faithfulness of plain-language rendering to the actual record)? **TBD**
- What is the update cadence for processing new sessions (cron exists at `code/src/app/api/cron/process/route.ts` — is it wired up in production)? **TBD**

## TODOs

- [x] Mitchell: move the local `.env` into `code/.env` and reinstall dependencies in `code/` after the restructure lands. *(Done by Madison, 2026-07-20.)*
- [ ] Mitchell: update the Railway service root directory to `code/` so deploys keep working.
- [ ] Fill in `vision.md` problem/beachhead/hypotheses sections.
- [ ] Record the first non-negotiables in `AGENTS.md` Design Philosophy.
