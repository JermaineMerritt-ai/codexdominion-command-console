// codex-control-plane uses the shared live module client. Re-exported here for
// backward compatibility with existing imports.
export {
  fetchModuleData as fetchControlPlaneData,
  type ModuleApiResponse as ControlPlaneApiResponse,
  type FetchOptions,
  type FetchResult,
} from "@/lib/modules/live-client";
