import { z } from "zod";

const id = z.string().trim().min(1, "id is required");

export const decisionActionSchema = z.object({
  decisionId: id,
  comment: z.string().trim().max(500).optional(),
});

export const workflowTransitionSchema = z.object({
  workflowId: id,
  toState: z.enum([
    "draft",
    "pending_review",
    "approved",
    "denied",
    "escalated",
    "closed",
  ]),
  note: z.string().trim().max(500).optional(),
});

export const policyActionSchema = z.object({
  policyId: id,
});

export const vendorReviewSchema = z.object({
  vendorId: id,
});

export const evidencePackSchema = z.object({
  title: z.string().trim().min(3, "title must be at least 3 characters").max(160),
  decisionIds: z
    .array(id)
    .min(1, "select at least one decision")
    .max(50, "too many decisions"),
  formats: z
    .array(z.enum(["JSON", "PDF", "ZIP"]))
    .min(1)
    .default(["JSON"]),
});

export type DecisionActionInput = z.infer<typeof decisionActionSchema>;
export type WorkflowTransitionInput = z.infer<typeof workflowTransitionSchema>;
export type PolicyActionInput = z.infer<typeof policyActionSchema>;
export type VendorReviewInput = z.infer<typeof vendorReviewSchema>;
export type EvidencePackInput = z.infer<typeof evidencePackSchema>;
