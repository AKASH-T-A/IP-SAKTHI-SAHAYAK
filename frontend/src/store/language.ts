/**
 * IP-SAKTI Sahayak — Centralized Multilingual Internationalization Store
 * SIH26045
 * 
 * Supports all 22 Eighth Schedule Languages of the Indian Constitution + English.
 * 
 * Core Rules:
 * 1. Statutory section numbers, Act names, and official form titles
 *    (e.g., Section 3(p), Rule 158B, Form III, Schedule T) are NEVER translated.
 * 2. Missing translations fall back to English gracefully.
 * 3. RTL layout (Urdu, Kashmiri, Sindhi) is automatically applied to document direction.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode, isRtlLanguage, ALL_LANGUAGES, getLanguageMeta } from '@/i18n/languages';
import { MASTER_DICTIONARY } from '@/i18n/translations';
import { getDualTerm } from '@/i18n/terminology';

export type { LanguageCode };

export interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tDual: (termKey: string) => string;
  isRtl: boolean;
  isHydrated: boolean;
}

function syncDocumentDirection(lang: LanguageCode) {
  if (typeof document !== 'undefined') {
    const isRtl = isRtlLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }
}

function syncCookie(lang: LanguageCode) {
  if (typeof document !== 'undefined') {
    document.cookie = `ip-sakti-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      isRtl: false,
      isHydrated: false,
      setLanguage: (lang: LanguageCode) => {
        syncDocumentDirection(lang);
        syncCookie(lang);
        set({
          language: lang,
          isRtl: isRtlLanguage(lang),
        });
      },
      t: (key: string, params?: Record<string, string | number>): string => {
        const lang = get().language;
        const dict = MASTER_DICTIONARY[lang] || MASTER_DICTIONARY.en;
        let val: string = (dict ? dict[key] : '') || '';

        if (!val) {
          // If translation is missing in the selected language
          if (lang !== 'en') {
            const isDev = process.env.NODE_ENV === 'development';
            if (isDev) {
              console.error(`[i18n VIOLATION] Missing ${lang.toUpperCase()} translation for key: "${key}"`);
            }
            val = (MASTER_DICTIONARY.en && MASTER_DICTIONARY.en[key]) || key;
          } else {
            val = (MASTER_DICTIONARY.en && MASTER_DICTIONARY.en[key]) || key;
          }
        }
        if (params && typeof val === 'string') {
          Object.entries(params).forEach(([pKey, pVal]) => {
            val = val.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
          });
        }
        return val || key;
      },
      tDual: (termKey: string): string => {
        const lang = get().language;
        return getDualTerm(termKey, lang);
      },
    }),
    {
      name: 'ip-sakti-language',
      skipHydration: true,
      partialize: (state) => ({ language: state.language, isRtl: state.isRtl }),
      onRehydrateStorage: () => (state) => {
        const currentLang = state?.language || 'en';
        syncDocumentDirection(currentLang);
        syncCookie(currentLang);
        useLanguageStore.setState({ isHydrated: true });
      },
    }
  )
);

