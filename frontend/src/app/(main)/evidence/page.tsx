'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';
import { STATUTORY_CORPUS } from '@/lib/intelligence/corpus';
import { Citation, EvidenceSource } from '@/lib/intelligence/types';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';

export default function EvidenceExplorerPage() {
  const { t } = useLanguageStore();
  const [filterAuthority, setFilterAuthority] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const sourcesList: EvidenceSource[] = Object.values(STATUTORY_CORPUS);

  const filteredSources = sourcesList.filter((src) => {
    const matchesAuthority =
      filterAuthority === 'ALL' || src.authority.toLowerCase().includes(filterAuthority.toLowerCase());
    const matchesType = filterType === 'ALL' || src.sourceType === filterType;
    const matchesSearch =
      src.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.hierarchy.act.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.plainSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.officialExcerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAuthority && matchesType && matchesSearch;
  });

  const handleOpenCitation = (src: EvidenceSource) => {
    setSelectedCitation({
      sourceId: src.id,
      sourceTitle: src.title,
      authority: src.authority,
      hierarchy: src.hierarchy,
      version: src.version,
      status: src.status,
      relevanceExplanation: src.plainSummary,
      supportingExcerpt: src.officialExcerpt,
      canonicalUrl: src.canonicalUrl,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('evidence.breadcrumb')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                  {t('evidence.title')}
                </h1>
                <span style={{ padding: '0.2rem 0.65rem', background: 'rgba(46, 125, 50, 0.1)', border: '1px solid rgba(46, 125, 50, 0.3)', borderRadius: '20px', fontSize: '0.72rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                  {t('evidence.badge')}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.5rem 0 0', maxWidth: '720px', lineHeight: 1.5 }}>
                {t('evidence.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={t('evidence.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('evidence.filterAuthority')}</span>
            {[
              { id: 'ALL', label: t('evidence.allAuthorities') },
              { id: 'Patent', label: 'Indian Patent Office' },
              { id: 'AYUSH', label: 'Ministry of AYUSH' },
              { id: 'Biodiversity', label: 'National Biodiversity Authority' },
              { id: 'FSSAI', label: 'FSSAI' },
              { id: 'Trade Marks', label: 'Trade Marks Registry' },
            ].map((auth) => (
              <button
                key={auth.id}
                onClick={() => setFilterAuthority(auth.id)}
                style={{
                  background: filterAuthority === auth.id ? 'var(--color-primary)' : 'var(--bg-base)',
                  color: filterAuthority === auth.id ? '#fff' : 'var(--text-muted)',
                  border: filterAuthority === auth.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {auth.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredSources.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t('evidence.noCorpusFound')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {t('evidence.noCorpusHint')}
            </p>
          </div>
        )}

        {/* Corpus Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredSources.map((src) => (
            <div
              key={src.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)' }}>
                    ● {src.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('evidence.effectiveDate')}: {src.effectiveDate}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 0.3rem', fontWeight: 600 }}>
                  {src.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  {src.authority}
                </div>

                {/* Hierarchy Breadcrumb */}
                <div style={{ background: 'var(--bg-base)', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <strong>{t('evidence.hierarchy')}:</strong> {src.hierarchy.act} {src.hierarchy.chapter ? `→ ${src.hierarchy.chapter}` : ''} → {src.hierarchy.section} {src.hierarchy.clause ? `(${src.hierarchy.clause})` : ''}
                </div>

                {/* Plain Summary */}
                <p style={{ color: 'var(--text-primary)', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  {src.plainSummary}
                </p>

                {/* Verbatim Excerpt */}
                <blockquote style={{ margin: 0, padding: '0.75rem', borderLeft: '3px solid var(--color-primary)', background: 'var(--bg-base)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, borderRadius: '0 6px 6px 0' }}>
                  &ldquo;{src.officialExcerpt}&rdquo;
                </blockquote>
              </div>

              {/* Actions & Verification */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  SHA-256: {src.contentHash.substring(0, 16)}...
                </span>

                <button
                  onClick={() => handleOpenCitation(src)}
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--color-primary-dark)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('evidence.inspectCitation')}
                </button>
              </div>

            </div>
          ))}
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
