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
Show active modules
Show modules needing integration
Show highest risk module
Show module status for ComplianceFlow
Recommend next module integration
Show control plane health
Show live control plane decisions
Show ComplianceFlow health
Show GCFI health
Show contractor milestone risks
Show payment approval risks
Sync control plane                             (requires admin/compliance)
Sync ComplianceFlow                            (requires admin/compliance)
Sync GCFI                                       (requires admin/compliance)
Generate evidence pack for denied decisions   (requires evidence permission)
```

Each command returns a structured result (summary, linked rows, recommended
actions, evidence links) and writes a `command.executed` audit event; blocked
commands return a forbidden message and record `authorization.denied`. The
product arc: **visibility → action → authority (RBAC) → governed AI interface →
proof (audit)**. See [docs/command-workspace.md](docs/command-workspace.md).

## 🧩 Module Registry

`/modules` is **what CodexDominion governs** — every vertical app reports into the
Console through a standard **Integration Contract**
(`GovernanceModule`: workflows, decisions, evidence, policies, audit, risk). Each
module card shows status, health, metrics, and an **integration maturity** score;
detail pages show the contract capability checklist, missing capabilities, and
the recommended next integration step.

Demo-seeded today (9 modules: codex-control-plane, ComplianceFlow,
codex-procurement-network, GCFI, ClinicalFlow, EscrowFlow, CareLedger, GrantOps,
codexjustice-platform); a live module API can replace the source without changing
the Console. See [docs/module-registry.md](docs/module-registry.md) and
[docs/integration-contract.md](docs/integration-contract.md).

**Live bindings (×3):** `codex-control-plane`, `ComplianceFlow`, and
`Government Contractor Financial Infrastructure` (GCFI) can each report **live**
data through the same shared adapter — set `<MODULE>_MODE=live` +
`<MODULE>_API_URL` to connect, with automatic seed fallback if the API is
unavailable (the public demo always shows a clear "Demo fallback" state). The
registry pages are **live-safe** (ISR, 30s) so live data never freezes at build.
GCFI governs contract milestones, contractor approvals, and payment-authorization
risk. See [control-plane](docs/live-control-plane-binding.md),
[ComplianceFlow](docs/live-complianceflow-binding.md), and
[GCFI](docs/live-gcfi-binding.md) bindings.

## 🏦 Industry Editions — BankTrust OS

**BankTrust OS** is the first **industry edition** of CodexDominion — the AI
Governance Operating System for community & regional banking, built on the same
platform (not a separate product). `/banking` shows banking executive KPIs,
banking command prompts that run through the governed pipeline, regulators
(OCC/FDIC/Fed/FFIEC/CFPB/BSA-AML/Fair Lending/Model Risk), and the BankTrust OS
module. "Prepare our OCC examination package" proposes a plan **grounded in the
bank's actual posture** (SAR pending, open findings, expiring attestations).

The same engine powers healthcare, government, and other regulated industries
through industry editions. See [docs/banktrust-os.md](docs/banktrust-os.md).

## 🌐 Global Command Access

Prompt CodexDominion in **English, Spanish, or French** — every language resolves
to the **same governed intent** and the **same pipeline** (detect → translate
intent → RBAC → policy → execute → audit). The top-nav language selector
localizes commands and responses; IDs, hashes, and audit summaries stay
canonical. Audit events record the input/response language for traceability.

> **Language changes. Governance does not.** See
> [docs/global-command-access.md](docs/global-command-access.md).

## 🧠 Organization Knowledge Graph

CodexDominion maintains a **governed knowledge graph** of your environment —
policies, vendors, contracts, evidence, decisions, workflows, modules,
opportunities, and AI systems, plus the relationships between them. `/knowledge`
shows entity counts, relationship chains, and prioritized **knowledge gaps**
(expiring certifications, missing evidence, unreviewed decisions, integration
gaps, open risks).

This is the answer to *"How does the AI know our business?"* — a governed graph,
not uploaded documents. **Execution plans are grounded in it**: "Prepare for a
FedRAMP assessment" surfaces *your* expiring vendor certs, *your* uncovered
denied decisions, and *your* open module risks before any step runs. See
[docs/knowledge-graph.md](docs/knowledge-graph.md).

## 🤖 AI Execution Plans

The workspace is **autonomous, not a chatbot**: a high-level prompt proposes a
**multi-step plan**, a human approves it, and the platform executes each step
across modules — auditing everything.

```
"Prepare for a FedRAMP assessment"
  → Execution Plan (6 steps · ~12 min · risk: medium · ComplianceFlow, control-plane, Vendors, Evidence)
  → Approve & Execute   (RBAC: execute_plan — Administrator / Compliance Officer)
  → each step runs as a governed command (command.executed audit)
  → executive report + plan.executed audit (sealed)
```

**AI proposes · human approves · platform executes · everything audited.** Plans:
FedRAMP readiness, HIPAA audit prep, contractor payment risk, procurement
posture, AI governance posture, executive briefing, pilot readiness. See
[docs/execution-plans.md](docs/execution-plans.md).

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
- [Module Registry](docs/module-registry.md) · [Integration Contract](docs/integration-contract.md)
- Live bindings: [control-plane](docs/live-control-plane-binding.md) · [ComplianceFlow](docs/live-complianceflow-binding.md) · [GCFI](docs/live-gcfi-binding.md)
- [AI Execution Plans](docs/execution-plans.md) · [Knowledge Graph](docs/knowledge-graph.md)
- [Global Command Access](docs/global-command-access.md) · [Localization](docs/localization.md)
- [BankTrust OS](docs/banktrust-os.md) (banking edition)
- [Pilot Kit](docs/pilot-kit.md) · [Demo Script](docs/demo-script.md) · [Pilot Briefs](docs/pilot-briefs.md) · [Video Scripts](docs/video-scripts.md)
- [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md)
- [Sprint 01](docs/sprint-01.md) · [02](docs/sprint-02.md) · [03](docs/sprint-03.md) · [04](docs/sprint-04.md) · [05](docs/sprint-05.md) · [06](docs/sprint-06.md) · [07](docs/sprint-07.md) · [08](docs/sprint-08.md) · [09](docs/sprint-09.md) · [10](docs/sprint-10.md) · [11](docs/sprint-11.md) · [12](docs/sprint-12.md) · [13](docs/sprint-13.md) · [14](docs/sprint-14.md)
- [Demo Script](docs/demo-script.md)
- [Contributing](CONTRIBUTING.md)

---

© CodexDominion 5.0 — AI Governance Control Plane.
