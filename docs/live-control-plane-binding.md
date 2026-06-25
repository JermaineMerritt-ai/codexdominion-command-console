# Live codex-control-plane Binding

`codex-control-plane` is the **first module that can report live governance data**
into the Console — proof that CodexDominion governs live modules through the
standard [Integration Contract](integration-contract.md), not just seed data.
It always falls back to seed so the public demo never breaks.

## Modes

| `CODEX_CONTROL_PLANE_MODE` | API URL set | Behavior | Connection shown |
| --- | --- | --- | --- |
| `demo` (default) | — | Seed data | **Demo fallback** |
| `demo` | yes | Seed data (ready to enable) | **Live-ready** |
| `live` | — | Seed data (misconfigured) | **Live-ready** |
| `live` | yes, API ok | Live API data | **Connected** |
| `live` | yes, API fails | Seed fallback | **Degraded** |

Environment:
```
CODEX_CONTROL_PLANE_MODE=demo            # demo | live
CODEX_CONTROL_PLANE_API_URL=             # module endpoint (GET)
CODEX_CONTROL_PLANE_API_KEY=             # optional bearer token
```

## Components

As of Sprint 08 the binding logic is **shared** across modules (see
[live-complianceflow-binding.md](live-complianceflow-binding.md)); the
control-plane adapter is a thin wrapper.

| Piece | File |
| --- | --- |
| Shared API client (timeout, retries, structured errors) | `lib/modules/live-client.ts` |
| Shared resolver (mode + fallback + source metadata) | `lib/modules/live-adapter.ts` |
| Control-plane adapter (thin wrapper) | `lib/modules/control-plane/adapter.ts` |
| Registry binding | `lib/modules/registry.ts` (`getModules`/`getModule`) |

### Client safety
- Per-attempt **timeout** via `AbortController` (default 4s).
- **Retries** transient failures (timeout / network / 5xx); no retry on 4xx.
- **Never throws** — returns `{ ok, data | error, latencyMs }`. The adapter
  falls back to seed on any failure.

### Source metadata
Every resolved control-plane view carries a `source`:
```ts
{ mode, connection, source: "seed_data" | "live_api" | "seed_fallback",
  lastSync, lastError, latencyMs }
```
Shown on the registry card (connection badge), the module detail **Connection**
panel (mode, last sync, last error, latency, data source), and in Command
Workspace results.

## Command Workspace

| Command | Permission |
| --- | --- |
| Sync control plane | `sync_control_plane` (Administrator, Compliance Officer) |
| Show control plane health | `view_control_plane` (Admin, Compliance, Reviewer, Auditor) |
| Show live control plane decisions | `view_control_plane` |
| Show control plane audit events | `view_control_plane` |

Viewer can see module status on `/modules` but **cannot** run live operational
commands. Each command runs through the governed pipeline (parse → RBAC →
`command.executed` audit) and returns **source metadata** in the result.

## Rendering note (live deployments)
The `/modules` pages are statically generated for the demo. In a live deployment,
make them dynamic (e.g. `export const dynamic = "force-dynamic"` or
`revalidate`) so the registry reflects current live data on each request. The
Command Workspace already fetches fresh data per command (server action).

## Why this matters
The Console proves it can govern a **live** module through a standard contract —
stronger buyer proof than another AI provider. Adding the remaining modules is
now the same pattern: implement the contract, point at the API, fall back safely.
