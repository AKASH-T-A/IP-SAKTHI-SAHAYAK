'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/store/language';

interface GraphNode {
  id: string;
  label: string;
  type: 'formulation' | 'ingredient' | 'biological_resource' | 'traditional_knowledge' | 'ip' | 'regulation' | 'authority' | 'jurisdiction';
  description: string;
  authority?: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

const DEFAULT_NODES: GraphNode[] = [
  { id: 'n-form', label: 'Medhya Rasayana Synergy', type: 'formulation', description: 'Core standardized polyherbal formulation combining Ashwagandha and Brahmi extracts.', x: 380, y: 140 },
  { id: 'n-ing1', label: 'Ashwagandha (Root)', type: 'ingredient', description: 'Withania somnifera (L.) Dunal. Sourced from Neemuch, Madhya Pradesh.', x: 120, y: 50 },
  { id: 'n-ing2', label: 'Brahmi (Whole Plant)', type: 'ingredient', description: 'Bacopa monnieri (L.) Wettst. Cultivated in wetland habitats.', x: 120, y: 220 },
  { id: 'n-bio', label: 'Indian Biological Resource', type: 'biological_resource', description: 'Subject to Access and Benefit Sharing under Biological Diversity Act 2002.', x: 120, y: 340 },
  { id: 'n-tk', label: 'Charaka & Sushruta Samhita', type: 'traditional_knowledge', description: 'Classical Ayurvedic Sanskrit treatises documenting Medhya Rasayana properties.', x: 380, y: 20 },
  { id: 'n-ip-3p', label: 'Patents Act § 3(p) [TK Bar]', type: 'ip', description: 'Excludes aggregations of traditional knowledge. Synergy data required.', authority: 'Indian Patent Office', x: 650, y: 40 },
  { id: 'n-ip-tm', label: 'Trade Mark (Class 5)', type: 'ip', description: 'Brand identity protection for pharmaceutical/herbal remedies.', authority: 'Trade Marks Registry', x: 650, y: 130 },
  { id: 'n-reg-158b', label: 'D&C Rules Rule 158B', type: 'regulation', description: 'Licensing pathway for Ayurvedic Proprietary Medicines.', authority: 'Ministry of Ayush', x: 650, y: 220 },
  { id: 'n-abs', label: 'BDA 2002 § 6 & § 7 (ABS)', type: 'regulation', description: 'SBB Form I prior intimation and NBA Form III patent approval obligations.', authority: 'NBA & State Biodiversity Boards', x: 380, y: 340 },
  { id: 'n-auth-ayush', label: 'Ministry of Ayush / SLA', type: 'authority', description: 'State Licensing Authority issuing manufacturing licenses.', x: 890, y: 220 },
  { id: 'n-auth-ipo', label: 'CGPDTM (Patent Office)', type: 'authority', description: 'Examines novelty, inventive step, and Section 3(p) objections.', x: 890, y: 80 },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { from: 'n-ing1', to: 'n-form', label: 'INGREDIENT' },
  { from: 'n-ing2', to: 'n-form', label: 'INGREDIENT' },
  { from: 'n-ing1', to: 'n-bio', label: 'HARVESTED_AS' },
  { from: 'n-ing2', to: 'n-bio', label: 'HARVESTED_AS' },
  { from: 'n-form', to: 'n-tk', label: 'BASED_ON' },
  { from: 'n-tk', to: 'n-ip-3p', label: 'TRIGGERS_BAR' },
  { from: 'n-form', to: 'n-ip-tm', label: 'PROTECTED_BY' },
  { from: 'n-form', to: 'n-reg-158b', label: 'LICENSED_UNDER' },
  { from: 'n-bio', to: 'n-abs', label: 'GOVERNED_BY' },
  { from: 'n-ip-3p', to: 'n-auth-ipo', label: 'EXAMINED_BY' },
  { from: 'n-reg-158b', to: 'n-auth-ayush', label: 'APPROVED_BY' },
];

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  formulation: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '🧪' },
  ingredient: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', icon: '🌿' },
  biological_resource: { bg: '#fefce8', border: '#eab308', text: '#854d0e', icon: '🌱' },
  traditional_knowledge: { bg: '#fff7ed', border: '#f97316', text: '#9a3412', icon: '📜' },
  ip: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '⚖️' },
  regulation: { bg: '#faf5ff', border: '#a855f7', text: '#6b21a8', icon: '🏛️' },
  authority: { bg: '#f8fafc', border: '#64748b', text: '#334155', icon: '🏢' },
  jurisdiction: { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490', icon: '🗺️' },
};

export default function RelationshipMap({
  customNodes,
  customEdges,
}: {
  customNodes?: GraphNode[];
  customEdges?: GraphEdge[];
}) {
  const { t } = useLanguageStore();
  const nodes = customNodes || DEFAULT_NODES;
  const edges = customEdges || DEFAULT_EDGES;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = filterType === 'all' ? nodes : nodes.filter((n) => n.type === filterType || n.type === 'formulation');
  const nodeMap = new Map(filteredNodes.map((n) => [n.id, n]));

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              margin: '0 0 0.25rem',
              fontWeight: 600,
            }}
          >
            🕸️ {t('intel.provenanceTracer') || 'Relational Knowledge Graph (Provenance & Statutory Mapping)'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            PostgreSQL relational graph structure: Botanical Ingredients → Traditional Knowledge → Formulation → IP Regimes → Regulations → Authorities.
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'ingredient', 'traditional_knowledge', 'ip', 'regulation', 'authority'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                background: filterType === f ? 'var(--green-700)' : 'var(--bg-base)',
                color: filterType === f ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          background: 'var(--bg-base)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1020 420" style={{ cursor: 'grab' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" opacity="0.6" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((e, idx) => {
            const source = nodeMap.get(e.from);
            const target = nodeMap.get(e.to);
            if (!source || !target) return null;

            const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);

            return (
              <g key={idx}>
                <line
                  x1={source.x + 75}
                  y1={source.y + 25}
                  x2={target.x + 75}
                  y2={target.y + 25}
                  stroke={isHighlighted ? 'var(--green-700)' : 'var(--border-color)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={e.label.includes('BAR') ? '4 3' : undefined}
                  markerEnd="url(#arrow)"
                />
                <text
                  x={(source.x + target.x) / 2 + 75}
                  y={(source.y + target.y) / 2 + 20}
                  fontSize="9"
                  fill="var(--text-muted)"
                  textAnchor="middle"
                  style={{ userSelect: 'none' }}
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((n) => {
            const conf = TYPE_COLORS[n.type] || TYPE_COLORS.formulation;
            const isSelected = selectedNode?.id === n.id;

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={() => setSelectedNode(n)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width="150"
                  height="50"
                  rx="8"
                  fill={conf.bg}
                  stroke={isSelected ? '#000' : conf.border}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : undefined}
                />
                <text x="10" y="22" fontSize="12" fontWeight="700" fill={conf.text}>
                  {conf.icon} {n.label.length > 18 ? n.label.slice(0, 18) + '...' : n.label}
                </text>
                <text x="10" y="38" fontSize="9" fill="var(--text-muted)">
                  {n.type.replace('_', ' ').toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer overlay */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              maxWidth: '340px',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: TYPE_COLORS[selectedNode.type]?.bg,
                  color: TYPE_COLORS[selectedNode.type]?.text,
                  border: `1px solid ${TYPE_COLORS[selectedNode.type]?.border}`,
                }}
              >
                {selectedNode.type.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {selectedNode.label}
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.4rem' }}>
              {selectedNode.description}
            </div>
            {selectedNode.authority && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                <strong>Statutory Authority:</strong> {selectedNode.authority}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
