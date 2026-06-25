# Sprint 13 — Global Command Access

**Goal:** let users interact with CodexDominion in multiple languages **without
changing governance**. Demonstrate that the governance model is
language-independent.

**Status:** ✅ Complete

> No external translation API. Demo mode default and unchanged.
> **Language changes. Governance does not.**

## Delivered

| # | Item | Notes |
| --- | --- | --- |
| 1 | Translation layer | `lib/i18n/` — locales, detection, intent synonyms, dictionaries, helpers |
| 2 | Languages | 🇺🇸 English · 🇪🇸 Spanish · 🇫🇷 French (adding a language = configuration) |
| 3 | Language detection | deterministic, marker-based (`detectLanguage`), English fallback |
| 4 | Multilingual intents | ES/FR phrasings resolve to the **same canonical intent** via `parseCommand` |
| 5 | UI selector | language picker in the top nav; persisted to session (cookie), read server-side |
| 6 | Localized responses | localized command chips, result headings (`localizeIntentLabel`), and UI strings |
| 7 | Canonical invariants | IDs, hashes, evidence/command IDs, audit summaries stay English |
| 8 | Audit metadata | each command records `inputLanguage`, `responseLanguage`, `originalPrompt`, `canonicalIntent` |
| 9 | Diagnostics | "Global Command Access" — active/supported/fallback language + coverage % |
| 10 | Tests | `tests/i18n.test.ts` — detection, multilingual mapping, fallback, coverage, localized chips (**98 total passing**) |
| 11 | Docs | this file, `global-command-access.md`, `localization.md`, README, roadmap, demo script, pilot briefs |
| 12 | Quality gates | typecheck, test (98), lint, build all green |

## Verified live
- Top-nav selector switches EN/ES/FR; chips localize.
- "Muéstrame las decisiones de alto riesgo" → canonical
  `show_high_risk_decisions` → result heading **"Decisiones de alto riesgo"** →
  real decisions → audited (`AUD-…`). Governance pipeline identical.
- Diagnostics shows supported languages + translation coverage.

## Why it matters
A government agency in the Caribbean, a healthcare org in Canada, or a
multinational can use the **same governed system** in their language — RBAC,
audit, evidence, and execution unchanged. CodexDominion governs the process;
language is simply the interface.

## Backlog → Sprint 14 (per revised roadmap)
| Order | Item |
| --- | --- |
| 14 | Claude integration (planner only — proposes plans over the knowledge graph in any language; Codex validates/executes) |
| 15+ | ChatGPT · M365 Copilot · cross-module workflows · SDK/Marketplace · more languages (PT, NL, Haitian Creole) |
