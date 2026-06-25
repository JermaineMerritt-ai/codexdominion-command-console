# Sprint 03 — Supabase Auth + server-side RBAC

**Goal:** make the operational console **procurement-safe and role-governed** —
answer "who is allowed to approve, deny, publish, or generate evidence?" —
without breaking the credential-free public demo.

**Status:** ✅ Complete

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Modes preserved | `APP_MODE=demo` and `REQUIRE_AUTH=false` remain defaults; public demo unchanged |
| 2 | Supabase Auth | `/login` page, sign-out action, session detection, middleware route protection (active only when `REQUIRE_AUTH=true`) |
| 3 | RBAC core | `lib/governance/rbac.ts` — 6 roles, `ACTION_ROLES` matrix, pure `can()` |
| 4 | Server-side enforcement | every governance action calls `authorize()` before mutating |
| 5 | Unauthorized handling | actions return a forbidden result; UI shows it; denied attempts audited as `authorization.denied` |
| 6 | Actor context | demo → seeded administrator; auth → Supabase session user mapped to app role (`lib/auth/actor.ts`) |
| 7 | UI | role-gated action controls, role badge in header, user menu with sign-out (auth mode) |
| 8 | Route-group refactor | console pages moved to `app/(console)/` so `/login` renders shell-free |
| 9 | Tests | `tests/rbac.test.ts` — permission matrix, denials, denied-attempt audit, demo-actor mutation (**19 total passing**) |
| 10 | Docs | this file, `rbac.md`, `auth.md`, README auth/RBAC section, deployment env vars |
| 11 | Quality gates | typecheck, test (19), lint, build all green |

## Permission matrix
See [rbac.md](rbac.md). Summary: Administrator (all); Compliance Officer (all
except none — full governance); Reviewer (approve/deny, vendor review); Auditor
(evidence packs); Executive & Viewer (read-only).

## Verified
- Demo mode: header shows **Administrator** badge; user menu shows role +
  "Demo session" (no sign-out). Approving a flagged decision succeeded under
  enforcement (Approved count 6→7) and the Approve control renders for the
  admin role on flagged decisions.
- Unit tests confirm non-permitted roles are rejected and denied attempts emit
  `authorization.denied` audit events.

## Design notes
- `can()` is shared by server (enforcement) and client (UI gating) so they can't
  drift. The server is authoritative; UI gating is convenience.
- Middleware **fails open** if `REQUIRE_AUTH=true` but Supabase isn't configured
  — set the keys to actually enforce (documented in `auth.md`).

## Backlog → Sprint 04 (proposed)
| Priority | Item |
| --- | --- |
| P1 | SSO (SAML/OIDC) + SCIM provisioning |
| P1 | Dual-approval / segregation-of-duties flow |
| P2 | Self-service password reset; per-org tenant switching |
| P2 | `useOptimistic` on all actions |
| Vision | Command Workspace (natural-language command bar) — see [roadmap.md](roadmap.md) |
