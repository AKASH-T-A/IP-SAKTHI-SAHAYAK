'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';
import { Citation } from '@/lib/intelligence/types';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citation: Citation | null;
}

export default function EvidenceDrawer({ isOpen, onClose, citation }: EvidenceDrawerProps) {
  const { t } = useLanguageStore();

  if (!isOpen || !citation) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 15, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderInlineStart: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 24px rgba(0,0,0,0.15)',
          animation: 'slideLeft 0.25s ease',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: 'var(--bg-base)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(46, 125, 50, 0.1)',
                  color: 'var(--color-primary-dark)',
                  border: '1px solid rgba(46, 125, 50, 0.3)',
                }}
              >
                ● {citation.status} {t('intel.authority')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {citation.version}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {citation.sourceTitle}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {citation.authority}
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
              padding: '0.2rem 0.5rem',
            }}
            aria-label={t('intel.closeDrawer')}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          
          {/* Statutory Legal Hierarchy */}
          <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {t('intel.hierarchy')}:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
              <div><strong>{t('intel.act')}:</strong> {citation.hierarchy.act}</div>
              {citation.hierarchy.chapter && <div><strong>{t('intel.chapter')}:</strong> {citation.hierarchy.chapter}</div>}
              <div><strong>{t('intel.section')}:</strong> {citation.hierarchy.section}</div>
              {citation.hierarchy.subsection && <div><strong>{t('intel.subsection')}:</strong> {citation.hierarchy.subsection}</div>}
              {citation.hierarchy.clause && <div><strong>{t('intel.clause')}:</strong> {citation.hierarchy.clause}</div>}
            </div>
          </div>

          {/* Relevance Explanation */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
              {t('evidence.why_applies')}:
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, background: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.3)', borderRadius: '8px', padding: '0.85rem' }}>
              {citation.relevanceExplanation}
            </div>
          </div>

          {/* Official Verbatim Excerpt */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
              {t('intel.excerpt')}:
            </div>
            <blockquote
              style={{
                margin: 0,
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--bg-base)',
                borderInlineStart: '4px solid var(--color-primary)',
                fontStyle: 'italic',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              &ldquo;{citation.supportingExcerpt}&rdquo;
            </blockquote>
          </div>

          {/* Explicit Evidentiary Boundaries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(46, 125, 50, 0.05)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                ✓ {t('evidence.what_source_establishes')}:
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {t('intel.whatSourceEstablishes')} ({citation.authority} - {citation.hierarchy.act})
              </div>
            </div>

            <div style={{ background: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                ✕ {t('evidence.what_source_does_not_establish')}:
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {t('intel.whatSourceDoesNotEstablish')}
              </div>
            </div>
          </div>

          {/* Verification & Canonical Source Link */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {t('evidence.canonical_notice')}
            </div>
            <a
              href={citation.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {t('intel.openExternal')} ({t('evidence.view_source')}) ↗
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
