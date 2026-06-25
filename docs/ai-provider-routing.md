# AI Provider Routing

CodexDominion is an **orchestration layer**, not an AI wrapper. Every request is
governed by CodexDominion first; AI providers are interchangeable **execution
assistants** that never bypass governance.

```
                    USER
                      │
                      ▼
            Command Workspace (/command)
                      │
                      ▼
            Codex Intent Router          ← always runs (deterministic)
                      │
              RBAC Validation            ← CodexDominion
                      │
              Audit Creation             ← CodexDominion
                      │
              Provider Routing
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Codex Engine   Claude/ChatGPT   (future providers)
   (connected)    /Copilot (preview)
        │
   Governance Execution → Decisions · Evidence · Workflows
```

**The provider never executes anything ungoverned.** Parsing, RBAC, and audit
all happen in CodexDominion *before* a provider is invoked. A provider only helps
interpret intent or generate/execute content.

## Provider model

`lib/providers/types.ts` defines the contract:

```ts
interface Provider {
  id; name; role; capabilities: string[];
  available;   // shown & selectable in the routing panel
  connected;   // can actually execute today (vs. preview)
  executeCommand(ctx): Promise<{ handled; body?; notice? }>;
}
```

| Provider | Role | Status |
| --- | --- | --- |
| **Codex Engine** | Governance & deterministic execution | **Active** (connected) |
| Claude | Implementation & generation | Preview (not connected) |
| ChatGPT | Architecture & strategy | Preview (not connected) |
| GitHub Copilot | In-editor assistance | Preview (not connected) |
| Research Provider | Research & retrieval | Not configured |

Registry: `lib/providers/registry.ts`. Only **Codex** is connected today; the
others return a structured *not-connected* response that still shows the governed
intent CodexDominion parsed. Selecting a provider never changes whether the
request is governed — only *who helps* execute.

## Routing flow (server action)

`lib/actions/command.ts` → `executeCommand(prompt, providerId)`:

1. **Parse** with the deterministic intent router (always Codex).
2. **RBAC** — privileged intents require a permission; denial → forbidden +
   `authorization.denied` audit.
3. **Route**:
   - Provider **not connected** → governed + audited, returns the not-connected
     notice (no execution).
   - **Codex** → executes (query, or governed evidence mutation).
4. **Audit** `command.executed` with the provider recorded in `afterState`.
5. Return a structured result (`commandId`, `provider`, `riskLevel`, `nextStep`, …).

## Why this matters

Customers interact with **CodexDominion**; external AI providers are replaceable
components behind the governed pipeline. The platform's identity isn't tied to any
single AI vendor, and every prompt is evaluated, permission-checked, and audited
before anything leaves the environment.

## Adding a real provider (future)

Implement `Provider.executeCommand` to call the vendor API, set `connected: true`,
and supply credentials via env. **No changes** to the orchestrator, RBAC, or audit
layers are required — that's the point of the abstraction. The deterministic Codex
engine remains the safe execution core; a provider's LLM only maps free-form
language onto the same governed intents. See [command-workspace.md](command-workspace.md).
