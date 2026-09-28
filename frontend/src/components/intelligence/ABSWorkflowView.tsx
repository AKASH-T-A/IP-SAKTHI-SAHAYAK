'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/store/language';

export default function ABSWorkflowView() {
  const { t } = useLanguageStore();

  const [bioResource, setBioResource] = useState<'yes' | 'no'>('yes');
  const [sourceNature, setSourceNature] = useState<'wild_harvested' | 'cultivated' | 'imported'>('wild_harvested');
  const [commercialIntent, setCommercialIntent] = useState<'commercial_mfg' | 'research_only' | 'local_vaid'>('commercial_mfg');
  const [patentIntent, setPatentIntent] = useState<'yes' | 'no'>('yes');
  const [userState, setUserState] = useState<string>('Madhya Pradesh');

  const triggersSBB = bioResource === 'yes' && sourceNature !== 'imported' && commercialIntent === 'commercial_mfg';
  const triggersNBA = bioResource === 'yes' && sourceNature !== 'imported' && patentIntent === 'yes';
  const isExempt = commercialIntent === 'local_vaid' || sourceNature === 'imported';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🌿</span>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            ABS & Biological Diversity Compliance Navigator
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Statutory assessment under the Biological Diversity Act, 2002 (as amended 2023) for commercial manufacture and patent applications.
        </p>
      </div>

      {/* Questionnaire Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Q1: Biological Resource Involved */}
        <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            1. Are Indian Biological Resources (plants, extracts) used?
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['yes', 'no'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBioResource(val as any)}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: bioResource === val ? 'var(--green-700)' : 'var(--bg-surface)',
                  color: bioResource === val ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Source Nature */}
        <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            2. Procurement Channel & Harvesting Origin:
          </label>
          <select
            value={sourceNature}
            onChange={(e) => setSourceNature(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
            }}
          >
            <option value="wild_harvested">Wild-Harvested from Forests / Habitats</option>
            <option value="cultivated">Cultivated by Farmers / Certified Mandi</option>
            <option value="imported">Imported from Foreign Jurisdiction</option>
          </select>
        </div>

        {/* Q3: Commercial Intent */}
        <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            3. Commercial Utilization Context:
          </label>
          <select
            value={commercialIntent}
            onChange={(e) => setCommercialIntent(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
            }}
          >
            <option value="commercial_mfg">Commercial Manufacturing Enterprise</option>
            <option value="research_only">Academic / Pure Non-Commercial Research</option>
            <option value="local_vaid">Local Vaid / Hakim / Traditional Practitioner</option>
          </select>
        </div>

        {/* Q4: Patent Intent */}
        <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            4. Intend to file Patent in India or Abroad?
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['yes', 'no'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setPatentIntent(val as any)}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: patentIntent === val ? 'var(--green-700)' : 'var(--bg-surface)',
                  color: patentIntent === val ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesis Results Box */}
      <div
        style={{
          background: isExempt ? 'rgba(46, 125, 50, 0.08)' : triggersSBB || triggersNBA ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-base)',
          border: isExempt ? '1px solid rgba(46, 125, 50, 0.3)' : triggersSBB || triggersNBA ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isExempt ? 'var(--color-primary-dark)' : '#9a3412' }}>
            {isExempt ? '✓ Statutory Exemption May Apply' : '⚠️ Statutory ABS Obligations Identified'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Authority: National Biodiversity Authority (NBA) & State Biodiversity Board
          </span>
        </div>

        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {triggersSBB && (
            <li>
              <strong>State Biodiversity Board Section 7 Prior Intimation (Form I):</strong> Required before procuring Indian biological resources for commercial manufacture. Benefit-sharing fee schedule applies (0.1% to 0.5% of ex-factory commercial sales).
            </li>
          )}
          {triggersNBA && (
            <li>
              <strong>NBA Section 6 Prior Approval (Form III):</strong> Mandatory statutory pre-condition before grant of patent in or outside India for any invention utilizing Indian biological material.
            </li>
          )}
          {sourceNature === 'cultivated' && (
            <li>
              <strong>Cultivated Exemption Documentation:</strong> Under BDA 2023 amendments, cultivated biological resources can obtain exemption if supported by authenticated Mandi certificates or cultivation origin affidavits.
            </li>
          )}
          {commercialIntent === 'local_vaid' && (
            <li>
              <strong>Traditional Practitioner Exemption:</strong> Registered Vaids, Hakims, and local communities practicing traditional medicine are explicitly exempted under Section 7 proviso.
            </li>
          )}
        </ul>

        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Statutory Reference: The Biological Diversity Act, 2002 §§ 6, 7 & 40
          </span>
          <a
            href="http://absefiling.nbaindia.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-primary-dark)',
              textDecoration: 'none',
            }}
          >
            Open NBA ABS E-Portal ↗
          </a>
        </div>
      </div>
    </div>
  );
}
