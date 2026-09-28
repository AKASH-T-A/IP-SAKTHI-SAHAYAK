'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';
import { EvidenceStrength } from '@/lib/intelligence/types';

interface EvidenceStrengthBadgeProps {
  strength: EvidenceStrength;
  showExplanation?: boolean;
}

export default function EvidenceStrengthBadge({ strength, showExplanation = false }: EvidenceStrengthBadgeProps) {
  const { t } = useLanguageStore();

  let label = t('strength.high');
  let bg = 'rgba(46, 125, 50, 0.1)';
  let color = 'var(--color-primary-dark)';
  let border = '1px solid rgba(46, 125, 50, 0.3)';
  let explanation = 'Supported directly by active official statutory text or Gazette notification.';

  if (strength === 'MODERATE_EVIDENCE') {
    label = t('strength.moderate');
    bg = 'rgba(197, 160, 89, 0.15)';
    color = '#8c6b1f';
    border = '1px solid rgba(197, 160, 89, 0.4)';
    explanation = 'Supported by official guidelines or pharmacopoeial monographs with contextual synthesis.';
  } else if (strength === 'LIMITED_EVIDENCE') {
    label = t('strength.limited');
    bg = 'rgba(234, 88, 12, 0.1)';
    color = '#c2410c';
    border = '1px solid rgba(234, 88, 12, 0.3)';
    explanation = 'Relevant source identified, but applicability depends on missing formulation details.';
  } else if (strength === 'INSUFFICIENT_EVIDENCE') {
    label = t('strength.insufficient');
    bg = 'rgba(220, 38, 38, 0.1)';
    color = '#dc2626';
    border = '1px solid rgba(220, 38, 38, 0.3)';
    explanation = 'No verified authoritative source directly covers this claimed parameter. Safe abstention applies.';
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          background: bg,
          color,
          border,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          width: 'fit-content',
        }}
      >
        <span>●</span> {label}
      </span>
      {showExplanation && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
          {explanation}
        </span>
      )}
    </div>
  );
}
