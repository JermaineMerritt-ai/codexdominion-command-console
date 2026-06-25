import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGovernanceModule,
  toModuleView,
  highestRiskModule,
  nextIntegrationModule,
  findModuleByText,
  type ModuleRecord,
} from "../lib/modules/contract";
import { getModules, getModule, getModuleAliases, moduleStats } from "../lib/modules/registry";
import { parseCommand } from "../lib/command/intents";
import { runQuery } from "../lib/command/engine";

const EMPTY = { decisions: [], workflows: [], vendors: [], opportunities: [], auditEvents: [] };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── Contract shape ───────────────────────────────────────────

test("createGovernanceModule implements the full contract", () => {
  const rec: ModuleRecord = {
    id: "x",
    name: "X",
    category: "Test",
    version: "v1",
    status: "active",
    owner: "o",
    health: "healthy",
    capabilities: ["workflows"],
    integrationMaturity: 70,
    lastSync: "2026-06-24T00:00:00Z",
    repositoryUrl: "r",
    missingCapabilities: ["risk"],
    recommendedNextStep: "next",
    aliases: ["ex"],
    metrics: { activeWorkflows: 1, openDecisions: 0, evidenceItems: 0, riskFlags: 0 },
    workflows: [{ id: "w1", name: "W", state: "draft", riskLevel: "low" }],
    decisions: [],
    evidence: [],
    policies: [],
    auditEvents: [],
    riskItems: [],
  };
  const m = createGovernanceModule(rec);
  assert.equal(typeof m.metrics, "function");
  assert.equal(m.metrics().activeWorkflows, 1);
  assert.equal(m.getWorkflows().length, 1);
  assert.deepEqual(m.getDecisions(), []);
  const view = toModuleView(m);
  assert.equal(view.id, "x");
  assert.equal(view.metrics.activeWorkflows, 1);
});

// ── Registry queries ─────────────────────────────────────────

test("registry returns all seeded modules", async () => {
  const mods = await getModules();
  assert.ok(mods.length >= 9);
  assert.ok(mods.some((m) => m.id === "codex-control-plane"));
});

test("getModule looks up by id; unknown returns undefined", async () => {
  assert.equal((await getModule("complianceflow"))?.name, "ComplianceFlow");
  assert.equal(await getModule("nope"), undefined);
});

test("moduleStats counts statuses", async () => {
  const stats = moduleStats(await getModules());
  assert.equal(stats.total >= 9, true);
  assert.ok(stats.active >= 1);
  assert.ok(stats.avgMaturity > 0 && stats.avgMaturity <= 100);
});

// ── Selection helpers ────────────────────────────────────────

test("highest-risk and next-integration helpers pick sane modules", async () => {
  const mods = await getModules();
  const risky = highestRiskModule(mods)!;
  assert.ok(risky.metrics.riskFlags >= 1);
  const next = nextIntegrationModule(mods)!;
  assert.notEqual(next.status, "active");
});

test("findModuleByText resolves names and aliases", async () => {
  const mods = await getModules();
  const aliases = getModuleAliases();
  assert.equal(findModuleByText(mods, aliases, "status for ComplianceFlow")?.id, "complianceflow");
  assert.equal(findModuleByText(mods, aliases, "how is procurement doing")?.id, "codex-procurement-network");
  assert.equal(findModuleByText(mods, aliases, "nothing here"), undefined);
});

// ── Command parsing ──────────────────────────────────────────

test("parses module commands", () => {
  assert.equal(parseCommand("Show active modules").intent, "show_active_modules");
  assert.equal(parseCommand("Show modules needing integration").intent, "show_modules_needing_integration");
  assert.equal(parseCommand("Show highest risk module").intent, "show_highest_risk_module");
  assert.equal(parseCommand("Show module status for ComplianceFlow").intent, "show_module_status");
  assert.equal(parseCommand("Recommend next module integration").intent, "recommend_next_module_integration");
});

test("module recommend does not collide with governance recommend", () => {
  assert.equal(parseCommand("Recommend next governance action").intent, "recommend_next_governance_action");
});

// ── Command execution ────────────────────────────────────────

test("module commands execute against registry data", async () => {
  const modules = await getModules();
  const moduleAliases = getModuleAliases();
  const data = { ...EMPTY, modules, moduleAliases };

  const active = runQuery(parseCommand("Show active modules"), data, NOW);
  assert.ok(active.rows.length >= 1);

  const status = runQuery(parseCommand("Show module status for ComplianceFlow"), data, NOW);
  assert.equal(status.rows[0]?.id, "complianceflow");

  const risk = runQuery(parseCommand("Show highest risk module"), data, NOW);
  assert.ok(risk.rows.length >= 1);

  const next = runQuery(parseCommand("Recommend next module integration"), data, NOW);
  assert.ok(next.nextStep && next.nextStep.length > 0);
});

test("unknown module name returns a clear prompt, not a guess", async () => {
  const modules = await getModules();
  const moduleAliases = getModuleAliases();
  const body = runQuery(
    parseCommand("Show module status for Nonexistent"),
    { ...EMPTY, modules, moduleAliases },
    NOW,
  );
  assert.equal(body.rows.length, 0);
  assert.match(body.summary, /Specify a module/i);
});
