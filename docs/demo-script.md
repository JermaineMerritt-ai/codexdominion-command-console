# 5-Minute Buyer Demo Script

> Audience: enterprise / finance / healthcare / government buyers evaluating AI
> governance tooling. Goal: show that CodexDominion turns AI oversight from a
> spreadsheet exercise into an auditable, examiner-ready control plane.
> Run in **demo mode** — no login, no setup, nothing to break.

**Setup:** open the deployed URL (demo mode). Dark mode on. Tenant shown in the
top bar: *Meridian Financial Group*.

---

### 0 · Framing (20s)
> "This is the operational control center your risk, compliance, and audit teams
> live in. Every AI decision your organization makes flows through here — with
> the policy that governed it, who approved it, and tamper-evident evidence an
> examiner can verify. Let me show you five things."

---

### 1 · Dashboard — governance visibility (60s)
Land on **Dashboard**.
- Point to the six KPI tiles: *Active Workflows, Pending Approvals, AI Decisions
  Today, Policy Violations, Evidence Packs, High-Risk Vendors.*
- "One screen, whole-of-org posture — the view a CRO or examiner asks for."
- Point to **Audit Readiness: 77/100** and the compliance rollup (SR 11-7, Fair
  Lending, Privacy…). "This score moves as you close gaps. Today fair lending is
  the open item — watch how we drill into exactly why."

**Talking point:** *visibility no spreadsheet gives you.*

---

### 2 · Decisions — an AI action approved / denied (75s)
Go to **Decisions**.
- "Every automated decision, searchable and filterable." Type `fraud` in search.
- Open **DEC-2026-0480** (FraudSentinel, *flagged, critical*). Expand the row.
- Read the rationale: *"Adverse-impact ratio fell below the 0.80 threshold for a
  protected segment."*
- Point to the **evidence hash** — "cryptographically sealed, tamper-evident.
  This is what makes a decision defensible months later."

**Talking point:** *every decision is explainable and provable.*

---

### 3 · Evidence — generate an audit pack (75s)
Go to **Evidence** → click **Generate Evidence Pack**.
- Select 3–4 decisions → **Generate**. Watch the sealing steps run (collect →
  compile → aggregate audit events → compute hash chain → seal).
- "What used to take a compliance analyst days before an exam — assembling
  decision history, approvals, and audit trail — is one click and a sealed hash."
- Click **Download JSON** to show the real artifact.

**Talking point:** *examination evidence on demand.*

---

### 4 · Procurement — match an opportunity to controls (60s)
Go to **Procurement** → open **OPP-7781** (Treasury, AI Governance Platform).
- Show **Match Score 88**, **Required Controls** (FedRAMP, NIST AI RMF, SR 11-7),
  and the **Capability Gap** (FedRAMP in progress) with **Bid Readiness 78/100**.
- "For public-sector buyers: we map each opportunity's required controls to your
  actual posture, so you know what you can win today and what to close first."

**Talking point:** *governance posture becomes pipeline.*

---

### 5 · Vendor Risk — expiring compliance gaps (50s)
Go to **Vendors**.
- Sorted by risk. Point to **Quanta Cloud Services (78, denied)** — red SOC 2 /
  security. Then **VeriDesk (expiring)** with the amber expiration warning.
- "Third-party AI risk, continuously tracked: SOC 2, HIPAA, FedRAMP, insurance,
  and contract expirations — with warnings before they lapse."

**Talking point:** *no surprise lapses in your AI supply chain.*

---

### Close (20s)
> "Visibility, explainable decisions, one-click evidence, procurement readiness,
> and vendor risk — one control plane. It runs today on demo data; for a pilot we
> point it at your environment with the same screens. What would make this a
> success for your team in 30 days?"

---

## Demo logistics
- **Mode:** `NEXT_PUBLIC_APP_MODE=demo`, `NEXT_PUBLIC_REQUIRE_AUTH=false`.
- **Reset:** none needed — seed data is deterministic; just reload.
- **Theme:** toggle light/dark in the top bar if the room/projector prefers light.
- **Fallback:** if presenting from a live DB and it's slow, flip back to demo
  mode (see deployment.md) for a guaranteed-smooth run.
