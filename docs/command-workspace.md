# Command Workspace

The Command Workspace (`/command`) is the **primary interface** for CodexDominion
(`/` redirects here) — a **governed command interface** where users describe what
they want in natural language, and CodexDominion translates it into controlled,
auditable governance operations, then routes execution to a selected
[AI provider](ai-provider-routing.md).

> This is **not** a chatbot. It is a deterministic command engine: no LLM, no API
> keys. Every interpretation is explainable, every execution is access-controlled
> and audited.

## Pipeline

```
prompt
  → parseCommand()        deterministic intent + entity extraction
  → RBAC: can(role, …)    privileged commands require a permission
  → run query / mutation  via the existing repository + mutation layer
  → audit: command.executed (or authorization.denied)
  → structured result     summary · rows · recommendedActions · evidenceLinks · auditEventId
```

## Supported commands

| Prompt (examples) | Intent | Permission |
| --- | --- | --- |
| "Show high-risk decisions" | `show_high_risk_decisions` | query (any role) |
| "Show pending approvals" | `show_pending_approvals` | query |
| "Show vendors with expiring certifications" | `show_expiring_vendors` | query |
| "Show procurement opportunities with high match scores" | `show_high_match_opportunities` | query |
| "Explain why decision DEC-2026-0480 was denied" | `explain_decision` | query |
| "Show audit events for DEC-2026-0480" | `show_audit_events` | query |
| "Prepare a buyer demo summary" | `prepare_buyer_demo_summary` | query |
| "Review system risk posture" | `review_system_risk_posture` | query |
| "Recommend next governance action" | `recommend_next_governance_action` | query |
| "Generate evidence pack for denied decisions" | `generate_evidence_for_denied` | `generate_evidence_pack` |

Unrecognized prompts return a clear "unsupported" message — the engine never
guesses or silently fails.

## RBAC

Queries are open to any authenticated role. The only privileged command is
**generating an evidence pack**, which requires the `generate_evidence_pack`
permission (Administrator, Compliance Officer, Auditor). A blocked command
returns a forbidden message **and** records an `authorization.denied` audit
event. This satisfies the role expectations: Viewer = query only; Reviewer =
query; Auditor = query + evidence; Compliance Officer / Administrator = all.

See [rbac.md](rbac.md).

## Result shape

```ts
interface CommandResult {
  ok: boolean;
  intent: string;
  intentLabel: string;
  entities: Record<string, string>;
  summary: string;
  rows: { id; title; subtitle; badge?; href? }[];
  recommendedActions: string[];
  evidenceLinks: { label; href }[];
  auditEventId: string | null;
  error?: string;
}
```

## Audit

Every recognized execution writes a `command.executed` audit event:
`entityType: "command"`, `beforeState: null`, `afterState` = the parsed command
result, with an `evidenceHash` derived from the command + result (chained to the
previous hash). The returned `auditEventId` is shown in the UI and links the
command to the audit trail. Denied commands write `authorization.denied`.

## UI

- Prompt bar + suggested prompts (one per supported intent).
- Result panel: summary, result rows (linked to the relevant page), recommended
  actions, evidence links, and the audit-event id.
- Execution timeline: every command run this session with status and audit id.

## Source

- `lib/command/intents.ts` — intent definitions + `parseCommand`
- `lib/command/engine.ts` — pure query/result builders
- `lib/actions/command.ts` — server action (RBAC + execution + audit)
- `components/command/command-workspace.tsx` — UI
- `tests/command.test.ts` — parsing, execution, RBAC, unsupported handling

## Roadmap
Today the engine is deterministic. A future iteration can add an LLM
**interpretation layer** that maps free-form language onto these same governed
intents — the governance pipeline (RBAC, execution, audit) stays unchanged.
See [roadmap.md](roadmap.md).
