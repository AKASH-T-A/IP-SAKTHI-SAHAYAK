/**
 * IP-SAKTI — Search API Client
 * SIH26045
 */
import apiClient from './client';

export interface SearchBackendResult {
  id: string;
  short_title: string;
  section_number: string;
  authority: string;
  source_url: string;
  content: string;
  jurisdiction: string;
  source_type: string;
  status: string;
  score?: number;
}

export interface SearchApiResponse {
  query: string;
  detected_intent: string;
  total_results: number;
  results: SearchBackendResult[];
}

export const searchApi = {
  search: (
    q: string,
    top_k: number = 10,
    jurisdiction: string = 'India',
    authority?: string
  ): Promise<SearchApiResponse> =>
    apiClient
      .get<SearchApiResponse>('/search', {
        params: {
          q,
          top_k,
          jurisdiction,
          ...(authority && authority !== 'ALL' ? { authority } : {}),
        },
      })
      .then((r) => r.data),
};
