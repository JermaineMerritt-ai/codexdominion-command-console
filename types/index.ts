export type PolicyStatus = "approved" | "pending" | "rejected" | "draft";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type EvidenceStatus = "ready" | "generating" | "archived";
export type VendorStatus = "active" | "under-review" | "suspended";
export type ApprovalStatus = "approved" | "pending" | "rejected";
export type ActivityType = "approval" | "review" | "alert" | "decision";
export type ProcurementStatus = "active" | "gap" | "awarded" | "closed";

export interface DashboardMetrics {
  totalPolicies: number;
  pendingReviews: number;
  approvedDecisions: number;
  riskScore: number;
  complianceRate: number;
  openIncidents: number;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface PolicyDecision {
  id: string;
  policyRule: string;
  status: PolicyStatus;
  reviewer: string;
  timestamp: string;
  evidenceHash: string;
  framework: string;
}

export interface EvidencePack {
  id: string;
  name: string;
  framework: string;
  generatedAt: string;
  policyCount: number;
  controlCount: number;
  status: EvidenceStatus;
  fileSize: string | null;
}

export interface ProcurementOpportunity {
  id: string;
  title: string;
  agency: string;
  matchScore: number;
  requiredControls: string[];
  nextAction: string;
  dueDate: string;
  value: string;
  status: ProcurementStatus;
}

export interface VendorCert {
  name: string;
  expiresAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  riskLevel: RiskLevel;
  approvalStatus: ApprovalStatus;
  missingDocs: string[];
  expiringCerts: VendorCert[];
  lastReviewed: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
