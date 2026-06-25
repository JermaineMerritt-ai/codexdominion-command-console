// Supported locales. Adding a language is configuration (extend these tables),
// not code changes — governance is language-independent.

export type Locale = "en" | "es" | "fr";

export const DEFAULT_LOCALE: Locale = "en";
export const FALLBACK_LOCALE: Locale = "en";

export interface LocaleInfo {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
];

export function isLocale(x: unknown): x is Locale {
  return x === "en" || x === "es" || x === "fr";
}

export function coerceLocale(x: unknown): Locale {
  return isLocale(x) ? x : DEFAULT_LOCALE;
}
