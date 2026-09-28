'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/store/language';
import { EvidenceChainStep, Citation } from '@/lib/intelligence/types';
import EvidenceDrawer from './EvidenceDrawer';

interface EvidenceChainViewProps {
  steps: EvidenceChainStep[];
}

export default function EvidenceChainView({ steps }: EvidenceChainViewProps) {
  const { t } = useLanguageStore();
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[selectedStepIndex] || steps[0];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>🔗</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
              {t('label.evidenceChain')}
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            {t('intel.chainTitle')}
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            background: 'rgba(46, 125, 50, 0.08)',
            border: '1px solid rgba(46, 125, 50, 0.25)',
            color: 'var(--color-primary-dark)',
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            fontWeight: 600,
          }}
        >
          {t('intel.groundingTraceActive')}
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
        {t('intel.groundingTraceDesc')}
      </p>

      {/* Horizontal Steps Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {steps.map((step, idx) => {
          const isSelected = selectedStepIndex === idx;
          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => setSelectedStepIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-base)',
                  color: isSelected ? 'var(--color-primary-dark)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--color-primary)' : 'rgba(100, 116, 139, 0.2)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {step.stepNumber}
                </span>
                <span>{step.stageName.replace('_', ' ')}</span>
              </button>

              {idx < steps.length - 1 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Step Detailed Inspector */}
      <div
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Step {currentStep.stepNumber}: {currentStep.stageName.replace('_', ' ')}
            </span>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0.2rem 0 0', fontWeight: 600 }}>
              {currentStep.title}
            </h4>
          </div>

          {currentStep.citation && (
            <button
              onClick={() => setSelectedCitation(currentStep.citation!)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--color-primary-dark)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📖 {t('label.inspectStatute')} →
            </button>
          )}
        </div>

        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
          {currentStep.description}
        </p>

        {/* Facts List */}
        {currentStep.facts && currentStep.facts.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              {t('intel.factTriggered')}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentStep.facts.map((fact, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {fact}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rule Triggered */}
        {currentStep.ruleTriggered && (
          <div style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <strong>{t('intel.ruleApplied')}:</strong> <code style={{ fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>{currentStep.ruleTriggered}</code>
          </div>
        )}

        {/* Action Recommendation */}
        {currentStep.actionRecommendation && (
          <div
            style={{
              background: 'rgba(46, 125, 50, 0.06)',
              border: '1px solid rgba(46, 125, 50, 0.25)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              color: 'var(--color-primary-dark)',
            }}
          >
            <strong>{t('label.nextActions')}:</strong> {currentStep.actionRecommendation}
          </div>
        )}
      </div>

      <EvidenceDrawer
        isOpen={Boolean(selectedCitation)}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
      />
    </div>
  );
}
