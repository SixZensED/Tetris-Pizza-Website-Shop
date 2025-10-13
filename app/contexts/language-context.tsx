"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  type LanguageCode,
} from "../lib/translations";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
};

const STORAGE_KEY = "app_language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolveInitialLanguage(initialLanguage?: LanguageCode): LanguageCode {
  if (initialLanguage && isSupportedLanguage(initialLanguage)) {
    return initialLanguage;
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: LanguageCode }) {
  const [language, setLanguageState] = useState<LanguageCode>(resolveInitialLanguage(initialLanguage));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) {
      setLanguageState(stored);
      return;
    }
    const browserLanguage = window.navigator.language?.toLowerCase();
    if (!browserLanguage) return;
    const matched = SUPPORTED_LANGUAGES.find((code) => browserLanguage.startsWith(code.toLowerCase()));
    if (matched) {
      setLanguageState(matched);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return ctx;
}

export { SUPPORTED_LANGUAGES };
export type { LanguageCode };

