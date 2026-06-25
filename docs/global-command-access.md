# Global Command Access

Users interact with CodexDominion in their language; **governance is identical**
regardless. Language is the interface — not the control.

> **Language changes. Governance does not.**

## The pipeline

```
Input (any language)
  → Language detection
  → Intent translation (multilingual synonyms → canonical intent)
  → RBAC
  → Policy validation
  → Execution
  → Audit (canonical English + language metadata)
  → Localized response
```

Every non-English prompt resolves to the **same canonical intent** and runs the
**same governed pipeline**. Spanish, French, and English all converge:

| Input | Canonical intent |
| --- | --- |
| "Show high-risk decisions" | `show_high_risk_decisions` |
| "Muéstrame las decisiones de alto riesgo" | `show_high_risk_decisions` |
| "Montre-moi les décisions à haut risque" | `show_high_risk_decisions` |

## Languages (Phase 1)

🇺🇸 English · 🇪🇸 Spanish · 🇫🇷 French. Adding a language is **configuration**
(extend the locale + dictionary + synonym tables), not code changes — future:
Portuguese, Dutch, Haitian Creole, etc.

## UI

- A **language selector** in the top navigation; the choice is persisted to the
  user's session (cookie) and read server-side for consistent rendering.
- The Command Workspace shows **localized command suggestions**, **localized
  result headings**, and **localized UI strings** in the selected language.

## What stays canonical (never translated)

- Entity IDs, audit hashes, evidence IDs, command IDs, and technical identifiers.
- Audit event summaries (stored in canonical English for consistency).
- The governed intent, RBAC decision, policy checks, and execution.

## Audit metadata

Each command's audit event records (in `afterState`):
`inputLanguage`, `responseLanguage`, `originalPrompt`, `canonicalIntent` — full
traceability for multilingual users, without changing the canonical log.

## Diagnostics

**Diagnostics → Global Command Access** shows the active language, supported
languages, fallback language, and translation coverage.

## Source

- `lib/i18n/locales.ts` — supported locales + coercion
- `lib/i18n/detect.ts` — deterministic language detection
- `lib/i18n/intent-synonyms.ts` — ES/FR phrasings → canonical intent
- `lib/i18n/dictionaries.ts` — localized labels, UI strings, command chips
- `lib/i18n/index.ts` — `t`, `localizeIntentLabel`, `translationCoverage`
- `components/i18n/` — `LocaleProvider`, `LanguageSelector`
- `tests/i18n.test.ts` — detection, mapping, fallback, coverage

See [localization.md](localization.md) for how to add a language.
