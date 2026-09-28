'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';

interface KnowledgeItem {
  id: string;
  category: 'formulation' | 'ip' | 'regulation' | 'abs' | 'tk';
  title: string;
  subtitle: string;
  authority: string;
  actOrRule: string;
  summary: string;
  keyPoints: string[];
  actionLink: string;
  actionKey: string;
  actionText: string;
  tags: string[];
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-sec-3p',
    category: 'ip',
    title: 'Section 3(p) — Traditional Knowledge Exclusion',
    subtitle: 'Indian Patents Act, 1970 (as amended)',
    authority: 'Indian Patent Office (CGPDTM)',
    actOrRule: 'The Patents Act, 1970 — Section 3, Clause (p)',
    summary: 'Prevents the patenting of traditional herbal formulations or trivial aggregations of known properties. An applicant must prove inventive step through non-obvious synergistic efficacy or unexpected technical outcome.',
    keyPoints: [
      'Mere admixture of known medicinal herbs is unpatentable.',
      'Must submit synergistic experimental data (e.g. combination index < 1.0).',
      'TKDL evidence citations are routinely used in patent examination rejections.',
      'Novel extraction apparatus or specific isolated fractions may be eligible.'
    ],
    actionLink: '/cases/new',
    actionKey: 'explore.actSec3p',
    actionText: 'Analyze Formulation under Sec 3(p)',
    tags: ['Patents', 'Section 3(p)', 'Synergy', 'TKDL', 'IP Strategy']
  },
  {
    id: 'kb-rule-158b',
    category: 'regulation',
    title: 'Rule 158B — Ayurvedic Proprietary Medicines',
    subtitle: 'Drugs and Cosmetics Rules, 1945',
    authority: 'Ministry of AYUSH & State Licensing Authorities (SALA)',
    actOrRule: 'Drugs & Cosmetics Rules, 1945 — Rule 158B',
    summary: 'Governs the statutory licensing conditions for patented or proprietary Ayurvedic, Siddha, and Unani medicines containing ingredients cited in classical texts but in novel proportions or combinations.',
    keyPoints: [
      'Category (A): Ingredients cited in authoritative texts for same indications requires published textual citations.',
      'Category (B): Novel indications require pilot clinical trial safety/efficacy data.',
      'Compliance with Ayurvedic Pharmacopoeia of India (API) standards is mandatory.',
      'Heavy metals (Pb, Cd, As, Hg) and microbial counts must be within limits.'
    ],
    actionLink: '/cases/new',
    actionKey: 'explore.actRule158b',
    actionText: 'Start Rule 158B Dossier Case',
    tags: ['Licensing', 'Rule 158B', 'AYUSH', 'Proprietary Medicine', 'Safety']
  },
  {
    id: 'kb-abs-bda',
    category: 'abs',
    title: 'Biological Diversity Act — Commercial Access & Benefit Sharing',
    subtitle: 'National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)',
    authority: 'National Biodiversity Authority (NBA)',
    actOrRule: 'Biological Diversity Act, 2002 — Sections 3, 4, 6 & 7',
    summary: 'Mandates prior intimation or permission when biological resources found in India are utilized for commercial manufacturing or IP applications. Requires fair and equitable benefit sharing.',
    keyPoints: [
      'Section 3: Foreign entities, NRIs, or companies with foreign equity require NBA prior approval.',
      'Section 6: IP applications based on Indian bio-resources require NBA clearance before grant.',
      'Section 7: Indian manufacturers must provide prior intimation to the concerned State Biodiversity Board.',
      'Cultivated vs. wild-harvested sourcing impacts benefit-sharing fee schedules.'
    ],
    actionLink: '/cases/new',
    actionKey: 'explore.actAbs',
    actionText: 'Check NBA/SBB Compliance',
    tags: ['Biodiversity', 'ABS', 'NBA', 'SBB', 'Section 6', 'Conservation']
  },
  {
    id: 'kb-ayurveda-aahar',
    category: 'regulation',
    title: 'Food Safety & Standards (Ayurveda Aahar) Regulations 2022',
    subtitle: 'FSSAI & Ministry of AYUSH Joint Framework',
    authority: 'Food Safety and Standards Authority of India (FSSAI)',
    actOrRule: 'FSS (Ayurveda Aahar) Regulations, 2022',
    summary: 'Special regulatory classification for food prepared in accordance with classical Ayurvedic texts for nutritional and dietary purposes, distinct from therapeutic drugs under the D&C Act.',
    keyPoints: [
      'Must contain recipes or ingredients documented in authoritative Ayurvedic texts.',
      'Cannot be represented as preventing, treating, or curing human diseases.',
      'Must display official Ayurveda Aahar logo and advisory statements on packaging.',
      'Prohibited from adding synthetic vitamins, minerals, or amino acids unless naturally present.'
    ],
    actionLink: '/cases/new',
    actionKey: 'explore.actAahar',
    actionText: 'Formulate for Ayurveda Aahar',
    tags: ['FSSAI', 'Ayurveda Aahar', 'Nutraceutical', 'Dietary', 'Labeling']
  },
  {
    id: 'kb-tkdl-priorart',
    category: 'tk',
    title: 'Traditional Knowledge Digital Library (TKDL)',
    subtitle: 'CSIR & Ministry of AYUSH Prior-Art Repository',
    authority: 'Council of Scientific & Industrial Research (CSIR)',
    actOrRule: 'TKDL Prior Art Database System',
    summary: 'A pioneer database translating classical Ayurvedic, Unani, Siddha, and Sowa-Rigpa formulations into international patent languages to prevent wrongful bio-piracy and misappropriation of traditional knowledge.',
    keyPoints: [
      'Contains over 400,000 digitized traditional formulations with IPC classifications.',
      'Integrated into search systems of EPO, USPTO, JPO, and Indian Patent Office.',
      'Formulations matching TKDL entries face immediate Section 3(p) patent invalidation.',
      'Applicants should formulate with clear technical differentiation from classical monographs.'
    ],
    actionLink: '/cases',
    actionKey: 'explore.actTkdl',
    actionText: 'Search TKDL Classifications in Cases',
    tags: ['TKDL', 'Prior Art', 'CSIR', 'Patent Defense', 'Traditional Heritage']
  },
  {
    id: 'kb-gi-herbal',
    category: 'ip',
    title: 'Geographical Indications (GI) for Indigenous Botanical Products',
    subtitle: 'Geographical Indications of Goods (Registration and Protection) Act, 1999',
    authority: 'Geographical Indications Registry, Chennai',
    actOrRule: 'GI Act, 1999',
    summary: 'Protects traditional agricultural and natural botanical products possessing specific qualities, reputations, or characteristics attributable to their geographic origin.',
    keyPoints: [
      'Examples: Alleppey Cardamom, Malabar Pepper, Kashmir Saffron, Naga Mircha.',
      'Community IP right owned by producers in the declared geographic zone.',
      'Prevents deceptive misuse of regional botanical designations by third-party brands.',
      'Can be synergized with collective trademark filings for grower collectives.'
    ],
    actionLink: '/cases/new',
    actionKey: 'explore.actGi',
    actionText: 'Explore GI Strategy for Sourced Flora',
    tags: ['Geographical Indication', 'GI Registry', 'Botanical Origin', 'Farmers Rights']
  }
];

export default function ExplorePage() {
  const { t } = useLanguageStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filteredItems = KNOWLEDGE_BASE.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase()) ||
      item.actOrRule.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('explore.breadcrumb')}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            {t('explore.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            {t('explore.subtitle')}
          </p>
        </div>

        {/* Search & Category Filter */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Search Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.25rem 0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={t('explore.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            {[
              { id: 'all', label: t('explore.allFrameworks') },
              { id: 'ip', label: t('explore.ipPatents') },
              { id: 'regulation', label: t('explore.ayushFssai') },
              { id: 'abs', label: t('explore.bioAbs') },
              { id: 'tk', label: t('explore.tkTkdl') },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--bg-base)',
                  color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
                  border: activeCategory === cat.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <p>{t('explore.noItems')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.5rem' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
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
                  {/* Meta Header - Canonical Gazette details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(46, 125, 50, 0.1)',
                        color: 'var(--color-primary-dark)',
                      }}
                    >
                      {item.authority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.actOrRule}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.25rem', lineHeight: 1.35 }}>
                    {item.title}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontWeight: 500 }}>
                    {item.subtitle}
                  </div>

                  {/* Summary */}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {item.summary}
                  </p>

                  {/* Key Points Bullet List */}
                  <div style={{ background: 'var(--bg-base)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      {t('explore.statutoryHighlights')}
                    </div>
                    <ul style={{ margin: 0, paddingInlineStart: '1.1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {item.keyPoints.map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Link & Tags */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {item.tags.map((tg) => (
                      <span
                        key={tg}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border-color)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                        }}
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={item.actionLink}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-primary-dark)',
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t(item.actionKey) || item.actionText} →
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
