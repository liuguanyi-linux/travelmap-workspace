import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getTranslation } from '../utils/translations';

type Language = 'zh-CN' | 'en-US' | 'ko-KR';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'travelmap_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh-CN' || stored === 'en-US' || stored === 'ko-KR') return stored;
    return 'ko-KR';
  });

  const setLanguage = (lang: string) => {
    const targetLang = (lang === 'zh-CN' || lang === 'en-US' || lang === 'ko-KR') ? lang : 'ko-KR';
    localStorage.setItem(STORAGE_KEY, targetLang);
    setLanguageState(targetLang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current = getTranslation(language);
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to zh-CN if key missing
        let fallback = getTranslation('zh-CN');
        for (const k of keys) {
            if (fallback && fallback[k] !== undefined) {
                fallback = fallback[k];
            } else {
                return path; // Return key if not found
            }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
