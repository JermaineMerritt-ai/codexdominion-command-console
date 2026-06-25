import { test } from "node:test";
import assert from "node:assert/strict";
import { buildKnowledgeGraph, planContext } from "../lib/knowledge/graph";
import { getKnowledgeGraph } from "../lib/knowledge/registry";
import {
  policies,
  vendors,
  decisions,
  evidencePacks,
  auditEvents,
  workflows,
  opportunities,
  users,
} from "../lib/data/seed";

const NOW = new Date("2026-06-24T00:00:00.000Z");

function seedInput() {
  return {
    organizationName: "Meridian Financial Group",
    policies,
    vendors,
    decisions,
    evidencePacks,
    auditEvents,
    workflows,
    opportunities,
    users,
    modules: [],
  };
}

// ── Graph construction ───────────────────────────────────────

test("builds nodes for all entity types and links them", () => {
  const g = buildKnowledgeGraph(seedInput(), NOW);
  assert.equal(g.stats.totalNodes, g.nodes.length);
  assert.ok(g.nodes.some((n) => n.type === "organization"));
  assert.ok(g.nodes.some((n) => n.type === "decision"));
  assert.ok(g.nodes.some((n) => n.type === "ai_system"));
  assert.ok(g.stats.totalEdges > 0);
  // decisions link to their workflow
  assert.ok(g.edges.some((e) => e.relation === "belongs_to"));
  // evidence covers decisions
  assert.ok(g.edges.some((e) => e.relation === "covers"));
});

test("AI systems are de-duplicated", () => {
  const g = buildKnowledgeGraph(seedInput(), NOW);
  const aiNodes = g.nodes.filter((n) => n.type === "ai_system");
  const ids = new Set(aiNodes.map((n) => n.id));
  assert.equal(ids.size, aiNodes.length);
});

// ── Gaps ─────────────────────────────────────────────────────

test("surfaces certification, evidence, and reviewer gaps", () => {
  const g = buildKnowledgeGraph(seedInput(), NOW);
  const kinds = new Set(g.gaps.map((x) => x.kind));
  assert.ok(kinds.has("expiring_certification")); // VeriDesk / Quanta
  assert.ok(kinds.has("missing_evidence")); // a denied/flagged decision uncovered
  assert.ok(kinds.has("unreviewed_decision")); // DEC-2026-0476 has no reviewer
});

test("gaps are sorted with most severe first", () => {
  const g = buildKnowledgeGraph(seedInput(), NOW);
  const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  for (let i = 1; i < g.gaps.length; i++) {
    assert.ok(rank[g.gaps[i - 1].severity] <= rank[g.gaps[i].severity]);
  }
});

// ── Plan context ─────────────────────────────────────────────

test("planContext returns at most 5 grounded items", () => {
  const g = buildKnowledgeGraph(seedInput(), NOW);
  const ctx = planContext(g, "prepare_fedramp_readiness");
  assert.ok(ctx.length <= 5);
  assert.ok(ctx.every((c) => typeof c.label === "string"));
});

// ── Full graph (integration, demo data + modules) ────────────

test("getKnowledgeGraph assembles a non-empty governed graph", async () => {
  const g = await getKnowledgeGraph();
  assert.ok(g.stats.totalNodes > 10);
  assert.ok(g.nodes.some((n) => n.type === "module"));
  assert.ok(g.sampleChains.length >= 1);
});

test("contractor/payment plan context targets GCFI risk", async () => {
  const g = await getKnowledgeGraph();
  const ctx = planContext(g, "review_contractor_payment_risks");
  // GCFI seeds payment/milestone risk flags → should surface in context.
  assert.ok(ctx.some((c) => /payment|milestone|contractor|gcfi/i.test(c.label + c.detail)));
});
