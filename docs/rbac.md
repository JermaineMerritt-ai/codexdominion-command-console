# Role-Based Access Control (RBAC)

The Command Console enforces permissions **server-side** on every governance
action. The UI additionally hides or disables controls a role cannot use, but
the server is the source of truth — a forged client request is still rejected
and audited.

## Roles

| Role | Intent |
| --- | --- |
| **Administrator** | Full governance authority |
| **Compliance Officer** | Owns policy + workflow governance |
| **Reviewer** | Reviews decisions and vendors |
| **Auditor** | Produces examination evidence |
| **Executive** | Read-only oversight |
| **Viewer** | Read-only |

## Permission matrix

| Action | Administrator | Compliance Officer | Reviewer | Auditor | Executive | Viewer |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Approve decision | ✅ | ✅ | ✅ | — | — | — |
| Deny decision | ✅ | ✅ | ✅ | — | — | — |
| Transition workflow | ✅ | ✅ | — | — | — | — |
| Publish policy | ✅ | ✅ | — | — | — | — |
| Archive policy | ✅ | ✅ | — | — | — | — |
| Complete vendor review | ✅ | ✅ | ✅ | — | — | — |
| Generate evidence pack | ✅ | ✅ | — | ✅ | — | — |

The matrix lives in [`lib/governance/rbac.ts`](../lib/governance/rbac.ts)
(`ACTION_ROLES`) and is unit-tested in `tests/rbac.test.ts`.

## Enforcement flow

```
Client action component (hides/disables by can(role, action))
   │  server action call
   ▼
lib/actions/governance.ts → authorize(action, entity)
   │   getCurrentActor()  → resolves role (demo: admin; auth: session user)
   │   can(role, action)?
   ├─ yes → run mutation (+ success audit event)
   └─ no  → write `authorization.denied` audit event, return { ok:false, error }
```

- **`can(role, action)`** is a pure function shared by the server (enforcement)
  and the client (UI gating), so they never drift.
- **Denied attempts are audited** as `authorization.denied` with the actor,
  attempted action, and target — the audit trail records *attempts*, not just
  successes.

## Actor resolution

- **Demo / no-auth (`NEXT_PUBLIC_REQUIRE_AUTH=false`)** — the actor is the
  seeded organization administrator (Jermaine Merritt), so the public demo can
  exercise every action.
- **Auth mode (`=true`)** — the actor is the Supabase session user matched to an
  application `User` by email; unmatched authenticated users get least-privilege
  `viewer`. See [auth.md](auth.md).

## UI behavior

- Controls a role cannot use are hidden or replaced with a short note
  ("Your role cannot …").
- The current role is shown as a badge in the header and in the user menu.
