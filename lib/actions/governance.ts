"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrganization, getUsers } from "@/lib/data/queries";
import { getMutations, type Actor } from "@/lib/data/mutations";
import {
  decisionActionSchema,
  evidencePackSchema,
  policyActionSchema,
  vendorReviewSchema,
  workflowTransitionSchema,
} from "@/lib/governance/validation";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Resolve the acting user. Demo: the org administrator. (Auth wires here later.) */
async function getActor(): Promise<Actor> {
  const [users, org] = await Promise.all([getUsers(), getActiveOrganization()]);
  const admin = users.find((u) => u.role === "administrator") ?? users[0];
  return { id: admin.id, name: admin.name, organizationId: org.id };
}

function fail(e: unknown): ActionResult<never> {
  return { ok: false, error: e instanceof Error ? e.message : "Action failed" };
}

export async function approveDecision(
  input: { decisionId: string; comment?: string },
): Promise<ActionResult> {
  const parsed = decisionActionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).approveDecision(
      parsed.data.decisionId,
      actor,
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

export async function denyDecision(
  input: { decisionId: string; comment?: string },
): Promise<ActionResult> {
  const parsed = decisionActionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).denyDecision(
      parsed.data.decisionId,
      actor,
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

export async function transitionWorkflow(
  input: { workflowId: string; toState: string; note?: string },
): Promise<ActionResult> {
  const parsed = workflowTransitionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).transitionWorkflow(
      parsed.data.workflowId,
      parsed.data.toState,
      actor,
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

export async function publishPolicy(
  input: { policyId: string },
): Promise<ActionResult> {
  const parsed = policyActionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).publishPolicy(
      parsed.data.policyId,
      actor,
    );
    revalidatePath("/policies");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function archivePolicy(
  input: { policyId: string },
): Promise<ActionResult> {
  const parsed = policyActionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).archivePolicy(
      parsed.data.policyId,
      actor,
    );
    revalidatePath("/policies");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function completeVendorReview(
  input: { vendorId: string },
): Promise<ActionResult> {
  const parsed = vendorReviewSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).completeVendorReview(
      parsed.data.vendorId,
      actor,
    );
    revalidatePath("/vendors");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function generateEvidencePackRecord(
  input: { title: string; decisionIds: string[]; formats?: ("JSON" | "PDF" | "ZIP")[] },
): Promise<ActionResult> {
  const parsed = evidencePackSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    const actor = await getActor();
    const data = await (await getMutations()).generateEvidencePackRecord(
      parsed.data,
      actor,
    );
    revalidatePath("/evidence");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}
