/**
 * IP-SAKTI Sahayak — Unified Voice Provider Architecture
 * SIH26045
 * 
 * Provider Hierarchy:
 * VoiceProvider
 *  ├── GeminiLiveProvider
 *  ├── BhashiniProvider
 *  └── BrowserFallbackProvider
 * 
 * Transparently reports:
 * GEMINI_READY | BHASHINI_READY | BROWSER_FALLBACK | NOT_CONFIGURED
 * 
 * Never falsely claims cloud provider is connected when it is not.
 */
import { LanguageCode } from '@/i18n/languages';
import { assistantApi } from '@/lib/api/assistant';

export type VoiceProviderType = 'GEMINI_LIVE' | 'BHASHINI' | 'BROWSER_FALLBACK';
export type VoiceSelectionState = 'GEMINI_READY' | 'BHASHINI_READY' | 'BROWSER_FALLBACK' | 'NOT_CONFIGURED';

export interface UnifiedVoiceState {
  activeProvider: VoiceProviderType;
  selectionState: VoiceSelectionState;
  providerDisplayName: string;
  notes: string;
  isFemalePreferred: boolean;
  activeLanguage: LanguageCode;
}

export class UnifiedVoiceProvider {
  private currentState: UnifiedVoiceState = {
    activeProvider: 'BROWSER_FALLBACK',
    selectionState: 'BROWSER_FALLBACK',
    providerDisplayName: 'Native Web Speech API (Browser Fallback)',
    notes: 'Operating via browser speech synthesis & recognition across 23 languages.',
    isFemalePreferred: true,
    activeLanguage: 'en',
  };

  /**
   * Syncs with backend diagnostic endpoint to determine actual cloud readiness.
   */
  public async syncWithBackend(language: LanguageCode): Promise<UnifiedVoiceState> {
    try {
      const data = await assistantApi.getVoiceStatus(language);
      if (data && data.selection_state) {
        let displayName = 'Native Web Speech API (Browser Fallback)';
        if (data.selection_state === 'GEMINI_READY') {
          displayName = 'Google Gemini Live (Real-Time Audio)';
        } else if (data.selection_state === 'BHASHINI_READY') {
          displayName = 'Bhashini ULCA Speech Pipeline';
        }

        this.currentState = {
          activeProvider: data.active_provider,
          selectionState: data.selection_state,
          providerDisplayName: displayName,
          notes: data.notes || '',
          isFemalePreferred: true,
          activeLanguage: language,
        };
      }
    } catch {
      // Backend status call failed, retain safe browser fallback
      this.currentState.selectionState = 'BROWSER_FALLBACK';
      this.currentState.activeProvider = 'BROWSER_FALLBACK';
      this.currentState.providerDisplayName = 'Native Web Speech API (Browser Fallback)';
    }
    return this.currentState;
  }

  public getState(): UnifiedVoiceState {
    return this.currentState;
  }
}

export const unifiedVoiceProvider = new UnifiedVoiceProvider();
