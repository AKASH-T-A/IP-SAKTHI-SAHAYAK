/**
 * IP-SAKTI — Expert Consultation API Client
 * SIH26045
 */
import apiClient from './client';

export interface ExpertPackageRequest {
  case_id?: string;
  case_title?: string;
  formulation?: Record<string, any>;
  user_questions?: string[];
  jurisdiction?: string;
  language?: string;
}

export interface ExpertConsultationPackage {
  package_id: string;
  generated_at: string;
  case_id: string;
  case_title: string;
  submission_status: string;
  jurisdiction: string;
  formulation_summary: Record<string, any>;
  ai_classification_findings: Array<Record<string, any>>;
  statutory_citations: Array<Record<string, any>>;
  identified_evidence_gaps: string[];
  questions_for_expert: string[];
  ai_confidence_strength: string;
  markdown_dossier: string;
  disclaimer: string;
}

export const expertApi = {
  generateConsultationPackage: (payload: ExpertPackageRequest): Promise<ExpertConsultationPackage> =>
    apiClient.post<ExpertConsultationPackage>('/expert/consultation-package', payload).then((r) => r.data),
};
