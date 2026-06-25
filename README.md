# CodexDominion Command Console

> The flagship interface for **CodexDominion 5.0** — an AI Governance Control Plane for enterprise, healthcare, finance, and government organizations.

The Command Console is not a marketing site. It is an **operational control center** where organizations monitor AI governance, human approval workflows, policy enforcement, compliance evidence, audit trails, procurement readiness, and vendor risk — in the spirit of Azure Portal, Microsoft Defender, ServiceNow, Datadog, and the AWS Console.

**🔗 Live demo (demo mode):** https://codexdominion-command-console.vercel.app

![Status](https://img.shields.io/badge/build-passing-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

---

## ✨ What's inside

| Area | Capability |
| --- | --- |
| **Dashboard** | Executive governance metrics, decisions-over-time, policy-violation and approval trends, risk distribution, audit-readiness score, live widgets |
| **Decision Center** | Enterprise data table of every AI decision — search, filter, sort, paginate, expandable detail with cryptographic evidence hash |
| **Workflows** | Draft → review → approval → escalation → closure tracking with a visual stepper and event timeline |
| **Policies** | Versioned policy catalog with publish / draft / archive lifecycle |
| **Evidence** | Tamper-evident, hash-chained evidence-pack generator with JSON export |
| **Vendors** | Third-party governance grid — risk scores, SOC 2 / HIPAA / FedRAMP / insurance status, expiration warnings |
| **Procurement** | Opportunity tracking with match scores, required controls, capability gaps, and per-opportunity bid-readiness pages |
| **Users** | Role-based access control with a full permissions matrix |
| **Settings** | Governance controls, thresholds, data residency, and a hash-chained audit trail |
| **Global** | Cross-entity search, notification center, dark mode, responsive layout, skeleton + empty + error states |

## 🧱 Tech stack

- **Next.js 15** (App Router, Server Components) · **TypeScript** (strict)
- **Tailwind CSS** + a hand-rolled shadcn-style component system
- **Recharts** for data visualization · **TanStack Table** for enterprise tables
- **React Hook Form** + **Zod** for forms and validation
- **Prisma ORM** + **Supabase** (Auth + Postgres) — production backend
- **Lucide** icons · **next-themes** dark mode

## 🚀 Quick start

```bash
npm install
npm run dev
# → http://localhost:3021
```

The console runs **zero-config** in **DEMO mode**. With no environment variables
it serves a rich, typed **seed-data layer** so every screen is immediately
demoable — ideal for enterprise pilot demonstrations and public previews.

## 🧭 Command Workspace (the home screen)

`/command` is the **primary interface** (`/` redirects here) — a **governed
command interface** where you describe what you need in plain language.
CodexDominion **governs every request** (parse → RBAC → audit), then **routes
execution to a selected AI provider**. It's deterministic today (no LLM / API
keys); providers are interchangeable execution assistants behind the governed
pipeline. **CodexDominion is always the governing layer** — see
[AI provider routing](docs/ai-provider-routing.md).

```
Show high-risk decisions
Show pending approvals
Show vendors with expiring certifications
Show procurement opportunities with high match scores
Explain why decision DEC-2026-0480 was denied
Show audit events for DEC-2026-0480
Prepare a buyer demo summary
Review system risk posture
Recommend next governance action
Generate evidence pack for denied decisions   (requires evidence permission)
```

Each command returns a structured result (summary, linked rows, recommended
actions, evidence links) and writes a `command.executed` audit event; blocked
commands return a forbidden message and record `authorization.denied`. The
product arc: **visibility → action → authority (RBAC) → governed AI interface →
proof (audit)**. See [docs/command-workspace.md](docs/command-workspace.md).

## ⚙️ Live governance actions

The console is **operational**, not read-only. Every action runs as a validated
**server action**, mutates state, and writes a **hash-chained audit event**.

| Action | Where | Audit event |
| --- | --- | --- |
| Approve / Deny decision | Decisions → expand a row | `decision.approved` / `decision.denied` |
| Transition workflow | Workflows → "Move to" | `workflow.transitioned` (invalid transitions rejected) |
| Publish / Archive policy | Policies → row actions | `policy.published` / `policy.archived` |
| Complete vendor review | Vendors → "Mark reviewed" | `vendor.reviewed` |
| Save evidence pack record | Evidence → generator | `evidence.generated` |

- **Demo mode:** mutations persist in an in-memory store and update the UI live
  (reset on cold start — ideal for a shared public demo).
- **Database mode:** mutations + audit events run in a single Prisma transaction.

Inputs are validated with Zod; see [docs/audit-events.md](docs/audit-events.md)
and [docs/sprint-02.md](docs/sprint-02.md). Run the action tests with `npm test`.

## 🔐 Authentication & RBAC

Authentication is an **opt-in layer** — the demo stays open by default.

- `NEXT_PUBLIC_REQUIRE_AUTH=false` (default): open; actor = seeded administrator.
- `NEXT_PUBLIC_REQUIRE_AUTH=true` + Supabase keys: routes gated behind `/login`,
  session-bound, sign-out from the user menu.

Every governance action is **enforced server-side** by role. `can(role, action)`
is shared by the server (enforcement) and the UI (hides/disables controls), and
**denied attempts are audited** as `authorization.denied`.

| Action | Allowed roles |
| --- | --- |
| Approve / Deny decision | Administrator, Compliance Officer, Reviewer |
| Transition workflow | Administrator, Compliance Officer |
| Publish / Archive policy | Administrator, Compliance Officer |
| Complete vendor review | Administrator, Compliance Officer, Reviewer |
| Generate evidence pack | Administrator, Compliance Officer, Auditor |

See [docs/rbac.md](docs/rbac.md) and [docs/auth.md](docs/auth.md).

## 🔀 Data source modes

A single switch (`NEXT_PUBLIC_APP_MODE`) selects where data comes from. Pages
import only from `lib/data/queries.ts`, which delegates to a mode-aware
repository — so the UI is identical in both modes.

| Mode | Value | Source | Needs credentials? |
| --- | --- | --- | --- |
| **Demo** (default) | `demo` | typed seed layer | ❌ never breaks |
| **Database** | `database` | Prisma + Supabase Postgres | ✅ `DATABASE_URL` etc. |

**Demo is always the default**, so a credential-free Vercel preview never breaks.

### Switch to database mode

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_APP_MODE=database and fill in Supabase URL/keys + DATABASE_URL
npm run db:generate     # generate the Prisma client
npm run db:push         # or: npm run db:migrate
npm run db:seed         # load the same governance demo records into Postgres
```

See [docs/deployment.md](docs/deployment.md) and [docs/data-model.md](docs/data-model.md).

## 📜 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run governance unit tests |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create & apply a migration |
| `npm run db:seed` | Seed governance demo records |
| `npm run db:studio` | Open Prisma Studio |

## 🗂 Project structure

```
app/            App Router routes (dashboard, decisions, evidence, …)
components/     UI primitives, navigation, dashboard, feature components
lib/            data (seed + queries), supabase, auth, utils
prisma/         Prisma schema
supabase/       SQL migrations + RLS policies
types/          Shared domain types
docs/           Architecture, data model, API, deployment, roadmap
```

## 📚 Documentation

- [Architecture](docs/architecture.md)
- [System Design](docs/system-design.md)
- [Data Model](docs/data-model.md)
- [API & Server Actions](docs/api.md)
- [Security](docs/security.md)
- [Authentication](docs/auth.md) · [RBAC](docs/rbac.md)
- [Compliance Mapping](docs/compliance.md)
- [Audit Events](docs/audit-events.md)
- [Command Workspace](docs/command-workspace.md) · [AI Provider Routing](docs/ai-provider-routing.md)
- [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md)
- [Sprint 01](docs/sprint-01.md) · [02](docs/sprint-02.md) · [03](docs/sprint-03.md) · [04](docs/sprint-04.md) · [05](docs/sprint-05.md)
- [Demo Script](docs/demo-script.md)
- [Contributing](CONTRIBUTING.md)

---

© CodexDominion 5.0 — AI Governance Control Plane.
