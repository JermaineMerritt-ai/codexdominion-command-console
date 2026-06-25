import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchControlPlaneData } from "../lib/modules/control-plane/client";
import { loadControlPlaneView } from "../lib/modules/control-plane/adapter";
import { parseCommand } from "../lib/command/intents";
import { runQuery } from "../lib/command/engine";
import { can } from "../lib/governance/rbac";

const EMPTY = { decisions: [], workflows: [], vendors: [], opportunities: [], auditEvents: [] };
const NOW = new Date("2026-06-24T00:00:00.000Z");

// ── Mode selection / fallback ────────────────────────────────

test("demo mode uses seed data", async () => {
  const v = await loadControlPlaneView({ mode: "demo" });
  assert.equal(v.source?.mode, "demo");
  assert.equal(v.source?.connection, "demo");
  assert.equal(v.source?.source, "seed_data");
  assert.ok(v.decisions.length >= 1);
});

test("live mode without URL is live-ready on seed", async () => {
  const v = await loadControlPlaneView({ mode: "live" });
  assert.equal(v.source?.connection, "live_ready");
  assert.equal(v.source?.source, "seed_data");
});

test("live success returns live data + connected source", async () => {
  const okFetch = (async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      version: "v9",
      health: "healthy",
      metrics: { activeWorkflows: 2, openDecisions: 1, evidenceItems: 5, riskFlags: 0 },
      decisions: [{ id: "DEC-LIVE-1", summary: "live decision", outcome: "approved", riskLevel: "low" }],
      auditEvents: [{ id: "AUD-LIVE-1", type: "decision.approved", summary: "live", at: "2026-06-24T00:00:00Z" }],
    }),
  })) as unknown as typeof fetch;

  const v = await loadControlPlaneView(
    { mode: "live", apiUrl: "https://cp.example/module" },
    okFetch,
  );
  assert.equal(v.source?.connection, "connected");
  assert.equal(v.source?.source, "live_api");
  assert.equal(v.version, "v9");
  assert.equal(v.decisions[0]?.id, "DEC-LIVE-1");
});

test("live failure falls back to seed and is degraded", async () => {
  const boomFetch = (async () => {
    throw new Error("ECONNREFUSED");
  }) as unknown as typeof fetch;

  const v = await loadControlPlaneView(
    { mode: "live", apiUrl: "https://cp.example/module" },
    boomFetch,
  );
  assert.equal(v.source?.connection, "degraded");
  assert.equal(v.source?.source, "seed_fallback");
  assert.match(v.source?.lastError ?? "", /ECONNREFUSED/);
  assert.ok(v.decisions.length >= 1); // seed fallback still has data
});

// ── Client timeout handling ──────────────────────────────────

test("client times out and reports it (no hard crash)", async () => {
  const hanging = ((_url: string, opts: { signal?: AbortSignal }) =>
    new Promise((_res, rej) => {
      opts.signal?.addEventListener("abort", () => {
        const e = new Error("aborted");
        e.name = "AbortError";
        rej(e);
      });
    })) as unknown as typeof fetch;

  const res = await fetchControlPlaneData({
    apiUrl: "https://cp.example/module",
    timeoutMs: 40,
    retries: 0,
    fetchImpl: hanging,
  });
  assert.equal(res.ok, false);
  assert.match(res.ok === false ? res.error : "", /Timed out/);
});

// ── Command parsing + RBAC ───────────────────────────────────

test("parses control-plane commands with permissions", () => {
  assert.equal(parseCommand("Sync control plane").intent, "sync_control_plane");
  assert.equal(parseCommand("Sync control plane").permission, "sync_control_plane");
  assert.equal(parseCommand("Show control plane health").intent, "show_control_plane_health");
  assert.equal(parseCommand("Show live control plane decisions").intent, "show_live_control_plane_decisions");
  assert.equal(parseCommand("Show control plane audit events").intent, "show_control_plane_audit_events");
  assert.equal(parseCommand("Show control plane health").permission, "view_control_plane");
});

test("RBAC: sync requires admin/compliance; view allows reviewer/auditor; viewer denied", () => {
  assert.equal(can("administrator", "sync_control_plane"), true);
  assert.equal(can("compliance_officer", "sync_control_plane"), true);
  assert.equal(can("reviewer", "sync_control_plane"), false);
  assert.equal(can("viewer", "sync_control_plane"), false);

  assert.equal(can("reviewer", "view_control_plane"), true);
  assert.equal(can("auditor", "view_control_plane"), true);
  assert.equal(can("viewer", "view_control_plane"), false);
});

// ── Source metadata in command results ───────────────────────

test("control-plane commands return source metadata", async () => {
  const cp = await loadControlPlaneView({ mode: "demo" });
  const data = { ...EMPTY, modules: [cp], moduleAliases: {} };

  const health = runQuery(parseCommand("Show control plane health"), data, NOW);
  assert.equal(health.source?.connection, "demo");
  assert.match(health.summary, /demo seed data/i);

  const decisions = runQuery(parseCommand("Show live control plane decisions"), data, NOW);
  assert.ok(decisions.rows.length >= 1);
  assert.equal(decisions.source?.source, "seed_data");
});
