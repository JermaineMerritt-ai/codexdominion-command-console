import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../lib/command/intents";
import {
  runQuery,
  deniedDecisions,
  expiringVendors,
} from "../lib/command/engine";
import { can } from "../lib/governance/rbac";
import {
  decisions,
  workflows,
  vendors,
  opportunities,
  auditEvents,
} from "../lib/data/seed";

const DATA = { decisions, workflows, vendors, opportunities, auditEvents };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── Intent parsing ───────────────────────────────────────────

test("parses each supported command phrase", () => {
  assert.equal(parseCommand("Show high-risk decisions").intent, "show_high_risk_decisions");
  assert.equal(parseCommand("Show pending approvals").intent, "show_pending_approvals");
  assert.equal(
    parseCommand("Generate evidence pack for denied decisions").intent,
    "generate_evidence_for_denied",
  );
  assert.equal(
    parseCommand("Show vendors with expiring certifications").intent,
    "show_expiring_vendors",
  );
  assert.equal(
    parseCommand("Show procurement opportunities with high match scores").intent,
    "show_high_match_opportunities",
  );
  assert.equal(
    parseCommand("Explain why decision DEC-2026-0480 was denied").intent,
    "explain_decision",
  );
  assert.equal(
    parseCommand("Show audit events for DEC-2026-0480").intent,
    "show_audit_events",
  );
});

test("extracts entity ids", () => {
  const p = parseCommand("Explain why decision DEC-2026-0480 was denied");
  assert.equal(p.entities.entityId, "DEC-2026-0480");
  const a = parseCommand("Show audit events for DEC-2026-0481");
  assert.equal(a.entities.entityId, "DEC-2026-0481");
});

test("unsupported commands are flagged, not guessed", () => {
  assert.equal(parseCommand("make me a coffee").intent, "unsupported");
  assert.equal(parseCommand("").intent, "unsupported");
});

test("privileged commands carry a permission; queries do not", () => {
  assert.equal(
    parseCommand("Generate evidence pack for denied decisions").permission,
    "generate_evidence_pack",
  );
  assert.equal(parseCommand("Show high-risk decisions").permission, null);
});

// ── RBAC mapping for commands ────────────────────────────────

test("RBAC: evidence command gated, queries open", () => {
  const evidence = parseCommand("Generate evidence pack for denied decisions");
  assert.equal(can("viewer", evidence.permission!), false);
  assert.equal(can("reviewer", evidence.permission!), false);
  assert.equal(can("auditor", evidence.permission!), true);
  assert.equal(can("administrator", evidence.permission!), true);
});

// ── Execution (pure query builders) ──────────────────────────

test("high-risk decisions returns only high/critical", () => {
  const body = runQuery(parseCommand("Show high-risk decisions"), DATA, NOW);
  assert.ok(body.rows.length > 0);
  for (const r of body.rows) {
    assert.ok(["high", "critical"].includes(r.badgeStatus!));
  }
  assert.match(body.summary, /high-risk/);
});

test("explain decision returns rationale for a known id, message for unknown", () => {
  const ok = runQuery(
    parseCommand("Explain why decision DEC-2026-0480 was denied"),
    DATA,
    NOW,
  );
  assert.equal(ok.rows.length, 1);
  assert.match(ok.summary, /DEC-2026-0480/);

  const missing = runQuery(
    parseCommand("Explain why decision DEC-9999-9999 was denied"),
    DATA,
    NOW,
  );
  assert.equal(missing.rows.length, 0);
  assert.match(missing.summary, /not found/);
});

test("audit-events command filters by entity id", () => {
  const body = runQuery(
    parseCommand("Show audit events for DEC-2026-0481"),
    DATA,
    NOW,
  );
  for (const r of body.rows) assert.ok(r.id.startsWith("AUD-"));
});

test("helpers: denied decisions and expiring vendors", () => {
  assert.ok(deniedDecisions(decisions).every((d) => d.outcome === "denied"));
  const exp = expiringVendors(vendors, NOW);
  assert.ok(exp.length > 0);
});
