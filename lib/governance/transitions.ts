import type { WorkflowState } from "@/types";

/**
 * Allowed workflow state transitions. A move not listed here is rejected by
 * `canTransition` and the governance actions.
 */
export const WORKFLOW_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  draft: ["pending_review"],
  pending_review: ["approved", "denied", "escalated"],
  escalated: ["approved", "denied"],
  approved: ["closed"],
  denied: ["closed", "pending_review"],
  closed: [],
};

export function nextStates(from: WorkflowState): WorkflowState[] {
  return WORKFLOW_TRANSITIONS[from] ?? [];
}

export function canTransition(
  from: WorkflowState,
  to: WorkflowState,
): boolean {
  return nextStates(from).includes(to);
}

export const WORKFLOW_STATE_LABELS: Record<WorkflowState, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  denied: "Denied",
  escalated: "Escalated",
  closed: "Closed",
};
