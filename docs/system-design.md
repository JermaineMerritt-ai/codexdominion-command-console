# System Design

Companion to [architecture.md](architecture.md) — focuses on the data path,
the mode switch, and the seams that make the console pilot-ready.

## Data path

```
Page (async Server Component)
  └─ lib/data/queries.ts            (async public API: sort, derive, compose)
       └─ getRepository()           (selects implementation by APP_MODE)
            ├─ seedRepository       demo  → lib/data/seed.ts
            └─ prismaRepository     database → lib/db/prisma.ts → Postgres
```

- **`queries.ts` is the only module pages import.** It owns sorting, metric
  computation, audit-readiness scoring, and search. Both repositories return raw
  collections, so this logic is shared and never duplicated.
- **`getRepository()`** memoizes the choice. In `database` mode it
  **dynamically imports** `repository.prisma.ts`, so demo builds never bundle
  Prisma or require credentials.
- **All accessors are async** → the seed and Prisma implementations are
  drop-in interchangeable.

## Mode switch

`lib/config.ts` reads `NEXT_PUBLIC_APP_MODE` (`demo` default). Because it's a
`NEXT_PUBLIC_` variable it's inlined at build time; the database branch is dead
code in a demo build.

## Rendering & data fetching

- Pages are **async Server Components**; data is fetched server-side with
  `Promise.all` for parallelism. No client-side data fetching for primary
  content.
- **Name resolution:** pages fetch a `usersById` map once (`getUsersById()`) and
  resolve display names synchronously in JSX via `nameOf(map, id)` — avoiding
  N async lookups inside render loops.
- **Global search** is a **server action** (`searchAction`) so the data layer
  never ships to the browser and search is automatically mode-aware.

## Client islands

Interactivity is isolated to small client components: the TanStack data table,
Recharts visualizations, the evidence-generator modal, the settings form, and
navigation menus (search box, notifications, theme toggle). Everything else is
server-rendered.

## Multi-tenancy seam

Every entity carries `organizationId`. `getActiveOrganization()` resolves the
current tenant (seed: `ACTIVE_ORG_ID`; database: first org / future auth claim).
The SQL migration enforces isolation with row-level security keyed on
`current_org_id()`.

## Extending to live mutations (Sprint 02)

Mutations should be **Server Actions** that (1) authorize by role, (2) write via
Prisma, and (3) append an `AuditEvent` to preserve the hash chain. The read path
already abstracts the source; the write path will follow the same repository
seam.

## Failure modes

- **No DB credentials in database mode** → Prisma throws on first query. Mitigate
  by keeping `demo` the default and only setting `database` once Supabase is
  provisioned.
- **DB unavailable mid-demo** → flip `NEXT_PUBLIC_APP_MODE=demo` to restore the
  seed experience instantly.
