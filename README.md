# CodexDominion Command Console

> The flagship interface for **CodexDominion 5.0** — an AI Governance Control Plane for enterprise, healthcare, finance, and government organizations.

The Command Console is not a marketing site. It is an **operational control center** where organizations monitor AI governance, human approval workflows, policy enforcement, compliance evidence, audit trails, procurement readiness, and vendor risk — in the spirit of Azure Portal, Microsoft Defender, ServiceNow, Datadog, and the AWS Console.

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

The console runs **zero-config**. With no environment variables it serves a rich,
typed **seed-data layer** so every screen is immediately demoable — ideal for
enterprise pilot demonstrations.

### Wire up the live backend (optional)

```bash
cp .env.example .env.local
# fill in Supabase URL / keys + DATABASE_URL, then:
npm run prisma:generate
npm run prisma:migrate
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
| `npm run prisma:migrate` | Apply Prisma migrations |

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
- [Data Model](docs/data-model.md)
- [API & Server Actions](docs/api.md)
- [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)

---

© CodexDominion 5.0 — AI Governance Control Plane.
