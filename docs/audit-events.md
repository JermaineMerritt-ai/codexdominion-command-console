# Audit Events

Every governance mutation in the Command Console writes a **tamper-evident,
hash-chained audit event**. This is the spine of the product's examination story.

## Event shape

Each event (`AuditEvent` in `types/index.ts`) carries:

| Field | Description |
| --- | --- |
| `id` | Derived from the evidence hash (`AUD-…`) |
| `type` | Domain event type (e.g. `decision.approved`, `workflow.transitioned`) |
| `action` | The mutation performed (e.g. `approve_decision`) |
| `actorId` | The user who performed it |
| `entityType` | `decision` \| `workflow` \| `policy` \| `vendor` \| `evidence_pack` |
| `entityId` | The affected record |
| `beforeState` | Field values **before** the change |
| `afterState` | Field values **after** the change |
| `summary` | Human-readable description |
| `at` | ISO timestamp |
| `prevHash` | Hash of the previous event (chain link) |
| `hash` / `evidenceHash` | SHA-256 over `{prevHash, action, entity, actor, before, after, at}` |

## Hash chaining

```
event[n].evidenceHash = sha256( event[n].prevHash + payload[n] )
event[n].prevHash     = event[n-1].hash
```

Because each event's hash incorporates the previous hash plus its full mutation
context, **any insertion, reordering, or edit breaks the chain** and is
detectable. The hash is deterministic, so an examiner can independently
recompute and verify it. See `lib/governance/audit.ts` and the tests in
`tests/governance.test.ts`.

## Actions that emit events

| Action | `type` | Entity |
| --- | --- | --- |
| Approve decision | `decision.approved` | decision |
| Deny decision | `decision.denied` | decision |
| Transition workflow | `workflow.transitioned` | workflow |
| Publish policy | `policy.published` | policy |
| Archive policy | `policy.archived` | policy |
| Complete vendor review | `vendor.reviewed` | vendor |
| Generate evidence pack | `evidence.generated` | evidence_pack |

## Where events are created

- **Demo mode:** `lib/data/mutations.ts` appends to the in-memory store
  (`demoStore.auditEvents`) via `buildAuditEvent`.
- **Database mode:** `lib/data/mutations.prisma.ts` writes the event **inside the
  same Prisma transaction** as the entity change, so the mutation and its audit
  record commit atomically (or roll back together).

## Where events are shown

The **Settings → Audit Trail** panel renders the chain newest-first with the
`prevHash → hash` link displayed for each event. The **Audit Readiness** score
on the dashboard is derived from the current governance state.

## Integrity guarantees & limits

- ✅ Deterministic, recomputable hashes.
- ✅ Atomic write with the mutation (database mode).
- ⚠️ Demo mode stores events in memory; a cold start resets them (intended for a
  shared public demo).
- 🔜 Cryptographic signing of exported evidence packs (roadmap).
