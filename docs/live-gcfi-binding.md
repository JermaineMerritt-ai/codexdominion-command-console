# Live GCFI Binding

Government Contractor Financial Infrastructure (GCFI) is the **third** module
bound through the Integration Contract. It demonstrates governance over the
things buyers pay for: **contract milestones, contractor approvals, payment
authorization risk, and audit evidence** — the strongest path toward paid pilots.

## Modes

| `GCFI_MODE` | API URL set | Behavior | Connection |
| --- | --- | --- | --- |
| `demo` (default) | — | Seed data | Demo fallback |
| `demo` / `live` | yes / — | Seed data (ready) | Live-ready |
| `live` | yes, API ok | Live API data | Connected |
| `live` | yes, API fails | Seed fallback | Degraded |

```
GCFI_MODE=demo
GCFI_API_URL=
GCFI_API_KEY=
```

Module id: `government-contractor-financial-infrastructure`
(detail page: `/modules/government-contractor-financial-infrastructure`).

## What it governs (demo seed)

- **Workflows** — Milestone Disbursement Review, Contractor Onboarding Approval,
  Payment Authorization Review (escalated/critical).
- **Decisions** — payment authorization withheld (missing dual approval),
  milestone acceptance approved.
- **Evidence** — milestone completion evidence, contractor compliance docs.
- **Risk items** — payment authorization missing dual approval (critical),
  milestone evidence incomplete (high), contractor insurance missing (medium).
- **Missing capability** — `policies`.

## Reuses the shared adapter

No control-plane / ComplianceFlow logic is duplicated. The GCFI adapter is a thin
wrapper over `resolveLiveModuleView` (`lib/modules/live-adapter.ts`):

```ts
export const loadGcfiView = (config = getGcfiConfig(), fetchImpl?) =>
  resolveLiveModuleView({ record: getSeedRecord(GCFI_ID), config, fetchImpl });
```

## Command Workspace

| Command | Permission |
| --- | --- |
| Sync GCFI | `sync_gcfi` (Administrator, Compliance Officer) |
| Show GCFI health | `view_gcfi` (Admin, Compliance, Reviewer, Auditor) |
| Show GCFI decisions | `view_gcfi` |
| Show GCFI audit events | `view_gcfi` |
| Show contractor milestone risks | `view_gcfi` |
| Show payment approval risks | `view_gcfi` |

The two risk commands filter GCFI risk items (milestone/contractor vs.
payment/authorization). Viewer can see module status but not live operational
data. Every command runs through the governed pipeline (parse → RBAC →
`command.executed` audit) and returns source metadata.

## Buyer value
The Console now demonstrates governance over **government contract milestones,
contractor approvals, payment risk, and audit evidence** — concrete,
money-adjacent governance that maps directly to paid pilots.

See [integration-contract.md](integration-contract.md) and
[live-complianceflow-binding.md](live-complianceflow-binding.md).
