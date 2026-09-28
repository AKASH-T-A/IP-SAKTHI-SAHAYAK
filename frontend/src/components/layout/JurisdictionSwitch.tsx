'use client';

import React, { useEffect, useState } from 'react';
import { useJurisdictionStore, JurisdictionMode } from '@/store/jurisdiction';
import { useLanguageStore } from '@/store/language';

export default function JurisdictionSwitch({ className = '' }: { className?: string }) {
  const { jurisdiction, setJurisdiction } = useJurisdictionStore();
  const { t } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '2px',
          height: '32px',
          minWidth: '170px',
        }}
      />
    );
  }

  return (
    <div
      role="group"
      aria-label="Jurisdiction Selector"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '24px',
        padding: '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <button
        type="button"
        onClick={() => setJurisdiction('India')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          border: 'none',
          fontSize: '0.78rem',
          fontWeight: jurisdiction === 'India' ? 700 : 500,
          background: jurisdiction === 'India' ? 'var(--green-700)' : 'transparent',
          color: jurisdiction === 'India' ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="India Domestic Statutory Regimes (Patents Act, D&C Act, BDA 2002, FSSAI)"
      >
        <span>🇮🇳</span>
        <span>INDIA</span>
      </button>

      <button
        type="button"
        onClick={() => setJurisdiction('International')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          border: 'none',
          fontSize: '0.78rem',
          fontWeight: jurisdiction === 'International' ? 700 : 500,
          background: jurisdiction === 'International' ? '#1e40af' : 'transparent',
          color: jurisdiction === 'International' ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="International Treaties & Export Regimes (TRIPS, CBD, Nagoya, WIPO GRATK, PCT, EU THMPD, US FDA)"
      >
        <span>🌐</span>
        <span>INTERNATIONAL</span>
      </button>
    </div>
  );
}
