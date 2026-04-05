import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

import en from '@/i18n/translations/en.json';
import hi from '@/i18n/translations/hi.json';
import kn from '@/i18n/translations/kn.json';
import ta from '@/i18n/translations/ta.json';
import te from '@/i18n/translations/te.json';

export type LangCode = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export const SUPPORTED_LANGUAGES: { code: LangCode; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

/** BCP-47 locale tags for Web Speech API */
export const LANG_TO_BCP47: Record<LangCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

type TranslationDict = Record<string, Record<string, string>>;

const dictionaries: Record<LangCode, TranslationDict> = {
  en: en as TranslationDict,
  hi: hi as TranslationDict,
  kn: kn as TranslationDict,
  ta: ta as TranslationDict,
  te: te as TranslationDict,
};

interface LanguageContextType {
  language: LangCode;
  setLanguage: (code: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'eventhub-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in dictionaries) return saved as LangCode;
    } catch { /* ignore */ }
    return 'en';
  });

  const setLanguage = useCallback((code: LangCode) => {
    setLanguageState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  /** Translate a dotted key like "common.search" */
  const t = useCallback((key: string): string => {
    const [section, field] = key.split('.');
    if (!section || !field) return key;

    const dict = dictionaries[language];
    const value = dict?.[section]?.[field];
    if (value) return value;

    // Fallback to English
    const fallback = dictionaries.en?.[section]?.[field];
    return fallback ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
