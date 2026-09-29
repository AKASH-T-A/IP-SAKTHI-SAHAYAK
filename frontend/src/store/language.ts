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
  completeHydration: () => void;
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
          isHydrated: true,
        });
      },
      completeHydration: () => {
        if (typeof window === 'undefined') return;
        try {
          const raw = localStorage.getItem('ip-sakti-language');
          if (raw) {
            const parsed = JSON.parse(raw);
            const storedLang = parsed?.state?.language;
            if (storedLang && ALL_LANGUAGES.some((l) => l.code === storedLang)) {
              syncDocumentDirection(storedLang);
              syncCookie(storedLang);
              set({
                language: storedLang as LanguageCode,
                isRtl: isRtlLanguage(storedLang as LanguageCode),
                isHydrated: true,
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[LanguageStore] Error reading stored language:', e);
        }
        set({ isHydrated: true });
      },
      t: (key: string, params?: Record<string, string | number>): string => {
        const state = get();
        // HYDRATION INVARIANT:
        // Before hydration completes, ALWAYS return English to ensure 100% deterministic match with SSR.
        const lang = state.isHydrated ? state.language : 'en';
        const dict = MASTER_DICTIONARY[lang] || MASTER_DICTIONARY.en;
        let val: string = (dict ? dict[key] : '') || '';

        if (!val) {
          // Check supplemental fallback action keys if any
          const supplemental: Record<string, Record<string, string>> = {
            "action.requestExpertReview": {
              en: "Request Expert Legal Review",
              kn: "ತಜ್ಞರ ಕಾನೂನು ಪರಿಶೀಲನೆ ಕೋರಿ",
              hi: "विशेषज्ञ कानूनी समीक्षा का अनुरोध करें",
              ta: "நிபுணர் சட்ட மதிப்பாய்வைக் கோருங்கள்",
              te: "నిపుణుల న్యాయ సమీక్షను అభ్యర్థించండి",
              ml: "വിദഗ്ദ്ധ നിയമ അവലോകനം അഭ്യർത്ഥിക്കുക",
              mr: "तज्ञ कायदेशीर पुनरावलोकनाची विनंती करा",
              bn: "বিশেষজ্ঞ আইনি পর্যালোচনার অনুরোধ করুন",
              gu: "નિષ્ણાત કાનૂની સમીક્ષાની વિનંતી કરો",
              pa: "ਮਾਹਰ ਕਾਨੂੰਨੀ ਸਮੀਖਿਆ ਲਈ ਬੇਨਤੀ ਕਰੋ",
              or: "ବିଶେଷଜ୍ଞ ଆଇନଗତ ସମୀକ୍ଷା ଅନୁରୋଧ କରନ୍ତୁ",
              as: "বিশেষজ্ঞ আইনগত পৰ্যালোচনাৰ বাবে অনুৰোধ কৰক",
              ur: "ماہر قانونی جائزہ کی درخواست کریں",
            }
          };
          if (supplemental[key]) {
            val = supplemental[key][lang] || supplemental[key].en || '';
          }
        }

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
        const state = get();
        const lang = state.isHydrated ? state.language : 'en';
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
        useLanguageStore.setState({
          isHydrated: true,
          language: currentLang,
          isRtl: isRtlLanguage(currentLang),
        });
      },
    }
  )
);

