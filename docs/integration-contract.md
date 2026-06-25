# Integration Contract

The Integration Contract is the standard interface every CodexDominion app
implements to be governed through the Command Console. It is the seam that turns
a collection of repositories into a **platform**: each module emits the same
governed artifacts, so the Console can present one operational view regardless of
domain.

## Interface

```ts
interface GovernanceModule {
  id; name; category; version;
  status: "active" | "planned" | "needs_integration" | "inactive";
  owner; health: "healthy" | "degraded" | "offline" | "unknown";
  capabilities: string[];
  integrationMaturity: number;   // 0-100
  lastSync; repositoryUrl;
  missingCapabilities: string[];
  recommendedNextStep;

  metrics(): ModuleMetrics;       // activeWorkflows, openDecisions, evidenceItems, riskFlags
  getWorkflows(): ModuleWorkflowRef[];
  getDecisions(): ModuleDecisionRef[];
  getEvidence(): ModuleEvidenceRef[];
  getPolicies(): ModulePolicyRef[];
  getAuditEvents(): ModuleAuditRef[];
  getRiskItems(): ModuleRiskRef[];
}
```

Defined in [`lib/modules/contract.ts`](../lib/modules/contract.ts).

## Capabilities

A module declares which contract capabilities it supports:
`workflows`, `decisions`, `evidence`, `policies`, `audit`, `risk`. The
**integration maturity** score and **missing capabilities** are derived from how
much of the contract a module fulfills. A fully governed module implements all
six.

## Today vs. tomorrow

- **Today (demo):** modules are backed by seed records
  (`lib/data/modules.ts`); `createGovernanceModule(record)` wraps a record as a
  contract implementation. No live repo/API access.
- **Live (proven, ×2):** `codex-control-plane` **and** `ComplianceFlow` both bind
  to live APIs through this contract using shared adapter utilities
  (`live-client.ts` + `live-adapter.ts`) — fetch live data into a record, wrap
  with `createGovernanceModule`, fall back to seed on failure. **Nothing else in
  the Console changes.** See
  [live-control-plane-binding.md](live-control-plane-binding.md) and
  [live-complianceflow-binding.md](live-complianceflow-binding.md).
- **Tomorrow:** the remaining modules follow the identical 3-step pattern —
  adapter wrapper + registry entry + command/RBAC entries.

## Materialization

`toModuleView(module)` invokes the contract and returns a serializable
`ModuleView` (safe to pass to client components and the command engine). The
registry (`lib/modules/registry.ts`) exposes `getModules()` / `getModule(id)`
returning views.

## Adding a module

1. Implement the contract (or, for now, add a `ModuleRecord` to
   `lib/data/modules.ts`).
2. Set `status`, `capabilities`, `integrationMaturity`, and
   `recommendedNextStep`.
3. It automatically appears in the Module Registry, gets a detail page, and is
   reachable via Command Workspace module commands — no other changes required.

See [module-registry.md](module-registry.md).
