import { test } from "node:test";
import assert from "node:assert/strict";
import { getModule } from "../lib/modules/registry";
import {
  getBankingEdition,
  BANKTRUST_ID,
  BANKING_COMMANDS,
} from "../lib/banking/edition";
import { buildExecutionPlan } from "../lib/execution/plans";
import { parseCommand } from "../lib/command/intents";

// ── BankTrust OS module ──────────────────────────────────────

test("BankTrust OS is registered as an active banking module", async () => {
  const m = await getModule(BANKTRUST_ID);
  assert.equal(m?.name, "BankTrust OS");
  assert.equal(m?.status, "active");
  assert.ok(m?.riskItems.some((r) => /sar/i.test(r.label)));
  assert.ok(m?.policies.some((p) => /fair lending/i.test(p.name)));
});

// ── Banking edition ──────────────────────────────────────────

test("banking edition exposes KPIs, regulations, and commands", async () => {
  const e = await getBankingEdition();
  assert.ok(e.module);
  assert.ok(e.kpis.length >= 8);
  assert.ok(e.kpis.some((k) => /Loans Under Governance/.test(k.label)));
  assert.ok(e.regulations.includes("OCC"));
  assert.ok(e.evidenceTypes.includes("Fair Lending"));
});

// ── Banking execution plans ──────────────────────────────────

test("banking plans build from natural prompts", () => {
  assert.equal(
    buildExecutionPlan("Prepare our OCC examination package")?.intent,
    "prepare_occ_examination",
  );
  assert.equal(
    buildExecutionPlan("Generate an FFIEC readiness report")?.intent,
    "generate_ffiec_readiness",
  );
  assert.equal(
    buildExecutionPlan("Generate Fair Lending evidence")?.intent,
    "generate_fair_lending_evidence",
  );
  assert.equal(
    buildExecutionPlan("Prepare BSA/AML audit evidence")?.intent,
    "review_bsa_aml_posture",
  );
});

test("OCC plan is grounded in BankTrust OS and ends in a report", () => {
  const plan = buildExecutionPlan("Prepare our OCC examination package")!;
  assert.ok(plan.modules.includes("BankTrust OS"));
  assert.equal(plan.steps[plan.steps.length - 1].kind, "report");
});

// ── Every banking command resolves (plan or command) ─────────

test("every banking command resolves to a plan or a governed command", () => {
  for (const c of BANKING_COMMANDS) {
    const isPlan = buildExecutionPlan(c) !== null;
    const isCommand = parseCommand(c).intent !== "unsupported";
    assert.ok(isPlan || isCommand, `unresolved banking command: ${c}`);
  }
});
