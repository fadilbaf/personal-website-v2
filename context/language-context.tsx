"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../src/lib/translations";

export type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin-language") as Language;
    if (stored === "id" || stored === "en") {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("admin-language", lang);
    document.cookie = `admin-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    const keys = key.split(".");
    
    // Resolve key in current language
    let current: any = translations[language];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback to English dictionary if not found in active language
        let fallback: any = translations["en"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in fallback) {
            fallback = fallback[fk];
          } else {
            fallback = null;
            break;
          }
        }
        if (typeof fallback === "string") {
          current = fallback;
        } else {
          return key;
        }
        break;
      }
    }

    if (typeof current !== "string") {
      return key;
    }

    let result = current;
    if (replacements) {
      Object.entries(replacements).forEach(([k, val]) => {
        result = result.replace(new RegExp(`{${k}}`, "g"), val);
      });
    }
    return result;
  };

  // Prevent flash of un-translated content by rendering children only after mounting
  // but to keep Next.js happy during SSR layout, we still render children (with default "en" strings)
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string, replacements?: Record<string, string>) => {
        const keys = key.split(".");
        let current: any = translations["en"];
        for (const k of keys) {
          if (current && typeof current === "object" && k in current) {
            current = current[k];
          } else {
            return key;
          }
        }
        let result = typeof current === "string" ? current : key;
        if (replacements) {
          Object.entries(replacements).forEach(([rKey, rVal]) => {
            result = result.replace(`{${rKey}}`, rVal);
          });
        }
        return result;
      },
    };
  }
  return context;
}
