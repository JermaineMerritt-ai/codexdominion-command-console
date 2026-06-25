"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import { getMutations } from "@/lib/data/mutations";
import { can, forbiddenMessage } from "@/lib/governance/rbac";
import { executeCommand } from "@/lib/actions/command";
import { buildExecutionPlan } from "@/lib/execution/plans";
import type { ExecutionPlan, ExecutionRun, ExecutionStep } from "@/lib/execution/types";

/** Propose a plan from a prompt (no execution). Returns null if not a plan. */
export async function proposePlan(prompt: string): Promise<ExecutionPlan | null> {
  return buildExecutionPlan(prompt);
}

export type ExecuteResult =
  | { ok: true; run: ExecutionRun }
  | { ok: false; error: string };

/**
 * Execute an approved plan. RBAC-gated; each step runs through the governed
 * command pipeline (so each is permission-checked and individually audited),
 * then a plan-level `plan.executed` audit event seals the run.
 */
export async function executePlan(plan: ExecutionPlan): Promise<ExecuteResult> {
  const actor = await getCurrentActor();
  if (!can(actor.role, "execute_plan")) {
    try {
      await (await getMutations()).auditAuthorizationDenied(
        actor,
        "execute_plan",
        "execution_plan",
        plan.id,
      );
      revalidatePath("/settings");
    } catch {
      /* never fail the response on an audit-write error */
    }
    return { ok: false, error: forbiddenMessage(actor.role, "execute_plan") };
  }

  const executed: ExecutionStep[] = [];
  const summaries: string[] = [];

  for (const step of plan.steps) {
    if (!step.include) {
      executed.push({ ...step, status: "skipped" });
      continue;
    }
    if (step.kind === "report") {
      const summary =
        summaries.length > 0
          ? `Executive summary — ${summaries.join("  •  ")}`
          : "No prior step output to summarize.";
      executed.push({ ...step, status: "completed", summary });
      continue;
    }

    const start = Date.now();
    const res = await executeCommand(step.prompt, "codex");
    const durationMs = Date.now() - start;
    const ok = res.ok && !res.error;
    executed.push({
      ...step,
      status: ok ? "completed" : "failed",
      summary: res.error ?? res.summary,
      auditEventId: res.auditEventId,
      durationMs,
    });
    if (ok) summaries.push(`${step.title}: ${res.summary}`);
  }

  const active = executed.filter((s) => s.status !== "skipped");
  const completed = executed.filter((s) => s.status === "completed").length;
  const status: ExecutionRun["status"] =
    active.every((s) => s.status === "completed") ? "completed" : "failed";
  const executiveSummary = `Completed ${completed} of ${active.length} steps. ${summaries.slice(0, 8).join("  •  ")}`;

  const audit = await (await getMutations()).recordPlanExecuted(actor, {
    planId: plan.id,
    title: plan.title,
    summary: executiveSummary,
    stepCount: active.length,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/evidence");

  return {
    ok: true,
    run: {
      planId: plan.id,
      title: plan.title,
      status,
      steps: executed,
      executiveSummary,
      planAuditId: audit.id,
      stepsCompleted: completed,
      stepsTotal: active.length,
    },
  };
}
