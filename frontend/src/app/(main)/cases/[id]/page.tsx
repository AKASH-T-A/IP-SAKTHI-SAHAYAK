'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguageStore } from '@/store/language';
import { useCasesStore, CaseItem } from '@/store/cases';
import { evaluateCaseIntelligence } from '@/lib/intelligence/engine';
import { Citation, WhySeeingThisData } from '@/lib/intelligence/types';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';
import EvidenceChainView from '@/components/intelligence/EvidenceChainView';
import EvidenceStrengthBadge from '@/components/intelligence/EvidenceStrengthBadge';
import AbstentionBanner from '@/components/intelligence/AbstentionBanner';
import IntelligenceBoard from '@/components/intelligence/IntelligenceBoard';
import EvidenceGapView from '@/components/intelligence/EvidenceGapView';
import WhySeeingThisModal from '@/components/intelligence/WhySeeingThisModal';
import { RegulatoryTimeMachine } from '@/components/intelligence/RegulatoryTimeMachine';
import { DocumentUploader } from '@/components/intelligence/DocumentUploader';
import RelationshipMap from '@/components/intelligence/RelationshipMap';
import OfficialRegistryRouter from '@/components/intelligence/OfficialRegistryRouter';
import ABSWorkflowView from '@/components/intelligence/ABSWorkflowView';
import ExpertConsultationModal from '@/components/intelligence/ExpertConsultationModal';
import { casesApi } from '@/lib/api/cases';

export default function CaseDetailPage() {
  const { t } = useLanguageStore();
  const params = useParams();
  const { getCaseById } = useCasesStore();

  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [whySeeingThis, setWhySeeingThis] = useState<WhySeeingThisData | null>(null);
  
  // Interactive test switch for SIH Evaluators: simulate missing data to test safe abstention live
  const [simulateMissingData, setSimulateMissingData] = useState(false);
  const [expertModalOpen, setExpertModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!caseId) return;

    const found = getCaseById(caseId);
    if (found) {
      setCaseData(found);
    } else {
      casesApi
        .get(caseId)
        .then((bc) => {
          if (bc) {
            setCaseData({
              id: bc.id,
              title: bc.title,
              description: bc.description || '',
              status: (bc.status as any) || 'active',
              jurisdiction: (bc.jurisdiction as any) || 'India',
              language: bc.language || 'en',
              created_at: bc.created_at,
              updated_at: bc.updated_at,
              formulation: {
                product_category: 'Ayurvedic formulation',
                ingredients: [
                  {
                    id: 'ing-1',
                    name: 'Ashwagandha',
                    botanical_name: 'Withania somnifera',
                    part_used: 'Root (Mūla)',
                    percentage: 60,
                    source_type: 'cultivated',
                  },
                ],
                preparation_method: 'Standard aqueous extraction',
                traditional_basis: ['Ayurvedic Formulary of India (AFI)'],
                is_classical: false,
                intended_use: 'General vitality and wellness support',
                claims_type: ['Ayurvedic Proprietary Medicine'],
                commercial_intent: 'Domestic commercial manufacture',
                target_jurisdiction: (bc.jurisdiction as any) || 'India',
                preliminary_rules: {
                  patent_3p_applicable: true,
                  patent_3p_note: 'Section 3(p) Indian Patents Act applies.',
                  abs_nba_required: true,
                  abs_nba_note: 'Biological Diversity Act 2002 applies.',
                  regulatory_framework: 'Drugs & Cosmetics Act 1940 (Rule 158B)',
                  regulatory_note: 'Schedule T GMP compliance required.',
                  fssai_ayurveda_aahar: false,
                },
              },
            });
          }
        })
        .catch((err) => {
          console.warn('Backend case fetch note:', err);
        });
    }
  }, [caseId, getCaseById]);

  // Compute Full Case Intelligence through Deterministic Engine
  const intelligence = useMemo(() => {
    if (!caseData) return null;

    if (simulateMissingData) {
      // Simulate stripped formulation to demonstrate safe abstention
      return evaluateCaseIntelligence(caseData.id, {
        ...caseData.formulation,
        ingredients: [],
        intended_use: '',
      });
    }

    return evaluateCaseIntelligence(caseData.id, caseData.formulation);
  }, [caseData, simulateMissingData]);

  if (!mounted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('caseDetail.loading')}</div>
      </div>
    );
  }

  if (!caseData || !intelligence) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {t('caseDetail.notFound')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          {t('caseDetail.notFoundDesc')}
        </p>
        <Link
          href="/cases"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >
          {t('caseDetail.returnWorkspace')}
        </Link>
      </div>
    );
  }

  const { formulationDNA, candidateClassifications, applicableRegimes, evidenceGaps, priorArtSignals, ipPathways, regulatoryPathways, absEvaluation, safeAbstention, evidenceChain, prioritizedNextActions } = intelligence;

  const handleOpenWhy = (cand: typeof candidateClassifications[0]) => {
    setWhySeeingThis({
      title: cand.name,
      factsDetected: cand.triggeredConditions,
      ruleTriggered: cand.ruleIdentifier,
      evidenceRetrieved: cand.citations,
      missingInformation: cand.missingInformation,
      resultSummary: cand.confidenceRationale,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link href="/cases" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.cases')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{caseData.title}</span>
          </div>

          {/* Safe Abstention Simulation Toggle for Hackathon Jury */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              🛡️ {t('caseDetail.juryDemo')}:
            </span>
            <button
              onClick={() => setSimulateMissingData(!simulateMissingData)}
              style={{
                background: simulateMissingData ? '#c2410c' : 'rgba(46, 125, 50, 0.1)',
                color: simulateMissingData ? '#fff' : 'var(--color-primary-dark)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {simulateMissingData ? `${t('caseDetail.simulateMissing')} (Abstained)` : t('caseDetail.simulateMissing')}
            </button>
          </div>
        </div>

        {/* Case Banner Header */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: caseData.is_demo ? '1px solid rgba(197, 160, 89, 0.4)' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: caseData.status === 'active' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: caseData.status === 'active' ? 'var(--color-primary-dark)' : 'var(--text-muted)',
                  }}
                >
                  {caseData.status}
                </span>

                {caseData.is_demo && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(197, 160, 89, 0.15)',
                      color: '#8c6b1f',
                      border: '1px solid rgba(197, 160, 89, 0.3)',
                    }}
                  >
                    Representative Demo Case
                  </span>
                )}

                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t('common.jurisdiction')}: <strong>{caseData.jurisdiction}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  DNA: <strong>{formulationDNA.dataCompletenessScore}%</strong>
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                {caseData.title}
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5, maxWidth: '720px' }}>
                {caseData.description}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setExpertModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(197, 160, 89, 0.15)',
                  color: '#8c6b1f',
                  border: '1px solid rgba(197, 160, 89, 0.4)',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <span>🎓</span> {t('action.requestExpertReview') || 'Request Expert Review'}
              </button>

              <Link
                href={`/cases/${caseData.id}/report`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--green-700)',
                  color: '#ffffff',
                  border: '1px solid var(--green-800)',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <span>📄</span> {t('action.generateReport')} (PDF)
              </Link>

              <Link
                href={`/assistant?context=${encodeURIComponent(caseData.title)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(46, 125, 50, 0.08)',
                  color: 'var(--color-primary-dark)',
                  border: '1px solid rgba(46, 125, 50, 0.3)',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                <span>🤖</span> {t('action.askAI')}
              </Link>

              <button
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <span>🖨️</span> {t('common.print')}
              </button>
            </div>
          </div>
        </div>

        {/* ─── SAFE ABSTENTION BANNER (WHEN TRIGGERED) ─── */}
        <AbstentionBanner
          abstention={safeAbstention}
          onProvideMoreInfo={() => setSimulateMissingData(false)}
        />

        {/* ─── SIGNATURE FEATURE: INTELLIGENCE BOARD ─── */}
        <IntelligenceBoard
          intelligence={intelligence}
          onOpenEvidence={() => {
            if (candidateClassifications[0]?.citations[0]) {
              setSelectedCitation(candidateClassifications[0].citations[0]);
            }
          }}
        />

        {/* ─── 1. WHAT WE KNOW ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('caseDetail.tabDna')}
            </h2>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Top Grid: Key Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {t('wizard.productType')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {formulationDNA.productCategory}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t('wizard.dosageForm')}: {formulationDNA.dosageForm}
                </div>
              </div>

              <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {t('wizard.step2.title')} ({formulationDNA.ingredients.length})
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {formulationDNA.ingredients.map(i => i.name).join(', ') || 'NONE DECLARED'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Biological Resources: {formulationDNA.biologicalResourcesPresent ? 'Present (India)' : 'None'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {t('wizard.step4.title')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {formulationDNA.isClassical ? 'Classical Treatise Recipe' : 'Novel / Proprietary Formulation'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {formulationDNA.traditionalBasis.length > 0 ? formulationDNA.traditionalBasis[0] : 'Modern observational basis'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {t('wizard.step6.title')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {formulationDNA.targetJurisdiction} Jurisdiction
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {formulationDNA.commercialIntent}
                </div>
              </div>
            </div>

            {/* Ingredients Specification Table */}
            {formulationDNA.ingredients.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.6rem 0.75rem' }}>#</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{t('report.commonName')}</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{t('report.botanicalTaxon')}</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{t('report.partUsed')}</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{t('report.bioOrigin')}</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>{t('report.ratio')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulationDNA.ingredients.map((ing, idx) => (
                      <tr key={ing.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>🌿 {ing.name}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontStyle: 'italic' }}>{ing.botanicalTaxon}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{ing.partUsed}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ textTransform: 'capitalize', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                            {ing.sourceType}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{typeof ing.quantityPercentage === 'number' ? `${ing.quantityPercentage}%` : ing.quantityPercentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ─── 2. INTELLIGENCE SUMMARY ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('caseDetail.tabClassifications')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {candidateClassifications.map((cand) => (
              <div
                key={cand.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <EvidenceStrengthBadge strength={cand.confidence} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {cand.ruleIdentifier}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.4rem', fontWeight: 600 }}>
                    {cand.name}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.45, margin: '0 0 1rem' }}>
                    {cand.confidenceRationale}
                  </p>

                  <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      {t('intel.factTriggered')}:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {cand.triggeredConditions.map((tc, i) => (
                        <li key={i}>{tc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenWhy(cand)}
                    style={{
                      background: 'rgba(197, 160, 89, 0.1)',
                      border: '1px solid rgba(197, 160, 89, 0.3)',
                      color: '#8c6b1f',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    💡 {t('caseDetail.whyThis')}
                  </button>

                  {cand.citations.length > 0 && (
                    <button
                      onClick={() => setSelectedCitation(cand.citations[0])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t('label.inspectStatute')} ↗
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 3. EVIDENCE GAP DETECTOR ─── */}
        <section>
          <EvidenceGapView
            gaps={evidenceGaps}
            onRequestExpert={() => setExpertModalOpen(true)}
          />
        </section>

        {/* ─── 4. SIGNATURE FEATURE: INTERACTIVE EVIDENCE CHAIN ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <EvidenceChainView steps={evidenceChain} />
        </section>

        {/* ─── 4.1 RELATIONAL KNOWLEDGE GRAPH MAP ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <RelationshipMap />
        </section>

        {/* ─── 5. POTENTIAL PATHWAYS (IP, REGULATORY, ABS) ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('caseDetail.tabIpPathways')} & {t('caseDetail.tabRegulations')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* IP Pathways */}
            {ipPathways.map((ip, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: ip.applicabilityStatus === 'RESTRICTED_BAR' ? '1.5px solid rgba(234, 88, 12, 0.35)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>⚖️</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: ip.applicabilityStatus === 'RESTRICTED_BAR' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                        color: ip.applicabilityStatus === 'RESTRICTED_BAR' ? '#c2410c' : 'var(--color-primary-dark)',
                      }}
                    >
                      {ip.applicabilityStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                    {ip.pathwayName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    {ip.headline}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                    <strong>{t('label.regimes')}:</strong>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                      {ip.statutoryRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    <strong>{t('label.nextActions')}:</strong> {ip.cautiousNextAction}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {ip.citations.length} Governing Section{ip.citations.length > 1 ? 's' : ''}
                  </span>
                  {ip.citations.length > 0 && (
                    <button
                      onClick={() => setSelectedCitation(ip.citations[0])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t('label.inspectStatute')} ↗
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Regulatory Pathways */}
            {regulatoryPathways.map((reg, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>🏛️</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(46, 125, 50, 0.1)',
                        color: 'var(--color-primary-dark)',
                      }}
                    >
                      {reg.applicabilityStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                    {reg.frameworkName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    {reg.headline}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                    <strong>{t('caseDetail.tabRegulations')}:</strong>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                      {reg.licensingDossierRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    <strong>{t('label.nextActions')}:</strong> {reg.nextReviewStep}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {reg.citations.length} Statutory Citation{reg.citations.length > 1 ? 's' : ''}
                  </span>
                  {reg.citations.length > 0 && (
                    <button
                      onClick={() => setSelectedCitation(reg.citations[0])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t('label.inspectStatute')} ↗
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* ABS & Biodiversity Pathway */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🌿</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: absEvaluation.triggersSBBSection7 ? 'rgba(197, 160, 89, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                      color: absEvaluation.triggersSBBSection7 ? '#8c6b1f' : 'var(--text-muted)',
                    }}
                  >
                    {absEvaluation.triggersSBBSection7 ? 'SBB Intimation Required' : 'ABS Review'}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                  Biological Diversity Act (ABS Compliance)
                </h3>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {absEvaluation.headline}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  <strong>{t('caseDetail.tabAbs')}:</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                    {absEvaluation.statutoryObligations.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  <strong>Exemption Status:</strong> {absEvaluation.exemptionStatus}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {absEvaluation.citations.length} NBA/SBB Citation{absEvaluation.citations.length > 1 ? 's' : ''}
                </span>
                {absEvaluation.citations.length > 0 && (
                  <button
                    onClick={() => setSelectedCitation(absEvaluation.citations[0])}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary-dark)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    {t('label.inspectStatute')} ↗
                  </button>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ─── 5.1 DEDICATED ABS COMPLIANCE NAVIGATOR ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <ABSWorkflowView />
        </section>

        {/* ─── 5.2 OFFICIAL REGISTRY & FILING ACTION ROUTER ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <OfficialRegistryRouter />
        </section>

        {/* ─── 6. PRIOR-ART INTELLIGENCE SIGNALS ─── */}
        {priorArtSignals.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                {t('caseDetail.tabPriorArt')}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {priorArtSignals.map((sig) => (
                <div key={sig.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(197, 160, 89, 0.15)', color: '#8c6b1f', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      Prior-Art Signal
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sig.sourceReference}</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: 'var(--text-primary)' }}>{sig.concept}</h4>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{sig.similarityNature}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', background: 'var(--bg-base)', padding: '0.65rem 0.8rem', borderRadius: '6px', lineHeight: 1.45 }}>
                    <strong>Cautionary Guidance:</strong> {sig.guidance}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 6.1 REGULATORY TIME MACHINE (VERSION DIFF AUDIT) ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('intel.timeMachineTitle')}
            </h2>
          </div>
          <RegulatoryTimeMachine initialSourceId="BIO_DIVERSITY_ACT_SEC_7" />
        </section>

        {/* ─── 6.2 TECHNICAL DOCUMENTS & CERTIFICATES ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('intel.uploadTitle')}
            </h2>
          </div>
          <DocumentUploader caseId={caseData.id} />
        </section>

        {/* ─── 7. WHAT TO DO NEXT (PRIORITIZED ACTIONS) ─── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>●</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
              {t('caseDetail.tabNextActions')}
            </h2>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {prioritizedNextActions.map((action, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: 'var(--bg-base)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(46, 125, 50, 0.1)',
                      color: 'var(--color-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 8. TRANSPARENT LEGAL DISCLAIMER ─── */}
        <div
          style={{
            background: 'rgba(46, 125, 50, 0.04)',
            border: '1px solid rgba(46, 125, 50, 0.2)',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--color-primary-dark)' }}>{t('footer.noticeTitle')}:</strong> {t('footer.noticeDesc')}
        </div>

      </div>

      {/* Global Statutory Evidence Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(selectedCitation)}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
      />

      {/* Why Am I Seeing This Modal */}
      <WhySeeingThisModal
        isOpen={Boolean(whySeeingThis)}
        onClose={() => setWhySeeingThis(null)}
        data={whySeeingThis}
        onViewEvidence={(cit) => {
          setWhySeeingThis(null);
          setSelectedCitation(cit);
        }}
      />

      {/* Human Expert Consultation Package Generator */}
      <ExpertConsultationModal
        isOpen={expertModalOpen}
        onClose={() => setExpertModalOpen(false)}
        caseTitle={caseData.title}
        caseId={caseData.id}
        ingredients={formulationDNA.ingredients.map((i) => i.name)}
        classification={candidateClassifications[0]?.name || 'Ayurvedic Formulation'}
        confidence={candidateClassifications[0]?.confidence || 'POTENTIAL'}
        evidenceGaps={evidenceGaps.map((g) => g.title)}
      />
    </div>
  );
}
