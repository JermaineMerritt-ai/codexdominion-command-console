# API & Server Actions

The console reads through a single accessor module, `lib/data/queries.ts`, which
is the contract between the UI and the data source (seed today, Prisma in
production). This document describes that contract and the REST / Server Action
surface to implement for a live backend.

## Query accessors (current contract)

| Function | Returns |
| --- | --- |
| `getActiveOrganization()` | the current tenant |
| `getUser(id)` / `getUserName(id)` / `getUsers()` | user lookups |
| `getPolicies()` / `getPolicy(id)` | policies |
| `getWorkflows()` / `getWorkflow(id)` | workflows (newest first) |
| `getDecisions()` / `getDecision(id)` | decisions (newest first) |
| `getEvidencePacks()` / `getEvidencePack(id)` | evidence packs |
| `getVendors()` | vendors (riskiest first) |
| `getOpportunities()` / `getOpportunity(id)` | procurement opportunities |
| `getAuditEvents()` | hash-chained audit log |
| `getNotifications()` | notification center feed |
| `getRiskAssessments()` | weighted risk assessments |
| `getDashboardMetrics()` | executive KPI tile values |
| `getAuditReadinessScore()` | composite 0–100 readiness score |
| `getComplianceStatus()` | per-framework compliance rollup |
| `globalSearch(query)` | cross-entity search results |

## REST endpoints to implement (production)

Recommended Route Handlers under `app/api/`:

```
GET    /api/policies            list policies
POST   /api/policies            create policy
PATCH  /api/policies/:id        update / publish / archive

GET    /api/decisions           list decisions (filter, paginate)
GET    /api/decisions/:id       decision detail + approvals

POST   /api/approvals           grant / reject an approval
PATCH  /api/workflows/:id       transition workflow state

POST   /api/evidence            generate an evidence pack
GET    /api/evidence/:id        fetch pack (JSON)

GET    /api/vendors             list vendors
PATCH  /api/vendors/:id         update review / approval

GET    /api/procurement         list opportunities
GET    /api/procurement/:id     opportunity detail

GET    /api/audit               audit trail (hash-chained)
GET    /api/users               members + roles
PATCH  /api/users/:id           change role / status
```

## Server Actions

Mutations are best modeled as Server Actions colocated with features:

```ts
"use server";
export async function generateEvidencePack(input: GeneratePackInput) { … }
export async function transitionWorkflow(id: string, to: WorkflowState) { … }
export async function publishPolicy(id: string) { … }
export async function recordApproval(input: ApprovalInput) { … }
```

Each mutation should (1) authorize via the caller's role, (2) write through
Prisma, and (3) append an `AuditEvent` to maintain the hash chain.

## Authorization

Role → capability mapping is enforced in the UI (`app/users/page.tsx` matrix)
and must be re-checked server-side in every mutation. Roles:
`administrator`, `compliance_officer`, `reviewer`, `auditor`, `executive`, `viewer`.
