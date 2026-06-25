# Data Model

The production data model is defined in [`prisma/schema.prisma`](../prisma/schema.prisma)
and provisioned in [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
The demo seed layer in `lib/data/seed.ts` mirrors the same shapes via `types/index.ts`.

## Entities

| Model | Purpose | Key relations |
| --- | --- | --- |
| **Organization** | Tenant (enterprise / healthcare / finance / government) | owns everything |
| **User** | Member with an RBAC role | → Organization |
| **Policy** | Versioned governance policy | → Organization, owner User |
| **Workflow** | Governance workflow with lifecycle state | → Organization, Decisions, WorkflowEvents |
| **WorkflowEvent** | Timeline entry for a workflow transition | → Workflow |
| **Decision** | A governed AI decision + evidence hash | → Workflow, reviewer User |
| **Approval** | Human approval record for a decision | → Decision, reviewer User |
| **EvidencePack** | Sealed, hash-chained bundle of decisions | → Organization, responsible User |
| **AuditEvent** | Tamper-evident, hash-chained system event | → Organization, actor User |
| **Vendor** | Third party with risk + certification status | → Organization, owner User |
| **ProcurementOpportunity** | Pipeline opportunity with controls & gaps | → Organization |
| **RiskAssessment** | Weighted risk score for a subject | → Vendor (optional) |
| **OrganizationSettings** | Per-org governance configuration | → Organization (1:1) |

## Enumerations

`RiskLevel` · `PolicyStatus` · `WorkflowState` · `DecisionOutcome` ·
`ApprovalStatus` · `ComplianceState` · `VendorStatus` · `OpportunityStatus` ·
`PackStatus` · `UserRole` — all defined as Postgres enums and Prisma enums.

## Hash chaining

`AuditEvent` and `EvidencePack` carry `hash` / `prevHash` fields. Each audit
event references the prior event's hash, forming a tamper-evident chain that
underpins the **Audit Readiness** score and examination evidence packs.

## Switching from seed to database

1. Set `DATABASE_URL` / `DIRECT_URL` (Supabase pooled + direct).
2. `npm run prisma:generate && npm run prisma:migrate`.
3. Reimplement the accessors in `lib/data/queries.ts` against the Prisma client
   (the function signatures are the contract the UI depends on).

No page or component changes are required — the UI depends only on `queries.ts`.
