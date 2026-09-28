/**
 * IP-SAKTI — Zustand Auth Store
 * Manages authentication state, persists tokens to localStorage.
 * Security note: authorization is always enforced server-side.
 * The frontend store is UI state only.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPublic } from '@/lib/api/auth';

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: UserPublic, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ipsakti_access_token', accessToken);
          localStorage.setItem('ipsakti_refresh_token', refreshToken);
        }
        set({ user, isAuthenticated: true, isLoading: false });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ipsakti_access_token');
          localStorage.removeItem('ipsakti_refresh_token');
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'ipsakti-auth',
      skipHydration: true,
      // Only persist user data, not loading state
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
