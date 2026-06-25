# CodexDominion BankTrust OS

**The AI Governance Operating System for community & regional banking** — the
**first industry edition** of CodexDominion. It is **not** "another module"; it
is a banking operating environment built on the same governance platform.

```
CodexDominion Command Console        ← the platform (governance engine)
├── ComplianceFlow
├── GCFI
├── ClinicalFlow
├── Procurement Network
└── BankTrust OS                     ← the banking edition (this doc)
     ├── Lending Governance     ├── BSA/AML
     ├── Deposit Operations     ├── AI Model Governance
     ├── Fraud Review           ├── Consumer Complaints
     ├── Vendor / Third-Party Risk  ├── Internal Audit
     └── Regulatory Evidence
```

## The Jack Henry story

CodexDominion is the governance platform; BankTrust OS is the banking operating
environment built on it. The same engine powers healthcare, government, and other
regulated industries through industry-specific editions. That scales far better
than presenting a standalone banking product.

## What it adds

| Surface | Where |
| --- | --- |
| **Banking edition page** | `/banking` — executive KPIs, banking commands, regulators, evidence types, module link |
| **BankTrust OS module** | flagship entry in the Module Registry (`banktrust-os`), Financial Services, active |
| **Banking execution plans** | OCC examination · FFIEC readiness · Fair Lending evidence · BSA/AML posture |
| **Nav** | "Solutions → Banking" group |

## Executive KPIs (`/banking`)

Loans Under Governance · AI Decisions Reviewed · High-Risk Lending Decisions ·
Fraud Cases · Vendor Risk Score · Compliance Readiness · Consumer Complaints ·
Open Regulatory Findings · Audit Readiness · AI Models Governed. Derived from the
BankTrust OS module + portfolio headline figures (`lib/banking/edition.ts`).

## Banking commands

Tangible prompts that run through the **same governed pipeline** (parse → RBAC →
execute → audit). Banking chips deep-link to the Command Workspace
(`/command?q=…`, prefilled):

- "Prepare our OCC examination package" → **OCC Examination** plan
- "Generate an FFIEC readiness report" → **FFIEC Readiness** plan
- "Generate Fair Lending evidence" → **Fair Lending Evidence** plan
- "Prepare BSA/AML audit evidence" → **BSA/AML Posture** plan
- "Show high-risk decisions" / "Show vendors with expiring certifications" /
  "Show highest risk module" / "Show organization knowledge graph"

## Organization-specific plans

"Prepare our OCC examination package" proposes a plan **grounded in the bank's
actual posture** (via the knowledge graph): SAR pending review, open OCC finding,
expiring vendor attestation, lending model lacking review, unresolved consumer
complaint, high-risk lending decisions — then gathers regulatory evidence, all
human-approved and audited.

## Regulators & evidence

Evidence packs for **OCC, FDIC, Federal Reserve, FFIEC, CFPB, BSA/AML, Fair
Lending (ECOA), Model Risk (SR 11-7), Vendor Management**.

## Positioning

> **CodexDominion BankTrust OS — The AI Governance Operating System for Community
> and Regional Banking.**

## Source
- `lib/banking/edition.ts` — KPIs, regulations, evidence types, commands
- `lib/data/modules.ts` — BankTrust OS module (banking workflows/decisions/
  evidence/policies/risk)
- `lib/execution/plans.ts` — banking plan templates
- `app/(console)/banking/page.tsx` — the edition page
- `tests/banking.test.ts` — module, edition, plans, command resolution
