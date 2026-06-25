import {
  createGovernanceModule,
  toModuleView,
  type ModuleRecord,
  type ModuleView,
} from "@/lib/modules/contract";
import { moduleRecords } from "@/lib/data/modules";
import { fetchControlPlaneData } from "./client";

export const CONTROL_PLANE_ID = "codex-control-plane";

export interface ControlPlaneConfig {
  mode: "demo" | "live";
  apiUrl?: string;
  apiKey?: string;
}

export function getControlPlaneConfig(): ControlPlaneConfig {
  return {
    mode: process.env.CODEX_CONTROL_PLANE_MODE === "live" ? "live" : "demo",
    apiUrl: process.env.CODEX_CONTROL_PLANE_API_URL,
    apiKey: process.env.CODEX_CONTROL_PLANE_API_KEY,
  };
}

function seedRecord(): ModuleRecord {
  const rec = moduleRecords.find((m) => m.id === CONTROL_PLANE_ID);
  if (!rec) throw new Error("codex-control-plane seed record missing");
  return rec;
}

function seedView(): ModuleView {
  return toModuleView(createGovernanceModule(seedRecord()));
}

const isoOrNull = (s: string) => (s === "never" ? null : s);

/**
 * Resolve the codex-control-plane module — live when configured, with safe
 * fallback to seed data. Never throws; the public demo always renders.
 */
export async function loadControlPlaneView(
  cfg: ControlPlaneConfig = getControlPlaneConfig(),
  fetchImpl?: typeof fetch,
): Promise<ModuleView> {
  const base = seedView();

  // Demo mode (or live mode without a URL) → seed data.
  if (cfg.mode === "demo" || !cfg.apiUrl) {
    return {
      ...base,
      source: {
        mode: cfg.mode,
        // Configured for live (URL set) or intending live but missing URL →
        // "live-ready"; pure demo with nothing configured → "demo".
        connection: cfg.apiUrl || cfg.mode === "live" ? "live_ready" : "demo",
        source: "seed_data",
        lastSync: isoOrNull(base.lastSync),
        lastError: null,
        latencyMs: null,
      },
    };
  }

  // Live mode → fetch, fall back to seed on failure.
  const res = await fetchControlPlaneData({
    apiUrl: cfg.apiUrl,
    apiKey: cfg.apiKey,
    fetchImpl,
  });

  if (!res.ok) {
    return {
      ...base,
      health: "degraded",
      source: {
        mode: "live",
        connection: "degraded",
        source: "seed_fallback",
        lastSync: isoOrNull(base.lastSync),
        lastError: res.error,
        latencyMs: res.latencyMs,
      },
    };
  }

  const d = res.data;
  const now = new Date().toISOString();
  const liveRecord: ModuleRecord = {
    ...seedRecord(),
    version: d.version ?? base.version,
    health: d.health ?? "healthy",
    lastSync: now,
    metrics: d.metrics ?? base.metrics,
    workflows: d.workflows ?? [],
    decisions: d.decisions ?? [],
    evidence: d.evidence ?? [],
    policies: d.policies ?? [],
    auditEvents: d.auditEvents ?? [],
    riskItems: d.riskItems ?? [],
  };

  return {
    ...toModuleView(createGovernanceModule(liveRecord)),
    source: {
      mode: "live",
      connection: "connected",
      source: "live_api",
      lastSync: now,
      lastError: null,
      latencyMs: res.latencyMs,
    },
  };
}
