import type {
  ModuleAuditRef,
  ModuleDecisionRef,
  ModuleEvidenceRef,
  ModuleHealth,
  ModuleMetrics,
  ModulePolicyRef,
  ModuleRiskRef,
  ModuleWorkflowRef,
} from "@/lib/modules/contract";

/** Shape the codex-control-plane API is expected to return. */
export interface ControlPlaneApiResponse {
  version?: string;
  health?: ModuleHealth;
  metrics?: ModuleMetrics;
  workflows?: ModuleWorkflowRef[];
  decisions?: ModuleDecisionRef[];
  evidence?: ModuleEvidenceRef[];
  policies?: ModulePolicyRef[];
  auditEvents?: ModuleAuditRef[];
  riskItems?: ModuleRiskRef[];
}

export interface FetchOptions {
  apiUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: typeof fetch;
}

export type FetchResult =
  | { ok: true; data: ControlPlaneApiResponse; latencyMs: number }
  | { ok: false; error: string; latencyMs: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch control-plane data safely: per-attempt timeout, retries for transient
 * failures (timeout / network / 5xx), and a structured error result. Never
 * throws — callers fall back to seed data.
 */
export async function fetchControlPlaneData(
  opts: FetchOptions,
): Promise<FetchResult> {
  const {
    apiUrl,
    apiKey,
    timeoutMs = 4000,
    retries = 2,
    fetchImpl = fetch,
  } = opts;
  const start = Date.now();
  let lastError = "unknown error";

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(apiUrl, {
        method: "GET",
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.status >= 500) {
        lastError = `Upstream ${res.status}`;
        if (attempt < retries) {
          await sleep(150 * (attempt + 1));
          continue;
        }
        return { ok: false, error: lastError, latencyMs: Date.now() - start };
      }
      if (!res.ok) {
        // 4xx — do not retry (auth / bad request).
        return {
          ok: false,
          error: `Request failed (${res.status})`,
          latencyMs: Date.now() - start,
        };
      }

      const data = (await res.json()) as ControlPlaneApiResponse;
      return { ok: true, data, latencyMs: Date.now() - start };
    } catch (e) {
      clearTimeout(timer);
      lastError =
        e instanceof Error && e.name === "AbortError"
          ? `Timed out after ${timeoutMs}ms`
          : e instanceof Error
            ? e.message
            : "network error";
      if (attempt < retries) {
        await sleep(150 * (attempt + 1));
        continue;
      }
    }
  }

  return { ok: false, error: lastError, latencyMs: Date.now() - start };
}
