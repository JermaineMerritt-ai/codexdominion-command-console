# Sprint 09 — GCFI Live Binding (third module)

**Goal:** bind Government Contractor Financial Infrastructure as the third
live-ready governed module — proving the Module Registry / Integration Contract
governs contract, milestone, contractor, and payment-approval workflows.

**Status:** ✅ Complete

> No paid AI APIs. Demo mode default and unchanged. Public demo never breaks.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Third binding | GCFI adapter (`GCFI_MODE` / `_API_URL` / `_API_KEY`), thin wrapper over the shared resolver — no duplicated logic |
| 2 | Canonical id | `government-contractor-financial-infrastructure` (detail route matches) |
| 3 | Enriched seed | milestones, contractor approvals, payment-authorization risks, evidence, audit events, risk flags; capabilities now include evidence + risk |
| 4 | Registry + detail | GCFI shows connection state, source, last sync, latency, last error; full artifact sections |
| 5 | Commands | sync GCFI, show health / decisions / audit events, **show contractor milestone risks**, **show payment approval risks** |
| 6 | RBAC | `sync_gcfi` (Admin/Compliance); `view_gcfi` (+Reviewer/Auditor); Viewer denied live data |
| 7 | Live-safe | inherits ISR registry (revalidate=30) + `anyModuleLive` updated |
| 8 | Tests | `tests/gcfi.test.ts` — fallback, parsing, execution, RBAC, source metadata, milestone & payment risk commands, detail lookup (**72 total passing**) |
| 9 | Docs | this file, `live-gcfi-binding.md`, README, integration-contract, module-registry, deployment, roadmap, command-workspace |
| 10 | Quality gates | typecheck, test (72), lint, build all green |

## Verified
- `/modules/government-contractor-financial-infrastructure` renders (200) with
  the Connection panel and the payment dual-approval risk.
- Command "Show payment approval risks" → "1 payment approval risk in GCFI.
  Source: seed_data." with an audit id.
- Three modules (control-plane, ComplianceFlow, GCFI) now show **Demo fallback**;
  avg integration maturity 61%.

## Pattern confirmed (N modules)
Adding GCFI was the same 3 steps as ComplianceFlow:
1. Adapter wrapper (`loadGcfiView`).
2. Registry `LIVE_BINDINGS` entry.
3. `LIVE_MODULE_COMMANDS` + intents + RBAC actions (plus 2 domain-specific risk
   commands here).

## Backlog → Sprint 10 (proposed)
| Priority | Item |
| --- | --- |
| P1 | Real AI provider integration (Claude/ChatGPT) behind the provider abstraction |
| P1 | Bind procurement / CareLedger to round out verticals |
| P2 | Multi-step plan execution; governed "initiate integration" action |
| P2 | Multi-organization (tenants / workspaces) |
