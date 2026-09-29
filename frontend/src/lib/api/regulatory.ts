/**
 * IP-SAKTI — Regulatory & Claims API Client
 * SIH26045
 */
import apiClient from './client';

export interface IngredientPayload {
  id?: string;
  name: string;
  botanical_name?: string;
  sanskrit_name?: string;
  part_used?: string;
  percentage?: number;
  source_type?: string;
  origin_state?: string;
}

export interface FormulationPayload {
  product_category: string;
  dosage_form?: string;
  ingredients: IngredientPayload[];
  preparation_method?: string;
  classical_basis?: string;
  is_classical?: boolean;
  intended_use?: string;
  claims_type?: string[];
  commercial_intent?: string;
  target_jurisdiction?: string;
}

export interface ClaimScanRequest {
  claim_text: string;
  product_category?: string;
  target_media?: string;
  jurisdiction?: string;
}

export interface LabelReviewRequest {
  label_text: string;
  product_category?: string;
  dosage_form?: string;
  jurisdiction?: string;
}

export const regulatoryApi = {
  evaluate: (payload: FormulationPayload): Promise<any> =>
    apiClient.post('/regulatory/evaluate', payload).then((r) => r.data),

  checklist: (payload: FormulationPayload): Promise<any> =>
    apiClient.post('/regulatory/checklist', payload).then((r) => r.data),

  internationalRegimes: (market: string = 'All'): Promise<any> =>
    apiClient.get('/regulatory/international-regimes', { params: { market } }).then((r) => r.data),

  checkClaims: (payload: ClaimScanRequest): Promise<any> =>
    apiClient.post('/claims/check', payload).then((r) => r.data),

  reviewLabel: (payload: LabelReviewRequest): Promise<any> =>
    apiClient.post('/label/review', payload).then((r) => r.data),
};
