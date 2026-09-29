'use client';

import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language';
import { expertApi, ExpertConsultationPackage } from '@/lib/api/expert';

interface ExpertConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  caseId: string;
  ingredients: string[];
  classification: string;
  confidence: string;
  evidenceGaps: string[];
}

export default function ExpertConsultationModal({
  isOpen,
  onClose,
  caseTitle,
  caseId,
  ingredients,
  classification,
  confidence,
  evidenceGaps,
}: ExpertConsultationModalProps) {
  const { t } = useLanguageStore();
  const [copied, setCopied] = useState(false);
  const [userQuestions, setUserQuestions] = useState<string>('');
  const [backendPackage, setBackendPackage] = useState<ExpertConsultationPackage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const packageId = backendPackage?.package_id || `EXP-PKG-${caseId.slice(0, 8).toUpperCase()}`;
  const now = backendPackage?.generated_at || new Date().toISOString();

  const questionsList = userQuestions.trim()
    ? userQuestions.split('\n').filter((q) => q.trim().length > 0)
    : [
        'Does our comparative extraction data overcome Section 3(p) Traditional Knowledge objection?',
        'Can this product be marketed under D&C Rule 158B without full clinical phase trials?',
        'What are the mandatory State Biodiversity Board (SBB) benefit-sharing filing requirements?',
      ];

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsGenerating(true);
    expertApi
      .generateConsultationPackage({
        case_id: caseId,
        case_title: caseTitle,
        formulation: {
          ingredients: ingredients.map((name) => ({ name })),
        },
        user_questions: questionsList,
      })
      .then((pkg) => {
        if (!isCancelled) setBackendPackage(pkg);
      })
      .catch((err) => {
        console.warn('Backend expert package generation failed, using local format:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsGenerating(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, caseId, caseTitle]);

  if (!isOpen) return null;

  const fallbackDossierText = `# IP-SAKTI SAHAYAK — HUMAN EXPERT CONSULTATION PACKAGE
Package ID: ${packageId}
Generated At: ${now}
Case: ${caseTitle} (ID: ${caseId})
Status: PREPARED FOR EXPERT REVIEW — NOT SUBMITTED EXTERNALLY

============================================================
1. FORMULATION SUMMARY
============================================================
- Formulation: ${caseTitle}
- Declared Ingredients: ${ingredients.join(', ') || 'Herbal polyherbal blend'}
- AI Classification Finding: ${classification}
- Algorithmic Evidence Confidence: ${confidence}

============================================================
2. GOVERNING STATUTORY REGIMES & CITATIONS
============================================================
1. The Patents Act, 1970 — Section 3(p) [Traditional Knowledge Bar]
2. The Patents Act, 1970 — Section 3(e) [Aggregation of Known Properties]
3. Drugs & Cosmetics Rules, 1945 — Rule 158B [Proprietary Medicine Licensing Criteria]
4. The Biological Diversity Act, 2002 — Section 6 [NBA Patent Approval] & Section 7 [SBB Prior Intimation]

============================================================
3. IDENTIFIED EVIDENCE GAPS REQUIRING SPECIALIST REVIEW
============================================================
${evidenceGaps.map((g, i) => `${i + 1}. ${g}`).join('\n') || 'None recorded.'}

============================================================
4. QUESTIONS REQUIRING EXPERT HUMAN ADVICE
============================================================
${questionsList.map((q, i) => `${i + 1}. ${q}`).join('\n')}

============================================================
5. MANDATORY TRANSPARENT DISCLAIMER
============================================================
This consultation package is an algorithmic decision-support synthesis.
It does NOT constitute formal legal advice, attorney-client privileged work product,
or granted regulatory certification. Not yet submitted to an external expert.
`;

  const fullDossierText = backendPackage?.markdown_dossier || fallbackDossierText;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDossierText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([fullDossierText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expert_Consultation_Package_${caseId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-base)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1rem' }}>🧑‍⚖️</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(46, 125, 50, 0.12)', color: 'var(--color-primary-dark)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {packageId}
              </span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Human Expert Escalation Package
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.3rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Submission Notice Banner */}
          <div
            style={{
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#9a3412',
              lineHeight: 1.45,
            }}
          >
            <strong>Transparent Process Notice:</strong> This structured dossier has been generated locally from verified case evidence. It is <strong>NOT yet submitted to an external expert or government authority</strong>. You may download or copy this package to share with your accredited patent agent or AYUSH regulatory consultant.
          </div>

          {/* Dossier Preview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-base)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Case & Classification
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {caseTitle}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', marginTop: '0.2rem' }}>
                {classification} ({confidence})
              </div>
            </div>

            <div style={{ background: 'var(--bg-base)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Statutory Citations Attached
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                • Patents Act 1970 § 3(p) & § 3(e)<br />
                • D&C Rules 1945 Rule 158B<br />
                • Biological Diversity Act § 6 & § 7
              </div>
            </div>
          </div>

          {/* User Questions Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Specific Questions for Attorney / Consultant (Optional):
            </label>
            <textarea
              rows={3}
              value={userQuestions}
              onChange={(e) => setUserQuestions(e.target.value)}
              placeholder="e.g. Can we claim composition of matter under Indian patent law? What are the clinical trial sample size requirements?"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Dossier Code Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Structured Consultation Dossier (Markdown Preview)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {fullDossierText.length} characters
              </span>
            </div>
            <pre
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                overflowX: 'auto',
                maxHeight: '180px',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {fullDossierText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-base)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Dossier'}
            </button>

            <button
              onClick={handleDownload}
              style={{
                background: 'var(--green-700)',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.15rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>💾</span> Download Package (.MD)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
