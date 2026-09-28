'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';



// ─── Icons ────────────────────────────────────────────────────────────────────

const IconFlask = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6M9 3v7l-4 9h14l-4-9V3"/><path d="M6.3 15h11.4"/>
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconScale = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const IconSearch = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconBot = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

// ─── Workflow / Domain layout metadata (no user-facing text) ──────────────────

const WORKFLOW_CONFIGS = [
  { id: 'analyze', icon: <IconFlask />, titleKey: 'home.workflow.analyze.title', descKey: 'home.workflow.analyze.desc', href: '/cases/new?workflow=analyze', color: 'var(--green-700)', bg: 'var(--green-100)', tagKey: 'home.workflow.mostUsed' },
  { id: 'protect', icon: <IconShield />, titleKey: 'home.workflow.protect.title', descKey: 'home.workflow.protect.desc', href: '/explore/ip', color: 'var(--green-700)', bg: 'var(--green-100)', tagKey: null },
  { id: 'regulations', icon: <IconScale />, titleKey: 'home.workflow.regulations.title', descKey: 'home.workflow.regulations.desc', href: '/explore/regulations', color: 'var(--gold-700)', bg: 'var(--gold-100)', tagKey: null },
  { id: 'evidence', icon: <IconSearch />, titleKey: 'home.workflow.evidence.title', descKey: 'home.workflow.evidence.desc', href: '/evidence', color: 'var(--gold-700)', bg: 'var(--gold-100)', tagKey: null },
  { id: 'assistant', icon: <IconBot />, titleKey: 'home.workflow.assistant.title', descKey: 'home.workflow.assistant.desc', href: '/assistant', color: 'var(--green-700)', bg: 'var(--green-100)', tagKey: null },
];

const HOW_IT_WORKS_KEYS = [
  { step: '01', titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc' },
  { step: '02', titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc' },
  { step: '03', titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc' },
  { step: '04', titleKey: 'home.howItWorks.step4.title', descKey: 'home.howItWorks.step4.desc' },
];

const TRUST_POINT_KEYS = [
  'home.trust.point1', 'home.trust.point2', 'home.trust.point3',
  'home.trust.point4', 'home.trust.point5', 'home.trust.point6',
];

const INTAKE_OPTIONS = [
  { labelKey: 'home.intake.ayurvedicFormulation', icon: '🌿', hintKey: 'home.intake.ayurvedicFormulationHint', href: '/cases/new?category=Ayurvedic formulation' },
  { labelKey: 'home.intake.herbalProduct', icon: '🧪', hintKey: 'home.intake.herbalProductHint', href: '/cases/new?category=Herbal product' },
  { labelKey: 'home.intake.plantResource', icon: '🌱', hintKey: 'home.intake.plantResourceHint', href: '/cases/new?category=Plant / biological resource' },
  { labelKey: 'home.intake.traditionalKnowledge', icon: '📜', hintKey: 'home.intake.traditionalKnowledgeHint', href: '/cases/new?category=Traditional knowledge' },
  { labelKey: 'home.intake.novelProcess', icon: '⚙️', hintKey: 'home.intake.novelProcessHint', href: '/cases/new?category=Process / manufacturing method' },
  { labelKey: 'home.intake.brandIdentity', icon: '🏷️', hintKey: 'home.intake.brandIdentityHint', href: '/cases/new?category=Brand / product identity' },
  { labelKey: 'home.intake.geographicalIdentity', icon: '🗺️', hintKey: 'home.intake.geographicalIdentityHint', href: '/search?q=GI+protection+for+traditional+products' },
  { labelKey: 'home.intake.regulatoryQuestion', icon: '⚖️', hintKey: 'home.intake.regulatoryQuestionHint', href: '/assistant?q=What+regulatory+approvals+do+I+need' },
];

const DEMO_FLOW_KEYS = [
  { labelKey: 'home.demo.step1.label', subKey: 'home.demo.step1.sub' },
  { labelKey: 'home.demo.step2.label', subKey: 'home.demo.step2.sub' },
  { labelKey: 'home.demo.step3.label', subKey: 'home.demo.step3.sub' },
  { labelKey: 'home.demo.step4.label', subKey: 'home.demo.step4.sub' },
  { labelKey: 'home.demo.step5.label', subKey: 'home.demo.step5.sub' },
  { labelKey: 'home.demo.step6.label', subKey: 'home.demo.step6.sub' },
  { labelKey: 'home.demo.step7.label', subKey: 'home.demo.step7.sub' },
];

const DOMAIN_KEYS = [
  { labelKey: 'home.domain.patent', descKey: 'home.domain.patentDesc' },
  { labelKey: 'home.domain.trademark', descKey: 'home.domain.trademarkDesc' },
  { labelKey: 'home.domain.gi', descKey: 'home.domain.giDesc' },
  { labelKey: 'home.domain.plantVariety', descKey: 'home.domain.plantVarietyDesc' },
  { labelKey: 'home.domain.copyright', descKey: 'home.domain.copyrightDesc' },
  { labelKey: 'home.domain.industrialDesign', descKey: 'home.domain.industrialDesignDesc' },
  { labelKey: 'home.domain.tk', descKey: 'home.domain.tkDesc' },
  { labelKey: 'home.domain.abs', descKey: 'home.domain.absDesc' },
  { labelKey: 'home.domain.ayush', descKey: 'home.domain.ayushDesc' },
  { labelKey: 'home.domain.fssai', descKey: 'home.domain.fssaiDesc' },
  { labelKey: 'home.domain.drugsCosmetics', descKey: 'home.domain.drugsCosmeticsDesc' },
  { labelKey: 'home.domain.internationalIp', descKey: 'home.domain.internationalIpDesc' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useLanguageStore();

  return (
    <div style={{ background: 'var(--bg-base)' }}>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        style={{
          background: 'linear-gradient(155deg, var(--green-950) 0%, var(--green-900) 50%, var(--green-800) 100%)',
          padding: '96px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-label="Hero section"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(74,138,94,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(196,154,40,0.06)', pointerEvents: 'none' }} />

        <div className="page-container" style={{ position: 'relative' }}>
          {/* SIH badge */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(196,154,40,0.15)',
                border: '1px solid rgba(196,154,40,0.3)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--gold-300)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold-400)', display: 'inline-block' }} />
              {t('home.hero.badge')}
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '20px',
              maxWidth: '720px',
            }}
          >
            {t('home.hero.title')}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '620px',
              lineHeight: 1.7,
              marginBottom: '40px',
            }}
          >
            {t('home.hero.subtitle')}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              href="/cases/new"
              className="btn-primary"
              style={{
                background: 'var(--gold-500)',
                color: 'var(--green-950)',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('action.analyzeProduct')}
              <IconArrow />
            </Link>
            <Link
              href="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 28px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 250ms ease',
              }}
              onMouseEnter={undefined}
            >
              {t('home.hero.cta_search')}
            </Link>
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '32px',
              marginTop: '56px',
              paddingTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {[
              { value: '12+', labelKey: 'home.domains.title' },
              { value: '23', labelKey: 'home.hero.multilingual' },
              { value: 'RAG', labelKey: 'home.features.rag_grounds' },
              { value: '✓', labelKey: 'home.features.citations_prove' },
            ].map((stat) => (
              <div key={stat.value}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--gold-300)',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ GUIDED INTAKE: WHAT ARE YOU WORKING WITH? ═══════════════════ */}
      <section
        style={{
          padding: '48px 0 24px',
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-default)',
        }}
        aria-label="Guided Intake Selector"
      >
        <div className="page-container">
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--green-200)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '20px' }}>
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--green-700)',
                    background: 'var(--green-100)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: '8px',
                  }}
                >
                  ⚡ {t('wizard.badge')}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {t('wizard.step1.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                  {t('wizard.step1.subtitle')}
                </p>
              </div>

              {/* Architecture Pipeline Visualization */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>{t('home.pipeline.question')}</span>
                <span>↓</span>
                <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>{t('home.pipeline.classify')}</span>
                <span>↓</span>
                <span style={{ color: 'var(--gold-600)', fontWeight: 700 }}>{t('home.pipeline.evidence')}</span>
                <span>↓</span>
                <span style={{ color: 'var(--green-800)', fontWeight: 700 }}>{t('home.pipeline.intelligence')}</span>
                <span>↓</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{t('home.pipeline.action')}</span>
              </div>
            </div>

            {/* Asset Selection Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              {INTAKE_OPTIONS.map((item) => (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-base)',
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--green-600)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {t(item.labelKey)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {t(item.hintKey)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHAT CAN I DO? ═══════════════════ */}
      <section
        aria-labelledby="workflows-heading"
        style={{ padding: '80px 0', background: 'var(--bg-base)' }}
      >
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-600)', marginBottom: '12px' }}>
              {t('home.workflows.title').toUpperCase()}
            </p>
            <h2
              id="workflows-heading"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}
            >
              {t('home.workflows.heading')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              {t('home.workflows.subtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {WORKFLOW_CONFIGS.map((workflow) => (
              <Link
                key={workflow.id}
                href={workflow.href}
                style={{ textDecoration: 'none' }}
                aria-label={`${t(workflow.titleKey)} — ${t(workflow.descKey)}`}
              >
                <div
                  className="card"
                  style={{
                    padding: '28px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 250ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.borderColor = workflow.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  {workflow.tagKey && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'var(--green-100)',
                        color: 'var(--green-700)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {t(workflow.tagKey)}
                    </span>
                  )}

                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: workflow.bg,
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: workflow.color,
                      flexShrink: 0,
                    }}
                  >
                    {workflow.icon}
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}
                    >
                      {t(workflow.titleKey)}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {t(workflow.descKey)}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: workflow.color,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      marginTop: 'auto',
                    }}
                  >
                    {t('common.continue')}
                    <IconArrow />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section
        aria-labelledby="how-heading"
        style={{ padding: '80px 0', background: 'var(--bg-subtle)' }}
      >
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-600)', marginBottom: '12px' }}>
              {t('home.howItWorks.title').toUpperCase()}
            </p>
            <h2
              id="how-heading"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {t('home.howItWorks.subtitle')}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px',
            }}
          >
            {HOW_IT_WORKS_KEYS.map((item, i) => (
              <div key={item.step} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--green-500)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ flex: 1, height: '1px', background: i < HOW_IT_WORKS_KEYS.length - 1 ? 'var(--border-default)' : 'transparent' }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {t(item.titleKey)}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>

          {/* Philosophy tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '56px',
              justifyContent: 'center',
            }}
          >
            {['home.features.rules_constrain', 'home.features.rag_grounds', 'home.features.ai_explains', 'home.features.citations_prove', 'home.features.versioning_updates', 'home.features.abstention_protects'].map((tagKey) => (
              <span
                key={tagKey}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--green-900)',
                  color: 'var(--green-300)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                }}
              >
                {t(tagKey).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DEMO STORY ═══════════════════ */}
      <section
        aria-labelledby="demo-heading"
        style={{ padding: '80px 0', background: 'var(--bg-base)' }}
      >
        <div className="page-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Left: Text */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-600)' }}>
                  {t('home.demo.badge').toUpperCase()}
                </span>
                <span
                  style={{
                    background: 'rgba(197, 160, 89, 0.15)',
                    color: '#8c6b1f',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                  }}
                >
                  {t('home.demo.simulation')}
                </span>
              </div>
              <h2
                id="demo-heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                {t('home.demo.title')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                {t('home.demo.story')}
              </p>
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '28px',
                }}
              >
                {t('home.demo.notice')}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/cases/new" className="btn-primary">
                  {t('home.demo.startCase')}
                  <IconArrow />
                </Link>
                <Link
                  href="/cases/demo-case-ashwagandha-brahmi"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {t('home.demo.inspectDossier')}
                </Link>
              </div>
            </div>

            {/* Right: Flow diagram */}
            <div>
              <div className="card" style={{ padding: '32px' }}>
                {DEMO_FLOW_KEYS.map((item, i) => (
                  <div key={item.labelKey} style={{ display: 'flex', gap: '16px', marginBottom: i < DEMO_FLOW_KEYS.length - 1 ? '0' : '0' }}>
                    {/* Connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--green-700)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        <IconCheck />
                      </div>
                      {i < DEMO_FLOW_KEYS.length - 1 && (
                        <div style={{ width: '2px', flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, var(--green-300), var(--green-200))' }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: i < DEMO_FLOW_KEYS.length - 1 ? '20px' : '0' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {t(item.labelKey)}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
                        {t(item.subKey)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ EVIDENCE & TRUST ═══════════════════ */}
      <section
        aria-labelledby="trust-heading"
        style={{ padding: '80px 0', background: 'var(--green-950)' }}
      >
        <div className="page-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Trust points */}
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-400)', marginBottom: '12px' }}>
                {t('home.trust.title').toUpperCase()}
              </p>
              <h2
                id="trust-heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '32px',
                }}
              >
                {t('home.trust.subtitle')}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {TRUST_POINT_KEYS.map((pointKey) => (
                  <li
                    key={pointKey}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '16px',
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(74,138,94,0.3)',
                        color: 'var(--green-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <IconCheck />
                    </span>
                    {t(pointKey)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Evidence Card */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.evidence.sample')}
              </p>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  borderLeft: '4px solid var(--evidence-high)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      {t('home.evidence.actIndia')}
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {t('home.evidence.actName')}
                    </h4>
                  </div>
                  <span className="status-badge active">● {t('sourceStatus.active')}</span>
                </div>

                <div
                  className="legal-text"
                  style={{ fontSize: '0.8125rem', marginBottom: '16px' }}
                >
                  {t('home.evidence.sec3pText')}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('home.evidence.strength')}</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          style={{
                            width: '20px',
                            height: '6px',
                            borderRadius: '3px',
                            background: i <= 5 ? 'var(--evidence-high)' : 'var(--border-default)',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--evidence-high)', fontWeight: 600, marginTop: '4px' }}>{t('home.evidence.high')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>{t('home.evidence.whyRelevant')}</button>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>{t('home.evidence.viewSource')}</button>
                  </div>
                </div>

                <div className="legal-disclaimer" style={{ marginTop: '16px' }}>
                  <span>⚠</span>
                  <span>{t('home.evidence.disclaimer')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ DOMAINS ═══════════════════ */}
      <section
        aria-labelledby="domains-heading"
        style={{ padding: '80px 0', background: 'var(--bg-subtle)' }}
      >
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-600)', marginBottom: '12px' }}>
              {t('home.domains.title').toUpperCase()}
            </p>
            <h2
              id="domains-heading"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {t('home.domains.subtitle')}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {DOMAIN_KEYS.map((domain) => (
              <div
                key={domain.labelKey}
                className="card"
                style={{ padding: '20px', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'var(--green-100)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--green-700)',
                    margin: '0 auto 12px',
                  }}
                >
                  <IconLeaf />
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {t(domain.labelKey)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {t(domain.descKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MULTILINGUAL ═══════════════════ */}
      <section
        aria-labelledby="multilingual-heading"
        style={{ padding: '80px 0', background: 'var(--bg-base)' }}
      >
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-600)', marginBottom: '12px' }}>
            {t('home.multilingual.badge').toUpperCase()}
          </p>
          <h2
            id="multilingual-heading"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            {t('home.hero.multilingual_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            {t('home.hero.multilingual_desc')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '20px 32px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--green-700)' }}>{t('home.multilingual.activeLanguage')}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('home.multilingual.fullSupport')}</div>
            </div>
            <div className="card" style={{ padding: '20px 32px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--green-700)' }}>{t('home.multilingual.schedule8')}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('home.multilingual.all22')}</div>
            </div>
            <div className="card" style={{ padding: '20px 32px', opacity: 0.85 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--green-700)' }}>{t('home.multilingual.isolationTitle')}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('home.multilingual.isolationDesc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section
        style={{
          padding: '80px 0',
          background: 'linear-gradient(135deg, var(--green-900), var(--green-800))',
        }}
        aria-label="Call to action"
      >
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 700,
              color: 'white',
              marginBottom: '16px',
            }}
          >
            {t('home.cta.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '40px', fontSize: '1.1rem' }}>
            {t('home.cta.subtitle')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/cases/new"
              className="btn-primary"
              style={{ background: 'var(--gold-500)', color: 'var(--green-950)', padding: '16px 32px', fontSize: '1rem', fontWeight: 600 }}
            >
              {t('home.cta.button')}
              <IconArrow />
            </Link>
            <Link
              href="/evidence"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 32px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              {t('home.hero.cta_search')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
