# Contributing

Thanks for helping build the CodexDominion Command Console.

## Setup

```bash
npm install
npm run dev
```

## Standards

- **TypeScript strict** — no `any` unless unavoidable and commented.
- **Server Components by default**; add `"use client"` only when you need
  interactivity (state, effects, event handlers, browser APIs).
- **Data access** goes through `lib/data/queries.ts`. Never import `seed.ts`
  from a page or component.
- **Styling** uses Tailwind + the design tokens in `app/globals.css`. Use the
  `StatusBadge` component for any enum/status display so colors stay consistent.
- **Components** are feature-scoped under `components/<feature>/`; shared
  primitives live in `components/ui/`.

## Before opening a PR

```bash
npm run typecheck   # must pass clean
npm run lint        # must pass clean
npm run build       # must succeed
```

## Conventions

- Files: `kebab-case.tsx`. Components: `PascalCase`. Helpers: `camelCase`.
- Keep PRs focused; one feature or fix per PR.
- Update the relevant doc in `docs/` when behavior changes.
- Add new entities to `types/index.ts`, the Prisma schema, and the SQL migration
  together so the seed layer and database stay in sync.

## Commit messages

Use clear, imperative summaries (e.g. `add vendor expiration warnings`).
