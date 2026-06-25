# Roadmap

## ✅ Phase 1 — Console foundation (shipped)
- Executive dashboard: metrics, charts, audit-readiness, live widgets
- Policy Decision Center with expandable enterprise data table
- Governance workflows with stepper + timeline
- Policy management (publish / draft / archive)
- Evidence-pack generator with hash sealing + JSON export
- Vendor governance grid with certification + expiration warnings
- Procurement readiness + per-opportunity detail pages
- RBAC user management with permissions matrix
- Settings + tamper-evident audit trail
- Global search, notifications, dark mode, responsive, a11y states
- Prisma schema + Supabase migration + RLS + auth scaffolding

## 🔜 Phase 2 — Live backend
- Implement `lib/data/queries.ts` against Prisma
- Route Handlers + Server Actions (see [api.md](api.md))
- Supabase Auth login flow + role provisioning
- Real evidence-pack export to PDF and ZIP (signed artifacts)
- Server-side enforcement of the role → capability matrix

## 🧭 Phase 3 — Intelligence
- Continuous model-drift and disparate-impact monitoring jobs
- Automated risk scoring for vendors and AI systems
- Policy-as-code rule engine with versioned rule evaluation
- SAM.gov / opportunity ingestion for procurement
- Notification delivery (email / Slack / webhook)

## 🏛 Phase 4 — Enterprise & compliance
- SSO (SAML / OIDC) and SCIM provisioning
- FedRAMP / StateRAMP control mapping and continuous evidence
- Configurable approval chains and segregation-of-duties rules
- Multi-org consolidated reporting for examiners
- Exportable examination packages aligned to SR 11-7 / NIST AI RMF
