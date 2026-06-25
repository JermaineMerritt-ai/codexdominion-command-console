import type { RiskLevel } from "@/types";

// ─────────────────────────────────────────────────────────────
// Integration Contract
// Every CodexDominion app (current or future) implements this contract to be
// governed through the Command Console. Today modules report demo seed data;
// the same interface will later be backed by live module APIs — without any
// change to the Console.
// ─────────────────────────────────────────────────────────────

export type ModuleStatus = "active" | "planned" | "needs_integration" | "inactive";
export type ModuleHealth = "healthy" | "degraded" | "offline" | "unknown";

/** Provenance of a module's data (demo seed vs. live API). */
export interface ModuleSource {
  mode: "demo" | "live";
  connection: "demo" | "live_ready" | "connected" | "degraded";
  source: "seed_data" | "live_api" | "seed_fallback";
  lastSync: string | null;
  lastError: string | null;
  latencyMs: number | null;
}

export interface ModuleMetrics {
  activeWorkflows: number;
  openDecisions: number;
  evidenceItems: number;
  riskFlags: number;
}

export interface ModuleWorkflowRef {
  id: string;
  name: string;
  state: string;
  riskLevel: RiskLevel;
}
export interface ModuleDecisionRef {
  id: string;
  summary: string;
  outcome: string;
  riskLevel: RiskLevel;
}
export interface ModuleEvidenceRef {
  id: string;
  title: string;
  status: string;
}
export interface ModulePolicyRef {
  id: string;
  name: string;
  status: string;
}
export interface ModuleAuditRef {
  id: string;
  type: string;
  summary: string;
  at: string;
}
export interface ModuleRiskRef {
  id: string;
  label: string;
  level: RiskLevel;
}

/** The standard interface a governed module exposes. */
export interface GovernanceModule {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly status: ModuleStatus;
  readonly owner: string;
  readonly health: ModuleHealth;
  readonly capabilities: string[];
  readonly integrationMaturity: number; // 0-100
  readonly lastSync: string; // ISO or "never"
  readonly repositoryUrl: string;
  readonly missingCapabilities: string[];
  readonly recommendedNextStep: string;

  metrics(): ModuleMetrics;
  getWorkflows(): ModuleWorkflowRef[];
  getDecisions(): ModuleDecisionRef[];
  getEvidence(): ModuleEvidenceRef[];
  getPolicies(): ModulePolicyRef[];
  getAuditEvents(): ModuleAuditRef[];
  getRiskItems(): ModuleRiskRef[];
}

/** Serializable representation of a module (safe to pass to client/UI). */
export interface ModuleView {
  id: string;
  name: string;
  category: string;
  version: string;
  status: ModuleStatus;
  owner: string;
  health: ModuleHealth;
  capabilities: string[];
  integrationMaturity: number;
  lastSync: string;
  repositoryUrl: string;
  missingCapabilities: string[];
  recommendedNextStep: string;
  metrics: ModuleMetrics;
  workflows: ModuleWorkflowRef[];
  decisions: ModuleDecisionRef[];
  evidence: ModuleEvidenceRef[];
  policies: ModulePolicyRef[];
  auditEvents: ModuleAuditRef[];
  riskItems: ModuleRiskRef[];
  /** Data provenance (set by live-binding adapters; absent = seed). */
  source?: ModuleSource;
}

/** The seed/record shape a module is configured with. */
export interface ModuleRecord
  extends Omit<
    ModuleView,
    "metrics"
  > {
  metrics: ModuleMetrics;
  aliases: string[];
}

/** Wrap a plain record as a GovernanceModule implementing the contract. */
export function createGovernanceModule(record: ModuleRecord): GovernanceModule {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    version: record.version,
    status: record.status,
    owner: record.owner,
    health: record.health,
    capabilities: record.capabilities,
    integrationMaturity: record.integrationMaturity,
    lastSync: record.lastSync,
    repositoryUrl: record.repositoryUrl,
    missingCapabilities: record.missingCapabilities,
    recommendedNextStep: record.recommendedNextStep,
    metrics: () => record.metrics,
    getWorkflows: () => record.workflows,
    getDecisions: () => record.decisions,
    getEvidence: () => record.evidence,
    getPolicies: () => record.policies,
    getAuditEvents: () => record.auditEvents,
    getRiskItems: () => record.riskItems,
  };
}

// ── Pure selection helpers (shared by registry + command engine) ──

/** Module carrying the most risk (most flags, then least mature). */
export function highestRiskModule(views: ModuleView[]): ModuleView | undefined {
  return [...views].sort(
    (a, b) =>
      b.metrics.riskFlags - a.metrics.riskFlags ||
      a.integrationMaturity - b.integrationMaturity,
  )[0];
}

/** Next best module to integrate: a non-active module closest to done. */
export function nextIntegrationModule(views: ModuleView[]): ModuleView | undefined {
  return views
    .filter((m) => m.status !== "active" && m.status !== "inactive")
    .sort((a, b) => b.integrationMaturity - a.integrationMaturity)[0];
}

/** Resolve a module from free text using its name + aliases (longest match). */
export function findModuleByText(
  views: ModuleView[],
  aliases: Record<string, string[]>,
  text: string,
): ModuleView | undefined {
  const lower = text.toLowerCase();
  let best: ModuleView | undefined;
  let bestLen = 0;
  for (const v of views) {
    const candidates = aliases[v.id] ?? [v.name.toLowerCase()];
    for (const a of candidates) {
      if (a && lower.includes(a) && a.length > bestLen) {
        best = v;
        bestLen = a.length;
      }
    }
  }
  return best;
}

/** Materialize a module into a serializable view by invoking the contract. */
export function toModuleView(m: GovernanceModule): ModuleView {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    version: m.version,
    status: m.status,
    owner: m.owner,
    health: m.health,
    capabilities: m.capabilities,
    integrationMaturity: m.integrationMaturity,
    lastSync: m.lastSync,
    repositoryUrl: m.repositoryUrl,
    missingCapabilities: m.missingCapabilities,
    recommendedNextStep: m.recommendedNextStep,
    metrics: m.metrics(),
    workflows: m.getWorkflows(),
    decisions: m.getDecisions(),
    evidence: m.getEvidence(),
    policies: m.getPolicies(),
    auditEvents: m.getAuditEvents(),
    riskItems: m.getRiskItems(),
  };
}
