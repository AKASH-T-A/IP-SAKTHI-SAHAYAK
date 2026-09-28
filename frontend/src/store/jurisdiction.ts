/**
 * IP-SAKTI Sahayak — Jurisdiction Store
 * SIH26045
 * 
 * Strict boundary separation between India and International regimes.
 * Never conflates national statutory frameworks with international treaties.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JurisdictionMode = 'India' | 'International';

interface JurisdictionState {
  jurisdiction: JurisdictionMode;
  setJurisdiction: (mode: JurisdictionMode) => void;
  toggleJurisdiction: () => void;
}

export const useJurisdictionStore = create<JurisdictionState>()(
  persist(
    (set, get) => ({
      jurisdiction: 'India',
      setJurisdiction: (mode: JurisdictionMode) => set({ jurisdiction: mode }),
      toggleJurisdiction: () =>
        set({
          jurisdiction: get().jurisdiction === 'India' ? 'International' : 'India',
        }),
    }),
    {
      name: 'ip-sakti-jurisdiction',
    }
  )
);
