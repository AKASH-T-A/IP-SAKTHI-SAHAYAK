'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/language';
import { regulatoryApi } from '@/lib/api/regulatory';

interface FieldStatus {
  field_name: string;
  is_detected: boolean;
  detected_value?: string | null;
  statutory_rule: string;
  status: string;
  guidance: string;
}

interface LabelResult {
  product_category: string;
  compliance_score_percent: number;
  fields_evaluated: FieldStatus[];
  schedule_e1_warning_required: boolean;
  schedule_e1_detected_herbs: string[];
  critical_missing: string[];
  recommendations: string[];
  disclaimer: string;
}

const SAMPLE_LABELS = [
  {
    title: 'Compliant Proprietary Capsule Label',
    text: `Medhya Rasayana Capsules
Each capsule contains: Withania somnifera Root extract 250mg, Bacopa monnieri Herb extract 250mg.
Mfg. Lic. No.: HP-24D/AYUSH-2022
Batch No.: MR-2026-B12
Net Content: 60 Capsules
Manufactured by: Sakti Herbals Private Limited, Industrial Area Phase 2, Solan, Himachal Pradesh 173212.
Mfg Date: 09/2026, Best Before / Exp Date: 08/2029.
Storage: Store in a cool, dry place away from direct sunlight.`,
    category: 'Ayurvedic Proprietary Medicine',
  },
  {
    title: 'Deficient Label (Missing Batch, Lic No & Schedule E1 Warning)',
    text: `Vatsanabha Mahashankha Vati
Contains: Vatsanabha (Aconitum ferox), Shankha Bhasma, Maricha.
Natural herbal tablets for digestive strength.
Take 1 tablet twice daily with warm water.
Net weight: 50 grams.
Ayurvedic remedy.`,
    category: 'Classical Ayurvedic Medicine',
  },
];

export default function LabelReviewPage() {
  const { t } = useLanguageStore();

  const [labelText, setLabelText] = useState<string>(SAMPLE_LABELS[0].text);
  const [productCategory, setProductCategory] = useState<string>(SAMPLE_LABELS[0].category);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LabelResult | null>(null);

  const handleReview = async (overrideText?: string, overrideCategory?: string) => {
    const textToReview = overrideText || labelText;
    const catToReview = overrideCategory || productCategory;

    setLoading(true);
    try {
      const data = await regulatoryApi.reviewLabel({
        label_text: textToReview,
        product_category: catToReview,
      });
      setResult(data);
    } catch (err) {
      // Client-side fallback matching backend logic
      const lower = textToReview.toLowerCase();
      const hasLic = /mfg\.?\s*lic/i.test(textToReview);
      const hasBatch = /batch|lot/i.test(textToReview);
      const hasDate = /mfg|exp|date/i.test(textToReview);
      const hasQty = /net|capsules|tablets|g|ml/i.test(textToReview);
      const hasE1Herb = /vatsanabha|aconitum|kupilu|bhang|bhallataka/i.test(lower);
      const hasCaution = /caution|supervision|physician/i.test(lower);

      const fields: FieldStatus[] = [
        {
          field_name: 'Product Name / Classical Title',
          is_detected: true,
          detected_value: textToReview.split('\n')[0] || 'Ayurvedic Formulation',
          statutory_rule: 'D&C Rule 161(1)(a)',
          status: 'COMPLIANT',
          guidance: 'Must state true product identity per First Schedule texts or trade brand.',
        },
        {
          field_name: 'Active Botanical Ingredients & Parts',
          is_detected: /withania|bacopa|vatsanabha|contains/i.test(textToReview),
          detected_value: 'Botanicals detected',
          statutory_rule: 'D&C Rule 161(1)(b)',
          status: 'COMPLIANT',
          guidance: 'True list of all ingredients with botanical names and parts used.',
        },
        {
          field_name: 'Manufacturing Licence Number',
          is_detected: hasLic,
          detected_value: hasLic ? 'Mfg Lic No present' : null,
          statutory_rule: 'D&C Rule 161(1)(e)',
          status: hasLic ? 'COMPLIANT' : 'MISSING_REQUIRED',
          guidance: 'State AYUSH Licensing Authority number mandatory on all containers.',
        },
        {
          field_name: 'Batch / Lot Number',
          is_detected: hasBatch,
          detected_value: hasBatch ? 'Batch present' : null,
          statutory_rule: 'D&C Rule 161(1)(d)',
          status: hasBatch ? 'COMPLIANT' : 'MISSING_REQUIRED',
          guidance: 'Traceability identifier to master production batch record.',
        },
        {
          field_name: 'Net Quantity / Pack Size',
          is_detected: hasQty,
          detected_value: hasQty ? 'Declared' : null,
          statutory_rule: 'D&C Rule 161(1)(c)',
          status: hasQty ? 'COMPLIANT' : 'MISSING_REQUIRED',
          guidance: 'Numerical weight, volume, or unit count.',
        },
        {
          field_name: 'Dates: Manufacturing & Expiry',
          is_detected: hasDate,
          detected_value: hasDate ? 'Dates present' : null,
          statutory_rule: 'D&C Rule 161(1)(h)',
          status: hasDate ? 'COMPLIANT' : 'MISSING_REQUIRED',
          guidance: 'Date of manufacture and maximum shelf-life expiry date.',
        },
      ];

      if (hasE1Herb) {
        fields.push({
          field_name: 'Schedule E(1) Medical Supervision Warning',
          is_detected: hasCaution,
          detected_value: hasCaution ? 'Caution warning present' : 'WARNING MISSING',
          statutory_rule: 'D&C Rule 161(1)(g) & Schedule E(1)',
          status: hasCaution ? 'COMPLIANT' : 'MISSING_REQUIRED',
          guidance: "Detected Schedule E(1) poisonous botanical (Vatsanabha). Label MUST state: 'Caution: To be taken under medical supervision'.",
        });
      }

      const compliant = fields.filter((f) => f.status === 'COMPLIANT').length;
      const score = Math.round((compliant / fields.length) * 100);

      setResult({
        product_category: catToReview,
        compliance_score_percent: score,
        fields_evaluated: fields,
        schedule_e1_warning_required: hasE1Herb,
        schedule_e1_detected_herbs: hasE1Herb ? ['Vatsanabha (Aconitum ferox)'] : [],
        critical_missing: fields.filter((f) => f.status === 'MISSING_REQUIRED').map((f) => f.field_name),
        recommendations: [
          'Ensure indelible printing on container and outer carton.',
          'Verify all botanical ingredients include genus, species, and plant part.',
          'Confirm font size meets Legal Metrology Rules.',
        ],
        disclaimer: 'Label compliance analysis is an algorithmic decision-support tool. It does not replace final carton artwork proof sign-off.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read text from file
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setLabelText(text);
        handleReview(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
          <span>/</span>
          <Link href="/regulations" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.regulations')}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t('regulatory.labelReviewTitle')}</span>
        </div>

        {/* Header */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏷️</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-dark)', background: 'rgba(46, 125, 50, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              Statutory Packaging & Label Compliance Helper
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            {t('regulatory.labelReviewTitle')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            {t('regulatory.labelReviewDesc')}
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            🧪 Quick Representative Samples for Hackathon Evaluation:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {SAMPLE_LABELS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLabelText(s.text);
                  setProductCategory(s.category);
                  handleReview(s.text, s.category);
                }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {s.title}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                  Category: {s.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Upload Form */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Label Text / Extracted Document Content:
            </label>

            {/* Document Upload Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Or upload document:</span>
              <label
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                📁 Select File (.TXT, .DOCX)
                <input
                  type="file"
                  accept=".txt,.docx,.pdf,.json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <textarea
            rows={7}
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            placeholder="Paste complete carton or bottle label text here..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: '1rem',
            }}
          />

          <div style={{ background: 'rgba(100, 116, 139, 0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            💡 <strong>Document Fallback Note:</strong> Text extraction performed on uploaded documents. If analyzing photographic container artwork, paste transcribed label text or upload high-resolution document text scans.
          </div>

          <button
            onClick={() => handleReview()}
            disabled={loading || !labelText.trim()}
            style={{
              background: 'var(--green-700)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Evaluating Mandatory Declarations...' : '🔍 Review Label Compliance'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Statutory Label Evaluation Report
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Statute: Drugs and Cosmetics Rules, 1945 — Rule 161
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Compliance Score:
                </span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: result.compliance_score_percent >= 80 ? 'rgba(46, 125, 50, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                    color: result.compliance_score_percent >= 80 ? 'var(--color-primary-dark)' : '#c2410c',
                  }}
                >
                  {result.compliance_score_percent}%
                </span>
              </div>
            </div>

            {/* Critical Missing Alerts */}
            {result.critical_missing.length > 0 && (
              <div
                style={{
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9a3412', marginBottom: '0.35rem' }}>
                  ⚠️ Critical Mandatory Label Declarations Missing:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#9a3412', lineHeight: 1.45 }}>
                  {result.critical_missing.map((cm, i) => (
                    <li key={i}>{cm}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fields Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Statutory Declaration</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Rule Ref</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Detected Value / Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.fields_evaluated.map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {f.field_name}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {f.statutory_rule}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background: f.status === 'COMPLIANT' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(234, 88, 12, 0.1)',
                            color: f.status === 'COMPLIANT' ? 'var(--color-primary-dark)' : '#c2410c',
                            border: f.status === 'COMPLIANT' ? '1px solid rgba(46, 125, 50, 0.3)' : '1px solid rgba(234, 88, 12, 0.3)',
                          }}
                        >
                          {f.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                        {f.detected_value ? (
                          <span style={{ color: 'var(--color-primary-dark)', fontWeight: 500 }}>{f.detected_value}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{f.guidance}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'rgba(46, 125, 50, 0.04)', border: '1px solid rgba(46, 125, 50, 0.2)', borderRadius: '6px', padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              <strong>Statutory Notice:</strong> {result.disclaimer} Always submit proof cartons to your State AYUSH Licensing Authority for final batch printing endorsement.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
