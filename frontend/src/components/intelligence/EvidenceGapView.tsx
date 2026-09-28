'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';
import { EvidenceGap } from '@/lib/intelligence/types';

interface EvidenceGapViewProps {
  gaps: EvidenceGap[];
}

export default function EvidenceGapView({ gaps }: EvidenceGapViewProps) {
  const { t } = useLanguageStore();

  if (!gaps || gaps.length === 0) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>✅</div>
        <h4 style={{ margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>{t('intel.noGapsTitle')}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t('intel.noGapsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '2.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1rem', color: '#c2410c' }}>⚠</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c2410c' }}>
              {t('label.evidenceGaps')}
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            {t('intel.gapsTitle')} ({gaps.length})
          </h3>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {t('intel.dynamicallyEvaluated')}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {gaps.map((gap) => (
          <div
            key={gap.id}
            style={{
              background: 'var(--bg-base)',
              border: gap.severity === 'CRITICAL' ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid var(--border-color)',
              borderInlineStart: gap.severity === 'CRITICAL' ? '4px solid #dc2626' : '4px solid #c2410c',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {gap.title}
              </h4>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: gap.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(197, 160, 89, 0.2)',
                  color: gap.severity === 'CRITICAL' ? '#dc2626' : '#8c6b1f',
                }}
              >
                {gap.severity}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {t('intel.plainSummary')}:
                </strong>
                <span style={{ color: 'var(--text-muted)', lineHeight: 1.45 }}>{gap.whyItMatters}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {t('intel.resolutionStrategy')}:
                </strong>
                <span style={{ color: 'var(--text-muted)', lineHeight: 1.45 }}>{gap.whatToProvide}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {t('intel.factTriggered')}:
                </strong>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.45 }}>{gap.decisionAffected}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
