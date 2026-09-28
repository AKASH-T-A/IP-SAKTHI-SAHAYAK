/**
 * IP-SAKTI — Cases API calls
 */
import apiClient from './client';

export type CaseStatus = 'draft' | 'active' | 'completed' | 'archived';
export type Jurisdiction = 'India' | 'International' | 'EU' | 'US';

export interface CasePublic {
  id: string;
  title: string;
  description?: string;
  status: CaseStatus;
  jurisdiction: Jurisdiction;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface CaseListResponse {
  items: CasePublic[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateCaseData {
  title: string;
  description?: string;
  jurisdiction?: Jurisdiction;
  language?: string;
}

export interface UpdateCaseData {
  title?: string;
  description?: string;
  status?: CaseStatus;
  jurisdiction?: Jurisdiction;
}

export const casesApi = {
  list: (page = 1, per_page = 20) =>
    apiClient.get<CaseListResponse>('/cases', { params: { page, per_page } }).then((r) => r.data),

  create: (data: CreateCaseData) =>
    apiClient.post<CasePublic>('/cases', data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<CasePublic>(`/cases/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateCaseData) =>
    apiClient.patch<CasePublic>(`/cases/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/cases/${id}`).then((r) => r.data),
};
