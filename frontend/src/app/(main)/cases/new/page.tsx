'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCasesStore, Ingredient, FormulationDNA } from '@/store/cases';
import { useLanguageStore } from '@/store/language';
import { casesApi } from '@/lib/api/cases';

const PRODUCT_CATEGORIES = [
  { id: 'Ayurvedic formulation', labelKey: 'wizard.cat.ayurvedic', icon: '🌿', descKey: 'wizard.cat.ayurvedicDesc' },
  { id: 'Herbal product', labelKey: 'wizard.cat.herbal', icon: '🧪', descKey: 'wizard.cat.herbalDesc' },
  { id: 'Traditional knowledge', labelKey: 'wizard.cat.traditional', icon: '📜', descKey: 'wizard.cat.traditionalDesc' },
  { id: 'Plant / biological resource', labelKey: 'wizard.cat.plant', icon: '🌱', descKey: 'wizard.cat.plantDesc' },
  { id: 'Process / manufacturing method', labelKey: 'wizard.cat.process', icon: '⚙️', descKey: 'wizard.cat.processDesc' },
  { id: 'Brand / product identity', labelKey: 'wizard.cat.brand', icon: '🏷️', descKey: 'wizard.cat.brandDesc' },
];

const PREP_TYPES = [
  { id: 'classical', labelKey: 'wizard.prep.classical', descKey: 'wizard.prep.classicalDesc' },
  { id: 'standardized_extract', labelKey: 'wizard.prep.extract', descKey: 'wizard.prep.extractDesc' },
  { id: 'novel_process', labelKey: 'wizard.prep.novel', descKey: 'wizard.prep.novelDesc' },
];

const CLAIM_TYPES = [
  { id: 'Therapeutic / Medicinal', labelKey: 'wizard.claim.therapeutic' },
  { id: 'Nutritional / Ayurveda-Aahar', labelKey: 'wizard.claim.nutritional' },
  { id: 'Ayurvedic Cosmetic (Saundarya)', labelKey: 'wizard.claim.cosmetic' },
  { id: 'General Wellness / Lifestyle', labelKey: 'wizard.claim.wellness' },
];

const COMMERCIAL_INTENTS = [
  { id: 'Domestic commercial manufacturing in India', labelKey: 'wizard.commercial.domestic', descKey: 'wizard.commercial.domesticDesc' },
  { id: 'Export to International Markets (US/EU/APAC)', labelKey: 'wizard.commercial.export', descKey: 'wizard.commercial.exportDesc' },
  { id: 'R&D and Pre-Clinical Investigation only', labelKey: 'wizard.commercial.rd', descKey: 'wizard.commercial.rdDesc' },
  { id: 'Licensing / Tech Transfer to AYUSH Manufacturer', labelKey: 'wizard.commercial.licensing', descKey: 'wizard.commercial.licensingDesc' },
];

const JURISDICTIONS = [
  { id: 'India', labelKey: 'wizard.jur.india', descKey: 'wizard.jur.indiaDesc' },
  { id: 'US', labelKey: 'wizard.jur.us', descKey: 'wizard.jur.usDesc' },
  { id: 'EU', labelKey: 'wizard.jur.eu', descKey: 'wizard.jur.euDesc' },
  { id: 'International', labelKey: 'wizard.jur.intl', descKey: 'wizard.jur.intlDesc' },
];

const CLASSICAL_TEXTS = [
  'Charaka Samhita',
  'Sushruta Samhita',
  'Ashtanga Hridaya',
  'Bhavaprakasha Samhita',
  'Sarangadhara Samhita',
  'Ayurvedic Formulary of India (AFI)',
  'Ayurvedic Pharmacopoeia of India (API)',
  'Siddha / Unani Formulary',
  'None — Novel / Proprietary Formulation'
];

function NewCaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'Ayurvedic formulation';
  const { addCase } = useCasesStore();
  const { t, language } = useLanguageStore();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Case & Formulation state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productCategory, setProductCategory] = useState(initialCategory);

  useEffect(() => {
    if (initialCategory) {
      setProductCategory(initialCategory);
    }
  }, [initialCategory]);

  const [dosageForm, setDosageForm] = useState('Tablet / Vati');

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: 'ing-1',
      name: 'Ashwagandha',
      botanical_name: 'Withania somnifera',
      sanskrit_name: 'Aśvagandhā',
      part_used: 'Root',
      percentage: 60,
      source_type: 'cultivated',
      origin_state: 'Madhya Pradesh'
    }
  ]);

  // Preparation
  const [preparationMethod, setPreparationMethod] = useState('');
  const [prepType, setPrepType] = useState<'classical' | 'standardized_extract' | 'novel_process'>('standardized_extract');

  // Traditional Basis
  const [selectedTexts, setSelectedTexts] = useState<string[]>(['Charaka Samhita', 'Ayurvedic Formulary of India (AFI)']);
  const [isClassical, setIsClassical] = useState(false);

  // Intended Use
  const [intendedUse, setIntendedUse] = useState('');
  const [claimTypes, setClaimTypes] = useState<string[]>(['Therapeutic / Medicinal']);

  // Commercial Intent
  const [commercialIntent, setCommercialIntent] = useState('Domestic commercial manufacturing in India');

  // Target Jurisdiction
  const [targetJurisdiction, setTargetJurisdiction] = useState<'India' | 'International' | 'EU' | 'US'>('India');

  // Documents
  const [supportingDocs, setSupportingDocs] = useState<string[]>([
    'Certificate of Analysis (Heavy Metals & Microbials)',
    'Classical Text Reference Excerpt'
  ]);
  const [newDocName, setNewDocName] = useState('');

  // Add ingredient helper
  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      {
        id: 'ing-' + Date.now(),
        name: '',
        botanical_name: '',
        sanskrit_name: '',
        part_used: 'Whole Plant',
        percentage: 0,
        source_type: 'cultivated',
      }
    ]);
  };

  const removeIngredientRow = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((i) => i.id !== id));
    }
  };

  const updateIngredientRow = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const toggleText = (text: string) => {
    if (selectedTexts.includes(text)) {
      setSelectedTexts(selectedTexts.filter((t) => t !== text));
    } else {
      setSelectedTexts([...selectedTexts, text]);
    }
  };

  const toggleClaim = (claim: string) => {
    if (claimTypes.includes(claim)) {
      setClaimTypes(claimTypes.filter((c) => c !== claim));
    } else {
      setClaimTypes([...claimTypes, claim]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!title.trim())) {
      alert(t('wizard.validation.titleRequired'));
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Deterministic preliminary rule assessment
    const hasTraditionalHerb = ingredients.some((i) => !!i.botanical_name || !!i.sanskrit_name);
    const usesBioResource = ingredients.some((i) => i.source_type !== 'imported');

    const preliminaryRules = {
      patent_3p_applicable: hasTraditionalHerb,
      patent_3p_note: hasTraditionalHerb
        ? 'Section 3(p) Indian Patents Act applies: Traditional herbal uses cannot be patented as mere aggregations. Technical synergy, novel extraction, or unexpected bio-enhancement data is required.'
        : 'Section 3(p) not immediately triggered based on declared ingredients.',
      abs_nba_required: usesBioResource,
      abs_nba_note: usesBioResource
        ? 'Biological Diversity Act (BDA) 2002: Using biological resources from India triggers mandatory State Biodiversity Board (SBB) intimation or National Biodiversity Authority (NBA) approvals.'
        : 'Imported ingredients generally fall outside domestic NBA prior-approval mandates.',
      regulatory_framework: isClassical
        ? 'Drugs & Cosmetics Act 1940: Classical Ayurvedic Medicine (Schedule 1 First Schedule text compliance)'
        : 'Drugs & Cosmetics Act 1940: Ayurvedic Proprietary Medicine (Rule 158B evidence dossier required)',
      regulatory_note: 'Manufacturing requires State AYUSH Licensing Authority (SALA) GMP certification under Schedule T.',
      fssai_ayurveda_aahar: claimTypes.includes('Nutritional / Ayurveda-Aahar'),
    };

    const formulation: FormulationDNA = {
      product_category: productCategory,
      dosage_form: dosageForm,
      ingredients,
      preparation_method: preparationMethod || 'Standard aqueous-ethanolic percolation followed by vacuum concentration.',
      traditional_basis: selectedTexts,
      is_classical: isClassical,
      intended_use: intendedUse || 'General wellness and constitutional balance support.',
      claims_type: claimTypes,
      commercial_intent: commercialIntent,
      target_jurisdiction: targetJurisdiction,
      supporting_docs: supportingDocs,
      preliminary_rules: preliminaryRules,
    };

    let backendCaseId: string | undefined = undefined;
    try {
      const created = await casesApi.create({
        title: title.trim() || 'Untitled Ayurvedic Case',
        description: description.trim() || `Formulation analysis for ${ingredients.map(i => i.name).filter(Boolean).join(', ')}`,
        jurisdiction: targetJurisdiction,
        language: language || 'en',
      });
      if (created && created.id) {
        backendCaseId = created.id;
      }
    } catch (err) {
      console.warn('Backend case creation note (offline or unauthenticated fallback):', err);
    }

    const newCase = addCase(
      {
        title: title.trim() || 'Untitled Ayurvedic Case',
        description: description.trim() || `Formulation analysis for ${ingredients.map(i => i.name).filter(Boolean).join(', ')}`,
        status: 'active',
        jurisdiction: targetJurisdiction,
        language: language || 'en',
        formulation,
      },
      backendCaseId
    );

    router.push(`/cases/${newCase.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {t('wizard.backToCases')}
          </Link>
        </div>

        {/* Wizard Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)',
              }}
            >
              {t('wizard.guidedSetup')}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {t('wizard.stepProgress', { current: step, total: totalSteps })}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
            {t(`wizard.step${step}.title`)}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            {t(`wizard.step${step}.subtitle`)}
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Dynamic Evidence Gap Detection Banner */}
        {ingredients.some((i) => !i.botanical_name || !i.part_used) && step > 1 && (
          <div
            style={{
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('wizard.gap.title')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('wizard.gap.desc')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                background: '#c2410c',
                color: '#fff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t('wizard.gap.fix')}
            </button>
          </div>
        )}

        {/* Step Container Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '2rem',
          }}
        >

          {/* STEP 1: Product Category & Basic Info */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('wizard.assetTitle')} *
                </label>
                <input
                  type="text"
                  placeholder={t('wizard.assetTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('wizard.assetDesc')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('wizard.assetDescPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {t('wizard.assetNature')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setProductCategory(cat.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: productCategory === cat.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: productCategory === cat.id ? 'rgba(46, 125, 50, 0.05)' : 'var(--bg-base)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{cat.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {t(cat.labelKey)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        {t(cat.descKey)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Ingredients */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {t('wizard.step2.subtitle')}
                </span>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  style={{
                    background: 'rgba(46, 125, 50, 0.1)',
                    color: 'var(--color-primary-dark)',
                    border: '1px solid rgba(46, 125, 50, 0.3)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + {t('wizard.addIngredient')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ingredients.map((ing, idx) => (
                  <div
                    key={ing.id}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {t('wizard.ingIndex', { index: idx + 1 })}
                      </span>
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredientRow(ing.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          {t('wizard.remove')}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {t('wizard.ingName')} *
                        </label>
                        <input
                          type="text"
                          placeholder={t('wizard.ingName')}
                          value={ing.name}
                          onChange={(e) => updateIngredientRow(ing.id, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {t('wizard.botanicalName')}
                        </label>
                        <input
                          type="text"
                          placeholder="Withania somnifera"
                          value={ing.botanical_name || ''}
                          onChange={(e) => updateIngredientRow(ing.id, 'botanical_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                            fontStyle: 'italic',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {t('wizard.plantPart')}
                        </label>
                        <select
                          value={ing.part_used || 'Root'}
                          onChange={(e) => updateIngredientRow(ing.id, 'part_used', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <option value="Root">{t('wizard.partRoot') || 'Root (Mūla)'}</option>
                          <option value="Leaf">{t('wizard.partLeaf') || 'Leaf (Patra)'}</option>
                          <option value="Bark">{t('wizard.partBark') || 'Bark (Tvāk)'}</option>
                          <option value="Whole Plant">{t('wizard.partWhole') || 'Whole Plant (Pañcāṅga)'}</option>
                          <option value="Seed / Fruit">{t('wizard.partSeed') || 'Seed / Fruit (Phala / Bīja)'}</option>
                          <option value="Flower">{t('wizard.partFlower') || 'Flower (Puṣpa)'}</option>
                          <option value="Rhizome">{t('wizard.partRhizome') || 'Rhizome (Kanda)'}</option>
                          <option value="Resin / Gum">{t('wizard.partResin') || 'Resin / Gum (Niryāsa)'}</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {t('wizard.sourcingType')}
                        </label>
                        <select
                          value={ing.source_type}
                          onChange={(e) => updateIngredientRow(ing.id, 'source_type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <option value="cultivated">{t('wizard.sourceCultivated')}</option>
                          <option value="wild_harvested">{t('wizard.sourceWild')}</option>
                          <option value="imported">{t('wizard.sourceImported')}</option>
                          <option value="unknown">{t('wizard.sourceUnknown')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preparation Method */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {t('wizard.prepType')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {PREP_TYPES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrepType(p.id as any)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: prepType === p.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: prepType === p.id ? 'rgba(46, 125, 50, 0.05)' : 'var(--bg-base)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {t(p.labelKey)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        {t(p.descKey)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('wizard.prepNarrative')}
                </label>
                <textarea
                  rows={4}
                  placeholder={t('wizard.prepNarrativePlaceholder')}
                  value={preparationMethod}
                  onChange={(e) => setPreparationMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Traditional Basis */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
                  <input
                    type="checkbox"
                    checked={isClassical}
                    onChange={(e) => setIsClassical(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t('wizard.classicalCitation')}
                  </span>
                </label>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {t('wizard.selectTreatises')}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                  {CLASSICAL_TEXTS.map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => toggleText(txt)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: selectedTexts.includes(txt) ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: selectedTexts.includes(txt) ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-base)',
                        color: selectedTexts.includes(txt) ? 'var(--color-primary-dark)' : 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{txt === 'None — Novel / Proprietary Formulation' ? (t('wizard.classicalNone') || txt) : txt}</span>
                      {selectedTexts.includes(txt) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Intended Use & Claims */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {t('wizard.claimType')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {CLAIM_TYPES.map((claim) => (
                    <button
                      key={claim.id}
                      type="button"
                      onClick={() => toggleClaim(claim.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '8px',
                        border: claimTypes.includes(claim.id) ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: claimTypes.includes(claim.id) ? 'rgba(46, 125, 50, 0.06)' : 'var(--bg-base)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: claimTypes.includes(claim.id) ? 'var(--color-primary-dark)' : 'var(--text-primary)',
                      }}
                    >
                      {t(claim.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('wizard.indicationsLabel')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('wizard.indicationsPlaceholder')}
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Commercial Intent */}
          {step === 6 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {t('wizard.commercialPathway')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {COMMERCIAL_INTENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCommercialIntent(item.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: commercialIntent === item.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      background: commercialIntent === item.id ? 'rgba(46, 125, 50, 0.05)' : 'var(--bg-base)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {t(item.labelKey)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t(item.descKey)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Target Jurisdiction */}
          {step === 7 && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {t('wizard.targetJurisdictionTitle')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {JURISDICTIONS.map((jur) => (
                  <button
                    key={jur.id}
                    type="button"
                    onClick={() => setTargetJurisdiction(jur.id as any)}
                    style={{
                      padding: '1.2rem',
                      borderRadius: '8px',
                      border: targetJurisdiction === jur.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      background: targetJurisdiction === jur.id ? 'rgba(46, 125, 50, 0.06)' : 'var(--bg-base)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      {t(jur.labelKey)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {t(jur.descKey)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Supporting Documents & Review */}
          {step === 8 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('wizard.supportingDocsTitle')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  {supportingDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-base)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span>📄 {doc === 'Certificate of Analysis (Heavy Metals & Microbials)' ? (t('wizard.docCoa') || doc) : doc === 'Classical Text Reference Excerpt' ? (t('wizard.docExcerpt') || doc) : doc}</span>
                      <button
                        type="button"
                        onClick={() => setSupportingDocs(supportingDocs.filter((_, i) => i !== idx))}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={t('wizard.docAddPlaceholder')}
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-base)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDocName.trim()) {
                        setSupportingDocs([...supportingDocs, newDocName.trim()]);
                        setNewDocName('');
                      }
                    }}
                    style={{
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.55rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t('wizard.addDocBtn')}
                  </button>
                </div>
              </div>

              {/* Formulation DNA Summary Card */}
              <div
                style={{
                  background: 'rgba(197, 160, 89, 0.08)',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🧬</span>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#8c6b1f' }}>
                    {t('wizard.dnaReady')}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>{t('common.status')}:</strong> {title || 'Untitled Case'}<br />
                  <strong>{t('cases.formulationCategory')}:</strong> {productCategory}<br />
                  <strong>{t('report.tableIngredients')}:</strong> {ingredients.map(i => i.name).filter(Boolean).join(', ') || 'None specified'}<br />
                  <strong>{t('common.jurisdiction')}:</strong> {targetJurisdiction} • <strong>{t('wizard.commercialScope')}:</strong> {commercialIntent}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {t('wizard.stepPrev')}
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
              }}
            >
              {t('wizard.stepNext', { next: step + 1 })}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                background: 'var(--color-primary-dark)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
              }}
            >
              {t('wizard.stepSaveRoadmap')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading...</div>
      </div>
    }>
      <NewCaseContent />
    </Suspense>
  );
}
