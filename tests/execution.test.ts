import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildExecutionPlan,
  matchPlanTemplate,
  PLAN_SUGGESTIONS,
  PLAN_TEMPLATES,
} from "../lib/execution/plans";
import { can } from "../lib/governance/rbac";

// ── Plan parsing / building ──────────────────────────────────

test("plan prompts build multi-step plans ending in a report", () => {
  const plan = buildExecutionPlan("Prepare for a FedRAMP assessment");
  assert.ok(plan);
  assert.equal(plan!.intent, "prepare_fedramp_readiness");
  assert.ok(plan!.steps.length >= 4);
  assert.equal(plan!.steps[plan!.steps.length - 1].kind, "report");
  assert.ok(plan!.steps.every((s) => s.include === true));
  assert.ok(plan!.estimateMinutes > 0);
  assert.ok(["low", "medium", "high", "critical"].includes(plan!.riskLevel));
  assert.ok(plan!.modules.length >= 1);
});

test("non-plan prompts return null (fall through to single command)", () => {
  assert.equal(buildExecutionPlan("Show high-risk decisions"), null);
  assert.equal(buildExecutionPlan("Prepare a buyer demo summary"), null);
});

test("each template sample matches its template", () => {
  for (const t of PLAN_TEMPLATES) {
    const matched = matchPlanTemplate(t.sample);
    assert.equal(matched?.intent, t.intent, t.sample);
  }
});

test("plan steps reference real-sounding command prompts", () => {
  const plan = buildExecutionPlan("Prepare a pilot readiness report")!;
  const commandSteps = plan.steps.filter((s) => s.kind === "command");
  assert.ok(commandSteps.length >= 3);
  assert.ok(commandSteps.every((s) => s.prompt.length > 0));
});

test("contractor payment plan targets GCFI", () => {
  const plan = buildExecutionPlan("Review contractor payment risks")!;
  assert.equal(plan.intent, "review_contractor_payment_risks");
  assert.ok(plan.modules.includes("GCFI"));
});

test("PLAN_SUGGESTIONS lists every template", () => {
  assert.equal(PLAN_SUGGESTIONS.length, PLAN_TEMPLATES.length);
});

// ── RBAC for execution ───────────────────────────────────────

test("execute_plan is restricted to administrator + compliance officer", () => {
  assert.equal(can("administrator", "execute_plan"), true);
  assert.equal(can("compliance_officer", "execute_plan"), true);
  assert.equal(can("reviewer", "execute_plan"), false);
  assert.equal(can("auditor", "execute_plan"), false);
  assert.equal(can("viewer", "execute_plan"), false);
});
