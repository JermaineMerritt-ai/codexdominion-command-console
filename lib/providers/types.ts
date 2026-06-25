import type { CommandData, CommandResultBody } from "@/lib/command/engine";
import type { ParsedCommand } from "@/lib/command/intents";

/**
 * A provider is an execution assistant. CodexDominion always governs the
 * request first (parse → RBAC → audit); a provider only helps interpret or
 * execute. Providers never bypass governance.
 */
export interface ProviderInfo {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  /** Shown and selectable in the routing panel. */
  available: boolean;
  /** Can actually execute today (vs. preview/not-connected). */
  connected: boolean;
}

export interface ProviderContext {
  parsed: ParsedCommand;
  data: CommandData;
  now: Date;
}

export interface ProviderExecution {
  handled: boolean;
  body?: CommandResultBody;
  notice?: string;
}

export interface Provider extends ProviderInfo {
  executeCommand(ctx: ProviderContext): Promise<ProviderExecution>;
}
