/**
 * IP-SAKTI — Assistant API Client
 * SIH26045
 */
import apiClient from './client';

export interface AssistantQueryRequest {
  query: string;
  language?: string;
  case_context?: Record<string, any>;
}

export interface BackendCitation {
  id: string;
  short_title: string;
  section: string;
  authority: string;
  source_url: string;
  excerpt: string;
  canonical_status?: string;
}

export interface AssistantQueryResponse {
  abstained: boolean;
  detected_intent?: string;
  answer: string;
  why: string;
  evidence_strength: string;
  citations: BackendCitation[];
  missing_information: string[];
  practical_meaning?: string;
  next_actions: string[];
  disclaimer?: string;
  is_rtl?: boolean;
  provider_used?: string;
  citation_validation_status?: string;
}

export interface AssistantStatusResponse {
  service: string;
  gemini: {
    provider_name: string;
    status: 'GEMINI_READY' | 'GEMINI_NOT_CONFIGURED' | 'ERROR';
    model: string;
    live_model: string;
    is_configured: boolean;
    supported_languages_count: number;
    notes: string;
  };
  voice: {
    active_provider: 'GEMINI_LIVE' | 'BHASHINI' | 'BROWSER_FALLBACK';
    selection_state: 'GEMINI_READY' | 'BHASHINI_READY' | 'BROWSER_FALLBACK' | 'NOT_CONFIGURED';
    notes: string;
    preferred_voice: {
      gender: string;
      gemini_voice: string;
    };
  };
  rules_engine: string;
  statutory_corpus: string;
  safe_abstention: string;
}

export const assistantApi = {
  query: (payload: AssistantQueryRequest): Promise<AssistantQueryResponse> =>
    apiClient.post<AssistantQueryResponse>('/assistant/query', payload).then((r) => r.data),
  getStatus: (): Promise<AssistantStatusResponse> =>
    apiClient.get<AssistantStatusResponse>('/assistant/status').then((r) => r.data),
  getVoiceStatus: (language: string = 'kn'): Promise<any> =>
    apiClient.get(`/assistant/voice/status?language=${language}`).then((r) => r.data),
};
