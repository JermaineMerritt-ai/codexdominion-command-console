# Localization Guide

How to add or extend a language. Adding a language is **configuration**, not new
governance code — the canonical intent pipeline never changes.

## Architecture

| Concern | File |
| --- | --- |
| Supported locales | `lib/i18n/locales.ts` (`Locale`, `LOCALES`) |
| Language detection | `lib/i18n/detect.ts` |
| Intent synonyms (non-English → canonical) | `lib/i18n/intent-synonyms.ts` |
| Labels, UI strings, command chips | `lib/i18n/dictionaries.ts` |
| Helpers (`t`, `localizeIntentLabel`, coverage) | `lib/i18n/index.ts` |
| Provider + selector (UI) | `components/i18n/` |

## Add a new language (e.g. Portuguese `pt`)

1. **Locale.** Add `"pt"` to the `Locale` union and a `LOCALES` entry
   (`{ code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇵🇹" }`).
   Update `isLocale`.
2. **Detection.** Add a `pt` entry to `MARKERS` in `detect.ts` with
   language-distinctive words (avoid stems that overlap with English).
3. **Synonyms.** Add `pt` regexes to the relevant intents in
   `intent-synonyms.ts` (they map to the same canonical intent).
4. **Dictionaries.** Add `pt` entries to `INTENT_LABELS`, `UI_STRINGS`, and
   `LOCALIZED_COMMANDS`.
5. **Done.** The selector, command understanding, localized responses, audit
   metadata, and diagnostics coverage all pick it up. No governance changes.

## Detection notes

- Use **language-distinctive markers**. Accent-optional patterns like
  `d[eé]cisions` will match English "decisions" — use the **accented literal**
  (`décisions`) for detection, while synonym *matching* can stay accent-flexible
  to tolerate users who omit accents.
- Detection is best-effort; it only sets audit metadata. Intent resolution comes
  from explicit synonyms, so a missed detection never changes behavior.

## What never localizes

IDs, hashes, evidence/command IDs, canonical intent names, and audit summaries.
The governed pipeline (RBAC → policy → execute → audit) is identical in every
language. See [global-command-access.md](global-command-access.md).
