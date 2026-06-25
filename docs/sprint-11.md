# Sprint 11 — Organization Knowledge Graph

**Goal:** establish a **governed organizational knowledge graph** so the platform
understands *what it knows* — then ground execution plans in that context.
Establish governed understanding **before** adding an LLM, so AI later reasons
over governed context instead of raw prompts.

**Status:** ✅ Complete

> No paid AI APIs. Demo mode default and unchanged.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Knowledge model | nodes (11 types) + edges (8 relations) + gaps (`lib/knowledge/types.ts`) |
| 2 | Graph builder | `buildKnowledgeGraph` (pure) assembles nodes/edges/gaps + sample chains |
| 3 | Gap detection | expiring certifications, missing evidence, unreviewed decisions, integration gaps, open risks — sorted by severity |
| 4 | Server accessor | `getKnowledgeGraph` assembles from policies/vendors/decisions/evidence/audit/workflows/opportunities/users/modules |
| 5 | `/knowledge` page | entity counts, relationship count, sample relationship chains, prioritized gaps; nav item "Knowledge" |
| 6 | Context-aware plans | `proposePlan` grounds each plan via `planContext(graph, intent)`; proposal card shows "Based on your organization" |
| 7 | Command | "Show organization knowledge graph" → governed summary + audit |
| 8 | Tests | `tests/knowledge.test.ts` — graph construction, AI-system de-dup, gap kinds, sort order, plan context, full-graph integration (**86 total passing**) |
| 9 | Docs | this file, `knowledge-graph.md`, README, roadmap |
| 10 | Quality gates | typecheck, test (86), lint, build all green |

## Verified live
- `/knowledge` → 77 entities, 128 relationships, 13 gaps, 6 AI systems; entity
  breakdown; real relationship chains
  (`DEC-2026-0481 → belongs_to → Business Lending → produced_by → CreditScore-X v4`).
- "Prepare for a FedRAMP assessment" plan proposal shows **Based on your
  organization**: codex-procurement-network (2 open risk flags, FedRAMP pending,
  Critical), GCFI (3 open risk flags, payment dual-approval, Critical), etc.

## Differentiator
> "How does the AI know our business?" → "CodexDominion maintains a governed
> organizational knowledge graph built from your policies, contracts, evidence,
> workflows, vendors, decisions, and modules." Providers sit **on top of**
> governed context, not raw prompts.

## Revised roadmap (per Product Owner)
| Sprint | Goal |
| --- | --- |
| ✅ 1–11 | Governance foundation + Knowledge Graph |
| 12 | Claude integration (planner only — proposes plans over the graph) |
| 13 | ChatGPT integration (strategy / document generation) |
| 14 | Microsoft 365 Copilot integration |
| 15 | Cross-module autonomous workflows |
| 16 | SDK + Marketplace |
