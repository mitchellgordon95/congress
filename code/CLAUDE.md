# Congress Chat — App

Next.js 16 (App Router) + React 19 + Prisma + Tailwind 4. Presents congressional floor proceedings as group-chat threads with plain-language translation via the Anthropic SDK. Deployed on Railway (`railway.json`).

Run everything from this directory (`code/`).

## Commands

- `npm run dev` — dev server on port 3847
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — lint
- `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` — Prisma
- `npm run process-transcripts` — fetch & process Congressional Record transcripts
- `npm run sync-members` — sync member data from Congress.gov

## Layout

- `src/app/` — routes: home, house, senate, bills, members, member/[bioguideId], search, session/[id]; API routes under `src/app/api/`.
- `src/components/` — chat/, member/, home/, shared/ UI components.
- `src/lib/` — `govinfo.ts` (transcript fetch), `parser.ts` (speaker-turn parsing), `congress-api.ts` (member sync), `translator.ts` (plain-language translation), `db.ts`, `date-utils.ts`.
- `src/scripts/` — CLI entry points for the two npm scripts above.
- `prisma/schema.prisma` — data model.

## Environment

Copy `.env.example` to `.env` in this directory. Needs GovInfo/Congress.gov API keys, an Anthropic API key, and the database URL. Never commit `.env`.
