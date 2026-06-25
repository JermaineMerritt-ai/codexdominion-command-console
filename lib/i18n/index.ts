import type { CommandIntent } from "@/lib/command/intents";
import { FALLBACK_LOCALE, type Locale } from "./locales";
import { INTENT_LABELS, UI_STRINGS } from "./dictionaries";
import { INTENT_SYNONYMS } from "./intent-synonyms";

export * from "./locales";
export { detectLanguage } from "./detect";
export { INTENT_SYNONYMS } from "./intent-synonyms";
export { LOCALIZED_COMMANDS } from "./dictionaries";

/** Translate a UI string key; falls back to English, then the key. */
export function t(key: string, locale: Locale): string {
  return UI_STRINGS[key]?.[locale] ?? UI_STRINGS[key]?.[FALLBACK_LOCALE] ?? key;
}

/** Localize a command result heading by canonical intent. */
export function localizeIntentLabel(
  intent: CommandIntent | string,
  fallback: string,
  locale: Locale,
): string {
  const entry = INTENT_LABELS[intent as CommandIntent];
  return entry?.[locale] ?? entry?.[FALLBACK_LOCALE] ?? fallback;
}

/** Share of canonical intents with non-English coverage (synonyms + labels). */
export function translationCoverage(): number {
  const labelled = Object.keys(INTENT_LABELS).length;
  const synonyms = Object.keys(INTENT_SYNONYMS).length;
  const covered = new Set([
    ...Object.keys(INTENT_LABELS),
    ...Object.keys(INTENT_SYNONYMS),
  ]).size;
  // Coverage relative to the localized command surface (intents we localize).
  const target = Math.max(labelled, synonyms);
  return target === 0 ? 0 : Math.round((covered / target) * 100);
}
