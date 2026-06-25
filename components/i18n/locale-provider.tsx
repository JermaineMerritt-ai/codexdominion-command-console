"use client";

import * as React from "react";
import { coerceLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE,
  );

  React.useEffect(() => {
    const m = document.cookie.match(/codex_locale=([a-z]{2})/);
    if (m) setLocaleState(coerceLocale(m[1]));
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    document.cookie = `codex_locale=${l}; path=/; max-age=31536000`;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => React.useContext(LocaleContext);
