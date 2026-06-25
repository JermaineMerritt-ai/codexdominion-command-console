# Sprint 08 — Dynamic Modules + Second Live Binding

**Goal:** prove the `GovernanceModule` contract works for **more than one
module**, and make live module pages **live-safe** (no stale build-time data).

**Status:** ✅ Complete

> No paid AI APIs. Demo mode default and unchanged. Public demo never breaks.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Live-safe registry | `/modules` + `/modules/[id]` use ISR (`revalidate = 30`) — fresh live data, cached demo |
| 2 | Shared adapter utilities | `live-client.ts` (`fetchModuleData`) + `live-adapter.ts` (`getModeConfig`, `getSeedRecord`, `resolveLiveModuleView`, `anyModuleLive`) |
| 3 | Refactor | control-plane adapter now a thin wrapper over the shared resolver (no duplicated logic) |
| 4 | Second binding | ComplianceFlow adapter (`COMPLIANCEFLOW_MODE` / `_API_URL` / `_API_KEY`) |
| 5 | Connection UI helpers | `connectionLabel` / `connectionTone` in the contract, shared by registry + detail |
| 6 | Registry + detail | both control-plane and ComplianceFlow show connection state, source, last sync, latency, last error |
| 7 | Commands | sync / health / decisions / audit for ComplianceFlow — generic handler now serves both modules |
| 8 | RBAC | `sync_complianceflow` (Admin/Compliance); `view_complianceflow` (Admin/Compliance/Reviewer/Auditor); Viewer denied live data |
| 9 | Tests | `tests/complianceflow.test.ts` — fallback, shared utility, parsing, execution, RBAC, source metadata (**64 total passing**) |
| 10 | Docs | this file, `live-complianceflow-binding.md`, README, integration-contract, module-registry, live-control-plane-binding, deployment, roadmap |
| 11 | Quality gates | typecheck, test (64), lint, build all green |

## Verified
- `/modules`: both codex-control-plane and ComplianceFlow show **Demo fallback**.
- ComplianceFlow detail page renders the Connection panel.
- Command "Show ComplianceFlow health" → "ComplianceFlow running on demo seed
  data. Set COMPLIANCEFLOW_MODE=live to connect. Source: seed_data." with an
  audit id (correct per-module env hint via the generic handler).
- Tests cover ComplianceFlow live success / failure / timeout and the shared
  `resolveLiveModuleView` working for any seed record.

## Adding the next module
1. `loadXView = (cfg=getModeConfig("X")) => resolveLiveModuleView({ record: getSeedRecord("x"), config: cfg })`
2. Register it in `LIVE_BINDINGS` (registry) and `LIVE_MODULE_COMMANDS` (engine).
3. Add 4 intents + 2 RBAC actions. Done — UI, audit, fallback all inherited.

## Story
```
One console. One integration contract. Multiple governed modules.
Live-safe architecture. Demo fallback for sales. Production path for pilots.
```

## Backlog → Sprint 09 (proposed)
| Priority | Item |
| --- | --- |
| P1 | Bind a third module (GCFI or procurement) — confirm the 3-step pattern |
| P1 | Real AI provider integration behind the provider abstraction |
| P2 | Multi-step plan execution; governed "initiate integration" action |
| P2 | Multi-organization (tenants / workspaces) |
