/**
 * IP-SAKTI — Relational Knowledge Graph API Client
 * SIH26045
 */
import apiClient from './client';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  description: string;
  authority?: string;
  level: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_nodes: number;
  total_edges: number;
  summary: string;
}

export const graphApi = {
  getRelationalMap: (formulation?: Record<string, any>): Promise<KnowledgeGraphResponse> =>
    apiClient.post<KnowledgeGraphResponse>('/graph/relational-map', { formulation }).then((r) => r.data),
};
