# Sprint 10 — AI Execution Plans

**Goal:** make the platform demonstrably **autonomous** — AI proposes a
multi-step plan, a human approves, the platform executes across modules, and
everything is audited. Move from "ask AI" to "AI proposes, human approves,
platform executes."

**Status:** ✅ Complete

> Still deterministic — no paid AI APIs. Demo mode default and unchanged.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Execution model | `ExecutionPlan` / `ExecutionStep` / `ExecutionRun` + statuses (`lib/execution/types.ts`) |
| 2 | Plan templates | 7 plans (`lib/execution/plans.ts`), each a sequence of governed command prompts ending in a report; `buildExecutionPlan` is pure + client-safe |
| 3 | Human approval | plan is proposed (not executed); user edits (include/exclude steps) then **Approve & Execute** or Cancel |
| 4 | Governed execution | `executePlan` runs each step via the existing command pipeline (per-step `command.executed` audit) + a `plan.executed` audit sealing the run |
| 5 | Module orchestration | steps span ComplianceFlow, control-plane, GCFI, Evidence, Decisions, Vendors, Procurement |
| 6 | RBAC | `execute_plan` (Administrator, Compliance Officer); denied attempts audited; each step also enforces its own permission |
| 7 | Audit | new `plan.executed` event type + `execution_plan` entity; `recordPlanExecuted` (demo + Prisma) |
| 8 | UI | Execution Plans chip group, proposal card (steps, estimate, risk, modules), run card (per-step status, duration, audit ids, sealed plan audit) |
| 9 | Tests | `tests/execution.test.ts` — plan building, template matching, report step, RBAC (**79 total passing**) |
| 10 | Docs | this file, `execution-plans.md`, README, roadmap |
| 11 | Quality gates | typecheck, test (79), lint, build all green |

## Verified live
- "Prepare for a FedRAMP assessment" → proposes a plan (~12 min, 6 steps,
  ComplianceFlow/control-plane/Vendors/Evidence).
- **Approve & Execute** → "Completed 6 of 6 steps", each step audited, plan
  sealed in the audit trail ("sealed in audit trail: AUD-…").

## Why it matters
Regulated buyers expect exactly this shape: **AI proposes → human approves →
platform executes → audit proves it.** The console now demonstrates governed
autonomy across modules, not a chatbot.

## Backlog → Sprint 11+ (proposed)
| Sprint | Item |
| --- | --- |
| 11 | Real Claude API (LLM **proposes** plans; execution stays deterministic/governed) |
| 12 | Real ChatGPT API behind the provider abstraction |
| 13 | Microsoft 365 Copilot (document/report generation) |
| 14 | Cross-module autonomous workflows (conditional steps, retries) |
| 15 | Marketplace / SDK for third-party governed modules |
