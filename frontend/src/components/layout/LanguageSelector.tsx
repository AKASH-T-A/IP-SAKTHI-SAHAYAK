'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguageStore, LanguageCode } from '@/store/language';
import { ALL_LANGUAGES, LanguageMeta, getLanguageMeta } from '@/i18n/languages';

function GlobeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showCoverage, setShowCoverage] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentMeta = getLanguageMeta(language);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation: Escape closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filtered languages based on search query
  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    return ALL_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.script.toLowerCase().includes(q) ||
        l.regionGroup.toLowerCase().includes(q)
    );
  }, [query]);

  // Group languages for organized browsing
  const groupedLanguages = useMemo(() => {
    if (query.trim()) {
      return [{ groupName: 'Search Results', items: filteredLanguages }];
    }
    const groups: { groupName: string; items: LanguageMeta[] }[] = [];
    const map = new Map<string, LanguageMeta[]>();

    ALL_LANGUAGES.forEach((l) => {
      const g = map.get(l.regionGroup) || [];
      g.push(l);
      map.set(l.regionGroup, g);
    });

    map.forEach((items, groupName) => {
      groups.push({ groupName, items });
    });
    return groups;
  }, [filteredLanguages, query]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Trigger Button ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select application language. Current language: ${currentMeta.nativeName} (${currentMeta.name})`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)',
          padding: '5px 12px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--green-600)';
          e.currentTarget.style.background = 'var(--bg-surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.background = 'var(--bg-subtle)';
        }}
      >
        <span style={{ color: 'var(--green-700)', display: 'flex', alignItems: 'center' }}>
          <GlobeIcon size={14} />
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--green-900)' }}>
          {currentMeta.nativeName}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          ({currentMeta.name})
        </span>
        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: '1px' }}>▼</span>
      </button>

      {/* ── Language Selector Popover Modal ───────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Language selection modal"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            width: '360px',
            maxWidth: '92vw',
            maxHeight: '480px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            animation: 'fadeIn 150ms ease',
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GlobeIcon size={15} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {t('home.hero.multilingual_title')}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                aria-label={t('common.close')}
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', insetInlineStart: '10px', color: 'var(--text-muted)' }}>
                <SearchIcon size={13} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${t('nav.search')} (${t('nav.language')})...`}
                style={{
                  width: '100%',
                  paddingTop: '7px',
                  paddingBottom: '7px',
                  paddingInlineStart: '30px',
                  paddingInlineEnd: '28px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'white',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', insetInlineEnd: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                  aria-label={t('common.clear')}
                >
                  <CloseIcon size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {filteredLanguages.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {t('cases.noMatch')}
              </div>
            ) : (
              groupedLanguages.map((group) => (
                <div key={group.groupName} style={{ marginBottom: '8px' }}>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '4px 8px 2px',
                    }}
                  >
                    {group.groupName}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                    {group.items.map((l) => {
                      const isSelected = l.code === language;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelectLanguage(l.code)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '7px 10px',
                            background: isSelected ? 'var(--green-50, #E8F5E9)' : 'none',
                            border: isSelected ? '1px solid var(--green-600)' : '1px solid transparent',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            textAlign: 'start',
                            transition: 'background 120ms ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.9375rem',
                                fontWeight: 700,
                                color: isSelected ? 'var(--green-900)' : 'var(--text-primary)',
                              }}
                            >
                              {l.nativeName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {l.name}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {l.dir === 'rtl' && (
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: '#FEF3C7',
                                  color: '#92400E',
                                  fontWeight: 600,
                                }}
                              >
                                RTL
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'var(--bg-subtle)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {l.script}
                            </span>
                            {isSelected && (
                              <span style={{ color: 'var(--green-700)', display: 'flex', alignItems: 'center' }}>
                                <CheckIcon size={14} />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Notice */}
          <div
            style={{
              padding: '8px 14px',
              background: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-default)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Section numbers & legal citations remain canonical.</span>
            <button
              type="button"
              onClick={() => setShowCoverage(!showCoverage)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--green-700)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.6875rem',
                textDecoration: 'underline',
              }}
            >
              {showCoverage ? 'Hide Coverage' : 'Coverage Matrix'}
            </button>
          </div>

          {/* Translation Coverage Matrix Drawer */}
          {showCoverage && (
            <div
              style={{
                maxHeight: '140px',
                overflowY: 'auto',
                background: 'white',
                borderTop: '1px solid var(--border-default)',
                padding: '8px 12px',
                fontSize: '0.6875rem',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                Translation Readiness Status:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                <div>• English (en): 100% (Canonical)</div>
                <div>• हिन्दी (hi): 100% (Reviewed)</div>
                <div>• ಕನ್ನಡ (kn): 100% (Reviewed)</div>
                <div>• தமிழ் (ta): 100% (Reviewed)</div>
                <div>• తెలుగు (te): 100% (Reviewed)</div>
                <div>• മലയാളം (ml): 100% (Reviewed)</div>
                <div>• বাংলা (bn): 100% (Reviewed)</div>
                <div>• मराठी (mr): 100% (Reviewed)</div>
                <div>• ગુજરાતી (gu): 100% (Reviewed)</div>
                <div>• ਪੰਜਾਬੀ (pa): 100% (Reviewed)</div>
                <div>• ଓଡ଼ିଆ (or): 100% (Reviewed)</div>
                <div>• অসমীয়া (as): 100% (Reviewed)</div>
                <div>• اردو (ur): 100% (Reviewed, RTL)</div>
                <div>• संस्कृतम् (sa): 100% (Reviewed)</div>
                <div>• 9 Scheduled: English fallback active</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
