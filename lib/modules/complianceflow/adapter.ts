import type { ModuleView } from "@/lib/modules/contract";
import {
  getModeConfig,
  getSeedRecord,
  resolveLiveModuleView,
  type LiveModuleConfig,
} from "@/lib/modules/live-adapter";

export const COMPLIANCEFLOW_ID = "complianceflow";

export type ComplianceFlowConfig = LiveModuleConfig;

export function getComplianceFlowConfig(): ComplianceFlowConfig {
  return getModeConfig("COMPLIANCEFLOW");
}

/**
 * Resolve the ComplianceFlow module — the second live-bound module, using the
 * same shared resolver and safe seed fallback as codex-control-plane.
 */
export async function loadComplianceFlowView(
  config: ComplianceFlowConfig = getComplianceFlowConfig(),
  fetchImpl?: typeof fetch,
): Promise<ModuleView> {
  return resolveLiveModuleView({
    record: getSeedRecord(COMPLIANCEFLOW_ID),
    config,
    fetchImpl,
  });
}
