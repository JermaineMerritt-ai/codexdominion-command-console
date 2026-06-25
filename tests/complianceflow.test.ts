import { test } from "node:test";
import assert from "node:assert/strict";
import { loadComplianceFlowView } from "../lib/modules/complianceflow/adapter";
import {
  resolveLiveModuleView,
  getSeedRecord,
  getModeConfig,
  anyModuleLive,
} from "../lib/modules/live-adapter";
import { parseCommand } from "../lib/command/intents";
import { runQuery } from "../lib/command/engine";
import { can } from "../lib/governance/rbac";

const EMPTY = { decisions: [], workflows: [], vendors: [], opportunities: [], auditEvents: [] };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── ComplianceFlow adapter fallback ──────────────────────────

test("ComplianceFlow demo mode uses seed data", async () => {
  const v = await loadComplianceFlowView({ mode: "demo" });
  assert.equal(v.id, "complianceflow");
  assert.equal(v.source?.source, "seed_data");
  assert.equal(v.source?.connection, "demo");
  assert.ok(v.decisions.length >= 1);
});

test("ComplianceFlow live success → connected/live_api", async () => {
  const okFetch = (async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      version: "cf-v9",
      health: "healthy",
      decisions: [{ id: "DEC-CF-LIVE", summary: "live cf", outcome: "approved", riskLevel: "low" }],
    }),
  })) as unknown as typeof fetch;
  const v = await loadComplianceFlowView(
    { mode: "live", apiUrl: "https://cf.example/module" },
    okFetch,
  );
  assert.equal(v.source?.connection, "connected");
  assert.equal(v.version, "cf-v9");
  assert.equal(v.decisions[0]?.id, "DEC-CF-LIVE");
});

test("ComplianceFlow live failure → degraded/seed_fallback", async () => {
  const boom = (async () => {
    throw new Error("ETIMEDOUT");
  }) as unknown as typeof fetch;
  const v = await loadComplianceFlowView(
    { mode: "live", apiUrl: "https://cf.example/module" },
    boom,
  );
  assert.equal(v.source?.connection, "degraded");
  assert.equal(v.source?.source, "seed_fallback");
  assert.ok(v.decisions.length >= 1);
});

// ── Shared adapter utility ───────────────────────────────────

test("resolveLiveModuleView works for any seed record", async () => {
  const rec = getSeedRecord("codex-procurement-network");
  const v = await resolveLiveModuleView({ record: rec, config: { mode: "demo" } });
  assert.equal(v.id, "codex-procurement-network");
  assert.equal(v.source?.connection, "demo");
});

test("getModeConfig reads prefixed env; anyModuleLive defaults false", () => {
  const cfg = getModeConfig("NONEXISTENT_PREFIX");
  assert.equal(cfg.mode, "demo");
  assert.equal(cfg.apiUrl, undefined);
  assert.equal(anyModuleLive(), false);
});

// ── Command parsing ──────────────────────────────────────────

test("parses ComplianceFlow commands with permissions", () => {
  assert.equal(parseCommand("Sync ComplianceFlow").intent, "sync_complianceflow");
  assert.equal(parseCommand("Sync ComplianceFlow").permission, "sync_complianceflow");
  assert.equal(parseCommand("Show ComplianceFlow health").intent, "show_complianceflow_health");
  assert.equal(parseCommand("Show ComplianceFlow decisions").intent, "show_complianceflow_decisions");
  assert.equal(parseCommand("Show ComplianceFlow audit events").intent, "show_complianceflow_audit_events");
});

test("module status command is not hijacked by ComplianceFlow intents", () => {
  assert.equal(
    parseCommand("Show module status for ComplianceFlow").intent,
    "show_module_status",
  );
});

// ── RBAC ─────────────────────────────────────────────────────

test("RBAC: ComplianceFlow sync admin/compliance; view +reviewer/auditor; viewer denied", () => {
  assert.equal(can("administrator", "sync_complianceflow"), true);
  assert.equal(can("compliance_officer", "sync_complianceflow"), true);
  assert.equal(can("reviewer", "sync_complianceflow"), false);
  assert.equal(can("viewer", "sync_complianceflow"), false);
  assert.equal(can("reviewer", "view_complianceflow"), true);
  assert.equal(can("auditor", "view_complianceflow"), true);
  assert.equal(can("viewer", "view_complianceflow"), false);
});

// ── Execution + source metadata ──────────────────────────────

test("ComplianceFlow commands execute and return source metadata", async () => {
  const cf = await loadComplianceFlowView({ mode: "demo" });
  const data = { ...EMPTY, modules: [cf], moduleAliases: {} };

  const health = runQuery(parseCommand("Show ComplianceFlow health"), data, NOW);
  assert.equal(health.source?.connection, "demo");
  assert.match(health.summary, /ComplianceFlow/);

  const decisions = runQuery(parseCommand("Show ComplianceFlow decisions"), data, NOW);
  assert.ok(decisions.rows.length >= 1);
  assert.equal(decisions.source?.source, "seed_data");
});
