import { test } from "node:test";
import assert from "node:assert/strict";
import { can, ACTION_ROLES, forbiddenMessage } from "../lib/governance/rbac";
import { demoMutations, type Actor } from "../lib/data/mutations";
import { demoStore } from "../lib/data/demo-store";
import type { UserRole } from "../types";

const ALL_ROLES: UserRole[] = [
  "administrator",
  "compliance_officer",
  "reviewer",
  "auditor",
  "executive",
  "viewer",
];

// ── Permission matrix ────────────────────────────────────────

test("administrator can perform every governance action", () => {
  for (const action of Object.keys(ACTION_ROLES) as (keyof typeof ACTION_ROLES)[]) {
    assert.equal(can("administrator", action), true, action);
  }
});

test("viewer and executive cannot perform any governance action", () => {
  for (const action of Object.keys(ACTION_ROLES) as (keyof typeof ACTION_ROLES)[]) {
    assert.equal(can("viewer", action), false, `viewer:${action}`);
    assert.equal(can("executive", action), false, `executive:${action}`);
  }
});

test("reviewer can approve/deny and complete vendor review, but not publish policy", () => {
  assert.equal(can("reviewer", "approve_decision"), true);
  assert.equal(can("reviewer", "deny_decision"), true);
  assert.equal(can("reviewer", "complete_vendor_review"), true);
  assert.equal(can("reviewer", "publish_policy"), false);
  assert.equal(can("reviewer", "transition_workflow"), false);
});

test("auditor can generate evidence packs but cannot approve decisions", () => {
  assert.equal(can("auditor", "generate_evidence_pack"), true);
  assert.equal(can("auditor", "approve_decision"), false);
});

test("compliance officer can transition workflows and publish policies", () => {
  assert.equal(can("compliance_officer", "transition_workflow"), true);
  assert.equal(can("compliance_officer", "publish_policy"), true);
  assert.equal(can("compliance_officer", "archive_policy"), true);
});

test("every action lists only valid roles", () => {
  for (const roles of Object.values(ACTION_ROLES)) {
    for (const r of roles) assert.ok(ALL_ROLES.includes(r));
  }
});

test("forbiddenMessage names the role and action", () => {
  const msg = forbiddenMessage("viewer", "approve_decision");
  assert.match(msg, /Viewer/);
  assert.match(msg, /approve decisions/);
});

// ── Denied-attempt auditing (demo layer) ─────────────────────

const viewer: Actor = {
  id: "usr_test_viewer",
  name: "Test Viewer",
  organizationId: "org_meridian",
  role: "viewer",
};

test("auditAuthorizationDenied records an authorization.denied event", async () => {
  const before = demoStore.auditEvents.length;
  await demoMutations.auditAuthorizationDenied(
    viewer,
    "approve_decision",
    "decision",
    "DEC-2026-0479",
  );
  assert.equal(demoStore.auditEvents.length, before + 1);
  const ev = demoStore.auditEvents[0];
  assert.equal(ev.type, "authorization.denied");
  assert.equal(ev.action, "approve_decision");
  assert.equal(ev.entityId, "DEC-2026-0479");
  assert.match(ev.hash, /^0x[0-9a-f]{64}$/);
});

// ── Demo mutation + audit integration ────────────────────────

const admin: Actor = {
  id: "usr_jmerritt",
  name: "Jermaine Merritt",
  organizationId: "org_meridian",
  role: "administrator",
};

test("approveDecision updates outcome and chains an audit event", async () => {
  const target = demoStore.decisions.find((d) => d.outcome === "flagged");
  assert.ok(target, "expected a flagged seed decision");
  const updated = await demoMutations.approveDecision(target!.id, admin);
  assert.equal(updated.outcome, "approved");
  assert.equal(updated.reviewerId, admin.id);
  const ev = demoStore.auditEvents[0];
  assert.equal(ev.type, "decision.approved");
  assert.equal(ev.entityId, target!.id);
  assert.deepEqual(ev.afterState, { outcome: "approved", reviewerId: admin.id });
});
