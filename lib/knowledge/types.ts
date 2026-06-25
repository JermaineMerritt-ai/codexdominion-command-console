import type { RiskLevel } from "@/types";

export type KnowledgeNodeType =
  | "organization"
  | "policy"
  | "vendor"
  | "decision"
  | "evidence"
  | "audit_event"
  | "workflow"
  | "module"
  | "opportunity"
  | "ai_system"
  | "user";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  sublabel?: string;
  riskLevel?: RiskLevel;
  href?: string;
}

export type KnowledgeRelation =
  | "belongs_to"
  | "produced_by"
  | "reviewed_by"
  | "owned_by"
  | "covers"
  | "records"
  | "governs"
  | "part_of";

export interface KnowledgeEdge {
  from: string;
  to: string;
  relation: KnowledgeRelation;
}

export type KnowledgeGapKind =
  | "expiring_certification"
  | "missing_evidence"
  | "unreviewed_decision"
  | "integration_gap"
  | "open_risk";

export interface KnowledgeGap {
  id: string;
  kind: KnowledgeGapKind;
  label: string;
  detail: string;
  severity: RiskLevel;
  href?: string;
}

export interface KnowledgeStats {
  nodesByType: Record<KnowledgeNodeType, number>;
  totalNodes: number;
  totalEdges: number;
  totalGaps: number;
}

export interface OrganizationKnowledgeGraph {
  organizationName: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  gaps: KnowledgeGap[];
  stats: KnowledgeStats;
  sampleChains: string[];
}

export interface KnowledgeContextItem {
  label: string;
  detail: string;
  severity?: RiskLevel;
  href?: string;
}
