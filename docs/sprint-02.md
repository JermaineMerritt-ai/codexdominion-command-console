# Sprint 02 — Live governance actions

**Goal:** turn the demo from read-only governance *visibility* into an
interactive operational *console* — without prioritizing auth and without
breaking the credential-free public demo.

**Status:** ✅ Complete

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Server actions | `lib/actions/governance.ts`: approve/deny decision, transition workflow, publish/archive policy, complete vendor review, generate evidence-pack record |
| 2 | Mutation layer | `lib/data/mutations.ts` (demo, in-memory) + `lib/data/mutations.prisma.ts` (transactional) behind one interface, mode-selected |
| 3 | Audit on every mutation | `buildAuditEvent` with actor, action, entityType, entityId, beforeState, afterState, timestamp, hash-chained evidenceHash |
| 4 | Demo persistence | `lib/data/demo-store.ts` — mutable in-memory store seeded from the typed seed layer; reflected by `revalidatePath` in the same invocation |
| 5 | Zod validation | `lib/governance/validation.ts` validates every action input |
| 6 | State machine | `lib/governance/transitions.ts` enforces valid workflow transitions |
| 7 | UI actions | Decision Approve/Deny, Workflow next-state, Policy Publish/Archive, Vendor Mark-reviewed, Evidence Save-as-record |
| 8 | Database mode | Prisma mutations wrap entity change + audit event in a transaction; `0002_audit_mutation_context.sql` adds the audit columns |
| 9 | Tests | `tests/governance.test.ts` (Node test runner): Zod validation, transition guards, hash generation, audit generation — **10 passing** |
| 10 | Docs | this file, `audit-events.md`, README mutation section |
| 11 | Quality gates | `typecheck`, `test`, `lint`, `build` all green; demo stays the zero-config default |

## Verified live (demo mode)
- Approving decision `DEC-2026-0481` flipped **Escalated → Approved** in the UI.
- A `decision.approved` audit event (actor *Jermaine Merritt*, before/after state,
  hash chain) appeared in **Settings → Audit Trail**.

## Design note — why demo mutations work on serverless
A client component calls a server action → the action mutates the in-memory
`demoStore` → `revalidatePath` re-renders the affected route **within the same
server invocation**, so the change is immediately visible. Cold starts reset to
seed, which is the desired behavior for a shared public demo.

## Definition of done (met)
- `NEXT_PUBLIC_APP_MODE=demo` remains the default; zero-config demo preserved.
- All seven mutations exist as validated server actions with audit events.
- Invalid workflow transitions are rejected (unit-tested + runtime-guarded).
- Database mode mutations are transactional.

## Backlog → Sprint 03 (proposed)

| Priority | Item |
| --- | --- |
| P0 | Supabase Auth login + map auth user → application role |
| P0 | Server-side RBAC enforcement (gate each action by role) |
| P1 | `useOptimistic` for instant UI on all actions |
| P1 | Real signed PDF/ZIP evidence export |
| P2 | Approval records (dual-approval flow) surfaced in UI |
| P2 | Notifications subsystem (table + delivery) |
