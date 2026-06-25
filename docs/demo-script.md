# 5–10 Minute Buyer Demo Script

> Audience: enterprise / finance / healthcare / government buyers evaluating AI
> governance. Goal: show CodexDominion is a **governed AI operating system** —
> not a dashboard, not a chatbot. Runs on the **live demo** (no login, demo data).

**Live:** https://codexdominion-command-console.vercel.app
(lands on the **Command Workspace** — that's the point.)

---

### 0 · Framing (20s)
> "This is the interface your risk, compliance, and audit teams work in. You
> describe what you need; CodexDominion governs the request — checks permissions,
> reasons over a governed model of your organization, executes, and proves it in
> an audit trail. Let me show you."

---

### 1 · Command Workspace — governed autonomy (90s)
On the home screen, click the plan chip **"Prepare for a FedRAMP assessment."**
- A **plan** appears — *not* a chatbot reply: 6 steps, ~12 min, risk level, the
  modules it will use, and a **"Based on your organization"** section listing
  *your* real risks (e.g. *GCFI: payment authorization missing dual approval*).
- "Notice: the AI **proposes**, but nothing runs until a human approves." Click
  **Approve & Execute.**
- Each step runs as a governed command and is **individually audited**; the run
  ends with an executive summary and a **plan sealed in the audit trail**.

**Talking point:** *AI proposes · human approves · platform executes · everything audited.*

---

### 2 · Knowledge Graph — "how does the AI know our business?" (60s)
Go to **Knowledge**.
- "CodexDominion maintains a **governed knowledge graph** of your environment —
  policies, vendors, contracts, evidence, decisions, workflows, modules, AI
  systems — and the relationships between them." Point to entities,
  relationships, and the **knowledge gaps** (expiring certs, missing evidence,
  unreviewed decisions).
- "That plan a moment ago was grounded in *this* — not raw prompts."

**Talking point:** *governed context, not uploaded documents.*

---

### 3 · Modules — the control plane governs every app (60s)
Go to **Modules**.
- "Every CodexDominion app reports in through one Integration Contract." Three
  modules are **live-ready** (control-plane, ComplianceFlow, GCFI) with a
  connection state; the rest show maturity and gaps.
- Open **GCFI** → contract milestones, contractor approvals, and the **payment
  dual-approval** risk, governed.

**Talking point:** *one console, one contract, multiple governed live modules.*

---

### 4 · Authority & a single governed action (60s)
Go to **Decisions** → expand a flagged decision → **Approve.**
- "Every action is **role-controlled** (RBAC) and writes a tamper-evident audit
  event." Point to the evidence hash.
- Note the role badge in the header — authority is explicit.

**Talking point:** *who is allowed to act — and proof that they did.*

---

### 5 · Proof & health (50s)
Go to **Diagnostics**.
- "Environment mode, provider status, every module's connection, the knowledge
  graph, and the **audit chain integrity** — one operations view."
- Then **Settings → Audit Trail**: the hash-chained log, including the plan you
  just executed.

**Talking point:** *examination-ready by design.*

---

### Close (20s)
> "Visibility, governed autonomy, organization-aware planning, role-controlled
> authority, and provable audit — one platform. It runs today on demo data; for a
> pilot we bind it to your environment through the same contract. What would make
> this a success for your team in 30 days?"

---

### Optional · Global Command Access (30s)
Switch the **top-nav language** to Español, then run
*"Muéstrame las decisiones de alto riesgo."* Same governed result —
**"Decisiones de alto riesgo"** — same audit trail.
> "Language changes; governance does not." (Strong for Caribbean, Canadian, and
> multinational buyers.)

## Logistics
- **Mode:** demo (no credentials). Reset = reload (seed is deterministic; a cold
  start clears in-session changes).
- **Theme:** light/dark toggle in the header.
- **Vertical framing:** see [pilot-briefs.md](pilot-briefs.md) for gov /
  healthcare / finance one-pagers.
