import {
  createGovernanceModule,
  toModuleView,
  type ModuleRecord,
  type ModuleView,
} from "@/lib/modules/contract";
import { moduleRecords } from "@/lib/data/modules";
import { fetchModuleData } from "./live-client";

export interface LiveModuleConfig {
  mode: "demo" | "live";
  apiUrl?: string;
  apiKey?: string;
}

/** Resolve a module's live config from env, given a variable prefix. */
export function getModeConfig(prefix: string): LiveModuleConfig {
  return {
    mode: process.env[`${prefix}_MODE`] === "live" ? "live" : "demo",
    apiUrl: process.env[`${prefix}_API_URL`],
    apiKey: process.env[`${prefix}_API_KEY`],
  };
}

export function getSeedRecord(id: string): ModuleRecord {
  const rec = moduleRecords.find((m) => m.id === id);
  if (!rec) throw new Error(`module seed record missing: ${id}`);
  return rec;
}

const isoOrNull = (s: string) => (s === "never" ? null : s);

/**
 * Generic live-binding resolver shared by all module adapters.
 *  - demo / no URL → seed data (connection: demo or live-ready)
 *  - live + URL + success → live API data (connected)
 *  - live + URL + failure → seed fallback (degraded)
 * Never throws; the public demo always renders.
 */
export async function resolveLiveModuleView(args: {
  record: ModuleRecord;
  config: LiveModuleConfig;
  fetchImpl?: typeof fetch;
}): Promise<ModuleView> {
  const { record, config, fetchImpl } = args;
  const base = toModuleView(createGovernanceModule(record));

  if (config.mode === "demo" || !config.apiUrl) {
    return {
      ...base,
      source: {
        mode: config.mode,
        connection: config.apiUrl || config.mode === "live" ? "live_ready" : "demo",
        source: "seed_data",
        lastSync: isoOrNull(base.lastSync),
        lastError: null,
        latencyMs: null,
      },
    };
  }

  const res = await fetchModuleData({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
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
    ...record,
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

/** True if any module is configured for live mode (used to make routes dynamic). */
export function anyModuleLive(): boolean {
  return (
    process.env.CODEX_CONTROL_PLANE_MODE === "live" ||
    process.env.COMPLIANCEFLOW_MODE === "live"
  );
}
