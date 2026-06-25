# Sprint 04 — Command Workspace

**Goal:** turn the console from a click-through dashboard into the actual
CodexDominion operating interface — a **governed command workspace** where users
prompt the platform to query, explain, and initiate governance operations.

**Status:** ✅ Complete

> Deterministic engine — **no LLM, no API keys**. Every command is explainable,
> access-controlled, and audited.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | `/command` route | under `app/(console)/command/` |
| 2 | Navigation item | "Command" in the Overview group |
| 3 | Workspace UI | prompt input, suggested prompts, execution timeline, result panel, evidence/audit links |
| 4 | 7 supported commands | high-risk decisions, pending approvals, evidence-for-denied, expiring vendors, high-match opportunities, explain decision, audit events |
| 5 | Command engine | `parseCommand` (deterministic intent + entity extraction) → `runQuery` (pure result builders) |
| 6 | Structured result | intent, entities, summary, rows, recommendedActions, evidenceLinks, auditEventId |
| 7 | `command.executed` audit | every execution writes an audit event (entityType `command`, afterState = result, chained evidenceHash) |
| 8 | RBAC | queries open; evidence generation requires `generate_evidence_pack`; denials return forbidden + `authorization.denied` audit |
| 9 | Guardrails | unsupported commands return a clear message; never silently fail |
| 10 | Tests | `tests/command.test.ts` — parsing, entity extraction, RBAC, execution, unsupported handling |
| 11 | Docs | this file, `command-workspace.md`, README section |
| 12 | Quality gates | typecheck, test, lint, build all green |

## Product story (now complete)

```
Dashboard        = visibility
Actions          = operational control
RBAC             = authority
Command Workspace = governed AI interface
Audit Trail      = proof
```

## Design notes
- The engine reuses everything from Sprints 01–03: it calls the same repository
  queries and mutation layer, and enforces the same `can(role, action)` RBAC.
  The command bar is a new **surface** over governed operations — not a bypass.
- Evidence generation via command calls `generateEvidencePackRecord` (its own
  `evidence.generated` audit) **and** records a `command.executed` event.

## Backlog → Sprint 05 (proposed)
| Priority | Item |
| --- | --- |
| P1 | LLM interpretation layer mapping free-form language → these governed intents (pipeline unchanged) |
| P1 | More intents: transition workflow, publish policy, complete vendor review by command |
| P2 | Multi-step / chained commands with confirmation |
| P2 | Saved commands & scheduled command runs |
