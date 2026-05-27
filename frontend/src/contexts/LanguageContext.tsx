import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Language } from "./languageContext";
import { LanguageContext } from "./languageContext";

const LANGUAGE_STORAGE_KEY = "fintrack_language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "pt";
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en"
    ? "en"
    : "pt";
}

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
