"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import { getMutations, type Actor } from "@/lib/data/mutations";
import {
  can,
  forbiddenMessage,
  type GovernanceAction,
} from "@/lib/governance/rbac";
import {
  decisionActionSchema,
  evidencePackSchema,
  policyActionSchema,
  vendorReviewSchema,
  workflowTransitionSchema,
} from "@/lib/governance/validation";
import type { AuditEntityType } from "@/types";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function fail(e: unknown): ActionResult<never> {
  return { ok: false, error: e instanceof Error ? e.message : "Action failed" };
}

/**
 * Resolve the actor and enforce RBAC. On denial, records an
 * `authorization.denied` audit event and returns a forbidden result.
 */
async function authorize(
  action: GovernanceAction,
  entityType: AuditEntityType,
  entityId: string,
): Promise<{ ok: true; actor: Actor } | { ok: false; error: string }> {
  const actor = await getCurrentActor();
  if (can(actor.role, action)) return { ok: true, actor };
  try {
    await (await getMutations()).auditAuthorizationDenied(
      actor,
      action,
      entityType,
      entityId,
    );
    revalidatePath("/settings");
  } catch {
    /* never fail the response because the denial-audit write failed */
  }
  return { ok: false, error: forbiddenMessage(actor.role, action) };
}

export async function approveDecision(input: {
  decisionId: string;
  comment?: string;
}): Promise<ActionResult> {
  const parsed = decisionActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize("approve_decision", "decision", parsed.data.decisionId);
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).approveDecision(
      parsed.data.decisionId,
      auth.actor,
      parsed.data.comment,
    );
    revalidatePath("/decisions");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function denyDecision(input: {
  decisionId: string;
  comment?: string;
}): Promise<ActionResult> {
  const parsed = decisionActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize("deny_decision", "decision", parsed.data.decisionId);
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).denyDecision(
      parsed.data.decisionId,
      auth.actor,
      parsed.data.comment,
    );
    revalidatePath("/decisions");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function transitionWorkflow(input: {
  workflowId: string;
  toState: string;
  note?: string;
}): Promise<ActionResult> {
  const parsed = workflowTransitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize(
    "transition_workflow",
    "workflow",
    parsed.data.workflowId,
  );
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).transitionWorkflow(
      parsed.data.workflowId,
      parsed.data.toState,
      auth.actor,
      parsed.data.note,
    );
    revalidatePath("/workflows");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function publishPolicy(input: {
  policyId: string;
}): Promise<ActionResult> {
  const parsed = policyActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize("publish_policy", "policy", parsed.data.policyId);
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).publishPolicy(
      parsed.data.policyId,
      auth.actor,
    );
    revalidatePath("/policies");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function archivePolicy(input: {
  policyId: string;
}): Promise<ActionResult> {
  const parsed = policyActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize("archive_policy", "policy", parsed.data.policyId);
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).archivePolicy(
      parsed.data.policyId,
      auth.actor,
    );
    revalidatePath("/policies");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function completeVendorReview(input: {
  vendorId: string;
}): Promise<ActionResult> {
  const parsed = vendorReviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize(
    "complete_vendor_review",
    "vendor",
    parsed.data.vendorId,
  );
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).completeVendorReview(
      parsed.data.vendorId,
      auth.actor,
    );
    revalidatePath("/vendors");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function generateEvidencePackRecord(input: {
  title: string;
  decisionIds: string[];
  formats?: ("JSON" | "PDF" | "ZIP")[];
}): Promise<ActionResult> {
  const parsed = evidencePackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const auth = await authorize("generate_evidence_pack", "evidence_pack", "new");
  if (!auth.ok) return auth;
  try {
    const data = await (await getMutations()).generateEvidencePackRecord(
      parsed.data,
      auth.actor,
    );
    revalidatePath("/evidence");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}
