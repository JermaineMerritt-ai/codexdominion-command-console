# AI Execution Plans

Execution Plans turn a single intent into a **multi-step, human-approved,
audited workflow** that orchestrates across modules. This is what makes
CodexDominion read as an *AI Governance Operating System* rather than a chatbot:

> **AI proposes. A human approves. The platform executes. Everything is audited.**

```
"Prepare for a FedRAMP assessment"
        │
        ▼  (deterministic plan builder — no LLM)
   Execution Plan ── steps · estimate · risk · modules
        │
        ▼  Human approval (RBAC: execute_plan)
   Execute each step → governed command → audit event
        │
        ▼
   Executive report  +  plan.executed audit (sealed)
```

## Flow

1. A prompt matching a plan template proposes an **ExecutionPlan** — it is *not*
   executed. The user sees steps, estimated time, risk level, and modules used.
2. The user can **edit** (include/exclude steps) and then **Approve & Execute**,
   or **Cancel**. Nothing runs without approval.
3. On approval, each step runs through the **existing governed command pipeline**
   (`executeCommand`) — so every step is permission-checked and individually
   audited (`command.executed`). Steps orchestrate across modules.
4. A final **report** step synthesizes the prior step outputs into an executive
   summary, and a **`plan.executed`** audit event seals the whole run.

## Plan templates

| Prompt | Plan | Modules |
| --- | --- | --- |
| "Prepare for a FedRAMP assessment" | FedRAMP Readiness | ComplianceFlow, control-plane, Vendors, Evidence |
| "Prepare for a HIPAA audit" | HIPAA Audit Prep | ComplianceFlow, control-plane, Vendors, Evidence |
| "Review contractor payment risks" | Contractor & Payment Risk | GCFI |
| "Review procurement posture" | Procurement Posture | Procurement |
| "Review AI governance posture" | AI Governance Posture | Decisions, Workflows |
| "Prepare an executive briefing" | Executive Briefing | Dashboard, Modules |
| "Prepare a pilot readiness report" | Pilot Readiness | control-plane, ComplianceFlow, GCFI, Evidence |

Templates live in `lib/execution/plans.ts`. Each step is a natural-language
command the engine already understands, so adding/editing a plan is data, not
code.

## Governance

- **RBAC:** executing a plan requires `execute_plan` (Administrator, Compliance
  Officer). A denied attempt records an `authorization.denied` audit event.
  Each step *also* enforces its own command permission (defense in depth).
- **Audit:** every executed step emits `command.executed`; the run emits
  `plan.executed`. The plan audit id is shown in the result ("sealed in audit
  trail").
- **Determinism:** plans are built deterministically (no LLM). A future LLM
  interpreter (Sprint 11+) can *propose* plans, but execution stays governed and
  deterministic.

## Source

- `lib/execution/types.ts` — ExecutionPlan / ExecutionStep / ExecutionRun
- `lib/execution/plans.ts` — templates + `buildExecutionPlan` (pure, client-safe)
- `lib/actions/execution.ts` — `executePlan` (RBAC + per-step run + plan audit)
- `components/command/execution-plan.tsx` — proposal + run UI
- `tests/execution.test.ts` — plan building, matching, RBAC
