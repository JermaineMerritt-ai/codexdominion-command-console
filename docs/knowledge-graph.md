# Organization Knowledge Graph

CodexDominion maintains a **governed organizational knowledge graph** built from
your policies, contracts, evidence, workflows, vendors, decisions, modules,
opportunities, and AI systems — and the relationships between them. This is the
answer to *"How does the AI know our business?"* — not "we uploaded documents,"
but a governed graph the platform reasons over.

## Why it matters

Execution plans no longer run generic templates — they are **grounded in your
organization**. "Prepare for our FedRAMP review" surfaces *your* expiring vendor
certifications, *your* uncovered denied decisions, and *your* open module risks,
before any step runs.

## Model

| Node types | Edge relations |
| --- | --- |
| organization, policy, vendor, decision, evidence, audit_event, workflow, module, opportunity, ai_system, user | belongs_to, produced_by, reviewed_by, owned_by, covers, records, governs, part_of |

Defined in `lib/knowledge/types.ts`; built by `buildKnowledgeGraph` (pure) in
`lib/knowledge/graph.ts`; assembled from all data sources by `getKnowledgeGraph`
(`lib/knowledge/registry.ts`).

## Knowledge gaps (the governed "what's missing / at risk")

The graph computes actionable gaps:

| Kind | Example |
| --- | --- |
| `expiring_certification` | "VeriDesk: lapsed certification — Insurance expired" |
| `missing_evidence` | "Missing evidence for DEC-2026-0477 — denied decision not covered by any evidence pack" |
| `unreviewed_decision` | "Unreviewed decision DEC-2026-0476 — no assigned reviewer" |
| `integration_gap` | "ClinicalFlow: integration gap — implement audit + evidence endpoints" |
| `open_risk` | "GCFI: 3 open risk flags — payment authorization missing dual approval" |

Gaps are sorted most-severe first.

## Surfaces

- **`/knowledge`** — entity counts, relationship count, sample relationship
  chains, and the prioritized gap list.
- **Execution plans** — `proposePlan` grounds each plan in `planContext(graph,
  intent)`; the proposal card shows a **"Based on your organization"** section
  with the specific entities/risks the plan addresses.
- **Command** — "Show organization knowledge graph" returns a governed summary
  (entities, relationships, top gaps) and writes a `command.executed` audit.

## Roadmap fit

This is the layer the AI providers sit **on top of**. In Sprint 12+, an LLM
receives this **structured governed context** from CodexDominion and proposes
plans over it — better plans, more relevant outputs, and CodexDominion remains
the authority over the organization's knowledge and governance.

```
Knowledge Graph → Execution Planner → (LLM, later) → Plan → Codex validates → Human approves → Execute → Audit
```
