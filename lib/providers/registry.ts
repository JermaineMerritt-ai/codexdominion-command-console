import { runQuery } from "@/lib/command/engine";
import type { Provider, ProviderInfo } from "./types";

/**
 * Codex Engine — CodexDominion's own deterministic provider. Always available
 * and connected; executes read/compute commands. (Governed mutations such as
 * evidence-pack generation are performed by the orchestrator itself.)
 */
export const codexProvider: Provider = {
  id: "codex",
  name: "Codex Engine",
  role: "Governance & deterministic execution",
  capabilities: ["Intent parsing", "RBAC", "Query", "Evidence", "Audit"],
  available: true,
  connected: true,
  async executeCommand(ctx) {
    return { handled: true, body: runQuery(ctx.parsed, ctx.data, ctx.now) };
  },
};

function placeholder(info: ProviderInfo): Provider {
  return {
    ...info,
    async executeCommand(ctx) {
      return {
        handled: false,
        notice: `${info.name} is not connected yet. CodexDominion governed this request and parsed the intent as "${ctx.parsed.label}". Connect ${info.name} to enable execution — governance, RBAC, and audit still apply.`,
      };
    },
  };
}

export const PROVIDERS: Provider[] = [
  codexProvider,
  placeholder({
    id: "claude",
    name: "Claude",
    role: "Implementation & generation",
    capabilities: ["Code generation", "Refactoring", "Test generation", "Drafting"],
    available: true,
    connected: false,
  }),
  placeholder({
    id: "chatgpt",
    name: "ChatGPT",
    role: "Architecture & strategy",
    capabilities: ["Architecture review", "Product strategy", "Documentation"],
    available: true,
    connected: false,
  }),
  placeholder({
    id: "copilot",
    name: "GitHub Copilot",
    role: "In-editor assistance",
    capabilities: ["Code completion", "Inline docs", "Small refactors"],
    available: true,
    connected: false,
  }),
  placeholder({
    id: "research",
    name: "Research Provider",
    role: "Research & retrieval",
    capabilities: ["Web research"],
    available: false,
    connected: false,
  }),
];

export function getProvider(id?: string): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? codexProvider;
}

/** Serializable provider metadata for the UI (no functions). */
export const PROVIDER_INFO: ProviderInfo[] = PROVIDERS.map(
  ({ id, name, role, capabilities, available, connected }) => ({
    id,
    name,
    role,
    capabilities,
    available,
    connected,
  }),
);
