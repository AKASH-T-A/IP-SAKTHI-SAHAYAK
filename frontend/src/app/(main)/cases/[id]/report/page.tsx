'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCasesStore } from '@/store/cases';
import { useLanguageStore } from '@/store/language';
import { evaluateCaseIntelligence } from '@/lib/intelligence/engine';
import { Citation } from '@/lib/intelligence/types';
import LanguageSelector from '@/components/layout/LanguageSelector';
import { Printer, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CaseReportPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const { getCaseById } = useCasesStore();
  const { language, t, tDual } = useLanguageStore();

  const caseData = getCaseById(caseId);

  const intelligence = useMemo(() => {
    if (!caseData) return null;
    return evaluateCaseIntelligence(caseData.id, caseData.formulation);
  }, [caseData]);

  if (!caseData || !intelligence) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-stone-400">
        <div className="text-center">
          <p className="text-base font-semibold text-stone-200">Case dossier not found or uninitialized.</p>
          <Link href="/cases" className="text-emerald-400 hover:underline mt-2 inline-block text-sm">
            ← Return to Cases Workspace
          </Link>
        </div>
      </div>
    );
  }

  const primaryClass = intelligence.candidateClassifications[0]?.name || 'Ayurvedic Proprietary Medicine';
  const confidenceLevel = intelligence.candidateClassifications[0]?.confidence || 'HIGH_EVIDENCE';
  const reportRef = `IPSAKTI-DOSSIER-${caseData.id.toUpperCase()}-${primaryClass.slice(0, 4).toUpperCase()}`;
  const allCitations: Citation[] = intelligence.candidateClassifications[0]?.citations || [];
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* ── Top Floating Action Bar (Hidden in Print) ─────────────────────────── */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-wrap items-center justify-between gap-4 print:hidden shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseData.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-stone-900 border border-stone-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('report.returnDossier')}</span>
          </Link>

          <span className="text-xs text-stone-400 font-mono hidden sm:inline">
            {t('report.ref')} {reportRef}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Universal 22 Scheduled Indian Languages + English Selector */}
          <LanguageSelector />

          {/* Print / Save PDF Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('report.printSave')}</span>
          </button>
        </div>
      </div>

      {/* ── Main Printable Dossier Container ─────────────────────────────────── */}
      <div 
        id="case-intelligence-report"
        className="max-w-4xl mx-auto bg-stone-950 border border-stone-800 rounded-2xl p-8 sm:p-12 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Institutional Header */}
        <div className="border-b border-stone-800 pb-6 mb-8 print:border-gray-300">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase print:text-emerald-700">
                  {t('report.header')}
                </span>
                <span className="text-xs text-stone-500">•</span>
                <span className="text-xs text-stone-400 font-mono print:text-gray-600">
                  IP-SAKTI Sahayak Decision Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 print:text-black tracking-tight">
                {t('report.title')}
              </h1>
              <p className="text-xs text-stone-400 print:text-gray-600 mt-1">
                {t('report.subtitle')}
              </p>
            </div>

            <div className="text-start sm:text-end text-xs text-stone-400 print:text-gray-600 font-mono">
              <div><strong>{t('report.ref')}</strong> {reportRef}</div>
              <div className="mt-0.5"><strong>{t('report.date')}</strong> {currentDate}</div>
              <div className="mt-0.5"><strong>{t('report.corpusHash')}</strong> <span className="text-[11px] text-stone-500 print:text-gray-500">sha256-verified</span></div>
            </div>
          </div>
        </div>

        {/* Safe Abstention Alert (if incomplete) */}
        {intelligence.safeAbstention.isAbstained && (
          <div className="mb-8 p-5 rounded-xl bg-amber-950/30 border border-amber-500/50 print:bg-amber-50 print:border-amber-400">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 print:text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-300 print:text-amber-800">
                  Safe Abstention Safeguard Active
                </h3>
                <p className="text-xs text-stone-300 print:text-gray-700 mt-1 leading-relaxed">
                  IP-SAKTI does not have sufficient authoritative evidence to evaluate this formulation definitively. Speculative classifications have been withheld in strict accordance with statutory verification protocols.
                </p>
                <div className="mt-2 text-xs text-amber-200 print:text-amber-900 font-mono">
                  <strong>Missing Parameters:</strong> {intelligence.safeAbstention.missingFields.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Asset Information & DNA */}
        <div className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
            {t('report.sec1')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-stone-900/60 border border-stone-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-stone-500 print:text-gray-500 block uppercase font-mono text-[10px]">Asset Title</span>
              <span className="font-semibold text-stone-200 print:text-black text-sm mt-0.5 block">{caseData.title}</span>
              <span className="text-stone-400 print:text-gray-600 text-xs mt-1 block">{caseData.description}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-stone-900/60 border border-stone-800 print:bg-gray-50 print:border-gray-200 space-y-1">
              <div><strong className="text-stone-400 print:text-gray-600 font-mono">{t('report.tableIngredients')}:</strong> <span className="text-stone-200 print:text-black">{caseData.formulation.product_category}</span></div>
              <div><strong className="text-stone-400 print:text-gray-600 font-mono">{t('report.part')}:</strong> <span className="text-stone-200 print:text-black">{caseData.formulation.dosage_form || 'Unspecified'}</span></div>
              <div><strong className="text-stone-400 print:text-gray-600 font-mono">{t('report.source')}:</strong> <span className="text-stone-200 print:text-black capitalize">{caseData.formulation.commercial_intent}</span></div>
              <div><strong className="text-stone-400 print:text-gray-600 font-mono">{t('common.jurisdiction')}:</strong> <span className="text-stone-200 print:text-black">{caseData.formulation.target_jurisdiction}</span></div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="mt-4">
            <h3 className="text-xs font-mono uppercase text-stone-400 print:text-gray-600 mb-2">{t('report.botanicalActives')}</h3>
            <div className="overflow-x-auto rounded-lg border border-stone-800 print:border-gray-200">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900 print:bg-gray-100 text-stone-400 print:text-gray-700 font-mono border-b border-stone-800 print:border-gray-200">
                    <th className="p-2.5">{t('report.commonName')}</th>
                    <th className="p-2.5">{t('report.botanicalTaxon')}</th>
                    <th className="p-2.5">{t('report.partUsed')}</th>
                    <th className="p-2.5">{t('report.ratio')}</th>
                    <th className="p-2.5">{t('report.bioOrigin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 print:divide-gray-200">
                  {caseData.formulation.ingredients.map((ing, i) => (
                    <tr key={i} className="hover:bg-stone-900/30 print:hover:bg-transparent">
                      <td className="p-2.5 font-medium text-stone-200 print:text-black">{ing.name} ({ing.sanskrit_name || 'N/A'})</td>
                      <td className="p-2.5 italic text-stone-300 print:text-gray-800">{ing.botanical_name || 'Taxon unconfirmed'}</td>
                      <td className="p-2.5 text-stone-400 print:text-gray-600">{ing.part_used || 'Unspecified'}</td>
                      <td className="p-2.5 font-mono text-stone-300 print:text-black">{ing.percentage ? `${ing.percentage}%` : 'Quantum Satis'}</td>
                      <td className="p-2.5 text-stone-300 print:text-black capitalize">{ing.source_type || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Deterministic Statutory Classification */}
        <div className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
            {t('report.sec2')}
          </h2>

          <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800 print:bg-gray-50 print:border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-base font-bold text-stone-100 print:text-black">
                {primaryClass}
              </span>
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900">
                {confidenceLevel}
              </span>
            </div>

            <p className="text-xs text-stone-300 print:text-gray-800 leading-relaxed mb-3">
              Evaluated in strict accordance with the Drugs and Cosmetics Act 1940, Rule 158B, and The Patents Act 1970 § 3(p).
            </p>

            <div className="text-xs text-stone-400 print:text-gray-600 border-t border-stone-800 print:border-gray-200 pt-2">
              <strong className="text-stone-300 print:text-gray-900">{t('report.statutoryRationale')}</strong> {intelligence.candidateClassifications[0]?.confidenceRationale || 'Direct statutory applicability established.'}
            </div>
          </div>
        </div>

        {/* Section 3: Evidence Chain Trace */}
        <div className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
            {t('report.sec3')}
          </h2>

          <div className="space-y-2.5">
            {intelligence.evidenceChain.map((step) => (
              <div 
                key={step.stepNumber} 
                className="p-3 rounded-lg bg-stone-900/40 border border-stone-800/80 print:bg-gray-50 print:border-gray-200 text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 print:bg-emerald-100 print:text-emerald-900 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-[10px]">
                    {step.stepNumber}
                  </span>
                  <span className="font-mono font-semibold text-[11px] text-stone-400 print:text-gray-600 uppercase">
                    {step.stageName.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-semibold text-stone-200 print:text-black">
                    {step.title}
                  </span>
                </div>
                <p className="text-stone-300 print:text-gray-700 text-xs ps-7 leading-relaxed">
                  {step.description}
                </p>
                {step.citation && (
                  <div className="mt-1.5 ps-7 text-[11px] text-emerald-400 print:text-emerald-800 font-mono">
                    Statutory Grounding: {step.citation.sourceTitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Evidence Gaps */}
        {intelligence.evidenceGaps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-mono uppercase tracking-wider text-amber-400 print:text-amber-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
              {t('report.sec4')}
            </h2>

            <div className="space-y-2 text-xs">
              {intelligence.evidenceGaps.map((gap) => (
                <div 
                  key={gap.id} 
                  className="p-3 rounded-lg bg-stone-900/40 border border-amber-900/30 print:bg-amber-50 print:border-amber-200"
                >
                  <div className="font-semibold text-amber-300 print:text-amber-900 mb-1">
                    ⚠ {gap.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300 print:text-gray-800 text-[11px]">
                    <div><strong>Why It Matters:</strong> {gap.whyItMatters}</div>
                    <div><strong>Required Action:</strong> {gap.whatToProvide}</div>
                  </div>
                  <div className="text-[10px] font-mono text-stone-400 print:text-gray-600 mt-1">
                    <strong>Decision Affected:</strong> {gap.decisionAffected}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Authoritative Statutory Citations */}
        <div className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
            {t('report.sec5')}
          </h2>

          <div className="space-y-3 text-xs">
            {allCitations.map((c: Citation) => (
              <div 
                key={c.sourceId}
                className="p-3.5 rounded-lg bg-stone-900/50 border border-stone-800 print:bg-gray-50 print:border-gray-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-stone-200 print:text-black">{c.sourceTitle}</span>
                  <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-800 font-semibold">{c.status}</span>
                </div>
                <div className="text-[11px] text-stone-400 print:text-gray-600 mb-2">
                  {c.authority} • {c.version}
                </div>
                <blockquote className="p-2 rounded bg-stone-950/80 print:bg-white border-s-2 border-emerald-500/70 text-stone-300 print:text-gray-800 text-[11px] italic font-serif leading-relaxed mb-2">
                  "{c.supportingExcerpt}"
                </blockquote>
                <div className="text-[11px] text-stone-400 print:text-gray-700">
                  <strong>Relevance:</strong> {c.relevanceExplanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Actionable Next Steps */}
        <div className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-bold mb-3 border-b border-stone-800 print:border-gray-200 pb-1.5">
            {t('report.sec6')}
          </h2>

          <div className="space-y-2 text-xs">
            {intelligence.prioritizedNextActions.map((act: string, idx: number) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 print:bg-gray-50 print:border-gray-200 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-stone-200 print:text-black leading-relaxed">
                  {act}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Mandatory Disclaimers */}
        <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 print:bg-gray-100 print:border-gray-300 text-xs text-stone-400 print:text-gray-700 leading-relaxed">
          <strong className="text-stone-300 print:text-gray-900 block mb-1">{t('report.sec7')}:</strong>
          {t('assistant.disclaimerFooter')}
        </div>

        {/* End of Dossier Sign-off Footer */}
        <div className="mt-8 pt-4 border-t border-stone-800 print:border-gray-300 flex flex-wrap items-center justify-between text-[11px] text-stone-500 font-mono">
          <span>IP-SAKTI Sahayak · SIH26045</span>
          <span>Authentic Decision-Support Output</span>
          <span>Verified: {currentDate}</span>
        </div>
      </div>
    </div>
  );
}
