/**
 * IP-SAKTI — Sources Governance API Client
 * SIH26045
 */
import apiClient from './client';

export interface StatutorySourceDTO {
  id: string;
  short_title: string;
  title: string;
  authority: string;
  jurisdiction: string;
  source_type: string;
  section_number: string;
  content: string;
  source_url: string;
  status: string;
  checksum_sha256: string;
  trust_level: string;
  governance_status: string;
}

export interface SourceUpdateRequest {
  source_id: string;
  new_version_label: string;
  summary_of_changes: string;
  new_content: string;
  publication_date?: string;
}

export const sourcesApi = {
  list: (params?: { authority?: string; status?: string; jurisdiction?: string }): Promise<StatutorySourceDTO[]> =>
    apiClient.get<StatutorySourceDTO[]>('/sources', { params }).then((r) => r.data),

  getById: (id: string): Promise<StatutorySourceDTO> =>
    apiClient.get<StatutorySourceDTO>(`/sources/${id}`).then((r) => r.data),

  updateVersion: (payload: SourceUpdateRequest): Promise<any> =>
    apiClient.post('/sources/update-version', payload).then((r) => r.data),

  getVersions: (sourceId: string): Promise<any> =>
    apiClient.get(`/sources/${sourceId}/versions`).then((r) => r.data),
};
