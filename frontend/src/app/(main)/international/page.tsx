'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';
import JurisdictionSwitch from '@/components/layout/JurisdictionSwitch';

interface MarketInfo {
  market: string;
  flag: string;
  framework: string;
  authority: string;
  pathway: string;
  keyRequirements: string[];
  ipTreaties: string[];
  status: 'FULL_COVERAGE' | 'SELECTIVE_PATHWAY' | 'INSUFFICIENT_COVERAGE';
  citation: string;
  caution: string;
}

const INTERNATIONAL_MARKETS: MarketInfo[] = [
  {
    market: 'European Union (EU)',
    flag: '🇪🇺',
    framework: 'Directive 2004/24/EC (THMPD) & Directive 2001/83/EC',
    authority: 'European Medicines Agency (EMA) / Committee on Herbal Medicinal Products (HMPC)',
    pathway: 'Simplified Traditional Herbal Registration (THR)',
    keyRequirements: [
      'Documented evidence of traditional medicinal use for at least 30 years (with at least 15 years within the EU).',
      'European Pharmacopoeia monograph quality compliance (limits on heavy metals, mycotoxins, pesticide residues).',
      'Indications restricted to self-medication (non-prescription OTC herbal remedies).',
      'Manufacturing under EU-equivalent Good Manufacturing Practices (EU GMP).'
    ],
    ipTreaties: ['European Patent Convention (EPC)', 'PCT', 'Madrid Protocol', 'Nagoya Protocol'],
    status: 'FULL_COVERAGE',
    citation: 'EU Directive 2004/24/EC Articles 16a-16i',
    caution: 'Without 15 years documented use in the EU, full marketing authorization with bibliographic clinical safety data is required.'
  },
  {
    market: 'United States (USA)',
    flag: '🇺🇸',
    framework: 'DSHEA 1994 (Dietary Supplements) & FDA Botanical Drug Guidance (21 CFR Part 312)',
    authority: 'U.S. Food and Drug Administration (FDA), CDER & CFSAN',
    pathway: 'Dietary Supplement Notification (Structure/Function Claims) OR Prescription Botanical IND/NDA',
    keyRequirements: [
      'Dietary Supplements: cGMP 21 CFR Part 111 compliance, New Dietary Ingredient (NDI) notification if post-1994.',
      'Mandatory DSHEA disclaimer: "These statements have not been evaluated by the FDA. Not intended to treat, cure, or prevent any disease."',
      'Botanical Drugs: Phase 1-3 clinical trials, batch-to-batch chemical fingerprinting (HPLC/LC-MS), raw material botanical controls.'
    ],
    ipTreaties: ['USPTO Patent Law', 'PCT', 'Madrid Protocol'],
    status: 'FULL_COVERAGE',
    citation: 'US FDA Botanical Drug Guidance for Industry (2016)',
    caution: 'Ayurvedic formulations sold as dietary supplements CANNOT claim to treat diabetes, hypertension, or cancer. FDA issues immediate warning letters for therapeutic claims.'
  },
  {
    market: 'United Kingdom (UK)',
    flag: '🇬🇧',
    framework: 'Human Medicines Regulations 2012 / Traditional Herbal Registration (THR)',
    authority: 'Medicines and Healthcare products Regulatory Agency (MHRA)',
    pathway: 'Traditional Herbal Registration (THR Scheme)',
    keyRequirements: [
      'Demonstrated 30 years traditional use (including at least 15 years in the UK or EU).',
      'Display of official THR certification mark and approved patient information leaflet (PIL).',
      'Proof of safety and pharmacopoeial quality.'
    ],
    ipTreaties: ['UK Intellectual Property Office (UKIPO)', 'PCT', 'Madrid System'],
    status: 'FULL_COVERAGE',
    citation: 'MHRA Traditional Herbal Registration Scheme Guidance',
    caution: 'Post-Brexit UK maintains separate MHRA national registers distinct from the EMA herbal monographs.'
  },
  {
    market: 'Japan',
    flag: '🇯🇵',
    framework: 'Pharmaceutical and Medical Devices Act (PMD Act)',
    authority: 'Pharmaceuticals and Medical Devices Agency (PMDA) & MHLW',
    pathway: 'Kampo Formulation Alignment OR Foods with Function Claims (FFC)',
    keyRequirements: [
      'Conformity to Japanese Pharmacopoeia (JP) standards for crude drugs.',
      'Foods with Function Claims: Scientific evidence submitted to Consumer Affairs Agency.',
      'Strict microbial and aflatoxin limits.'
    ],
    ipTreaties: ['Japan Patent Office (JPO)', 'PCT', 'Madrid Protocol'],
    status: 'SELECTIVE_PATHWAY',
    citation: 'PMDA Herbal & Crude Drug Regulation Standards',
    caution: 'Non-Kampo Indian Ayurvedic herbs face prolonged review unless matched to existing approved food ingredients.'
  },
  {
    market: 'Australia',
    flag: '🇦🇺',
    framework: 'Therapeutic Goods Act 1989 (Complementary Medicines)',
    authority: 'Therapeutic Goods Administration (TGA)',
    pathway: 'Listed Medicine (AUST L) via Electronic Portal',
    keyRequirements: [
      'Ingredients must be selected from the TGA Permitted Ingredients List.',
      'Indications must be selected from pre-approved permitted indications list.',
      'TGA GMP clearance for the manufacturing facility.'
    ],
    ipTreaties: ['IP Australia', 'PCT', 'Budapest Treaty'],
    status: 'FULL_COVERAGE',
    citation: 'Therapeutic Goods (Permitted Indications) Determination',
    caution: 'Any novel herbal extract not on the Permitted Ingredients List requires a full evaluated AUST R Registered medicine submission.'
  },
  {
    market: 'Other / Emerging Markets',
    flag: '🌍',
    framework: 'National Regulatory Authorities (WHO Guidelines on Herbal Medicines)',
    authority: 'National Health Authorities',
    pathway: 'Case-by-Case Import Permit',
    keyRequirements: [
      'Certificate of a Pharmaceutical Product (CoPP) under WHO Certification Scheme issued by DCGI/Ayush.',
      'Free Sale Certificate (FSC) from Ministry of Ayush.',
      'NABL Batch Certificate of Analysis.'
    ],
    ipTreaties: ['WIPO GRATK Treaty 2024', 'CBD / Nagoya Protocol'],
    status: 'INSUFFICIENT_COVERAGE',
    citation: 'WHO Guidelines on Quality Control of Herbal Medicines',
    caution: 'Authoritative coverage is currently insufficient for this jurisdiction. Safe abstention applies: consult local in-country regulatory counsel.'
  }
];

export default function InternationalPage() {
  const { t } = useLanguageStore();
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo>(INTERNATIONAL_MARKETS[0]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t('international.treatiesTitle')}</span>
          </div>

          <JurisdictionSwitch />
        </div>

        {/* Header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌐</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#1e40af', background: 'rgba(30, 64, 175, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              International Jurisdictions & Export Frameworks
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            {t('international.treatiesTitle')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            {t('international.treatiesDesc')}
          </p>
        </div>

        {/* Market Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {INTERNATIONAL_MARKETS.map((m) => {
            const isSelected = selectedMarket.market === m.market;
            return (
              <button
                key={m.market}
                onClick={() => setSelectedMarket(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #1e40af' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(30, 64, 175, 0.08)' : 'var(--bg-surface)',
                  color: isSelected ? '#1e40af' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{m.flag}</span>
                <span>{m.market}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Market Detail Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedMarket.flag}</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                  {selectedMarket.market} Regulatory Architecture
                </h2>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Governing Authority: <strong>{selectedMarket.authority}</strong>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: selectedMarket.status === 'FULL_COVERAGE' ? 'rgba(46, 125, 50, 0.12)' : selectedMarket.status === 'SELECTIVE_PATHWAY' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(234, 88, 12, 0.12)',
                color: selectedMarket.status === 'FULL_COVERAGE' ? 'var(--color-primary-dark)' : selectedMarket.status === 'SELECTIVE_PATHWAY' ? '#8c6b1f' : '#c2410c',
              }}
            >
              {selectedMarket.status === 'FULL_COVERAGE' ? '✓ Authoritative Statutory Coverage' : selectedMarket.status === 'SELECTIVE_PATHWAY' ? 'Selective Pathway' : '⚠️ Insufficient Corpus Coverage (Safe Abstention)'}
            </span>
          </div>

          {selectedMarket.status === 'INSUFFICIENT_COVERAGE' ? (
            <div style={{ background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.3)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '0.35rem' }}>
                Safe Abstention Notice: Insufficient Authoritative Coverage
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a3412', lineHeight: 1.5 }}>
                IP-SAKTI does not have sufficient curated statutory legislation for this specific foreign territory. Rather than producing hallucinated legal advice, the system withholds conclusions. Please consult an accredited in-country regulatory attorney.
              </p>
            </div>
          ) : (
            <>
              {/* Pathway Banner */}
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Recommended Statutory Entry Pathway
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.35rem' }}>
                  {selectedMarket.pathway}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Framework: {selectedMarket.framework} · Citation: <em>{selectedMarket.citation}</em>
                </div>
              </div>

              {/* Key Statutory Requirements */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                  Key Compliance Requirements & Sourcing Criteria:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedMarket.keyRequirements.map((req, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>✓</span>
                      <div>{req}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IP Treaties & Cautions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Applicable Multilateral Treaties
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedMarket.ipTreaties.map((tr) => (
                      <span key={tr} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)' }}>
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(234, 88, 12, 0.06)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Critical Export Caution
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', lineHeight: 1.4 }}>
                    {selectedMarket.caution}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Statutory Disclaimers */}
          <div style={{ background: 'rgba(46, 125, 50, 0.04)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: '6px', padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            <strong>Statutory Boundary:</strong> Export regulations are independent of domestic Indian AYUSH drug licenses. An Indian Rule 158B license does NOT confer automated marketing approval in the European Union or United States.
          </div>
        </div>

      </div>
    </div>
  );
}
