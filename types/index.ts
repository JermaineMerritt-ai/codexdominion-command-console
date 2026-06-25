// ─────────────────────────────────────────────────────────────
// CodexDominion Command Console — domain types
// These mirror the Prisma schema and the Supabase migration.
// ─────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type DecisionOutcome = "approved" | "denied" | "flagged" | "escalated";

export type WorkflowState =
  | "draft"
  | "pending_review"
  | "approved"
  | "denied"
  | "escalated"
  | "closed";

export type PolicyStatus = "published" | "draft" | "archived";

export type ApprovalStatus = "pending" | "approved" | "denied";

export type VendorStatus = "approved" | "under_review" | "denied" | "expiring";

export type ComplianceState = "compliant" | "pending" | "expired" | "not_applicable";

export type OpportunityStatus =
  | "tracking"
  | "qualifying"
  | "bid"
  | "submitted"
  | "won"
  | "lost"
  | "no_bid";

export type UserRole =
  | "administrator"
  | "compliance_officer"
  | "reviewer"
  | "auditor"
  | "executive"
  | "viewer";

export type NotificationType =
  | "policy_violation"
  | "pending_approval"
  | "evidence_generated"
  | "workflow_assigned"
  | "vendor_expiration";

export type AuditEventType =
  | "decision.created"
  | "decision.approved"
  | "decision.denied"
  | "decision.escalated"
  | "policy.published"
  | "policy.archived"
  | "policy.updated"
  | "approval.granted"
  | "approval.rejected"
  | "evidence.generated"
  | "vendor.reviewed"
  | "workflow.transitioned"
  | "user.role_changed"
  | "authorization.denied"
  | "command.executed";

/** Entity a mutation/audit event targets. */
export type AuditEntityType =
  | "decision"
  | "workflow"
  | "policy"
  | "vendor"
  | "evidence_pack"
  | "command";

export interface Organization {
  id: string;
  name: string;
  sector: "enterprise" | "healthcare" | "finance" | "government";
  tier: "pilot" | "standard" | "enterprise";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  organizationId: string;
  status: "active" | "invited" | "suspended";
  lastActiveAt: string;
  avatarColor: string;
}

export interface Policy {
  id: string;
  name: string;
  category:
    | "Model Risk"
    | "Data Governance"
    | "Privacy"
    | "Security"
    | "Fairness & Bias"
    | "Operational"
    | "Procurement";
  version: string;
  ownerId: string;
  status: PolicyStatus;
  description: string;
  rulesCount: number;
  lastUpdated: string;
}

export interface Workflow {
  id: string;
  name: string;
  aiSystem: string;
  organizationId: string;
  state: WorkflowState;
  ownerId: string;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  timeline: WorkflowEvent[];
}

export interface WorkflowEvent {
  state: WorkflowState | "created";
  actorId: string;
  at: string;
  note?: string;
}

export interface Decision {
  id: string;
  organizationId: string;
  aiSystem: string;
  workflowId: string;
  workflowName: string;
  policyRule: string;
  outcome: DecisionOutcome;
  riskLevel: RiskLevel;
  reviewerId: string | null;
  rationale: string;
  evidenceHash: string;
  timestamp: string;
}

export interface Approval {
  id: string;
  decisionId: string;
  reviewerId: string;
  status: ApprovalStatus;
  comment: string;
  at: string;
}

export interface EvidencePack {
  id: string;
  title: string;
  organizationId: string;
  decisionIds: string[];
  responsibleUserId: string;
  hash: string;
  generatedAt: string;
  status: "generated" | "generating" | "archived";
  format: ("JSON" | "PDF" | "ZIP")[];
  sizeKb: number;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actorId: string;
  organizationId: string;
  target: string;
  summary: string;
  hash: string;
  prevHash: string;
  at: string;
  // Structured mutation context (populated by live governance actions).
  action?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  evidenceHash?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  riskScore: number; // 0-100, higher = riskier
  securityReview: ComplianceState;
  insurance: ComplianceState;
  soc2: ComplianceState;
  hipaa: ComplianceState;
  fedramp: ComplianceState;
  contractExpiresAt: string;
  approvalStatus: ApprovalStatus;
  ownerId: string;
}

export interface ProcurementOpportunity {
  id: string;
  agency: string;
  name: string;
  naics: string;
  psc: string;
  status: OpportunityStatus;
  matchScore: number; // 0-100
  estimatedValue: number;
  requiredControls: string[];
  capabilityGaps: string[];
  proposalDeadline: string;
  description: string;
}

export interface RiskAssessment {
  id: string;
  subjectType: "vendor" | "workflow" | "ai_system";
  subjectId: string;
  subjectName: string;
  score: number;
  level: RiskLevel;
  factors: { label: string; weight: number; value: number }[];
  assessedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  at: string;
  href: string;
}

export interface OrganizationSettings {
  organizationId: string;
  requireDualApproval: boolean;
  autoGenerateEvidence: boolean;
  retentionDays: number;
  riskThreshold: number;
  notifyOnViolation: boolean;
  dataRegion: "us-east" | "us-gov" | "eu-west";
}

export interface SeriesPoint {
  label: string;
  value: number;
  secondary?: number;
}
