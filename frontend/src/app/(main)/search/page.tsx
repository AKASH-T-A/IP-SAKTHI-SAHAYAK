'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { performIntelligentSearch } from '@/lib/intelligence/search';
import { searchApi, SearchApiResponse } from '@/lib/api/search';
import { useCasesStore } from '@/store/cases';
import { useLanguageStore } from '@/store/language';
import { Citation } from '@/lib/intelligence/types';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';

const SUGGESTED_QUERIES_BY_LANG: Record<string, string[]> = {
  hi: [
    'अश्वगंधा पेटेंट (Ashwagandha patent)',
    'Section 3(p) पारंपरिक ज्ञान',
    'Rule 158B आयुष लाइसेंस',
    'जैव विविधता लाभ साझाकरण (ABS)',
    'आयुर्वेद आहार (Ayurveda Aahar)',
    'फॉर्म III NBA',
    'Schedule T GMP',
  ],
  kn: [
    'ಅಶ್ವಗಂಧ ಪೇಟೆಂಟ್ (Ashwagandha patent)',
    'Section 3(p) ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ',
    'Rule 158B ಆಯುಷ್ ಲೈಸೆನ್ಸ್',
    'ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿ (SBB/ABS)',
    'ಆಯುರ್ವೇದ ಆಹಾರ ನಿಯಮಗಳು',
    'ಫಾರ್ಮ್ III NBA',
    'Schedule T GMP',
  ],
  ta: [
    'அஸ்வகந்தா காப்புரிமை (Ashwagandha patent)',
    'Section 3(p) பாரம்பரிய அறிவு',
    'Rule 158B ஆயுஷ் உரிமம்',
    'பல்லுயிர் சட்டம் மற்றும் ABS',
    'படிவம் III NBA',
    'ஆயுர்வேத உணவு விதிமுறைகள்',
  ],
  te: [
    'అశ్వగంధ పేటెంట్ (Ashwagandha patent)',
    'Section 3(p) సంప్రదాయ జ్ఞానం',
    'Rule 158B ఆయుష్ లైసెన్స్',
    'జీవ వైవిధ్య మండలి (ABS)',
    'ఫారం III NBA',
  ],
  default: [
    'Ashwagandha patent',
    'Section 3(p) traditional knowledge',
    'Rule 158B AYUSH license',
    'ABS requirements for medicinal plants',
    'FSSAI Ayurveda Aahar',
    'Schedule T GMP compliance',
    'Form III NBA approval',
  ],
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, t } = useLanguageStore();
  const rawQ = searchParams?.get('q') || '';
  const [queryInput, setQueryInput] = useState(rawQ);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const suggestedQueries = SUGGESTED_QUERIES_BY_LANG[language] || SUGGESTED_QUERIES_BY_LANG.default;

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ipsakti_recent_searches');
        return saved ? JSON.parse(saved) : ['Section 3(p)', 'Rule 158B', 'FSSAI Ayurveda Aahar'];
      } catch {
        return ['Section 3(p)', 'Rule 158B'];
      }
    }
    return ['Section 3(p)', 'Rule 158B'];
  });

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ipsakti_recent_searches', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');

  const { cases } = useCasesStore();
  const [backendResults, setBackendResults] = useState<SearchApiResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    if (!rawQ) {
      setBackendResults(null);
      return;
    }
    let isCancelled = false;
    setIsSearching(true);
    searchApi
      .search(
        rawQ,
        10,
        selectedJurisdiction !== 'ALL' ? selectedJurisdiction : 'India',
        selectedAuthority !== 'ALL' ? selectedAuthority : undefined
      )
      .then((data) => {
        if (!isCancelled) setBackendResults(data);
      })
      .catch((err) => {
        console.warn('Backend search error, falling back to local search engine:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsSearching(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [rawQ, selectedAuthority, selectedJurisdiction]);

  const rawResults = rawQ ? performIntelligentSearch(rawQ, cases) : null;

  // Filter statutory evidence by authority if selected and overlay backend evidence
  const searchResults = React.useMemo(() => {
    if (!rawResults) return null;
    let evidence = rawResults.groups.evidence;
    if (backendResults && backendResults.results && backendResults.results.length > 0) {
      evidence = backendResults.results.map((r) => ({
        sourceId: r.id,
        sourceTitle: r.short_title,
        authority: r.authority,
        hierarchy: { act: r.short_title, section: r.section_number },
        version: 'Official Gazette',
        status: (r.status?.toUpperCase() as any) || 'ACTIVE',
        relevanceExplanation: `Authoritative statutory reference retrieved from legal corpus (${r.jurisdiction})`,
        supportingExcerpt: r.content,
        canonicalUrl: r.source_url,
      }));
    } else if (selectedAuthority !== 'ALL') {
      evidence = evidence.filter((e: Citation) => e.authority.toLowerCase().includes(selectedAuthority.toLowerCase()));
    }
    return {
      ...rawResults,
      detectedIntent: (backendResults?.detected_intent as any) || rawResults.detectedIntent,
      groups: {
        ...rawResults.groups,
        evidence,
      },
    };
  }, [rawResults, backendResults, selectedAuthority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      saveRecentSearch(queryInput.trim());
      router.push(`/search?q=${encodeURIComponent(queryInput.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* Search Header Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('search.breadcrumb')}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', margin: '0 0 1rem', fontWeight: 600 }}>
            {t('search.heading')}
          </h1>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '750px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                }}
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {t('search.btnSearch')}
            </button>
          </form>

          {/* Suggested Query Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.85rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('search.suggestedLabel')}</span>
            {suggestedQueries.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => {
                  setQueryInput(sq);
                  saveRecentSearch(sq);
                  router.push(`/search?q=${encodeURIComponent(sq)}`);
                }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Recent Searches Row */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('search.recentLabel')}</span>
              {recentSearches.map((rq) => (
                <button
                  key={rq}
                  type="button"
                  onClick={() => {
                    setQueryInput(rq);
                    router.push(`/search?q=${encodeURIComponent(rq)}`);
                  }}
                  style={{
                    background: 'rgba(46, 125, 50, 0.08)',
                    border: '1px solid rgba(46, 125, 50, 0.25)',
                    borderRadius: '16px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.72rem',
                    color: 'var(--color-primary-dark)',
                    cursor: 'pointer',
                  }}
                >
                  🕒 {rq}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRecentSearches([]);
                  if (typeof window !== 'undefined') localStorage.removeItem('ipsakti_recent_searches');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginLeft: '0.3rem',
                }}
              >
                {t('search.clearLabel')}
              </button>
            </div>
          )}

          {/* Advanced Filter Toggle & Drawer */}
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: showFilters ? 'var(--bg-emphasis)' : 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span>⚙️</span> {showFilters ? t('search.hideAdvancedFilters') : t('search.advancedFilters')}
              {(selectedAuthority !== 'ALL' || selectedJurisdiction !== 'ALL') && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
              )}
            </button>

            {showFilters && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>
                    {t('search.filterAuthority')}
                  </label>
                  <select
                    value={selectedAuthority}
                    onChange={(e) => setSelectedAuthority(e.target.value)}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                    }}
                  >
                    <option value="ALL">{t('search.allAuthorities')}</option>
                    <option value="Patent">Indian Patent Office (CGPDTM)</option>
                    <option value="Ayush">Ministry of Ayush / CDSCO</option>
                    <option value="Biodiversity">National Biodiversity Authority (NBA)</option>
                    <option value="FSSAI">Food Safety & Standards (FSSAI)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>
                    {t('search.filterJurisdiction')}
                  </label>
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                    }}
                  >
                    <option value="ALL">{t('search.allJurisdictions')}</option>
                    <option value="India">India (Domestic Acts & Rules)</option>
                    <option value="International">International (PCT, Nagoya)</option>
                  </select>
                </div>

                {(selectedAuthority !== 'ALL' || selectedJurisdiction !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAuthority('ALL');
                      setSelectedJurisdiction('ALL');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-dark)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '1.2rem',
                    }}
                  >
                    {t('search.clearLabel')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {isSearching && (
          <div
            style={{
              background: 'rgba(46, 125, 50, 0.08)',
              border: '1px solid rgba(46, 125, 50, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.88rem',
              color: 'var(--color-primary-dark)',
            }}
          >
            <span>⚙️</span>
            <span>Querying authoritative statutory corpus from FastAPI backend...</span>
          </div>
        )}

        {/* Results Area */}
        {!searchResults ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t('search.title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              {t('search.subtitle')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Detected Intent Banner */}
            <div
              style={{
                background: 'rgba(46, 125, 50, 0.05)',
                border: '1px solid rgba(46, 125, 50, 0.25)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '4px',
                      background: 'var(--color-primary)',
                      color: '#fff',
                    }}
                  >
                    {t('common.status')}: {searchResults.detectedIntent}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                    {t('search.stream')} {searchResults.stream}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Interpreted query &ldquo;{searchResults.query}&rdquo; — mapped to relevant statutory pathways rather than flat text.
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('common.status')}: <strong>{Math.round(searchResults.confidence * 100)}%</strong>
              </span>
            </div>

            {/* ─── GROUP 1: IP PATHWAYS ─── */}
            {searchResults.groups.ipPathways.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚖️</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {t('search.ipPathways')}
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {searchResults.groups.ipPathways.map((ip, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem' }}>
                          {ip.badge}
                        </span>
                        <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {ip.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          {ip.subtitle}
                        </p>
                      </div>
                      <Link
                        href={ip.link}
                        style={{
                          marginTop: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--color-primary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        {t('common.view')} →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── GROUP 2: AUTHORITATIVE STATUTORY EVIDENCE ─── */}
            {searchResults.groups.evidence.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📜</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {t('search.statutoryEvidence')}
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {searchResults.groups.evidence.map((ev, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            ● {ev.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ev.authority}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {ev.sourceTitle}
                        </h4>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                          {ev.relevanceExplanation}
                        </p>
                        <blockquote style={{ margin: 0, paddingInlineStart: '0.75rem', borderInlineStart: '3px solid var(--color-primary)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                          &ldquo;{ev.supportingExcerpt}&rdquo;
                        </blockquote>
                      </div>

                      <button
                        onClick={() => setSelectedCitation(ev)}
                        style={{
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--color-primary)',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t('assistant.viewEvidence')} ↗
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── GROUP 3: PRIOR ART & DEFENSE CHECKLIST ─── */}
            {searchResults.groups.priorArtChecklist.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {t('caseDetail.tabPriorArt')}
                  </h2>
                </div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
                  <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {searchResults.groups.priorArtChecklist.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* ─── GROUP 4: MATCHED USER CASES ─── */}
            {searchResults.groups.cases.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📂</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {t('search.matchedCases')}
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {searchResults.groups.cases.map((c) => (
                    <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {c.status}
                      </span>
                      <h4 style={{ margin: '0.5rem 0 0.35rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                        <Link href={c.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </h4>
                      <Link href={c.link} style={{ color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                        {t('common.view')} →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── GROUP 5: RELATED STATUTORY FRAMEWORKS ─── */}
            {searchResults.groups.relatedFrameworks.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {t('caseDetail.tabRegulations')}
                  </h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {searchResults.groups.relatedFrameworks.map((rf, i) => (
                    <Link
                      key={i}
                      href={rf.link}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{rf.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('search.filterAuthority')} {rf.authority}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

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

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading search intelligence...</div>}>
      <SearchContent />
    </Suspense>
  );
}
