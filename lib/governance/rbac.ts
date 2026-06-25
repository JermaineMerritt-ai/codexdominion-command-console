import type { UserRole } from "@/types";

/**
 * Governance actions that are permission-gated. These keys match the `action`
 * strings recorded on audit events.
 */
export type GovernanceAction =
  | "approve_decision"
  | "deny_decision"
  | "transition_workflow"
  | "publish_policy"
  | "archive_policy"
  | "complete_vendor_review"
  | "generate_evidence_pack";

/** Which roles may perform each action (server-enforced, also drives the UI). */
export const ACTION_ROLES: Record<GovernanceAction, UserRole[]> = {
  approve_decision: ["administrator", "compliance_officer", "reviewer"],
  deny_decision: ["administrator", "compliance_officer", "reviewer"],
  transition_workflow: ["administrator", "compliance_officer"],
  publish_policy: ["administrator", "compliance_officer"],
  archive_policy: ["administrator", "compliance_officer"],
  complete_vendor_review: ["administrator", "compliance_officer", "reviewer"],
  generate_evidence_pack: ["administrator", "compliance_officer", "auditor"],
};

export function can(role: UserRole, action: GovernanceAction): boolean {
  return ACTION_ROLES[action]?.includes(role) ?? false;
}

export const ACTION_LABELS: Record<GovernanceAction, string> = {
  approve_decision: "approve decisions",
  deny_decision: "deny decisions",
  transition_workflow: "transition workflows",
  publish_policy: "publish policies",
  archive_policy: "archive policies",
  complete_vendor_review: "complete vendor reviews",
  generate_evidence_pack: "generate evidence packs",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: "Administrator",
  compliance_officer: "Compliance Officer",
  reviewer: "Reviewer",
  auditor: "Auditor",
  executive: "Executive",
  viewer: "Viewer",
};

/** Standard forbidden message for a role/action pair. */
export function forbiddenMessage(role: UserRole, action: GovernanceAction): string {
  return `${ROLE_LABELS[role]} role is not permitted to ${ACTION_LABELS[action]}.`;
}
