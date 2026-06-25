# Sprint 01 — Demo-ready → Pilot-ready foundation

**Goal:** move from a demo-only seed app to a pilot-ready foundation with a real
data path, while keeping the credential-free demo intact.

**Status:** ✅ Complete

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Repository abstraction behind `queries.ts` | `lib/data/repository.ts` defines `DataRepository`; pages unchanged in shape |
| 2 | Demo/Database mode switch | `NEXT_PUBLIC_APP_MODE` (`demo` default) via `lib/config.ts` |
| 3 | Prisma-backed implementation | `lib/data/repository.prisma.ts`, dynamically imported in DB mode only |
| 4 | Async data layer | all accessors async; pages converted to async Server Components |
| 5 | Mode-aware global search | moved to a server action (`lib/actions/search.ts`) — no data in client bundle |
| 6 | Database seed script | `prisma/seed.ts` loads the same governance records into Postgres |
| 7 | DB npm scripts | `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio` |
| 8 | `postinstall: prisma generate` | guarantees a generated client on Vercel |
| 9 | Docs updated | README, deployment, + system-design / security / compliance / demo-script |
| 10 | Quality gates green | `typecheck`, `lint`, `build` all pass; demo stays default |

## Definition of done (met)
- Demo mode requires **zero** environment variables and never breaks.
- Switching `NEXT_PUBLIC_APP_MODE=database` reads live data through Prisma.
- Seed script reproduces demo data in Postgres for parity.
- No page imports `seed.ts` directly — only `queries.ts`.

## Backlog → Sprint 02 (proposed)

| Priority | Item | Why |
| --- | --- | --- |
| P0 | Supabase Auth login flow + `/login` page | Required when `NEXT_PUBLIC_REQUIRE_AUTH=true` |
| P0 | Map Supabase auth user → application `User` / role | Real RBAC identity |
| P1 | Server Actions for mutations (approve, transition, publish) | Make workflows live, append audit events |
| P1 | Server-side enforcement of the role→capability matrix | Security; UI matrix is not enough |
| P1 | Real PDF / ZIP evidence export (signed) | Today JSON export is real; PDF/ZIP are labels |
| P2 | Derive dashboard time-series from live decisions | Replace representative series in DB mode |
| P2 | Notifications subsystem (table + delivery) | Currently derived/seed |
| P2 | Pagination + server-side filtering on Decisions | Scale beyond demo volumes |

## Risks / debt
- `repository.prisma.ts` reuses representative time-series for two charts in DB
  mode (documented; Phase 3 analytics).
- Notifications have no table yet — derived in DB mode, seed in demo mode.
- Auth is scaffolded but the `/login` flow is not built (demo default sidesteps).
