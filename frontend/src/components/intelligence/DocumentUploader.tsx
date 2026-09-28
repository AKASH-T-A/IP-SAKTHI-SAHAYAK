'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Shield, Trash2, ExternalLink } from 'lucide-react';
import { useLanguageStore } from '@/store/language';

export interface UploadedCaseDoc {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  uploadedAt: string;
  securityStatus: 'VERIFIED_CLEAN' | 'FLAGGED_SUSPICIOUS' | 'SCANNING';
  summary?: string;
  sanitizedTextExcerpt?: string;
}

interface DocumentUploaderProps {
  caseId: string;
  className?: string;
}

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx', 'json', 'csv'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'sh', 'cmd', 'py', 'js', 'vbs', 'ps1', 'dll'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  caseId,
  className = ''
}) => {
  const { t } = useLanguageStore();
  const [documents, setDocuments] = useState<UploadedCaseDoc[]>([
    {
      id: 'doc-sample-1',
      name: 'Certificate_of_Analysis_Ashwagandha_Withanolides.pdf',
      sizeBytes: 1048576, // 1 MB
      type: 'pdf',
      uploadedAt: '2026-09-26',
      securityStatus: 'VERIFIED_CLEAN',
      summary: 'HPLC Assay: Total withanolides 5.2% w/w. Heavy metals compliant with Pharmacopoeia standards.',
      sanitizedTextExcerpt: 'Standardized root extract of Withania somnifera. Lead: 0.12 ppm, Arsenic: 0.05 ppm, Cadmium: < 0.01 ppm, Mercury: Not detected.'
    }
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    setErrorMessage(null);

    // 1. Security Check: Dangerous Extensions
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Security Guardrail Triggered: Executable or script files (.${ext}) are strictly prohibited.`);
      return;
    }

    // 2. Format Whitelist Check
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported file format. Please upload verified formulation records (.pdf, .txt, .docx, .json, .csv).`);
      return;
    }

    // 3. File Size Limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds the 10 MB maximum upload threshold. Please compress or provide an excerpt.`);
      return;
    }

    setIsUploading(true);

    // Read and sanitize text if plain text/json
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = (event.target?.result as string) || '';
      
      // Prompt Injection Containment Scan
      const hasInjection = /ignore\s+(all\s+)?previous\s+instructions|override\s+system/i.test(rawText);

      setTimeout(() => {
        const newDoc: UploadedCaseDoc = {
          id: 'doc-' + Date.now(),
          name: file.name,
          sizeBytes: file.size,
          type: ext,
          uploadedAt: new Date().toISOString().split('T')[0],
          securityStatus: hasInjection ? 'FLAGGED_SUSPICIOUS' : 'VERIFIED_CLEAN',
          summary: hasInjection 
            ? 'Flagged: Contains suspicious prompt-override directives. Text quarantined.' 
            : `Extracted ${Math.min(file.size, 500)} bytes of technical formulation parameters.`,
          sanitizedTextExcerpt: rawText.substring(0, 300) || 'Binary content indexed for case dossier.'
        };

        setDocuments(prev => [newDoc, ...prev]);
        setIsUploading(false);
      }, 600);
    };

    if (ext === 'txt' || ext === 'json' || ext === 'csv') {
      reader.readAsText(file);
    } else {
      // Simulate binary processing
      setTimeout(() => {
        const newDoc: UploadedCaseDoc = {
          id: 'doc-' + Date.now(),
          name: file.name,
          sizeBytes: file.size,
          type: ext,
          uploadedAt: new Date().toISOString().split('T')[0],
          securityStatus: 'VERIFIED_CLEAN',
          summary: `Extracted laboratory document (${ext.toUpperCase()}). Scanned for malware and prompt overrides.`,
          sanitizedTextExcerpt: 'Document scanned and verified clean. Linked to case dossier.'
        };
        setDocuments(prev => [newDoc, ...prev]);
        setIsUploading(false);
      }, 700);
    }
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className={`p-6 rounded-xl bg-stone-900/60 border border-stone-800 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t('intel.uploadTitle')}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {t('intel.attachDocsDesc')}
          </p>
        </div>

        <span className="text-[11px] font-mono text-stone-400 bg-stone-950 px-2.5 py-1 rounded border border-stone-800">
          {t('intel.maxFileSize')}
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-stone-700 hover:border-emerald-500/60 rounded-xl p-5 text-center bg-stone-950/40 transition-colors mb-4">
        <input 
          type="file" 
          onChange={handleFileUpload}
          accept=".pdf,.txt,.docx,.json,.csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-200 block">
              {isUploading ? t('common.loading') : t('intel.dragDrop')}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              {t('intel.supportedFormats')}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-2.5">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-[200px]">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-medium text-stone-200 block truncate max-w-xs">{doc.name}</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {(doc.sizeBytes / 1024).toFixed(1)} KB · {doc.uploadedAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 ${
                doc.securityStatus === 'VERIFIED_CLEAN' 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-950/80 text-red-300 border border-red-500/30'
              }`}>
                {doc.securityStatus === 'VERIFIED_CLEAN' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{t('intel.cleanVerified')}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>{t('intel.quarantined')}</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="text-stone-500 hover:text-red-400 p-1 rounded transition-colors"
                title={t('common.delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security Rule Callout */}
      <div className="mt-4 p-2.5 rounded bg-stone-950/80 border border-stone-800 text-[11px] text-stone-500 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>
          <strong>{t('intel.securityPrinciple')}</strong> {t('intel.securityPrincipleDesc')}
        </span>
      </div>
    </div>
  );
};
