import { createContext } from "react";

export type Language = "pt" | "en";

export type LanguageContextData = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextData | undefined>(
  undefined
);
