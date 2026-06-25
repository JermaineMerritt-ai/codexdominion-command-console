# Video Scripts

Three scripts for the pilot kit. All recordable against the live demo
(https://codexdominion-command-console.vercel.app) with demo data — no setup.

---

## 1 · Executive Overview — 90 seconds

**[0:00–0:15] Hook.**
> "Every enterprise is deploying AI faster than it can govern it. When a
> regulator or your board asks *who approved this AI action, what policy governed
> it, and where's the evidence* — most companies answer with spreadsheets."

**[0:15–0:35] What it is.**
> "CodexDominion is a governed AI operations platform. You ask it to do work; it
> checks permissions, reasons over a governed model of your organization,
> executes, and proves every step in a tamper-evident audit trail."

**[0:35–1:05] The money shot.** (screen: Command Workspace)
> "Watch. *Prepare for a FedRAMP assessment.* It doesn't just answer — it
> proposes a plan, grounded in *our* real risks, and waits for a human to
> approve. I approve; it executes six governed steps and seals them in audit."

**[1:05–1:30] Close.**
> "AI proposes. A human approves. The platform executes. Everything is audited —
> in English, Spanish, or French. That's not an AI dashboard. It's the system
> that governs enterprise AI work. Let's talk about a 30-day pilot."

---

## 2 · Product Demo — 10 minutes

Follow [demo-script.md](demo-script.md) (Command-first flow), expanded:

1. **(1:30) Command Workspace + Execution Plan** — propose "Prepare for a FedRAMP
   assessment," show the *Based on your organization* context, approve, execute,
   show the sealed plan audit.
2. **(1:30) Knowledge Graph** — "how the AI knows your business": entities,
   relationships, and the actionable gaps.
3. **(1:30) Modules** — one console, one Integration Contract, 3 live-ready
   modules; open GCFI (payment dual-approval risk).
4. **(1:30) Authority & a single action** — expand a flagged decision, approve;
   show RBAC role badge and the evidence hash.
5. **(1:00) Evidence** — generate an evidence pack for denied decisions.
6. **(1:00) Global Command Access** — switch to Spanish, run
   *"Muéstrame las decisiones de alto riesgo,"* same governed result.
7. **(1:00) Diagnostics + Audit Trail** — system health, audit-chain integrity,
   and the hash-chained log including everything just done.
8. **(1:00) Close** — modes (demo/live), pilot motion, "what would success look
   like for your team in 30 days?"

---

## 3 · Architecture Deep Dive — 20–30 minutes

For technical evaluators / security teams.

1. **(3m) Positioning & principles** — governance is the product; AI is an
   assistant; deterministic + auditable; "language changes, governance does not."
2. **(4m) The governed pipeline** — parse → RBAC → policy → execute → audit;
   walk `lib/actions/*` and the audit chain (`audit-events.md`).
3. **(4m) Data architecture** — demo seed vs Prisma/Supabase; repository
   abstraction; row-level tenant isolation ([data-model.md](data-model.md)).
4. **(4m) Integration Contract** — `GovernanceModule`; live bindings with safe
   fallback; adding a module in 3 steps
   ([integration-contract.md](integration-contract.md)).
5. **(3m) Knowledge Graph** — entities/relationships/gaps; how plans are grounded
   ([knowledge-graph.md](knowledge-graph.md)).
6. **(3m) Execution engine** — plan templates, human approval, per-step audit
   ([execution-plans.md](execution-plans.md)).
7. **(3m) Provider abstraction & roadmap** — Codex active; how an LLM slots in
   *above* the knowledge graph and *below* governance
   ([ai-provider-routing.md](ai-provider-routing.md)).
8. **(3m) Security & compliance** — RBAC, audit integrity, residency, framework
   mapping ([security.md](security.md), [compliance.md](compliance.md)).
9. **(2m) Q&A hooks** — SSO/Entra ID, SIEM export, on-prem, your modules.

> Tip: keep the live demo open in a second window; jump to it whenever a
> technical claim can be shown rather than described.
