import type { ModuleView } from "@/lib/modules/contract";
import {
  getModeConfig,
  getSeedRecord,
  resolveLiveModuleView,
  type LiveModuleConfig,
} from "@/lib/modules/live-adapter";

export const GCFI_ID = "government-contractor-financial-infrastructure";

export type GcfiConfig = LiveModuleConfig;

export function getGcfiConfig(): GcfiConfig {
  return getModeConfig("GCFI");
}

/**
 * Resolve the Government Contractor Financial Infrastructure module — the third
 * live-bound module, using the same shared resolver and safe seed fallback.
 */
export async function loadGcfiView(
  config: GcfiConfig = getGcfiConfig(),
  fetchImpl?: typeof fetch,
): Promise<ModuleView> {
  return resolveLiveModuleView({
    record: getSeedRecord(GCFI_ID),
    config,
    fetchImpl,
  });
}
