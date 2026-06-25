# Sprint 07 — Live codex-control-plane Binding

**Goal:** bind the Module Registry to the real `codex-control-plane` module as the
first live governed integration — while preserving seed-data fallback so the
public demo never breaks.

**Status:** ✅ Complete

> No paid AI APIs. No new modules. Demo mode default and unchanged.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Integration mode | `CODEX_CONTROL_PLANE_MODE` (demo default), `..._API_URL`, `..._API_KEY` |
| 2 | Safe API client | `client.ts` — AbortController timeout, retries (transient/5xx), structured errors, never throws |
| 3 | Live adapter | `adapter.ts` — implements the contract from live data; falls back to seed on demo/missing-URL/failure |
| 4 | Registry binding | `getModules`/`getModule` resolve control-plane via the adapter |
| 5 | Source metadata | `ModuleSource` (mode, connection, source, lastSync, lastError, latency) on the view |
| 6 | Registry UI | control-plane card shows Demo fallback / Live-ready / Connected / Degraded |
| 7 | Detail UI | **Connection** panel: mode, connection, data source, last sync, latency, last error |
| 8 | Commands | sync control plane, show health, show live decisions, show audit events — governed + audited, return source metadata |
| 9 | RBAC | `sync_control_plane` (Admin/Compliance); `view_control_plane` (Admin/Compliance/Reviewer/Auditor); Viewer denied live data |
| 10 | Tests | `tests/control-plane.test.ts` — fallback, timeout, mode selection, parsing, RBAC, source metadata (**55 total passing**) |
| 11 | Docs | this file, `live-control-plane-binding.md`, README, integration-contract, module-registry, deployment, roadmap |
| 12 | Quality gates | typecheck, test (55), lint, build all green |

## Verified
- Demo (default): `/modules` shows **Demo fallback** on control-plane; detail
  Connection panel shows mode demo / source seed_data.
- Command "Show control plane health" → "Control plane running on demo seed data.
  Set CODEX_CONTROL_PLANE_MODE=live to connect. Source: seed_data." with audit id.
- Tests cover live success (connected + live_api), live failure (degraded +
  seed_fallback), and client timeout — without any real network.

## Public-demo safety
With no API configured, production stays fully functional and **clearly shows
demo fallback mode** — exactly the required behavior.

## Backlog → Sprint 08 (proposed)
| Priority | Item |
| --- | --- |
| P1 | Make `/modules` dynamic in live mode (revalidate) for fresh live data |
| P1 | Bind a second module (e.g. ComplianceFlow) using the same adapter pattern |
| P2 | Governed "initiate integration" action for planned modules |
| P2 | Real AI provider integration behind the provider abstraction |
