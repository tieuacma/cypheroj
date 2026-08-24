"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS, type Language } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: typeof TRANSLATIONS["vi"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("cypher_lang") as Language;
    if (saved === "vi" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("cypher_lang", newLang);
  };

  const toggleLang = () => {
    const next = lang === "vi" ? "en" : "vi";
    setLang(next);
  };

  const t = TRANSLATIONS[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
