# Live ComplianceFlow Binding

ComplianceFlow is the **second** module bound through the Integration Contract —
proof that the contract scales beyond one module. It reuses the exact same shared
live-binding utilities as codex-control-plane, with the same safe seed fallback.

## Modes

| `COMPLIANCEFLOW_MODE` | API URL set | Behavior | Connection |
| --- | --- | --- | --- |
| `demo` (default) | — | Seed data | Demo fallback |
| `demo` / `live` | yes / — | Seed data (ready) | Live-ready |
| `live` | yes, API ok | Live API data | Connected |
| `live` | yes, API fails | Seed fallback | Degraded |

```
COMPLIANCEFLOW_MODE=demo
COMPLIANCEFLOW_API_URL=
COMPLIANCEFLOW_API_KEY=
```

## Shared utilities (no duplicated logic)

Both modules use the same building blocks:

| Concern | Shared module |
| --- | --- |
| API client (timeout, retries, errors) | `lib/modules/live-client.ts` (`fetchModuleData`) |
| Mode resolution from env | `lib/modules/live-adapter.ts` (`getModeConfig(prefix)`) |
| Fallback + source metadata | `lib/modules/live-adapter.ts` (`resolveLiveModuleView`) |
| Connection label / tone (UI) | `lib/modules/contract.ts` (`connectionLabel` / `connectionTone`) |

Each module's adapter is now a thin wrapper:

```ts
// lib/modules/complianceflow/adapter.ts
export const loadComplianceFlowView = (config = getComplianceFlowConfig(), fetchImpl?) =>
  resolveLiveModuleView({ record: getSeedRecord("complianceflow"), config, fetchImpl });
```

Adding the next module is the same three lines with a different id + env prefix.

## Command Workspace

| Command | Permission |
| --- | --- |
| Sync ComplianceFlow | `sync_complianceflow` (Administrator, Compliance Officer) |
| Show ComplianceFlow health | `view_complianceflow` (Admin, Compliance, Reviewer, Auditor) |
| Show ComplianceFlow decisions | `view_complianceflow` |
| Show ComplianceFlow audit events | `view_complianceflow` |

Viewer can see module status on `/modules` but not live operational data. All
commands run through the governed pipeline (parse → RBAC → `command.executed`
audit) and return source metadata.

## Live-safe registry

`/modules` and `/modules/[id]` use ISR (`revalidate = 30`) so live module data
stays fresh (≤30s) instead of frozen at build time, while remaining cached and
fast in demo mode. The Command Workspace fetches fresh data per request.

See [live-control-plane-binding.md](live-control-plane-binding.md) and
[integration-contract.md](integration-contract.md).
