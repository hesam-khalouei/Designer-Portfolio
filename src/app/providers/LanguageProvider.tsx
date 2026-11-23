import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "../../domain/localization/LocalizedText";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "ahk-language";

const readLanguage = (): Lang => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "fa" || value === "ar" ? value : "en";
  } catch {
    return "en";
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Language remains usable when storage is disabled.
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
