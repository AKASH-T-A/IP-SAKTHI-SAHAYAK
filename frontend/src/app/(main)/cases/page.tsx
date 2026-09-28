'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCasesStore, CaseItem } from '@/store/cases';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';

export default function CasesPage() {
  const router = useRouter();
  const { cases, deleteCase } = useCasesStore();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useLanguageStore();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'demo'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('cases.loadingWorkspace')}</div>
      </div>
    );
  }

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.formulation.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return c.status === 'active' && !c.is_demo;
    if (statusFilter === 'draft') return c.status === 'draft';
    if (statusFilter === 'demo') return !!c.is_demo;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Breadcrumb & Context Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('cases.title')}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  {t('cases.title')}
                </h1>
                <span
                  style={{
                    padding: '0.2rem 0.65rem',
                    background: 'rgba(46, 125, 50, 0.1)',
                    border: '1px solid rgba(46, 125, 50, 0.3)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 600,
                  }}
                >
                  {t('cases.badge')}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
                {t('cases.subtitle')}
              </p>
            </div>

            <Link
              href="/cases/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {t('cases.newCase')}
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 300px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={t('cases.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                  fontSize: '0.85rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[
              { id: 'all', labelKey: 'cases.all' },
              { id: 'active', labelKey: 'cases.active' },
              { id: 'draft', labelKey: 'cases.draft' },
              { id: 'demo', labelKey: 'cases.demo' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                style={{
                  background: statusFilter === f.id ? 'var(--color-primary)' : 'transparent',
                  color: statusFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                  border: statusFilter === f.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Case List or Empty State */}
        {filteredCases.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(46, 125, 50, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t('cases.emptyTitle')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              {searchQuery
                ? t('cases.noMatch', { query: searchQuery })
                : t('cases.emptyDesc')}
            </p>
            <Link
              href="/cases/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {t('cases.startFirst')} →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filteredCases.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: item.is_demo ? '1px solid rgba(197, 160, 89, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Header row: Status badge + Jurisdiction */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background:
                            item.status === 'active'
                              ? 'rgba(46, 125, 50, 0.1)'
                              : 'rgba(100, 116, 139, 0.1)',
                          color:
                            item.status === 'active'
                              ? 'var(--color-primary-dark)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {item.status === 'active' ? t('cases.active') : item.status === 'draft' ? t('cases.draft') : item.status}
                      </span>
                      {item.is_demo && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(197, 160, 89, 0.15)',
                            color: '#8c6b1f',
                            border: '1px solid rgba(197, 160, 89, 0.3)',
                          }}
                        >
                          {t('cases.demo')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      🇮🇳 {item.jurisdiction === 'India' ? t('cases.jurisdictionIndia') : item.jurisdiction}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                    <Link href={`/cases/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </h2>

                  {/* Description */}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  {/* Formulation DNA preview */}
                  <div style={{ background: 'var(--bg-base)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                      {t('wizard.step2.title')}:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {item.formulation.ingredients.map((ing) => (
                        <span
                          key={ing.id}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.78rem',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          🌿 {ing.name} {ing.percentage ? `(${ing.percentage}%)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer / CTA Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('cases.updated', { time: new Date(item.updated_at).toLocaleDateString() })}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!item.is_demo && (
                      <button
                        onClick={() => {
                          if (confirm(t('cases.confirmDelete'))) {
                            deleteCase(item.id);
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem',
                        }}
                      >
                        {t('cases.delete')}
                      </button>
                    )}
                    <Link
                      href={`/cases/${item.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}
                    >
                      {t('cases.openDossier')} →
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
