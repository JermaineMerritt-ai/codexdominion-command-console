import type {
  AuditEvent,
  Decision,
  EvidencePack,
  Policy,
  ProcurementOpportunity,
  RiskLevel,
  User,
  Vendor,
  Workflow,
} from "@/types";
import type { ModuleView } from "@/lib/modules/contract";
import type {
  KnowledgeContextItem,
  KnowledgeEdge,
  KnowledgeGap,
  KnowledgeNode,
  KnowledgeNodeType,
  OrganizationKnowledgeGraph,
} from "./types";

export interface GraphInput {
  organizationName: string;
  policies: Policy[];
  vendors: Vendor[];
  decisions: Decision[];
  evidencePacks: EvidencePack[];
  auditEvents: AuditEvent[];
  workflows: Workflow[];
  opportunities: ProcurementOpportunity[];
  users: User[];
  modules: ModuleView[];
}

const DAY = 86400000;
const SEVERITY_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const ORG_ID = "org";

/** Build a governed organization knowledge graph from current data. Pure. */
export function buildKnowledgeGraph(
  input: GraphInput,
  now: Date,
): OrganizationKnowledgeGraph {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const add = (n: KnowledgeNode) => nodes.push(n);
  const link = (
    from: string,
    to: string,
    relation: KnowledgeEdge["relation"],
  ) => edges.push({ from, to, relation });

  add({ id: ORG_ID, type: "organization", label: input.organizationName });

  for (const u of input.users)
    add({ id: u.id, type: "user", label: u.name, sublabel: u.title });

  // AI systems (distinct, from decisions + workflows).
  const aiSystems = new Set<string>();
  input.decisions.forEach((d) => aiSystems.add(d.aiSystem));
  input.workflows.forEach((w) => aiSystems.add(w.aiSystem));
  for (const sys of aiSystems) {
    const id = `ai:${sys}`;
    add({ id, type: "ai_system", label: sys });
    link(id, ORG_ID, "part_of");
  }

  for (const p of input.policies) {
    add({ id: p.id, type: "policy", label: p.name, sublabel: p.category, href: "/policies" });
    link(p.id, ORG_ID, "part_of");
    if (p.ownerId) link(p.id, p.ownerId, "owned_by");
  }

  for (const w of input.workflows) {
    add({ id: w.id, type: "workflow", label: w.name, sublabel: w.aiSystem, riskLevel: w.riskLevel, href: "/workflows" });
    link(w.id, ORG_ID, "part_of");
    if (w.ownerId) link(w.id, w.ownerId, "owned_by");
    if (aiSystems.has(w.aiSystem)) link(w.id, `ai:${w.aiSystem}`, "produced_by");
  }

  for (const d of input.decisions) {
    add({ id: d.id, type: "decision", label: d.id, sublabel: d.policyRule, riskLevel: d.riskLevel, href: "/decisions" });
    link(d.id, d.workflowId, "belongs_to");
    if (aiSystems.has(d.aiSystem)) link(d.id, `ai:${d.aiSystem}`, "produced_by");
    if (d.reviewerId) link(d.id, d.reviewerId, "reviewed_by");
  }

  for (const e of input.evidencePacks) {
    add({ id: e.id, type: "evidence", label: e.title, sublabel: e.id, href: "/evidence" });
    link(e.id, ORG_ID, "part_of");
    for (const decId of e.decisionIds) link(e.id, decId, "covers");
  }

  for (const a of input.auditEvents) {
    add({ id: a.id, type: "audit_event", label: a.type, sublabel: a.summary, href: "/settings" });
    if (a.target) link(a.id, a.target, "records");
  }

  for (const v of input.vendors) {
    add({ id: v.id, type: "vendor", label: v.name, sublabel: v.category, href: "/vendors" });
    link(v.id, ORG_ID, "part_of");
    if (v.ownerId) link(v.id, v.ownerId, "owned_by");
  }

  for (const o of input.opportunities) {
    add({ id: o.id, type: "opportunity", label: o.name, sublabel: o.agency, href: "/procurement" });
    link(o.id, ORG_ID, "part_of");
  }

  for (const m of input.modules) {
    add({ id: `mod:${m.id}`, type: "module", label: m.name, sublabel: m.category, href: `/modules/${m.id}` });
    link(`mod:${m.id}`, ORG_ID, "governs");
  }

  // ── Gaps (the governed "what's missing / at risk") ──
  const gaps: KnowledgeGap[] = [];

  for (const v of input.vendors) {
    const days = (new Date(v.contractExpiresAt).getTime() - now.getTime()) / DAY;
    if (v.insurance === "expired" || v.securityReview === "expired") {
      gaps.push({ id: `gap-cert-${v.id}`, kind: "expiring_certification", label: `${v.name}: lapsed certification`, detail: v.insurance === "expired" ? "Insurance expired" : "Security review expired", severity: "high", href: "/vendors" });
    } else if (days <= 30) {
      gaps.push({ id: `gap-cert-${v.id}`, kind: "expiring_certification", label: `${v.name}: certification expiring`, detail: `Contract expires in ${Math.max(0, Math.round(days))} days`, severity: "medium", href: "/vendors" });
    }
  }

  const coveredDecisionIds = new Set(input.evidencePacks.flatMap((e) => e.decisionIds));
  for (const d of input.decisions) {
    if ((d.outcome === "denied" || d.outcome === "flagged") && !coveredDecisionIds.has(d.id)) {
      gaps.push({ id: `gap-ev-${d.id}`, kind: "missing_evidence", label: `Missing evidence for ${d.id}`, detail: `${d.outcome} decision not covered by any evidence pack`, severity: d.outcome === "denied" ? "high" : "medium", href: "/evidence" });
    }
    if (!d.reviewerId) {
      gaps.push({ id: `gap-rev-${d.id}`, kind: "unreviewed_decision", label: `Unreviewed decision ${d.id}`, detail: `${d.policyRule} has no assigned reviewer`, severity: d.riskLevel === "critical" || d.riskLevel === "high" ? "high" : "medium", href: "/decisions" });
    }
  }

  for (const m of input.modules) {
    if (m.status === "needs_integration" || m.status === "planned") {
      gaps.push({ id: `gap-int-${m.id}`, kind: "integration_gap", label: `${m.name}: integration gap`, detail: m.recommendedNextStep, severity: "medium", href: `/modules/${m.id}` });
    }
    if (m.metrics.riskFlags > 0) {
      gaps.push({ id: `gap-risk-${m.id}`, kind: "open_risk", label: `${m.name}: ${m.metrics.riskFlags} open risk flag(s)`, detail: m.riskItems[0]?.label ?? "See module risk items", severity: m.metrics.riskFlags >= 2 ? "critical" : "high", href: `/modules/${m.id}` });
    }
  }

  gaps.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  // ── Stats ──
  const nodesByType = nodes.reduce(
    (acc, n) => {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<KnowledgeNodeType, number>,
  );

  // ── Sample relationship chains (for display) ──
  const sampleChains: string[] = [];
  const firstDecision = input.decisions[0];
  if (firstDecision) {
    const wf = input.workflows.find((w) => w.id === firstDecision.workflowId);
    sampleChains.push(
      `${firstDecision.id} → belongs_to → ${wf?.name ?? firstDecision.workflowId} → produced_by → ${firstDecision.aiSystem}`,
    );
  }
  const firstPack = input.evidencePacks[0];
  if (firstPack)
    sampleChains.push(
      `${firstPack.id} → covers → ${firstPack.decisionIds.slice(0, 2).join(", ")}`,
    );
  const riskyVendor = input.vendors.find((v) => v.status === "expiring");
  if (riskyVendor)
    sampleChains.push(
      `${riskyVendor.name} → owned_by → ${input.users.find((u) => u.id === riskyVendor.ownerId)?.name ?? "owner"}`,
    );

  return {
    organizationName: input.organizationName,
    nodes,
    edges,
    gaps,
    stats: {
      nodesByType,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalGaps: gaps.length,
    },
    sampleChains,
  };
}

/** Select organization context relevant to a plan intent. */
export function planContext(
  graph: OrganizationKnowledgeGraph,
  intent: string,
): KnowledgeContextItem[] {
  let gaps = graph.gaps;
  if (/contractor|payment/.test(intent)) {
    gaps = graph.gaps.filter((g) => /payment|milestone|contractor|gcfi/i.test(g.label + g.detail));
  } else if (/procurement/.test(intent)) {
    gaps = graph.gaps.filter((g) => g.kind === "integration_gap" || /procurement/i.test(g.label));
  }
  if (gaps.length === 0) gaps = graph.gaps;
  return gaps.slice(0, 5).map((g) => ({
    label: g.label,
    detail: g.detail,
    severity: g.severity,
    href: g.href,
  }));
}
