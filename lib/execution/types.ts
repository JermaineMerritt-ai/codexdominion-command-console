import type { RiskLevel } from "@/types";
import type { KnowledgeContextItem } from "@/lib/knowledge/types";

export type ExecutionStatus =
  | "proposed"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface ExecutionStep {
  key: string;
  title: string;
  /** Command prompt run through the governed pipeline (empty for report steps). */
  prompt: string;
  kind: "command" | "report";
  moduleHint?: string;
  status: StepStatus;
  summary?: string;
  auditEventId?: string | null;
  durationMs?: number;
  /** Editable inclusion before approval. */
  include: boolean;
}

export interface ExecutionPlan {
  id: string;
  intent: string;
  title: string;
  prompt: string;
  steps: ExecutionStep[];
  estimateMinutes: number;
  riskLevel: RiskLevel;
  modules: string[];
  status: ExecutionStatus;
  /** Organization context (from the knowledge graph) this plan is grounded in. */
  context?: KnowledgeContextItem[];
}

export interface ExecutionRun {
  planId: string;
  title: string;
  status: ExecutionStatus;
  steps: ExecutionStep[];
  executiveSummary: string;
  planAuditId: string | null;
  stepsCompleted: number;
  stepsTotal: number;
}
