# CodexDominion Pilot Kit

The package to bring into a pilot conversation. Everything here is ready today;
the live demo runs with no credentials.

**Live demo:** https://codexdominion-command-console.vercel.app
**Repo:** https://github.com/JermaineMerritt-ai/codexdominion-command-console

---

## 1 · Executive one-pager

**What it is.** A governed AI operations platform that lets organizations
**request, approve, execute, monitor, and prove** AI-assisted work across
multiple enterprise systems.

**The problem.** Enterprises and agencies are deploying AI faster than they can
govern it. Regulators and boards ask: *who approved this AI action, what policy
governed it, and where is the evidence?* Today the answer is spreadsheets and
screenshots.

**What CodexDominion does.**
- **Command Workspace** — describe what you need; the platform governs the
  request (parse → permissions → policy → execute → audit).
- **Execution Plans** — AI proposes a multi-step plan; a human approves; the
  platform executes across modules; everything is audited.
- **Knowledge Graph** — a governed model of your policies, vendors, contracts,
  evidence, decisions, workflows, and AI systems.
- **Module Registry** — every app reports in through one Integration Contract
  (3 modules live-ready today).
- **RBAC + Audit** — role-controlled authority and a tamper-evident,
  hash-chained audit trail.
- **Global Command Access** — English, Spanish, French; governance unchanged.

**Why it's different.** It governs the *process*. AI assists; CodexDominion
remains the authority. Deterministic, explainable, auditable.

**Proof you can run in 5 minutes.** See [demo-script.md](demo-script.md).

---

## 2 · Technical architecture overview
See [architecture.md](architecture.md) and [system-design.md](system-design.md).
- Next.js 15 App Router · TypeScript · governed data layer (demo seed / Prisma+Supabase).
- Repository + Integration Contract abstractions; provider abstraction (Codex
  active; Claude/ChatGPT/Copilot ready as governed assistants).
- Demo mode (zero-config) and database/live modes; live module bindings with
  safe fallback.

## 3 · Security & governance overview
See [security.md](security.md), [rbac.md](rbac.md), [audit-events.md](audit-events.md).
- Supabase Auth (opt-in) · 6-role RBAC enforced server-side · row-level tenant
  isolation · hash-chained audit · evidence packs · data residency options.

## 4 · Compliance mapping
See [compliance.md](compliance.md): NIST AI RMF, SR 11-7, Fair Lending, GLBA/CCPA,
HIPAA, FedRAMP/StateRAMP, EU AI Act — how the platform produces the evidence each
requires.

## 5 · Pilot scope (30–60 days)
Per-vertical scopes in [pilot-briefs.md](pilot-briefs.md) (government, healthcare,
finance). Standard motion: demo → scope one workflow/module → bind customer data
via the contract → prove governance (decisions, evidence, audit, role control).

## 6 · Pricing options (starting points — adjust per deal)

| Tier | Who | Scope | Indicative |
| --- | --- | --- | --- |
| **Pilot** | 1 team / 1 vertical | 30–60 days, 1 governed workflow/module, demo or single live binding | Fixed pilot fee (e.g. $7.5k–$25k) |
| **Department** | 1 business unit | Up to 3 modules, RBAC, audit exports, SSO | Annual subscription |
| **Enterprise** | Org-wide | All modules, multi-org, SSO/SCIM, live bindings, support SLA | Annual + platform fee |

> Pricing is a starting framework — let pilot conversations calibrate it. Lead
> with the **paid pilot**; expansion follows proof.

## 7 · Demo video
Scripts in [video-scripts.md](video-scripts.md): 90-second executive overview,
10-minute product demo, 20–30 minute architecture deep dive.

## 8 · Live demo URL
https://codexdominion-command-console.vercel.app — no login, demo data, always on.

---

## Where to point the conversation
Watch which questions recur (SSO/Entra ID, SIEM export, specific module,
on-prem, data residency). **Those questions should drive the next sprint** — let
buyer demand, not a feature roadmap in isolation, decide what comes after.
