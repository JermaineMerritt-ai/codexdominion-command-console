import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decisionActionSchema,
  workflowTransitionSchema,
  evidencePackSchema,
} from "../lib/governance/validation";
import { canTransition, nextStates } from "../lib/governance/transitions";
import { computeEvidenceHash, buildAuditEvent } from "../lib/governance/audit";

// ── Zod input validation ─────────────────────────────────────

test("decisionActionSchema rejects empty id", () => {
  assert.equal(decisionActionSchema.safeParse({ decisionId: "" }).success, false);
});

test("decisionActionSchema accepts a valid id", () => {
  const r = decisionActionSchema.safeParse({ decisionId: "DEC-1", comment: "ok" });
  assert.equal(r.success, true);
});

test("workflowTransitionSchema rejects an unknown state", () => {
  const r = workflowTransitionSchema.safeParse({
    workflowId: "wf_1",
    toState: "frozen",
  });
  assert.equal(r.success, false);
});

test("evidencePackSchema requires a title and at least one decision", () => {
  assert.equal(
    evidencePackSchema.safeParse({ title: "ab", decisionIds: [] }).success,
    false,
  );
  const ok = evidencePackSchema.safeParse({
    title: "Quarterly Pack",
    decisionIds: ["DEC-1"],
  });
  assert.equal(ok.success, true);
  // formats defaults to ["JSON"]
  assert.deepEqual(ok.success && ok.data.formats, ["JSON"]);
});

// ── Workflow state machine ───────────────────────────────────

test("valid transitions are allowed", () => {
  assert.equal(canTransition("draft", "pending_review"), true);
  assert.equal(canTransition("pending_review", "approved"), true);
  assert.equal(canTransition("pending_review", "escalated"), true);
  assert.equal(canTransition("approved", "closed"), true);
});

test("invalid transitions are rejected", () => {
  assert.equal(canTransition("draft", "closed"), false);
  assert.equal(canTransition("draft", "approved"), false);
  assert.equal(canTransition("closed", "pending_review"), false);
  assert.equal(nextStates("closed").length, 0);
});

// ── Evidence hash generation ─────────────────────────────────

test("computeEvidenceHash is deterministic and well-formed", () => {
  const a = computeEvidenceHash({ x: 1, y: "z" });
  const b = computeEvidenceHash({ x: 1, y: "z" });
  assert.equal(a, b);
  assert.match(a, /^0x[0-9a-f]{64}$/);
});

test("computeEvidenceHash changes with input", () => {
  assert.notEqual(computeEvidenceHash({ x: 1 }), computeEvidenceHash({ x: 2 }));
});

// ── Audit event generation ───────────────────────────────────

test("buildAuditEvent populates structured fields and chains hash", () => {
  const ev = buildAuditEvent({
    type: "decision.approved",
    action: "approve_decision",
    actorId: "usr_1",
    organizationId: "org_1",
    entityType: "decision",
    entityId: "DEC-1",
    summary: "Approved DEC-1",
    beforeState: { outcome: "flagged" },
    afterState: { outcome: "approved" },
    prevHash: "0xabc",
    at: "2026-06-24T00:00:00.000Z",
  });

  assert.equal(ev.action, "approve_decision");
  assert.equal(ev.entityType, "decision");
  assert.equal(ev.entityId, "DEC-1");
  assert.deepEqual(ev.beforeState, { outcome: "flagged" });
  assert.deepEqual(ev.afterState, { outcome: "approved" });
  assert.equal(ev.prevHash, "0xabc");
  assert.equal(ev.hash, ev.evidenceHash);
  assert.match(ev.hash, /^0x[0-9a-f]{64}$/);
  assert.ok(ev.id.startsWith("AUD-"));
});

test("buildAuditEvent is deterministic for identical input", () => {
  const input = {
    type: "policy.published" as const,
    action: "publish_policy",
    actorId: "usr_1",
    organizationId: "org_1",
    entityType: "policy" as const,
    entityId: "pol_1",
    summary: "Published",
    prevHash: "0x0",
    at: "2026-06-24T00:00:00.000Z",
  };
  assert.equal(buildAuditEvent(input).hash, buildAuditEvent(input).hash);
});
