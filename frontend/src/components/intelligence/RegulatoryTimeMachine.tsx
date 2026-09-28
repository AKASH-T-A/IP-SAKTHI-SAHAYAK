'use client';

import React, { useState } from 'react';
import { 
  History, 
  ArrowRight, 
  ExternalLink, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { useLanguageStore } from '@/store/language';
import { STATUTORY_VERSIONS } from '@/lib/intelligence/versioning';
import { SourceVersionRecord } from '@/lib/intelligence/types';

interface RegulatoryTimeMachineProps {
  initialSourceId?: string;
  className?: string;
}

export const RegulatoryTimeMachine: React.FC<RegulatoryTimeMachineProps> = ({
  initialSourceId = 'BIO_DIVERSITY_ACT_SEC_7',
  className = ''
}) => {
  const { t } = useLanguageStore();
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    initialSourceId === 'BIO_DIVERSITY_ACT_SEC_7' ? 'BDA-2023-AMD' : 'PATENTS-2005-AMD'
  );

  const selectedRecord = STATUTORY_VERSIONS.find(v => v.id === selectedRecordId) || STATUTORY_VERSIONS[0];

  return (
    <div className={`bg-stone-900/90 border border-stone-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header Bar */}
      <div className="p-5 border-b border-stone-800 bg-stone-950/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-stone-100">{t('intel.timeMachineTitle')}</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                {t('intel.provenanceTracer')}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {t('intel.timeMachineDesc')}
            </p>
          </div>
        </div>

        {/* Framework Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-400 font-medium">{t('intel.selectFramework')}</label>
          <select 
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {STATUTORY_VERSIONS.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.sourceTitle} ({rec.versionLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metadata Card */}
      <div className="p-5 border-b border-stone-800/80 bg-stone-900/50 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-stone-500 block uppercase font-mono tracking-wider text-[10px]">{t('intel.authority')}</span>
          <span className="font-semibold text-stone-200 text-sm mt-0.5 block">{selectedRecord.sourceTitle}</span>
          <span className="text-stone-400 text-[11px] mt-0.5 block">{selectedRecord.authority}</span>
        </div>

        <div>
          <span className="text-stone-500 block uppercase font-mono tracking-wider text-[10px]">{t('intel.version')} & {t('common.status')}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
              selectedRecord.status === 'ACTIVE' 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
            }`}>
              {selectedRecord.status}
            </span>
            <span className="text-stone-300">{selectedRecord.versionNumber}</span>
          </div>
          <span className="text-stone-400 text-[11px] mt-1 block">{t('evidence.effectiveDate')}: {selectedRecord.effectiveDate}</span>
        </div>

        <div>
          <span className="text-stone-500 block uppercase font-mono tracking-wider text-[10px]">{t('intel.gazetteSource')}</span>
          <span className="text-stone-300 text-xs mt-0.5 block line-clamp-2">{selectedRecord.gazetteReference}</span>
          <span className="text-stone-500 font-mono text-[10px] mt-1 block truncate">Hash: {selectedRecord.hashSha256.substring(0, 18)}...</span>
        </div>

        <div className="flex flex-col justify-between items-start md:items-end">
          <span className="text-stone-500 uppercase font-mono tracking-wider text-[10px]">{t('intel.gazetteSource')}</span>
          <a 
            href={selectedRecord.officialUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all font-medium mt-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('intel.gazettePdf')}</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Summary of Changes Banner */}
      <div className="p-4 bg-emerald-950/20 border-b border-emerald-900/30 px-5 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-emerald-300 block mb-0.5">{t('intel.plainSummary')}:</span>
          <p className="text-stone-300 leading-relaxed">{selectedRecord.summaryOfChanges}</p>
        </div>
      </div>

      {/* Clause-Level Diff List */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            {t('intel.clauseComparison')}
          </h4>
          <span className="text-[11px] text-stone-500 font-mono">
            {selectedRecord.diffClauses.length} statutory clause(s) tracked
          </span>
        </div>

        <div className="space-y-3">
          {selectedRecord.diffClauses.map((clause, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-lg bg-stone-950/50 border border-stone-800/80 hover:border-stone-700 transition-all"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono font-semibold text-xs text-stone-200">
                  {clause.clauseId}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  clause.type === 'ADDED' 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                    : clause.type === 'MODIFIED'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}>
                  {clause.type}
                </span>
              </div>

              {/* Text Diff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                {clause.originalText && (
                  <div className="p-2.5 rounded bg-stone-900/80 border border-red-900/30">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1">
                      {t('intel.previousText')}
                    </span>
                    <p className="text-stone-400 line-through text-[11px] leading-relaxed">
                      {clause.originalText}
                    </p>
                  </div>
                )}

                {clause.updatedText && (
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-700/30">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                      {t('intel.amendedText')}
                    </span>
                    <p className="text-stone-200 font-medium text-[11px] leading-relaxed">
                      {clause.updatedText}
                    </p>
                  </div>
                )}
              </div>

              {/* Analysis Note */}
              <div className="p-2.5 rounded bg-stone-900/90 border-amber-500/60 text-xs" style={{ borderInlineStart: '2px solid rgba(245, 158, 11, 0.6)' }}>
                <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">
                  {t('evidence.why_applies')}:
                </span>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  {clause.analysisNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Mandatory Institutional Disclaimer */}
      <div className="p-3 bg-stone-950 border-t border-stone-800/80 px-5 flex items-center gap-2 text-[11px] text-stone-500">
        <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>
          <strong>{t('footer.noticeTitle')}:</strong> {t('footer.noticeDesc')}
        </span>
      </div>
    </div>
  );
};
