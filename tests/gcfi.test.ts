import { test } from "node:test";
import assert from "node:assert/strict";
import { loadGcfiView, GCFI_ID } from "../lib/modules/gcfi/adapter";
import { getModule } from "../lib/modules/registry";
import { parseCommand } from "../lib/command/intents";
import { runQuery } from "../lib/command/engine";
import { can } from "../lib/governance/rbac";

const EMPTY = { decisions: [], workflows: [], vendors: [], opportunities: [], auditEvents: [] };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── Adapter fallback ─────────────────────────────────────────

test("GCFI demo mode uses seed data with money/milestone signals", async () => {
  const v = await loadGcfiView({ mode: "demo" });
  assert.equal(v.id, GCFI_ID);
  assert.equal(v.source?.source, "seed_data");
  assert.ok(v.workflows.some((w) => /milestone/i.test(w.name)));
  assert.ok(v.riskItems.some((r) => /payment/i.test(r.label)));
});

test("GCFI live failure falls back to seed (degraded)", async () => {
  const boom = (async () => {
    throw new Error("ECONNRESET");
  }) as unknown as typeof fetch;
  const v = await loadGcfiView({ mode: "live", apiUrl: "https://gcfi.example" }, boom);
  assert.equal(v.source?.connection, "degraded");
  assert.equal(v.source?.source, "seed_fallback");
  assert.ok(v.riskItems.length >= 1);
});

// ── Module detail lookup ─────────────────────────────────────

test("registry resolves GCFI by its canonical id", async () => {
  const v = await getModule(GCFI_ID);
  assert.equal(v?.id, GCFI_ID);
  assert.ok(v?.source); // resolved through the live adapter
});

// ── Command parsing ──────────────────────────────────────────

test("parses GCFI commands with permissions", () => {
  assert.equal(parseCommand("Sync GCFI").intent, "sync_gcfi");
  assert.equal(parseCommand("Sync GCFI").permission, "sync_gcfi");
  assert.equal(parseCommand("Show GCFI health").intent, "show_gcfi_health");
  assert.equal(parseCommand("Show GCFI decisions").intent, "show_gcfi_decisions");
  assert.equal(parseCommand("Show GCFI audit events").intent, "show_gcfi_audit_events");
  assert.equal(parseCommand("Show contractor milestone risks").intent, "show_contractor_milestone_risks");
  assert.equal(parseCommand("Show payment approval risks").intent, "show_payment_approval_risks");
});

// ── RBAC ─────────────────────────────────────────────────────

test("RBAC: GCFI sync admin/compliance; view +reviewer/auditor; viewer denied", () => {
  assert.equal(can("administrator", "sync_gcfi"), true);
  assert.equal(can("compliance_officer", "sync_gcfi"), true);
  assert.equal(can("reviewer", "sync_gcfi"), false);
  assert.equal(can("viewer", "sync_gcfi"), false);
  assert.equal(can("reviewer", "view_gcfi"), true);
  assert.equal(can("auditor", "view_gcfi"), true);
  assert.equal(can("viewer", "view_gcfi"), false);
});

// ── Execution + source metadata ──────────────────────────────

test("GCFI commands execute and return source metadata", async () => {
  const gcfi = await loadGcfiView({ mode: "demo" });
  const data = { ...EMPTY, modules: [gcfi], moduleAliases: {} };

  const health = runQuery(parseCommand("Show GCFI health"), data, NOW);
  assert.equal(health.source?.connection, "demo");
  assert.match(health.summary, /GCFI|Government Contractor/);

  const decisions = runQuery(parseCommand("Show GCFI decisions"), data, NOW);
  assert.ok(decisions.rows.length >= 1);
  assert.equal(decisions.source?.source, "seed_data");
});

test("milestone risk command filters milestone/contractor items", async () => {
  const gcfi = await loadGcfiView({ mode: "demo" });
  const data = { ...EMPTY, modules: [gcfi], moduleAliases: {} };
  const body = runQuery(parseCommand("Show contractor milestone risks"), data, NOW);
  assert.ok(body.rows.length >= 1);
  assert.ok(body.rows.every((r) => /milestone|contractor|disburse/i.test(r.title)));
  assert.equal(body.source?.source, "seed_data");
});

test("payment approval risk command surfaces the dual-approval gap", async () => {
  const gcfi = await loadGcfiView({ mode: "demo" });
  const data = { ...EMPTY, modules: [gcfi], moduleAliases: {} };
  const body = runQuery(parseCommand("Show payment approval risks"), data, NOW);
  assert.ok(body.rows.some((r) => /payment|dual|authoriz/i.test(r.title)));
  assert.equal(body.riskLevel, "critical");
});
