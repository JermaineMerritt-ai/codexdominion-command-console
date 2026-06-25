# Sprint 06 — Module Registry + Integration Contract

**Goal:** prove CodexDominion is the **governed control plane for every vertical
app** — define a standard Integration Contract and a Module Registry so all
current and future CodexDominion apps report into the Console.

**Status:** ✅ Complete

> No paid AI APIs. No vertical app code moved into the Console. Demo seed only.
> Demo mode unchanged.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | `/modules` route + nav | "Modules" in a new **Platform** nav group |
| 2 | Module Registry UI | cards: name, category, status, health, version, last sync, metrics, integration maturity, owner, repo link |
| 3 | Module detail `/modules/[id]` | overview, governed artifacts, contract status, missing capabilities, recommended next step (SSG, 9 pages) |
| 4 | Integration Contract | `GovernanceModule` interface with metadata + `getWorkflows/Decisions/Evidence/Policies/AuditEvents/RiskItems` + `metrics()` |
| 5 | Seed module data | 9 modules in `lib/data/modules.ts`; `createGovernanceModule` wraps records |
| 6 | Command Workspace commands | active modules, modules needing integration, highest-risk module, module status for [name], recommend next module integration |
| 7 | Provider routing unchanged | Codex executes module commands deterministically |
| 8 | Tests | `tests/modules.test.ts` — contract shape, registry queries, parsing, execution, lookup, unknown-name handling (**47 total passing**) |
| 9 | Docs | this file, `module-registry.md`, `integration-contract.md`, README, roadmap, command-workspace |
| 10 | Quality gates | typecheck, test (47), lint, build all green |

## Verified live
- `/modules` renders 9 modules with stats (4 active, 3 needs integration, 60%
  avg maturity), health/status badges, metrics, and maturity bars.
- `/modules/codex-control-plane` shows the contract capability checklist;
  `/modules/clinicalflow` shows missing capabilities + recommended next step.
- Command "Show highest risk module" → "codex-procurement-network … 2 risk
  flags …" with `CMD-…` and `AUD-…` ids (governed + audited).

## Platform story
```
Command Workspace = how users ask
Provider Routing   = who helps
RBAC               = who is allowed
Audit              = proof
Module Registry    = what CodexDominion governs
```

## Backlog → Sprint 07 (proposed)
| Priority | Item |
| --- | --- |
| P1 | Live integration with `codex-control-plane` (first real contract binding) |
| P1 | Module command to *initiate* integration steps (governed, audited) |
| P2 | Multi-step plan execution across modules |
| P2 | Real AI provider integration behind the existing abstraction |
| P2 | Multi-organization / tenant support |
