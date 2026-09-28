'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';

export default function Footer() {
  const { t } = useLanguageStore();

  const platformLinks = [
    { label: t('action.analyzeProduct'), href: '/' },
    { label: t('action.protectInnovation'), href: '/explore' },
    { label: t('action.checkRegulations'), href: '/explore' },
    { label: t('nav.evidence'), href: '/evidence' },
    { label: t('nav.assistant'), href: '/assistant' },
  ];

  const ipDomainItems = [
    t('intents.patent'),
    t('intents.trademark'),
    t('intents.gi'),
    t('home.domain.plantVarietyProtection'),
    t('intents.traditional_knowledge'),
    t('intents.abs'),
  ];

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--green-900)',
        color: 'rgba(255,255,255,0.7)',
        padding: '48px 0 32px',
      }}
    >
      <div className="page-container">
        {/* Top Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '8px',
              }}
            >
              IP-SAKTI Sahayak
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
              {t('footer.tagline')}
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'rgba(255,255,255,0.4)' }}>
              SIH26045 | SIH 2026
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('footer.platform')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {platformLinks.map((item) => (
                <li key={item.label} style={{ marginBottom: '10px' }}>
                  <Link
                    href={item.href}
                    style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Domains */}
          <div>
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('footer.ipDomains')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {ipDomainItems.map((item) => (
                <li key={item} style={{ marginBottom: '10px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('footer.noticeTitle')}
            </h3>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.7, margin: 0 }}>
              {t('footer.noticeDesc')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 24px' }} />

        {/* Bottom Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8125rem',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('footer.copyright')}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
            {t('footer.evidenceGrounded')}
          </span>
        </div>
      </div>
    </footer>
  );
}
