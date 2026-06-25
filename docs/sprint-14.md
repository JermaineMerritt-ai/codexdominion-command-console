# Sprint 14 — BankTrust OS (first industry edition)

**Goal:** make BankTrust OS the **first industry edition** of CodexDominion — a
banking operating environment on the same governance platform — to lead the Jack
Henry / community-and-regional-banking conversation.

**Status:** ✅ Complete

> No paid AI APIs. Demo mode default and unchanged. Same governance engine;
> banking environment on top.

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | BankTrust OS module | flagship `banktrust-os` in the Module Registry (Financial Services, active, 90% integrated) with banking workflows, AI lending decisions, regulatory evidence, policies, audit, and risk items (SAR, OCC finding, vendor attestation, complaint, model review) |
| 2 | Banking edition page | `/banking` — 10 executive banking KPIs, banking command chips, regulators, evidence types, module link |
| 3 | Solutions nav | "Banking" under a new Solutions group |
| 4 | Banking plans | OCC examination · FFIEC readiness · Fair Lending evidence · BSA/AML posture — grounded in the org via the knowledge graph |
| 5 | Banking commands | tangible prompts that deep-link to the Command Workspace (`/command?q=…`, prefilled) and run through the governed pipeline |
| 6 | Tests | `tests/banking.test.ts` — module, edition KPIs, plan building, command resolution (**103 total passing**) |
| 7 | Docs | this file, `banktrust-os.md`, README, roadmap, pilot briefs |
| 8 | Quality gates | typecheck, test (103), lint, build all green |

## Verified live
- `/banking` renders: Loans Under Governance 1,248 · AI Decisions Reviewed 842 ·
  Compliance Readiness 74% · Open Regulatory Findings 2 · 10 KPIs total; banking
  command chips; regulators (OCC/FFIEC/BSA-AML/Fair Lending); module card.
- BankTrust OS appears in the Module Registry.
- "Prepare our OCC examination package" (deep-linked, prefilled) → proposes the
  **OCC Examination** plan, grounded in real banking context (SAR, OCC finding,
  vendor attestation) — human-approved, audited.

## Positioning
**CodexDominion BankTrust OS — The AI Governance Operating System for Community
and Regional Banking.** The same platform powers healthcare, government, and
other regulated industries through industry editions.

## Backlog (feedback-driven)
| Item |
| --- |
| Healthcare edition (ClinicalFlow) + Government edition as the next industry environments |
| Live core-banking / LOS binding for BankTrust OS (contract is ready) |
| Banking KPIs from live data; banking-specific knowledge entities |
| Claude planner (proposes banking plans over the knowledge graph; Codex validates) |
| SSO/Entra ID, SIEM export — if buyer conversations demand it |
