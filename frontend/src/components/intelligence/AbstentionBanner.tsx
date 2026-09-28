'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/store/language';
import { SafeAbstentionState, Citation } from '@/lib/intelligence/types';
import EvidenceDrawer from './EvidenceDrawer';

interface AbstentionBannerProps {
  abstention: SafeAbstentionState;
  onProvideMoreInfo?: () => void;
}

export default function AbstentionBanner({ abstention, onProvideMoreInfo }: AbstentionBannerProps) {
  const { t } = useLanguageStore();
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [expertRequested, setExpertRequested] = useState(false);

  if (!abstention.isAbstained) return null;

  return (
    <div
      style={{
        background: 'rgba(234, 88, 12, 0.04)',
        border: '1.5px solid rgba(234, 88, 12, 0.35)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(234, 88, 12, 0.12)',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0,
          }}
        >
          🛡️
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(234, 88, 12, 0.15)',
                color: '#c2410c',
              }}
            >
              {t('abstain.title')}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            {t('abstain.desc')}
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
            {abstention.reason || 'Under IP-SAKTI safety principles, deterministic rules withhold legal classifications when essential statutory parameters are absent to prevent regulatory misinformation.'}
          </p>

          {/* Missing Fields Checklist */}
          {abstention.missingFields.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                {t('abstain.missing')}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {abstention.missingFields.map((field, idx) => (
                  <li key={idx} style={{ color: '#c2410c', fontWeight: 500 }}>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Remedies */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {onProvideMoreInfo && (
              <button
                onClick={onProvideMoreInfo}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(46, 125, 50, 0.2)',
                }}
              >
                {t('abstain.remedy')} ✍️
              </button>
            )}

            {abstention.availableEvidenceFallback && abstention.availableEvidenceFallback.length > 0 && (
              <button
                onClick={() => setSelectedCitation(abstention.availableEvidenceFallback![0])}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t('label.inspectStatute')} 📚
              </button>
            )}

            <button
              onClick={() => setExpertRequested(true)}
              disabled={expertRequested}
              style={{
                background: 'transparent',
                border: '1px dashed var(--border-color)',
                color: expertRequested ? 'var(--color-primary-dark)' : 'var(--text-muted)',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.85rem',
                cursor: expertRequested ? 'default' : 'pointer',
              }}
            >
              {expertRequested ? '✓ Expert Review Requested (SIH Facilitation Unit)' : 'Request Expert Statutory Review 🏛️'}
            </button>
          </div>

        </div>
      </div>

      <EvidenceDrawer
        isOpen={Boolean(selectedCitation)}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
      />
    </div>
  );
}
