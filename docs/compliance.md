# Compliance & Governance Mapping

How the Command Console supports common AI-governance and regulatory frameworks.
This is positioning and capability mapping — **not** a certification claim.
Certifications (SOC 2, FedRAMP, etc.) are organizational programs; this tool
helps produce the evidence they require.

## Frameworks the console is designed to support

| Framework | How the console helps |
| --- | --- |
| **NIST AI RMF** | Govern/Map/Measure/Manage surfaced as workflows, risk assessments, policies, and audit trails |
| **SR 11-7 (Model Risk)** | Model validation, monitoring, and challenger checks tracked as policies + decisions; closeout evidence packs |
| **Fair Lending / ECOA** | Disparate-impact (adverse-impact ratio) and reason-code adequacy modeled as policy rules and decision outcomes |
| **GLBA / CCPA (Privacy)** | Consent and PII-minimization policies; privacy decisions logged with evidence |
| **HIPAA** | Vendor HIPAA status tracked; healthcare-tenant support |
| **FedRAMP / StateRAMP** | Control mapping for procurement readiness; vendor FedRAMP status; data-region residency |
| **EU AI Act (high-risk systems)** | Human-in-the-loop approvals, risk classification, record-keeping, and traceable evidence |

## Evidence the console produces
- **Decision records** — every automated AI decision with the governing policy
  rule, outcome, reviewer, rationale, and a tamper-evident evidence hash.
- **Approval trail** — who reviewed/approved/denied, when.
- **Audit log** — hash-chained system events (`prevHash → hash`).
- **Evidence packs** — sealed bundles of decisions + approvals + policy checks +
  audit events, exportable for examiners.
- **Audit-readiness score** — composite indicator of examination preparedness.

## Controls supporting compliance
- Role-based access control (six roles).
- Multi-tenant isolation via row-level security.
- Configurable governance controls: dual approval, auto-evidence on close,
  escalation thresholds, retention period, data residency.
- Vendor governance: SOC 2 / HIPAA / FedRAMP / insurance status + expirations.

## Retention
- Evidence retention is configurable (default **2555 days / ~7 years**) to meet
  financial-services record-keeping expectations.

## Gaps / roadmap
- Signed (cryptographically) evidence exports — **planned**.
- Automated continuous control monitoring + alerting — **planned (Phase 3)**.
- Pre-built examiner export templates per framework — **planned**.

See [roadmap.md](roadmap.md) and [security.md](security.md).
