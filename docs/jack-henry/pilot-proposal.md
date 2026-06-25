# Pilot Proposal — BankTrust OS for Community & Regional Banks

**Prepared by:** Jermaine Merritt · CodexDominion (The Merritt Methods LLC)
**For:** A community or regional bank (introduced via / co-selected with Jack Henry)
**Engagement:** 30–60 day governed AI pilot, single workflow

---

## 1 · Objective

Prove, on the institution's own terms, that AI-assisted work can be **governed,
human-approved, and examiner-provable** — without replacing any existing system.
At the end of the pilot the institution has a working governance layer over one
real workflow and an audit-ready evidence pack to show leadership and examiners.

## 2 · Scope (pick ONE workflow)

| Option | What we govern | Primary regulators |
| --- | --- | --- |
| **A. AI-assisted lending oversight** | High-risk / AI-influenced credit decisions, reviewer sign-off, fair-lending checks | OCC/FDIC/Fed, CFPB, Fair Lending, SR 11-7 |
| **B. BSA/AML case & SAR governance** | Alert→case→SAR workflow, approvals, deadlines | FinCEN/BSA-AML, FFIEC |
| **C. Vendor / third-party risk** | Attestations, certifications, expiry, concentration | FFIEC vendor management |

One workflow only — depth over breadth. The other two remain available to expand
into after the pilot.

## 3 · What the bank gets

- A configured **BankTrust OS** environment for the chosen workflow.
- **Governed execution plans** (e.g. "Prepare our OCC examination package") that
  propose → require human approval → execute → audit every step.
- **Role-based authority** (e.g. lender vs. compliance vs. auditor) enforced
  server-side.
- A **tamper-evident, hash-chained audit trail** and on-demand **evidence packs**.
- An **executive readiness view** (compliance readiness, open findings, audit
  readiness).
- A **closeout report** mapping what was governed to the relevant regulatory
  expectations.

## 4 · How it fits existing systems

BankTrust OS sits **alongside** the bank's core, LOS, and BSA/AML tooling via a
standard **Integration Contract**. The pilot can run two ways:
1. **Representative-data mode** — start immediately on a faithful sample (no
   integration work); fastest path to a working demo with the bank's own scenarios.
2. **Bound mode** — connect one real data source via the contract for live
   governance.

Most pilots start in representative-data mode and bind one source by week 2–3.

## 5 · Timeline (30–60 days)

| Phase | Days | Activities |
| --- | --- | --- |
| **Kickoff & scope** | 1–5 | Pick workflow, roles, success metrics; stand up environment |
| **Configure & seed** | 6–15 | Load representative data; configure policies, approvals, RBAC |
| **Bind (optional)** | 16–25 | Connect one real source via Integration Contract |
| **Govern live** | 20–45 | Bank runs the workflow through BankTrust OS; decisions/evidence accrue |
| **Evidence & review** | 45–60 | Generate examination pack; closeout report & expansion plan |

## 6 · Success metrics (agreed at kickoff)

- 100% of in-scope decisions captured with reviewer + policy + evidence hash.
- An examination/evidence pack generated **on demand** for the workflow.
- Audit chain **verifies** (no broken links).
- Time-to-evidence reduced vs. the current spreadsheet/screenshot process
  (baseline captured at kickoff).
- Compliance-team confidence rating (pre/post survey).

## 7 · Commercials

- **Format:** fixed-fee 30–60 day pilot (single workflow, single institution).
- **Pricing:** scoped per institution at kickoff; intentionally low-risk and
  time-boxed. (Reference range and terms provided directly — not published here.)
- **Conversion:** pilot fee credits toward an annual subscription if the
  institution proceeds.

## 8 · What we need from the bank

- A workflow owner + a compliance reviewer (a few hours/week).
- Representative data for the chosen workflow (or one source to bind).
- A 30-minute kickoff and a 45-minute closeout.

## 9 · What we explicitly do NOT do in the pilot

- No connection of paid third-party AI APIs is required to run the pilot.
- No production change to core/LOS/BSA-AML systems — BankTrust OS governs
  alongside them.
- No claim of certification (SOC 2 / FedRAMP); we help **produce the evidence**
  those programs require.

## 10 · Why now

Examiner expectations around AI governance are tightening while community and
regional banks adopt AI faster than they can document it. A short, governed pilot
turns that exposure into a demonstrable control — and a story the institution can
tell its board and its examiners.

---

**Next step:** co-select a pilot institution and a workflow, then schedule a
30-minute kickoff. Demo: https://codexdominion-command-console.vercel.app/banking

— Jermaine Merritt · JermaineMerritt@CodexDominion.app
