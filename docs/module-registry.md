# Module Registry

The Module Registry (`/modules`) is **what CodexDominion governs** — every
vertical app reporting into the Console through the [Integration
Contract](integration-contract.md). It is the proof that CodexDominion is a
control plane, not a standalone dashboard.

## Registered modules (demo)

| Module | Category | Status |
| --- | --- | --- |
| codex-control-plane | Governance Engine | Active |
| ComplianceFlow | Compliance Operations | Active |
| codex-procurement-network | Procurement Intelligence | Active |
| Government Contractor Financial Infrastructure | Finance / Government | Active |
| ClinicalFlow | Healthcare Governance | Needs integration |
| EscrowFlow | Financial Approvals | Needs integration |
| CareLedger | Healthcare Finance | Needs integration |
| GrantOps | Grant Lifecycle | Planned |
| codexjustice-platform | Justice / Public Sector | Planned |

## Registry page (`/modules`)

Each module card shows: name, category, version, **status** (active / needs
integration / planned / inactive), **health**, metrics (active workflows, open
decisions, evidence items, risk flags), **integration maturity** (0–100), owner,
last sync, and a repository link placeholder.

Summary stats: total registered, active, needs-integration, and average
integration maturity.

## Detail page (`/modules/[id]`)

- **Overview** — metrics, owner, last sync, repository.
- **Governed artifacts** — workflows, decisions, evidence, policies, audit
  events, risk items (as reported through the contract).
- **Integration Contract status** — which of the six capabilities are present vs.
  missing, with the maturity score.
- **Missing capabilities** and the **recommended next integration step**.

## Command Workspace integration

Module commands run through the same governed pipeline (parse → RBAC → execute →
`command.executed` audit):

- "Show active modules"
- "Show modules needing integration"
- "Show highest risk module"
- "Show module status for [module name]"
- "Recommend next module integration"

See [command-workspace.md](command-workspace.md).

## Live binding

`codex-control-plane` is the first module with a **live binding**: when
`CODEX_CONTROL_PLANE_MODE=live` and an API URL are set, its card and detail page
show **Connected** (or **Degraded** with seed fallback on failure); otherwise
**Demo fallback** / **Live-ready**. See
[live-control-plane-binding.md](live-control-plane-binding.md).

## Data source

Demo seed: `lib/data/modules.ts`. Accessors: `lib/modules/registry.ts`. The
registry is contract-backed, so a live module API replaces the source without
changing the Console.
