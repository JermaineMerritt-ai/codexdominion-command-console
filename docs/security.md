# Security

Security posture of the Command Console and the controls a pilot deployment
should enable. This is a living document — items marked **(planned)** are on the
Sprint 02 backlog.

## Authentication
- **Supabase Auth** scaffolding is in place (`lib/supabase/*`, `lib/auth/session.ts`).
- `middleware.ts` is a **no-op unless** `NEXT_PUBLIC_REQUIRE_AUTH=true` **and**
  Supabase env vars are present — then it refreshes the session and gates routes
  behind `/login`.
- Demo mode runs intentionally open (no PII, seed data only).
- **(planned)** `/login` flow and mapping of the Supabase auth user to an
  application `User` + role.

## Authorization (RBAC)
- Six roles: `administrator`, `compliance_officer`, `reviewer`, `auditor`,
  `executive`, `viewer`.
- The role→capability matrix is shown in the Users page and documented in
  [api.md](api.md).
- **(planned)** Server-side enforcement in every mutation (the UI matrix is
  presentation only and must not be trusted as the control).

## Multi-tenant isolation
- Every record carries `organizationId`.
- The SQL migration enables **row-level security** with org-scoped policies via
  `current_org_id()`, so tenants can only read/write their own data.

## Data protection
- **Secrets** live only in environment variables; `.env*` is git-ignored and
  `.env.example` documents the names. The service-role key is server-only and
  never exposed to the client.
- **PII minimization** is a governed policy in the product; demo data contains no
  real PII.
- **Data residency** is configurable per org (`us-east` / `us-gov` / `eu-west`).
- **(planned)** Encryption-at-rest is provided by Supabase Postgres; document
  KMS / key rotation for regulated pilots.

## Integrity & auditability
- `AuditEvent` and `EvidencePack` records are **hash-chained** (`hash` /
  `prevHash`), making tampering detectable.
- Evidence packs bundle decision history, approvals, policy checks, and audit
  events into a verifiable artifact.
- **(planned)** Cryptographic signing of exported packs.

## Application security
- **Strict TypeScript**, ESLint, and a CI gate (`typecheck` + `lint` + `build`).
- Next.js App Router with Server Components keeps data access on the server;
  the global search runs as a server action so the data layer is never shipped to
  the browser.
- React's default output encoding mitigates XSS; no `dangerouslySetInnerHTML`.
- **(planned)** Rate limiting and audit logging on mutation endpoints; CSP headers.

## Dependency hygiene
- `npm audit` is run during review; address criticals before pilot go-live.
- Renovate/Dependabot **(planned)** for continuous updates.

## Reporting
Report suspected vulnerabilities privately to the CodexDominion security contact
before public disclosure.
