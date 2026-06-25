# Roadmap

## ✅ Phase 1 — Console foundation (shipped)
- Executive dashboard: metrics, charts, audit-readiness, live widgets
- Policy Decision Center with expandable enterprise data table
- Governance workflows with stepper + timeline
- Policy management (publish / draft / archive)
- Evidence-pack generator with hash sealing + JSON export
- Vendor governance grid with certification + expiration warnings
- Procurement readiness + per-opportunity detail pages
- RBAC user management with permissions matrix
- Settings + tamper-evident audit trail
- Global search, notifications, dark mode, responsive, a11y states
- Prisma schema + Supabase migration + RLS + auth scaffolding

## 🔜 Phase 2 — Live backend
- Implement `lib/data/queries.ts` against Prisma
- Route Handlers + Server Actions (see [api.md](api.md))
- Supabase Auth login flow + role provisioning
- Real evidence-pack export to PDF and ZIP (signed artifacts)
- Server-side enforcement of the role → capability matrix

## 🧭 Phase 3 — Intelligence
- Continuous model-drift and disparate-impact monitoring jobs
- Automated risk scoring for vendors and AI systems
- Policy-as-code rule engine with versioned rule evaluation
- SAM.gov / opportunity ingestion for procurement
- Notification delivery (email / Slack / webhook)

## 🧭 Command Workspace — ✅ delivered (Sprints 04–05)

The Command Workspace shipped as the **primary interface** (`/command`, now the
home screen) with a deterministic governed command engine (Sprint 04) and an
**AI provider abstraction** (Sprint 05): CodexDominion governs every request and
routes execution to interchangeable providers (Codex active; Claude/ChatGPT/
Copilot preview). See [command-workspace.md](command-workspace.md) and
[ai-provider-routing.md](ai-provider-routing.md).

### ✅ Module Registry + Integration Contract — delivered (Sprint 06)
Every CodexDominion app reports into the Console via the `GovernanceModule`
contract; `/modules` registry + detail pages + 5 module commands. See
[module-registry.md](module-registry.md) and
[integration-contract.md](integration-contract.md).

### ✅ Live codex-control-plane binding — delivered (Sprint 07)
First module with a live API binding through the contract, with safe seed
fallback and source provenance. See
[live-control-plane-binding.md](live-control-plane-binding.md).

### ✅ Live-safe registry + second binding — delivered (Sprint 08)
ISR-based live-safe `/modules`; ComplianceFlow bound as the second live module
via shared adapter utilities. See
[live-complianceflow-binding.md](live-complianceflow-binding.md).

### ✅ Third live binding (GCFI) — delivered (Sprint 09)
Government Contractor Financial Infrastructure bound via the shared adapter, with
contract-milestone and payment-approval risk commands. See
[live-gcfi-binding.md](live-gcfi-binding.md).

### ✅ AI Execution Plans — delivered (Sprint 10)
Multi-step, human-approved, audited plans that orchestrate across modules
(propose → approve → execute → audit). See
[execution-plans.md](execution-plans.md).

### ✅ Organization Knowledge Graph — delivered (Sprint 11)
Governed knowledge graph (entities + relationships + gaps); execution plans are
grounded in it. See [knowledge-graph.md](knowledge-graph.md).

### ✅ Hardening & Demo Readiness — delivered (Sprint 12)
Diagnostics page, audit-chain verifier, curated command UX, refreshed demo
script, and vertical pilot briefs. Consolidation before the LLM. See
[sprint-12.md](sprint-12.md), [pilot-briefs.md](pilot-briefs.md).

### Proposed forward sequence
- **Sprint 13** — Multilingual Command Access (EN → ES → FR): in-language prompts → same governed intent; *language changes, governance does not*
- **Sprint 14** — Claude integration (planner only — proposes plans over the graph; Codex remains the authority)
- **Sprint 15** — ChatGPT integration (strategy / document generation)
- **Sprint 16** — Microsoft 365 Copilot integration
- **Sprint 17** — Cross-module autonomous workflows
- **Sprint 18** — SDK + Marketplace for third-party governed modules

### Original vision (reference)

Evolve the console from page navigation to a **governed command interface**. A
top-level **Command** page with a prompt bar where users describe intent:

> "Generate an evidence package for all denied AI decisions this month."
> "Review this vendor for HIPAA readiness." · "Explain why DEC-2026-0480 was denied."

Each command routes through the **same governed pipeline** built in Sprints
01–03: interpret → determine module(s) → **apply RBAC + policy** → execute
permitted actions → **write audit events** → return result *with* supporting
evidence. The command bar is a new surface over the existing governed actions —
not a bypass of them.

Proposed navigation grouping:
`Home · Dashboard · Command · Governance (Decisions/Policies/Evidence/Workflows)
· Operations (Procurement/Vendors/Contracts/Grants) · Solutions (industry
modules) · Administration (Users/Orgs/Integrations/Settings)`.

## 🧩 Vision — Platform tiers

Position the portfolio as one platform: **Tier 1 Platform** (this Console +
codex-control-plane engine + shared core/SDK + docs), **Tier 2 Modules**
(ComplianceFlow, ClinicalFlow, GrantOps, Gov Contractor Financial, EscrowFlow,
Procurement Network, CareLedger, Justice) integrated in that order, and **Tier 3
shared services**. Every module emits the same governed artifacts — decisions,
workflows, evidence, audit events, risk — so the Console presents one unified
operational view regardless of domain. Integration sequence: control-plane →
ComplianceFlow → GrantOps → Gov Contractor → EscrowFlow → ClinicalFlow →
Procurement → CareLedger → Justice.

## 🏛 Phase 4 — Enterprise & compliance
- SSO (SAML / OIDC) and SCIM provisioning
- FedRAMP / StateRAMP control mapping and continuous evidence
- Configurable approval chains and segregation-of-duties rules
- Multi-org consolidated reporting for examiners
- Exportable examination packages aligned to SR 11-7 / NIST AI RMF
