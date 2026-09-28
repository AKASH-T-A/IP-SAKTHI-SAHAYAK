'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';

export default function PrivacyPage() {
  const { t } = useLanguageStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Privacy & Data Architecture</span>
        </div>

        {/* Header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              DPDP Act Aligned Data Handling Architecture
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            Privacy, Data Isolation & Security Architecture
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '720px', lineHeight: 1.5 }}>
            Designed with strict privacy, tenant isolation, and security controls aligned with the principles of the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            {
              title: '1. What Data is Collected & Stored',
              body: 'IP-SAKTI processes user-provided formulation metadata (botanical names, plant parts, dosage form, intended use) and search inquiries solely to compute regulatory classifications, prior-art risks, and compliance checklists. We do not sell, broker, or monetize user formulation data.',
            },
            {
              title: '2. Document Isolation & Private Storage',
              body: 'Uploaded certificates, CoAs, and lab reports are strictly isolated by Case ID and User ID. Uploaded documents are treated as untrusted data inputs and scanned. Private documents are NEVER indexed into public search results or exposed to other platform users.',
            },
            {
              title: '3. Voice & Audio Processing Policy',
              body: 'Speech-to-text recognition is executed on-device using the browser\'s native Web Speech API. Audio is processed into text transcripts in real-time. Zero raw audio recordings or voice biometrics are transmitted or stored on IP-SAKTI backend servers.',
            },
            {
              title: '4. Data Deletion & Purge Behavior',
              body: 'Users possess full autonomy to delete cases at any time. Case deletion performs an immediate soft-delete preventing any further AI access, followed by automated database purge. You may also clear local browser storage at any point.',
            },
            {
              title: '5. Immutable Audit Trail Logging',
              body: 'All key actions (user authentication, case creation, classification evaluation, export generation) generate timestamped audit log entries with SHA-256 integrity hashing to satisfy institutional governance requirements.',
            },
          ].map((sec, idx) => (
            <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {sec.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        {/* Transparent Compliance Statement */}
        <div style={{ background: 'rgba(46, 125, 50, 0.04)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: '8px', padding: '1.25rem 1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--color-primary-dark)' }}>Institutional Notice:</strong> IP-SAKTI Sahayak is designed with privacy and security controls aligned to the stated requirements of SIH26045 and the Digital Personal Data Protection Act, 2023. Unless independently certified, this represents architectural design conformance.
        </div>

      </div>
    </div>
  );
}
