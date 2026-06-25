# Architecture

## Overview

The Command Console is a **Next.js 15 App Router** application built around
**Server Components** for data fetching and **Client Components** for
interactivity (tables, charts, modals, forms). It follows a **feature-based
architecture** with a clean separation between the data layer, the domain types,
and the presentation layer.

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│   ┌───────────────┐   ┌──────────────────────────────────┐  │
│   │ AppShell       │   │ Client islands                   │  │
│   │ (sidebar/topbar)   │ DataTable · Charts · Generator   │  │
│   └───────────────┘   └──────────────────────────────────┘  │
└───────────────▲─────────────────────────────────────────────┘
                │ RSC payload
┌───────────────┴─────────────────────────────────────────────┐
│  Next.js server (App Router)                                 │
│   Server Components → lib/data/queries → seed | Prisma       │
│   middleware.ts (optional Supabase auth gate)               │
└───────────────▲─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│  Data sources                                               │
│   • Seed layer (lib/data/seed.ts)  — zero-config demo       │
│   • Supabase Postgres via Prisma   — production pilots      │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Domain types — `types/`
A single source of truth (`types/index.ts`) defines every entity
(`Decision`, `Workflow`, `Policy`, `EvidencePack`, `Vendor`,
`ProcurementOpportunity`, `AuditEvent`, …). These types mirror the Prisma schema
and the SQL migration, so the seed layer and a live database are interchangeable.

### 2. Data layer — `lib/data/`
- `seed.ts` — realistic, deterministic records anchored to a fixed demo date.
- `queries.ts` — accessor functions (`getDecisions`, `getDashboardMetrics`,
  `globalSearch`, `getAuditReadinessScore`, …). **Pages only import from
  `queries.ts`**, never from `seed.ts` directly. To switch to a live backend,
  reimplement `queries.ts` against Prisma — no page changes required.

### 3. Presentation — `components/` + `app/`
- `components/ui/*` — primitives (Card, Button, Badge, Input, Progress,
  StatusBadge, EmptyState, Skeleton).
- `components/navigation/*` — AppShell, Sidebar, Topbar, GlobalSearch,
  NotificationsMenu, ThemeToggle.
- `components/{dashboard,decisions,evidence,settings}/*` — feature components.
- `app/*` — one route per governance domain; Server Components compose feature
  components with data from `queries.ts`.

## Design system

Theming is driven by **CSS custom properties** in `app/globals.css`, consumed by
Tailwind via `hsl(var(--token))`. Light and dark palettes are defined under
`:root` and `.dark`; `next-themes` toggles the class. The palette is an enterprise
neutral with a single accent (primary), plus semantic success / warning /
destructive tokens used consistently by `StatusBadge`.

## Rendering strategy

- **Server Components** for all data-bound pages — no client data fetching, no
  loading spinners for primary content.
- **Client Components** (`"use client"`) only where interaction is required:
  the TanStack data table, Recharts visualizations, the evidence generator
  modal, the settings form, and navigation menus.
- **Static generation** — procurement detail pages use `generateStaticParams`.

## Authentication

`middleware.ts` is a **no-op by default**. When `NEXT_PUBLIC_REQUIRE_AUTH=true`
and Supabase env vars are present, it refreshes the Supabase session and gates
routes behind `/login`. `lib/auth/session.ts` resolves the current user,
falling back to the seed admin in demo mode.

## Multi-tenancy

Every domain table carries an `organization_id`. The SQL migration enables
**row-level security** with an org-isolation policy (`current_org_id()`),
ensuring tenants only see their own governance data.
