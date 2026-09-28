'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';
import { WhySeeingThisData, Citation } from '@/lib/intelligence/types';

interface WhySeeingThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhySeeingThisData | null;
  onViewEvidence?: (citation: Citation) => void;
}

export default function WhySeeingThisModal({ isOpen, onClose, data, onViewEvidence }: WhySeeingThisModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen || !data) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 25, 15, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--bg-surface)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1rem' }}>💡</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>
                {t('intel.deterministicVerification')}
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('intel.whyTitle')}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {data.title}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* 1. Facts Detected */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            1. {t('intel.factTriggered')}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.factsDetected.map((fact, idx) => (
              <span
                key={idx}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                }}
              >
                ✓ {fact}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Deterministic Rule Triggered */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            2. {t('intel.ruleApplied')}:
          </div>
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <code>{data.ruleTriggered}</code>
          </div>
        </div>

        {/* 3. Evidence Retrieved */}
        {data.evidenceRetrieved.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              3. {t('label.citations')}:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {data.evidenceRetrieved.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.sourceTitle}</span>
                  {onViewEvidence && (
                    <button
                      onClick={() => onViewEvidence(ev)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}
                    >
                      {t('label.inspectStatute')} ↗
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Missing Information */}
        {data.missingInformation.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              4. {t('intel.gapsTitle')}:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#c2410c', lineHeight: 1.5 }}>
              {data.missingInformation.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Result Summary */}
        <div style={{ background: 'rgba(46, 125, 50, 0.06)', border: '1px solid rgba(46, 125, 50, 0.25)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            5. {t('caseDetail.classificationVerdict')}:
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {data.resultSummary}
          </div>
        </div>

      </div>
    </div>
  );
}
