# Sprint 05 — AI Orchestration

**Goal:** make CodexDominion the **governed AI operating layer** — a provider
abstraction where CodexDominion orchestrates and governs every request, and AI
providers (Claude, ChatGPT, Copilot, …) are interchangeable execution assistants
that never bypass governance.

**Status:** ✅ Complete

> No paid AI APIs, no keys. Codex is the only connected provider; others are
> governed placeholders. Demo mode unchanged.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Provider abstraction | `lib/providers/{types,registry}.ts` — `Provider` contract with `available`/`connected`/`executeCommand` |
| 2 | Providers | Codex (active), Claude / ChatGPT / Copilot (preview, not connected), Research (not configured) |
| 3 | Orchestration | `executeCommand(prompt, providerId)` governs first (parse → RBAC → audit), then routes; Codex is always the governing layer |
| 4 | Not-connected handling | preview providers return a structured governed notice — request still parsed, RBAC-checked, and audited |
| 5 | New commands | prepare buyer demo summary, review system risk posture, recommend next governance action |
| 6 | Result format | added `commandId`, `provider`, `riskLevel`, `nextStep`, and a multi-step `plan` |
| 7 | Routing panel UI | provider selection with Active / Preview / Not-configured states; result shows provider + risk + command id + audit id |
| 8 | Command is home | `/` now redirects to `/command`; it is the primary interface, with Dashboard/Decisions/etc. as supporting views |
| 9 | Tests | `tests/providers.test.ts` — routing, fallback, not-connected response, serializable info, new commands (**37 total passing**) |
| 10 | Docs | this file, `ai-provider-routing.md`, updated `command-workspace.md`, README, roadmap |
| 11 | Quality gates | typecheck, test (37), lint, build all green |

## Verified live
- `/` → 307 → `/command` (Command is the home screen).
- Routing panel shows all 5 providers with correct statuses.
- "Review system risk posture" → "Overall posture: CRITICAL …" with risk level,
  next step, `CMD-…` and `AUD-…` ids, via Codex Engine.
- Selecting **Claude** then running a command → governed *not-connected* response
  ("CodexDominion governed this request and parsed the intent as …") with audit id.

## Architecture principle
> The LLM never executes anything. It only helps answer "what is the user
> asking?" Everything after that — RBAC, policy, audit, execution — stays
> deterministic and governed by CodexDominion.

## Backlog → Sprint 06 (proposed)
| Priority | Item |
| --- | --- |
| P1 | Real provider integration (Claude/ChatGPT) behind the same abstraction — LLM interpretation maps free-form language onto governed intents |
| P1 | Multi-step plan **execution** (run each planned intent through the governed pipeline) |
| P2 | Module Registry (ComplianceFlow, GrantOps, EscrowFlow, …) emitting the same governed artifacts |
| P2 | Live integration with `codex-control-plane` |
