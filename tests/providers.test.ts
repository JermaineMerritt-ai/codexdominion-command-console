import { test } from "node:test";
import assert from "node:assert/strict";
import { getProvider, PROVIDER_INFO, codexProvider } from "../lib/providers/registry";
import { parseCommand } from "../lib/command/intents";
import { runQuery } from "../lib/command/engine";
import {
  decisions,
  workflows,
  vendors,
  opportunities,
  auditEvents,
} from "../lib/data/seed";

const DATA = { decisions, workflows, vendors, opportunities, auditEvents };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── Provider registry / routing ──────────────────────────────

test("codex is connected; placeholders are available but not connected", () => {
  assert.equal(getProvider("codex").connected, true);
  const claude = getProvider("claude");
  assert.equal(claude.available, true);
  assert.equal(claude.connected, false);
  const research = getProvider("research");
  assert.equal(research.available, false);
});

test("unknown provider falls back to codex", () => {
  assert.equal(getProvider("nope").id, "codex");
  assert.equal(getProvider(undefined).id, "codex");
});

test("PROVIDER_INFO is serializable (no functions)", () => {
  for (const p of PROVIDER_INFO) {
    assert.equal(
      typeof (p as unknown as Record<string, unknown>).executeCommand,
      "undefined",
    );
    assert.equal(typeof p.name, "string");
  }
});

// ── Provider execution ───────────────────────────────────────

test("codex provider executes a query and returns a body", async () => {
  const parsed = parseCommand("Show high-risk decisions");
  const exec = await codexProvider.executeCommand({ parsed, data: DATA, now: NOW });
  assert.equal(exec.handled, true);
  assert.ok(exec.body);
  assert.ok(exec.body!.rows.length > 0);
});

test("placeholder provider returns a not-connected notice, does not execute", async () => {
  const parsed = parseCommand("Show high-risk decisions");
  const claude = getProvider("claude");
  const exec = await claude.executeCommand({ parsed, data: DATA, now: NOW });
  assert.equal(exec.handled, false);
  assert.equal(exec.body, undefined);
  assert.match(exec.notice ?? "", /not connected/i);
});

// ── New orchestration commands ───────────────────────────────

test("parses the new orchestration commands", () => {
  assert.equal(parseCommand("Prepare a buyer demo summary").intent, "prepare_buyer_demo_summary");
  assert.equal(parseCommand("Review system risk posture").intent, "review_system_risk_posture");
  assert.equal(
    parseCommand("Recommend next governance action").intent,
    "recommend_next_governance_action",
  );
});

test("risk posture returns a computed risk level", () => {
  const body = runQuery(parseCommand("Review system risk posture"), DATA, NOW);
  assert.ok(["low", "medium", "high", "critical"].includes(body.riskLevel!));
  assert.match(body.summary, /posture/i);
});

test("recommend next action returns a next step", () => {
  const body = runQuery(parseCommand("Recommend next governance action"), DATA, NOW);
  assert.ok(body.nextStep && body.nextStep.length > 0);
});

test("buyer demo summary produces a plan", () => {
  const body = runQuery(parseCommand("Prepare a buyer demo summary"), DATA, NOW);
  assert.ok(body.plan && body.plan.length >= 2);
  assert.ok(body.rows.length > 0);
});
