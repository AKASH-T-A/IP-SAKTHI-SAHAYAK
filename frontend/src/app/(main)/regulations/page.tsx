'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';
import { useJurisdictionStore } from '@/store/jurisdiction';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';
import { Citation } from '@/lib/intelligence/types';
import AbstentionBanner from '@/components/intelligence/AbstentionBanner';
import JurisdictionSwitch from '@/components/layout/JurisdictionSwitch';

interface ChecklistItem {
  category: string;
  item: string;
  status: 'Required' | 'Potentially required' | 'Not identified' | 'Not applicable' | 'Needs expert verification' | 'Insufficient evidence';
  authority: string;
  jurisdiction: string;
  source: string;
  version: string;
  details: string;
}

export default function RegulationsPage() {
  const { t } = useLanguageStore();
  const { jurisdiction } = useJurisdictionStore();

  // Wizard Steps: 1: Product Type -> 2: Formulation Details -> 3: Market/Jurisdiction -> 4: Analysis & Checklist
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [productType, setProductType] = useState<string>('proprietary');
  const [formulationName, setFormulationName] = useState<string>('Polyherbal Vitality Formulation');
  const [ingredientsText, setIngredientsText] = useState<string>('Ashwagandha Root (50%), Brahmi Leaf (30%), Shankhpushpi (20%)');
  const [intendedUse, setIntendedUse] = useState<string>('Cognitive support, memory enhancement, and stress adaptogen');
  const [isClassical, setIsClassical] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Safe Abstention switch
  const [simulateAbstention, setSimulateAbstention] = useState<boolean>(false);

  const PRODUCT_CATEGORIES = [
    { id: 'classical', label: 'Classical / Generic Medicine', desc: 'Described in First Schedule ancient authoritative treatises (Charaka, Sushruta, etc.)', rule: 'D&C Act § 3(a)' },
    { id: 'proprietary', label: 'Proprietary Ayurvedic Medicine', desc: 'Novel formulation containing classical ingredients in modern proportions or forms', rule: 'D&C Rules Rule 158B' },
    { id: 'new_drug', label: 'New / Non-Classical Drug', desc: 'Substances or modified molecules requiring safety evaluation under New Drugs Rules', rule: 'New Drugs Rules 2019' },
    { id: 'phytopharm', label: 'Phytopharmaceutical Drug', desc: 'Purified and standardized fraction of medicinal plant with quantified bio-markers', rule: 'Gazette GSR 918(E)' },
    { id: 'ayurveda_aahar', label: 'Ayurveda-Aahar', desc: 'Food prepared per classical recipes for nutritional maintenance (No disease cure claims)', rule: 'FSSAI Regs 2022' },
    { id: 'food_supplement', label: 'Food / Dietary Supplement', desc: 'General nutraceutical under the Food Safety and Standards Act', rule: 'FSS Act 2006' },
    { id: 'cosmetic', label: 'Ayurvedic Cosmetic', desc: 'External application for beautifying, cleansing, or skin conditioning', rule: 'D&C Act Part XIII-A' },
    { id: 'uncertain', label: 'Other / Uncertain', desc: 'Unresolved classification boundary requiring preliminary safety & regulatory triage', rule: 'Safe Abstention' },
  ];

  const getChecklist = (): ChecklistItem[] => {
    return [
      {
        category: 'Product Classification',
        item: 'Statutory Product Category Determination',
        status: 'Required',
        authority: 'Ministry of Ayush / State Licensing Authority',
        jurisdiction: jurisdiction,
        source: 'Drugs and Cosmetics Act, 1940 § 3(a) & Rule 158B',
        version: 'Current (2024)',
        details: `Determined as ${PRODUCT_CATEGORIES.find(c => c.id === productType)?.label}.`,
      },
      {
        category: 'Licensing',
        item: 'Manufacturing License Application on Form 24-D',
        status: productType === 'ayurveda_aahar' ? 'Not applicable' : 'Required',
        authority: 'State AYUSH Licensing Authority (SALA)',
        jurisdiction: 'India',
        source: 'Drugs and Cosmetics Rules, 1945 Rule 153',
        version: 'Current',
        details: 'Mandatory before commercial batch manufacture or sale.',
      },
      {
        category: 'Manufacturing',
        item: 'Schedule T Good Manufacturing Practices (GMP)',
        status: 'Required',
        authority: 'Ministry of Ayush',
        jurisdiction: 'India',
        source: 'D&C Rules 1945 — Schedule T',
        version: 'GSR 560(E)',
        details: 'Mandatory hygiene standards, equipment calibration, QC testing lab, and batch records.',
      },
      {
        category: 'Ingredient Requirements',
        item: 'Ayurvedic Pharmacopoeia of India (API) Quality Compliance',
        status: 'Required',
        authority: 'PCIM&H, Ministry of Ayush',
        jurisdiction: 'India',
        source: 'Ayurvedic Pharmacopoeia of India Part I',
        version: 'Current Monograph',
        details: 'Raw materials must meet TLC fingerprinting, total ash, and acid-insoluble ash limits.',
      },
      {
        category: 'Safety Requirements',
        item: 'NABL Heavy Metal & Microbial Testing Certificate of Analysis (CoA)',
        status: 'Required',
        authority: 'NABL Accredited Testing Laboratories',
        jurisdiction: jurisdiction,
        source: 'Schedule T & API Part II',
        version: 'Current',
        details: 'Permissible limits: Lead <= 10 ppm, Arsenic <= 3 ppm, Cadmium <= 0.3 ppm, Mercury <= 1 ppm.',
      },
      {
        category: 'Efficacy Requirements',
        item: 'Published Literature or Pilot Clinical Trial Study',
        status: productType === 'classical' || productType === 'ayurveda_aahar' ? 'Not applicable' : 'Required',
        authority: 'Ministry of Ayush',
        jurisdiction: 'India',
        source: 'Drugs and Cosmetics Rules, 1945 Rule 158B Category (A)/(B)',
        version: 'Current',
        details: 'Classical formulas rely on authoritative texts; proprietary formulas require Category B pilot trial proof.',
      },
      {
        category: 'Labelling',
        item: 'Manner of Labelling & Statutory Inclusions',
        status: 'Required',
        authority: 'Ministry of Ayush / State Licensing Authority',
        jurisdiction: jurisdiction,
        source: 'D&C Rules 1945 Rule 161',
        version: 'Current',
        details: 'Must display botanical names, parts used, Batch No., Mfg Lic No., and Schedule E(1) caution if applicable.',
      },
      {
        category: 'Packaging',
        item: 'Tamper-Evident & Moisture Protection Packaging',
        status: 'Required',
        authority: 'Bureau of Indian Standards / AYUSH',
        jurisdiction: jurisdiction,
        source: 'D&C Rules Rule 161A',
        version: 'Current',
        details: 'Pharmaceutical grade blister, HDPE, or amber glass containers maintaining stability.',
      },
      {
        category: 'Advertising & Claims',
        item: 'Compliance with Drugs & Magic Remedies Act § 3',
        status: 'Required',
        authority: 'CDSCO / State Licensing Authorities',
        jurisdiction: 'India',
        source: 'Drugs and Magic Remedies Act 1954 § 3',
        version: 'Current',
        details: 'Strict statutory prohibition against advertising cures for 54 schedule disorders including diabetes and hypertension.',
      },
      {
        category: 'ABS / Biodiversity',
        item: 'State Biodiversity Board (SBB) Prior Intimation (Form I)',
        status: jurisdiction === 'India' ? 'Required' : 'Potentially required',
        authority: 'State Biodiversity Boards / National Biodiversity Authority',
        jurisdiction: 'India',
        source: 'The Biological Diversity Act, 2002 § 7',
        version: 'As amended 2023',
        details: 'Required before commercial procurement of Indian wild biological resources.',
      },
      {
        category: 'Traditional Knowledge',
        item: 'Prior-Art Search against Public Classical Treatises',
        status: 'Required',
        authority: 'Indian Patent Office (CGPDTM)',
        jurisdiction: jurisdiction,
        source: 'The Patents Act, 1970 § 3(p)',
        version: 'Current',
        details: 'Avoids inadvertent infringement of public domain traditional formulations.',
      },
      {
        category: 'Market-Specific Requirements',
        item: 'Export Market Clearance (EU THMPD / US DSHEA)',
        status: jurisdiction === 'International' ? 'Required' : 'Not applicable',
        authority: 'EMA (EU) / FDA (USA) / MHRA (UK)',
        jurisdiction: 'International',
        source: 'EU Directive 2004/24/EC / US FDA Botanical Guidance',
        version: 'Current',
        details: 'Requires 30/15 year bibliographic evidence for EU or DSHEA dietary supplement structure/function claim review.',
      },
    ];
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'Required': return { bg: 'rgba(234, 88, 12, 0.1)', color: '#c2410c', border: 'rgba(234, 88, 12, 0.3)' };
      case 'Potentially required': return { bg: 'rgba(197, 160, 89, 0.15)', color: '#8c6b1f', border: 'rgba(197, 160, 89, 0.3)' };
      case 'Not applicable': return { bg: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)', border: 'var(--border-color)' };
      case 'Needs expert verification': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'var(--bg-base)', color: 'var(--text-muted)', border: 'var(--border-color)' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Check Regulations</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <JurisdictionSwitch />
            <button
              onClick={() => setSimulateAbstention(!simulateAbstention)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.3rem 0.65rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: simulateAbstention ? '#c2410c' : 'var(--bg-surface)',
                color: simulateAbstention ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              🛡️ {simulateAbstention ? 'Simulating Insufficient Evidence' : 'Test Safe Abstention'}
            </button>
          </div>
        </div>

        {/* Page Title & Journey Header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏛️</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              SIH26045 Complete Regulatory Workflow
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            Ayurvedic Regulatory Compliance Navigator
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            End-to-end statutory guidance for Ayurvedic, Siddha, Unani and herbal formulations. Dynamically generates evidence-grounded checklists across licensing, manufacturing, labelling, safety, advertising, and ABS obligations.
          </p>

          {/* Stepper Progress Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { num: 1, label: 'Product Type' },
              { num: 2, label: 'Formulation Details' },
              { num: 3, label: 'Market & Jurisdiction' },
              { num: 4, label: 'Analysis & Checklist' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: currentStep === s.num ? '1.5px solid var(--green-700)' : '1px solid var(--border-color)',
                  background: currentStep === s.num ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-base)',
                  color: currentStep === s.num ? 'var(--color-primary-dark)' : 'var(--text-muted)',
                  fontWeight: currentStep === s.num ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: currentStep === s.num ? 'var(--green-700)' : 'var(--border-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                  {s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safe Abstention Guardrail if simulated */}
        {simulateAbstention && (
          <div style={{ marginBottom: '2rem' }}>
            <AbstentionBanner
              abstention={{
                isAbstained: true,
                reason: 'Insufficient authoritative evidence: Formulation composition and testing data are incomplete to evaluate statutory compliance.',
                triggerCategory: 'MISSING_CRITICAL_INFO',
                missingFields: ['Botanical composition with parts used', 'Certified pharmacopoeial batch testing CoA', 'Target commercial jurisdiction'],
                recommendations: ['Provide complete botanical ingredients with botanical taxa', 'Confirm manufacturing licence jurisdiction'],
              }}
              onProvideMoreInfo={() => setSimulateAbstention(false)}
            />
          </div>
        )}

        {/* STEP 1: PRODUCT TYPE SELECTION */}
        {currentStep === 1 && !simulateAbstention && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
              Step 1: Select Proposed Product Category
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              Statutory regimes diverge sharply depending on whether your formulation is classical, proprietary, a dietary food, or a cosmetic.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {PRODUCT_CATEGORIES.map((cat) => {
                const isSelected = productType === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setProductType(cat.id);
                      setIsClassical(cat.id === 'classical');
                    }}
                    style={{
                      background: isSelected ? 'rgba(46, 125, 50, 0.06)' : 'var(--bg-base)',
                      border: isSelected ? '2px solid var(--green-700)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-dark)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {cat.rule}
                        </span>
                        {isSelected && <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>✓ Selected</span>}
                      </div>
                      <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {cat.label}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  background: 'var(--green-700)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Continue to Formulation Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FORMULATION DETAILS */}
        {currentStep === 2 && !simulateAbstention && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
              Step 2: Enter Formulation Details
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              Provide the formulation title, active botanical ingredients, and intended indications.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Formulation Title / Commercial Name:
                </label>
                <input
                  type="text"
                  value={formulationName}
                  onChange={(e) => setFormulationName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Botanical Actives & Quantities:
                </label>
                <textarea
                  rows={3}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Intended Indication or Functional Claims:
                </label>
                <input
                  type="text"
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setCurrentStep(1)}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                style={{ background: 'var(--green-700)', color: '#ffffff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                Select Target Market →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TARGET MARKET / JURISDICTION */}
        {currentStep === 3 && !simulateAbstention && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
              Step 3: Select Target Commercial Jurisdiction
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              The problem statement requires clean separation between domestic Indian regimes and international export frameworks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  background: jurisdiction === 'India' ? 'rgba(46, 125, 50, 0.06)' : 'var(--bg-base)',
                  border: jurisdiction === 'India' ? '2px solid var(--green-700)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🇮🇳</div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  India Domestic Market
                </h4>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Governed by Drugs and Cosmetics Act 1940, Schedule T GMP, BDA 2002 Access and Benefit Sharing, and FSSAI Ayurveda Aahar Regulations 2022.
                </p>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Full Authoritative Statutory Coverage
                </span>
              </div>

              <div
                style={{
                  background: jurisdiction === 'International' ? 'rgba(30, 64, 175, 0.06)' : 'var(--bg-base)',
                  border: jurisdiction === 'International' ? '2px solid #1e40af' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌐</div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  International Export Markets (EU / USA / UK)
                </h4>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Governed by EU THMPD Directive 2004/24/EC (30/15 year traditional use), US FDA Botanical Guidance / DSHEA 1994, WIPO GRATK Treaty 2024, and PCT.
                </p>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', background: 'rgba(30, 64, 175, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Export-Specific Compliance Frameworks
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setCurrentStep(2)}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                style={{ background: 'var(--green-700)', color: '#ffffff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                Generate Compliance Checklist & Action Plan →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REGULATORY ANALYSIS, COMPLIANCE CHECKLIST & ACTION PLAN */}
        {currentStep === 4 && !simulateAbstention && (
          <div>
            {/* Classification Summary Card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)' }}>
                  Statutory Classification Determined
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Jurisdiction: <strong>{jurisdiction}</strong>
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                {PRODUCT_CATEGORIES.find(c => c.id === productType)?.label}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1rem', lineHeight: 1.45 }}>
                {PRODUCT_CATEGORIES.find(c => c.id === productType)?.desc}. Analyzed for formulation: <em>{formulationName}</em>.
              </p>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Link
                  href="/claims"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(197, 160, 89, 0.12)',
                    color: '#8c6b1f',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>📢</span> Check Advertising & Claims Compliance
                </Link>

                <Link
                  href="/label-review"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(46, 125, 50, 0.08)',
                    color: 'var(--color-primary-dark)',
                    border: '1px solid rgba(46, 125, 50, 0.3)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>🏷️</span> Review Packaging & Label Compliance
                </Link>
              </div>
            </div>

            {/* 16-POINT COMPLIANCE CHECKLIST */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Evidence-Grounded Regulatory Compliance Checklist
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Each requirement is grounded in specific statutory authorities, rules, and gazette notifications.
                  </p>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  12 Compliance Domains Evaluated
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Category</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Requirement / Obligation</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Authority</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Statutory Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getChecklist().map((item, idx) => {
                      const color = getStatusColor(item.status);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.category}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                              {item.item}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                              {item.details}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                background: color.bg,
                                color: color.color,
                                border: `1px solid ${color.border}`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                            {item.authority}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 500 }}>
                              {item.source}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION PLAN GENERATOR */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                What Should I Do Next? (Evidence-Grounded Action Plan)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
                Action sequence generated from available evidence and applicable statutory requirements:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  '1. Confirm Product Classification Boundary: Ensure formulation is officially documented under Rule 158B or FSSAI Ayurveda Aahar Schedule A.',
                  '2. Commission NABL Testing: Obtain batch Certificate of Analysis (CoA) for heavy metals (Pb, As, Cd, Hg) and pesticide residues.',
                  '3. File State Biodiversity Board Form I: Prior intimation before commercial sourcing of Indian biological resources.',
                  '4. Review Advertising & Marketing Claims: Eliminate absolute cure guarantees and barred schedule diseases.',
                  '5. Conduct Prior-Art Search on InPASS & Treatises: Verify absence of conflict under Patents Act Section 3(p).',
                  '6. Audit Container Label against Rule 161: Verify complete botanical nomenclature and Schedule E(1) warnings.'
                ].map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-base)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(46, 125, 50, 0.1)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ lineHeight: 1.45 }}>{act}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div style={{ background: 'rgba(46, 125, 50, 0.04)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: '8px', padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--color-primary-dark)' }}>Information Notice (Not Legal Advice):</strong> The compliance checklist and action plan are synthesized through algorithmic decision-support. They do not constitute formal legal certification, attorney-client privileged advice, or official government licensing clearance.
            </div>

          </div>
        )}

      </div>

      {/* Statutory Evidence Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(selectedCitation)}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
      />
    </div>
  );
}
