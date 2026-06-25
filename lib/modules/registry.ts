import { modules, moduleAliases } from "@/lib/data/modules";
import { toModuleView, type ModuleStatus, type ModuleView } from "./contract";

// Module registry accessors. Demo-backed today; the Integration Contract means a
// live module API can replace the source without changing the Console.

export async function getModules(): Promise<ModuleView[]> {
  return modules.map(toModuleView);
}

export async function getModule(id: string): Promise<ModuleView | undefined> {
  const m = modules.find((x) => x.id === id);
  return m ? toModuleView(m) : undefined;
}

export function getModuleAliases(): Record<string, string[]> {
  return moduleAliases;
}

export interface ModuleStats {
  total: number;
  active: number;
  needsIntegration: number;
  planned: number;
  inactive: number;
  avgMaturity: number;
}

export function moduleStats(views: ModuleView[]): ModuleStats {
  const by = (s: ModuleStatus) => views.filter((m) => m.status === s).length;
  const avg =
    views.length === 0
      ? 0
      : Math.round(
          views.reduce((a, m) => a + m.integrationMaturity, 0) / views.length,
        );
  return {
    total: views.length,
    active: by("active"),
    needsIntegration: by("needs_integration"),
    planned: by("planned"),
    inactive: by("inactive"),
    avgMaturity: avg,
  };
}
