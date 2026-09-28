'use client';

import React from 'react';
import { useLanguageStore } from '@/store/language';

interface RegistryPathway {
  id: string;
  domain: 'Patent' | 'Trademark' | 'GI' | 'ABS' | 'AYUSH' | 'FSSAI' | 'International';
  title: string;
  officialPortal: string;
  portalUrl: string;
  formRequired: string;
  officialAuthority: string;
  verifiedSteps: string[];
}

const OFFICIAL_REGISTRIES: RegistryPathway[] = [
  {
    id: 'reg-patent-inpass',
    domain: 'Patent',
    title: 'Indian Patent Office Prior-Art Search & E-Filing',
    officialPortal: 'InPASS & Comprehensive E-Filing Portal',
    portalUrl: 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin',
    formRequired: 'Form 1 (Application for Patent) & Form 2 (Complete Specification)',
    officialAuthority: 'CGPDTM, DPIIT, Ministry of Commerce and Industry',
    verifiedSteps: [
      '1. Conduct public prior-art search on official InPASS portal (inpass.gov.in).',
      '2. Draft Form 2 specification with mandatory Section 10(4)(ii)(D) geographical origin disclosure.',
      '3. Submit synergistic technical experimental data to address Section 3(p) objections.',
      '4. File online via IPO Comprehensive E-Filing System.'
    ]
  },
  {
    id: 'reg-tm-efiling',
    domain: 'Trademark',
    title: 'Trade Marks Registry (Class 5 & Class 3)',
    officialPortal: 'IP India Trade Mark E-Filing Portal',
    portalUrl: 'https://ipindiaonline.gov.in/trademarkefiling/user/frmNewUserRegistration.aspx',
    formRequired: 'Form TM-A (Application for Registration of Trademark)',
    officialAuthority: 'Trade Marks Registry, CGPDTM',
    verifiedSteps: [
      '1. Perform public trademark availability search across Class 5 (herbal medicine) or Class 3 (cosmetics).',
      '2. Ensure brand name is arbitrary or coined (avoiding generic Sanskrit/botanical terms barred under Section 9).',
      '3. Submit Form TM-A with user affidavit if claiming prior commercial use.'
    ]
  },
  {
    id: 'reg-gi-registry',
    domain: 'GI',
    title: 'Geographical Indications Registry (Regional Botanicals)',
    officialPortal: 'GI Registry Official Portal',
    portalUrl: 'https://ipindia.gov.in/geographical-indications.htm',
    formRequired: 'Form GI-1 (Application for Registration of a Geographical Indication)',
    officialAuthority: 'Geographical Indications Registry, Chennai',
    verifiedSteps: [
      '1. Form or represent an association of producers/cultivators in the specific geographical region.',
      '2. Document historical proof, classical treatise references, and agro-climatic uniqueness.',
      '3. Submit Form GI-1 with certified geographical boundary map.'
    ]
  },
  {
    id: 'reg-nba-abs',
    domain: 'ABS',
    title: 'National Biodiversity Authority (ABS Clearance)',
    officialPortal: 'NBA ABS E-Filing Portal',
    portalUrl: 'http://absefiling.nbaindia.org/',
    formRequired: 'Form I (Access for Commercial Utilization) or Form III (IPR Approval)',
    officialAuthority: 'National Biodiversity Authority (NBA) & State Biodiversity Boards',
    verifiedSteps: [
      '1. Determine whether sourcing involves wild-harvested Indian biological resources.',
      '2. If domestic commercial manufacture: submit Form I intimation to concerned State Biodiversity Board.',
      '3. If patent filing based on Indian bio-resources: submit Form III to NBA before grant of patent.'
    ]
  },
  {
    id: 'reg-eaushadhi',
    domain: 'AYUSH',
    title: 'AYUSH Manufacturing Licensing (e-Aushadhi)',
    officialPortal: 'e-Aushadhi Official Portal',
    portalUrl: 'https://e-aushadhi.gov.in/',
    formRequired: 'Form 24-D (Application for License to Manufacture ASU Drugs)',
    officialAuthority: 'Ministry of Ayush & State Licensing Authorities',
    verifiedSteps: [
      '1. Obtain Schedule T Good Manufacturing Practices (GMP) premises inspection approval.',
      '2. Submit Certificate of Analysis (CoA) from approved drug testing laboratory.',
      '3. Apply on Form 24-D under Rule 158B via State Licensing Authority portal.'
    ]
  },
  {
    id: 'reg-fssai-foscos',
    domain: 'FSSAI',
    title: 'FSSAI Food Safety Compliance System (FoSCoS)',
    officialPortal: 'FoSCoS Licensing Portal',
    portalUrl: 'https://foscos.fssai.gov.in/',
    formRequired: 'FSSAI Central / State License Application',
    officialAuthority: 'Food Safety and Standards Authority of India (FSSAI)',
    verifiedSteps: [
      '1. Verify formulation recipes against Schedule A authoritative classical books.',
      '2. Select Kind of Business (KoB): Health Supplements & Ayurveda Aahar.',
      '3. Ensure label artwork complies with Regulation 8 (No disease cure claims).'
    ]
  }
];

export default function OfficialRegistryRouter() {
  const { t } = useLanguageStore();

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
          <span style={{ fontSize: '1.2rem' }}>🏛️</span>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Official Registry & Action Routing
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Direct verified pathways from inquiry → authoritative statutory rule → official government registry portal. (No simulated submissions).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {OFFICIAL_REGISTRIES.map((reg) => (
          <div
            key={reg.id}
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(46, 125, 50, 0.1)',
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  {reg.domain} Pathway
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {reg.officialAuthority.split(',')[0]}
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {reg.title}
              </h4>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '0.75rem', background: 'var(--bg-surface)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong>Statutory Form:</strong> {reg.formRequired}
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                <strong>Verified Action Sequence:</strong>
                <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.1rem' }}>
                  {reg.verifiedSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <a
                href={reg.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--green-700)',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                <span>↗</span> Open Official Registry ({reg.officialPortal.split(' ')[0]})
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
