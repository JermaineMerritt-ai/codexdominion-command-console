import type { ModuleView } from "@/lib/modules/contract";
import {
  getModeConfig,
  getSeedRecord,
  resolveLiveModuleView,
  type LiveModuleConfig,
} from "@/lib/modules/live-adapter";

export const CONTROL_PLANE_ID = "codex-control-plane";

export type ControlPlaneConfig = LiveModuleConfig;

export function getControlPlaneConfig(): ControlPlaneConfig {
  return getModeConfig("CODEX_CONTROL_PLANE");
}

/**
 * Resolve the codex-control-plane module — live when configured, safe seed
 * fallback otherwise. Thin wrapper over the shared live-binding resolver.
 */
export async function loadControlPlaneView(
  config: ControlPlaneConfig = getControlPlaneConfig(),
  fetchImpl?: typeof fetch,
): Promise<ModuleView> {
  return resolveLiveModuleView({
    record: getSeedRecord(CONTROL_PLANE_ID),
    config,
    fetchImpl,
  });
}
