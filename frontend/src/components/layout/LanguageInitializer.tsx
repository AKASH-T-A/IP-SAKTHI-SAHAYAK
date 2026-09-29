'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/language';
import { useAuthStore } from '@/store/auth';

/**
 * LanguageInitializer — SIH26045
 * 
 * Safely rehydrates client-side persisted state (language, auth) AFTER
 * React finishes initial hydration. This guarantees 100% deterministic
 * SSR matching client first render, completely eliminating Next.js hydration errors.
 */
export default function LanguageInitializer() {
  useEffect(() => {
    // Rehydrate persisted language and auth state strictly on client mount (post-hydration)
    if (typeof window !== 'undefined') {
      try {
        useLanguageStore.getState().completeHydration();
      } catch (e) {
        console.warn('[LanguageInitializer] Failed to complete language hydration:', e);
      }
      try {
        useAuthStore.persist?.rehydrate?.();
      } catch (e) {
        console.warn('[LanguageInitializer] Failed to rehydrate auth store:', e);
      }
    }
  }, []);

  return null;
}
