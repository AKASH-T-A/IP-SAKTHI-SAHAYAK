'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';
import { FullCaseIntelligence } from '@/lib/intelligence/types';
import Link from 'next/link';

interface IntelligenceBoardProps {
  intelligence: FullCaseIntelligence;
  onOpenEvidence?: () => void;
  onOpenGaps?: () => void;
}

export default function IntelligenceBoard({ intelligence, onOpenEvidence, onOpenGaps }: IntelligenceBoardProps) {
  const { t } = useLanguageStore();
  const { ipPathways, regulatoryPathways, absEvaluation, intelligenceBoardStats, prioritizedNextActions, caseId } = intelligence;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '14px',
        padding: '1.75rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        marginBottom: '2.5rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🧭</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>
              {t('label.caseIntelligence')}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            {t('intel.matrixTitle')}
          </h2>
        </div>

        {/* Evidence Metrics Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)', padding: '0.25rem 0.65rem', borderRadius: '16px', fontWeight: 700, border: '1px solid rgba(46, 125, 50, 0.3)' }}>
            ✓ {intelligenceBoardStats.strongCount} {t('strength.high')}
          </span>
          <span style={{ fontSize: '0.78rem', background: 'rgba(197, 160, 89, 0.15)', color: '#8c6b1f', padding: '0.25rem 0.65rem', borderRadius: '16px', fontWeight: 700, border: '1px solid rgba(197, 160, 89, 0.35)' }}>
            ● {intelligenceBoardStats.moderateCount} {t('strength.moderate')}
          </span>
          {intelligenceBoardStats.gapCount > 0 && (
            <span style={{ fontSize: '0.78rem', background: 'rgba(234, 88, 12, 0.12)', color: '#c2410c', padding: '0.25rem 0.65rem', borderRadius: '16px', fontWeight: 700, border: '1px solid rgba(234, 88, 12, 0.3)' }}>
              ⚠ {intelligenceBoardStats.gapCount} {t('label.evidenceGaps')}
            </span>
          )}
        </div>
      </div>

      {/* 4-Column Grid: IP, Regulatory, ABS/TK, Next Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* Column 1: Potential IP */}
        <div style={{ background: 'var(--bg-base)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            ⚖️ {t('explore.ipPatents')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            {ipPathways.map((ip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ip.category}</span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: ip.applicabilityStatus === 'RESTRICTED_BAR' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(46, 125, 50, 0.1)', color: ip.applicabilityStatus === 'RESTRICTED_BAR' ? '#c2410c' : 'var(--color-primary-dark)' }}>
                  {ip.applicabilityStatus === 'RESTRICTED_BAR' ? t('intel.sec3pBar') : t('intel.applicable')}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t('intel.synergyRequired')}
          </div>
        </div>

        {/* Column 2: Regulatory Regime */}
        <div style={{ background: 'var(--bg-base)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            🏛️ {t('explore.ayushFssai')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            {regulatoryPathways.map((reg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{reg.regulatoryBody.split('&')[0]}</span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)' }}>
                  Rule 158B
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t('intel.slaGmpRequired')}
          </div>
        </div>

        {/* Column 3: ABS & Traditional Knowledge */}
        <div style={{ background: 'var(--bg-base)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            🌿 {t('explore.bioAbs')}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            <strong>SBB Section 7:</strong> {absEvaluation.triggersSBBSection7 ? t('intel.sbbSec7Mandatory') : t('intel.sbbSec7Exemption')}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <strong>NBA Section 6:</strong> {t('intel.nbaSec6Title')}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t('intel.benefitSharingRate')}
          </div>
        </div>

        {/* Column 4: Prioritized Next Actions */}
        <div style={{ background: 'var(--bg-base)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            🚀 {t('label.nextActions')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
            <div>{t('intel.actionSbb')}</div>
            <div>{t('intel.actionCoa')}</div>
            <div>{t('intel.actionTm')}</div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
            <Link
              href={`/assistant?context=${encodeURIComponent(intelligence.caseId)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              {t('action.askAI')} 🤖 →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
