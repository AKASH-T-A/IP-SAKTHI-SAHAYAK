/**
 * IP-SAKTI Sahayak — Deterministic Intelligence & Evidence Engine
 * SIH26045
 * 
 * Implements:
 * 1. Normalized Formulation DNA extraction with explicit missing markers
 * 2. Deterministic statutory rules (Patents Act, D&C Act, BDA 2002, FSSAI)
 * 3. Applicable Regime Engine (APPLICABLE, POTENTIALLY_APPLICABLE, NOT_CURRENTLY_INDICATED)
 * 4. Evidence Gap Detector (WHY IT MATTERS, WHAT TO PROVIDE, WHAT DECISION IT AFFECTS)
 * 5. Prior-Art Intelligence Signals
 * 6. Safe Abstention detector (protects against ungrounded inferences)
 * 7. Interactive Evidence Chain generator (Signature Feature)
 * 8. Intelligence Board statistics
 */

import {
  NormalizedFormulationDNA,
  NormalizedIngredient,
  FullCaseIntelligence,
  CandidateClassification,
  ApplicableRegimeEvaluation,
  EvidenceGap,
  PriorArtSignal,
  IPPathwayEvaluation,
  RegulatoryPathwayEvaluation,
  ABSEvaluation,
  SafeAbstentionState,
  EvidenceChainStep,
  Citation,
} from './types';
import { STATUTORY_CORPUS } from './corpus';
import { FormulationDNA } from '@/store/cases';

// ─── Helper: Create Citation from Corpus ──────────────────────────────────────
export function makeCitation(corpusKey: string, relevanceExplanation: string): Citation {
  const src = STATUTORY_CORPUS[corpusKey];
  if (!src) {
    throw new Error(`Corpus key ${corpusKey} not found in STATUTORY_CORPUS`);
  }
  return {
    sourceId: src.id,
    sourceTitle: src.title,
    authority: src.authority,
    hierarchy: src.hierarchy,
    version: src.version,
    status: src.status,
    relevanceExplanation,
    supportingExcerpt: src.officialExcerpt,
    canonicalUrl: src.canonicalUrl,
  };
}

// ─── 1. Normalizer: Formulation DNA ──────────────────────────────────────────
export function normalizeFormulationDNA(raw: FormulationDNA): NormalizedFormulationDNA {
  const normIngredients: NormalizedIngredient[] = (raw.ingredients || []).map((ing) => {
    const hasName = Boolean(ing.name && ing.name.trim());
    return {
      id: ing.id,
      name: hasName ? ing.name.trim() : 'UNKNOWN',
      botanicalTaxon: ing.botanical_name ? ing.botanical_name.trim() : 'NOT_PROVIDED',
      sanskritName: ing.sanskrit_name ? ing.sanskrit_name.trim() : 'NOT_PROVIDED',
      partUsed: ing.part_used ? ing.part_used.trim() : 'REQUIRES_REVIEW',
      quantityPercentage: typeof ing.percentage === 'number' && ing.percentage > 0 ? ing.percentage : 'NOT_PROVIDED',
      sourceType: (ing.source_type === 'unknown' ? 'UNKNOWN' : ing.source_type || 'UNKNOWN') as any,
      originState: ing.origin_state || 'NOT_PROVIDED',
      hasTraditionalPrecedent: Boolean(ing.sanskrit_name || raw.traditional_basis?.length),
    };
  });

  // Calculate completeness score (0-100)
  let completeness = 0;
  if (normIngredients.length > 0) completeness += 25;
  if (normIngredients.every((i) => i.botanicalTaxon !== 'NOT_PROVIDED')) completeness += 15;
  if (raw.preparation_method && raw.preparation_method.trim()) completeness += 20;
  if (raw.traditional_basis && raw.traditional_basis.length > 0) completeness += 15;
  if (raw.intended_use && raw.intended_use.trim()) completeness += 15;
  if (raw.target_jurisdiction) completeness += 10;

  return {
    assetType: raw.product_category || 'Ayurvedic formulation',
    productCategory: raw.product_category || 'Ayurvedic formulation',
    dosageForm: raw.dosage_form || 'REQUIRES_REVIEW',
    ingredients: normIngredients,
    preparationMethod: raw.preparation_method ? raw.preparation_method.trim() : 'NOT_PROVIDED',
    traditionalBasis: raw.traditional_basis || [],
    isClassical: Boolean(raw.is_classical),
    intendedUse: raw.intended_use ? raw.intended_use.trim() : 'NOT_PROVIDED',
    claimsType: raw.claims_type || ['Therapeutic / Medicinal (AYUSH)'],
    commercialIntent: raw.commercial_intent ? raw.commercial_intent.trim() : 'NOT_PROVIDED',
    targetJurisdiction: raw.target_jurisdiction || 'India',
    biologicalResourcesPresent: normIngredients.some((i) => i.sourceType !== 'imported'),
    supportingDocuments: raw.supporting_docs || [],
    dataCompletenessScore: Math.min(100, completeness),
  };
}

// ─── 2. Safe Abstention Detector ─────────────────────────────────────────────
export function evaluateSafeAbstention(dna: NormalizedFormulationDNA): SafeAbstentionState {
  const missingFields: string[] = [];

  if (dna.ingredients.length === 0 || dna.ingredients.every((i) => i.name === 'UNKNOWN')) {
    missingFields.push('Active Botanical / Herbo-Mineral Ingredients');
  }

  if (dna.intendedUse === 'NOT_PROVIDED' || !dna.intendedUse) {
    missingFields.push('Intended Therapeutic Indication or Functional Claim');
  }

  if (!dna.targetJurisdiction) {
    missingFields.push('Target Regulatory Jurisdiction');
  }

  const hasConflict = dna.isClassical && dna.traditionalBasis.length === 0;
  if (hasConflict) {
    missingFields.push('First Schedule Classical Treatise Reference (required for classical claim)');
  }

  if (missingFields.length > 0) {
    return {
      isAbstained: true,
      triggerCategory: 'MISSING_CRITICAL_INFO',
      reason: 'IP-SAKTI does not have sufficient authoritative evidence to evaluate this case reliably due to missing core formulation parameters.',
      missingFields,
      recommendations: [
        'Provide verified botanical names (Taxon) and plant parts used.',
        'Specify whether formulation is cited in First Schedule classical texts or novel.',
        'Define clear indication boundaries (e.g. D&C Act therapeutic vs FSSAI nutritional).',
      ],
      availableEvidenceFallback: [
        makeCitation('PATENTS_ACT_SEC_3P', 'Section 3(p) applicability requires declared botanical ingredients.'),
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'Licensing determination requires classical text or clinical safety dossier.'),
      ],
    };
  }

  return {
    isAbstained: false,
    missingFields: [],
    recommendations: [],
  };
}

// ─── 3. Deterministic Intelligence Engine ─────────────────────────────────────
export function evaluateCaseIntelligence(caseId: string, raw: FormulationDNA): FullCaseIntelligence {
  const dna = normalizeFormulationDNA(raw);
  const abstention = evaluateSafeAbstention(dna);

  // If abstained, return guarded fallback intelligence
  if (abstention.isAbstained) {
    return {
      caseId,
      evaluatedAt: new Date().toISOString(),
      formulationDNA: dna,
      candidateClassifications: [
        {
          id: 'ABSTAINED_INSUFFICIENT',
          name: 'Classification Withheld (Insufficient Information)',
          confidence: 'INSUFFICIENT_EVIDENCE',
          confidenceRationale: 'Core formulation parameters are missing. IP-SAKTI policy strictly abstains from guessing legal classification.',
          ruleIdentifier: 'RULE_SAFETY_ABSTENTION_CORE_PARAMS',
          triggeredConditions: ['Missing mandatory fields: ' + abstention.missingFields.join(', ')],
          missingInformation: abstention.missingFields,
          evidenceRequirements: ['Complete botanical species disclosure', 'Intended claims classification'],
          citations: abstention.availableEvidenceFallback || [],
        },
      ],
      applicableRegimes: [
        {
          id: 'REGIME_UNKNOWN',
          regimeName: 'Statutory Regime Determination Withheld',
          governingAuthority: 'Multiple Authorities',
          status: 'INSUFFICIENT_INFORMATION',
          whyTriggered: 'Missing core formulation data.',
          evidence: abstention.availableEvidenceFallback || [],
          missingInformation: abstention.missingFields,
          nextAction: 'Provide active ingredients and intended claims.',
        }
      ],
      evidenceGaps: abstention.missingFields.map((field, idx) => ({
        id: `gap-critical-${idx}`,
        title: field,
        whyItMatters: 'Mandatory statutory parameter for determining patentability and drug licensing.',
        whatToProvide: `Enter verified information for ${field} in the case wizard.`,
        decisionAffected: 'Complete statutory classification and IP eligibility.',
        severity: 'CRITICAL',
      })),
      priorArtSignals: [],
      intelligenceBoardStats: {
        strongCount: 0,
        moderateCount: 0,
        gapCount: abstention.missingFields.length,
      },
      ipPathways: [],
      regulatoryPathways: [],
      absEvaluation: {
        triggersNBASection3: false,
        triggersNBASection6: false,
        triggersSBBSection7: false,
        exemptionStatus: 'UNKNOWN',
        headline: 'ABS Determination Withheld',
        statutoryObligations: ['Provide biological sourcing details to evaluate Biological Diversity Act requirements.'],
        citations: [],
      },
      safeAbstention: abstention,
      evidenceChain: [
        {
          stepNumber: 1,
          stageName: 'USER_INPUT',
          title: 'Initial Case Submission',
          description: 'User initiated case setup with incomplete formulation parameters.',
          missingData: abstention.missingFields,
        },
        {
          stepNumber: 2,
          stageName: 'EXPLANATION',
          title: 'Safe Abstention Triggered',
          description: 'IP-SAKTI safeguards prevent hallucinations on incomplete legal data.',
          actionRecommendation: 'Complete the missing formulation parameters in the guided case wizard.',
        },
      ],
      prioritizedNextActions: [
        'Update case formulation with complete botanical species and parts used.',
        'Specify intended claims (Medicinal vs Ayurveda-Aahar food).',
      ],
    };
  }

  // ─── A. Candidate Classification ───────────────────────────────────────────
  const candidateClassifications: CandidateClassification[] = [];
  const claimsTherapeutic = dna.claimsType.some((c) => c.includes('Therapeutic') || c.includes('Medicinal'));
  const claimsDietary = dna.claimsType.some((c) => c.includes('Nutritional') || c.includes('Ayurveda-Aahar'));

  if (claimsTherapeutic) {
    candidateClassifications.push({
      id: dna.isClassical ? 'CLASSICAL_ASU_DRUG' : 'PROPRIETARY_ASU_DRUG',
      name: dna.isClassical
        ? 'Candidate Classical Ayurvedic Medicine (First Schedule)'
        : 'Candidate Ayurvedic Proprietary Medicine (D&C Act Rule 158B)',
      confidence: dna.dataCompletenessScore > 75 ? 'HIGH_EVIDENCE' : 'MODERATE_EVIDENCE',
      confidenceRationale: 'Supported by Drugs & Cosmetics Act 1940 and Rule 158B statutory categories for polyherbal ASU formulations.',
      ruleIdentifier: dna.isClassical ? 'RULE_DC_ACT_SEC_3A_CLASSICAL' : 'RULE_DC_ACT_RULE_158B_PROPRIETARY',
      triggeredConditions: [
        'Asset category: ' + dna.productCategory,
        'Intended therapeutic claims: ' + dna.claimsType.join(', '),
        dna.isClassical ? 'Direct First Schedule text citation' : 'Novel proprietary proportion/extract',
      ],
      missingInformation: dna.supportingDocuments.length === 0 ? ['Certificate of Analysis (Heavy metals, aflatoxins, pesticide residues)'] : [],
      evidenceRequirements: [
        'Proof of manufactured batch testing under Ayurvedic Pharmacopoeia of India limits',
        'Schedule T Good Manufacturing Practices certificate from State AYUSH Licensing Authority',
      ],
      citations: [
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'Statutory requirement for Ayurvedic Proprietary Medicine licensing under State AYUSH Licensing Authority.'),
        makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'Mandatory GMP certification for manufacturing premises.'),
      ],
    });
  }

  if (claimsDietary) {
    candidateClassifications.push({
      id: 'FSSAI_AYURVEDA_AAHAR',
      name: 'Candidate Ayurveda Aahar (FSSAI Nutritional Classification)',
      confidence: 'HIGH_EVIDENCE',
      confidenceRationale: 'Directly supported by FSSAI Ayurveda Aahar Regulations 2022. Food prepared according to classical Ayurvedic recipes.',
      ruleIdentifier: 'RULE_FSSAI_AYURVEDA_AAHAR_REG_3',
      triggeredConditions: ['Declared as Nutritional / Dietary Supplement with classical botanical ingredients'],
      missingInformation: ['FSSAI central food licensing dossier', 'Mandatory packaging advisory statement'],
      evidenceRequirements: [
        'Evidence that recipes conform strictly to classical texts listed in Schedule A',
        'Affirmation that NO therapeutic prevention/cure claims appear on the product label',
      ],
      citations: [
        makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'Regulation 8 strictly prohibits disease prevention or cure claims for Ayurveda Aahar products.'),
      ],
    });
  }

  // ─── B. Applicable Regimes Engine ──────────────────────────────────────────
  const applicableRegimes: ApplicableRegimeEvaluation[] = [
    {
      id: 'REGIME_IP_PATENTS',
      regimeName: 'Intellectual Property: Patents Act, 1970',
      governingAuthority: 'Indian Patent Office (CGPDTM), DPIIT',
      status: dna.ingredients.some(i => i.hasTraditionalPrecedent) ? 'APPLICABLE' : 'POTENTIALLY_APPLICABLE',
      whyTriggered: 'Herbal ingredients and proprietary composition trigger Section 3(p) Traditional Knowledge review.',
      evidence: [
        makeCitation('PATENTS_ACT_SEC_3P', 'Section 3(p) exclusion for traditional knowledge aggregations.'),
        makeCitation('PATENTS_ACT_SEC_10_4', 'Mandatory biological origin disclosure.'),
      ],
      missingInformation: ['In-vitro combination synergy index assay (< 1.0)'],
      nextAction: 'Determine whether to file process/apparatus patent or rely on trade secret + trademark protection.',
    },
    {
      id: 'REGIME_AYUSH_DC_ACT',
      regimeName: 'Drugs & Cosmetics Act, 1940 (AYUSH Regime)',
      governingAuthority: 'Ministry of AYUSH & State Licensing Authorities (SALA)',
      status: claimsTherapeutic ? 'APPLICABLE' : 'POTENTIALLY_APPLICABLE',
      whyTriggered: 'Therapeutic and medicinal claims trigger mandatory State AYUSH Licensing under Rule 158B.',
      evidence: [
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'Statutory licensing pathway for proprietary ASU medicines.'),
        makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'Schedule T Good Manufacturing Practices requirement.'),
      ],
      missingInformation: ['Schedule T GMP manufacturing premise validation'],
      nextAction: 'Compile manufacturing batch records and submit Rule 158B dossier to State AYUSH Licensing Authority.',
    },
    {
      id: 'REGIME_BIODIVERSITY_ABS',
      regimeName: 'Biological Diversity Act, 2002 (ABS Regime)',
      governingAuthority: 'National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)',
      status: dna.biologicalResourcesPresent ? 'APPLICABLE' : 'NOT_CURRENTLY_INDICATED',
      whyTriggered: 'Commercial utilization of Indian biological flora triggers Section 7 SBB intimation and Section 6 NBA patent clearance.',
      evidence: [
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'Prior intimation to SBB by Indian commercial entities.'),
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'NBA approval prior to grant of patent based on biological resources.'),
      ],
      missingInformation: ['Cultivation vs forest harvesting origin certificates'],
      nextAction: 'File Form I with the State Biodiversity Board and secure supply chain sourcing traceability.',
    },
  ];

  if (claimsDietary) {
    applicableRegimes.push({
      id: 'REGIME_FSSAI_AAHAR',
      regimeName: 'FSSAI Ayurveda Aahar Regulations, 2022',
      governingAuthority: 'Food Safety and Standards Authority of India (FSSAI)',
      status: 'APPLICABLE',
      whyTriggered: 'Nutritional and dietary wellness claims governed under joint FSSAI-AYUSH Ayurveda Aahar framework.',
      evidence: [
        makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'Prohibition of disease claims and mandatory logo placement.'),
      ],
      missingInformation: ['FoSCoS Category 13 endorsement application'],
      nextAction: 'Verify recipe against Schedule A classical formulations and audit label for cure claim omissions.',
    });
  }

  // ─── C. Evidence Gap Detector ──────────────────────────────────────────────
  const evidenceGaps: EvidenceGap[] = [];

  const missingProportions = dna.ingredients.some(i => i.quantityPercentage === 'NOT_PROVIDED');
  if (missingProportions) {
    evidenceGaps.push({
      id: 'gap-proportions',
      title: 'Exact Quantitative Herb Proportions Missing',
      whyItMatters: 'Section 3(e) of Patents Act and Rule 158B require exact ratios to assess synergistic technical effect versus arbitrary aggregation.',
      whatToProvide: 'Specific weight percentages (w/w) or milligram concentrations per unit dosage.',
      decisionAffected: 'Patent synergy validation and AYUSH batch standardization approval.',
      severity: 'CRITICAL',
    });
  }

  const missingOrigin = dna.ingredients.some(i => i.originState === 'NOT_PROVIDED');
  if (missingOrigin) {
    evidenceGaps.push({
      id: 'gap-origin',
      title: 'Specific Geographical Harvesting Origin Not Specified',
      whyItMatters: 'Section 10(4)(ii)(D) of Patents Act mandates geographic origin disclosure. BDA 2002 requires geographic location to route to proper SBB.',
      whatToProvide: 'Harvesting state/district or certified domestic cultivation source address.',
      decisionAffected: 'Patent specification completeness and NBA Form III approval.',
      severity: 'RECOMMENDED',
    });
  }

  if (dna.supportingDocuments.length === 0) {
    evidenceGaps.push({
      id: 'gap-coa',
      title: 'Certificate of Analysis (Heavy Metals & Microbials) Not Uploaded',
      whyItMatters: 'Ayurvedic Pharmacopoeia of India limits for Lead (<10 ppm), Arsenic (<3 ppm), and microbials must be verified before licensing.',
      whatToProvide: 'Independent NABL-accredited laboratory test report for finished formulation.',
      decisionAffected: 'State AYUSH Licensing Authority manufacturing license grant.',
      severity: 'CRITICAL',
    });
  }

  if (!dna.isClassical && dna.traditionalBasis.length === 0) {
    evidenceGaps.push({
      id: 'gap-classical-basis',
      title: 'Classical Literature Grounding Citation Not Provided',
      whyItMatters: 'Rule 158B Category A licensing requires published classical text citations to dispense with prolonged multi-phase clinical trials.',
      whatToProvide: 'Sloka number and chapter citation from one of 54 First Schedule recognized classical treatises.',
      decisionAffected: 'Eligibility for accelerated proprietary drug licensing without full phase III clinical trials.',
      severity: 'RECOMMENDED',
    });
  }

  // ─── D. Prior-Art Intelligence Signals ─────────────────────────────────────
  const priorArtSignals: PriorArtSignal[] = [
    {
      id: 'sig-tkdl-1',
      concept: 'Traditional Polyherbal Rasayana Synergies',
      similarityNature: 'Similar botanical combinations documented in classical treatises (e.g. Charaka Samhita Chikitsa Sthana).',
      sourceReference: 'TKDL Monograph & First Schedule Ayurvedic Formulary of India (AFI)',
      guidance: 'Traditional combination is public prior-art. Direct formulation cannot be patented per se. Focus IP claims on novel extraction apparatus or unexpected synergistic technical ratios.',
    },
    {
      id: 'sig-ipc-a61k',
      concept: 'IPC A61K 36/00 — Botanical Medicinal Preparations',
      similarityNature: 'International patent classes densely populated with Withania and Bacopa extract patents.',
      sourceReference: 'WIPO PATENTSCOPE & Indian Patent Office Gazettes',
      guidance: 'Conduct an exact boolean search for your specific extraction solvent ratios to ensure no pre-existing PCT filings anticipate your concentration parameters.',
    },
  ];

  // ─── E. IP Pathway Evaluation ──────────────────────────────────────────────
  const ipPathways: IPPathwayEvaluation[] = [];
  const hasKnownHerb = dna.ingredients.some((i) => i.hasTraditionalPrecedent);

  ipPathways.push({
    pathwayName: 'Patent Strategy (Indian Patent Office / PCT)',
    category: 'Patent',
    applicabilityStatus: hasKnownHerb ? 'RESTRICTED_BAR' : 'POTENTIALLY_APPLICABLE',
    headline: hasKnownHerb
      ? 'Section 3(p) Traditional Knowledge Bar Applies: Direct Formulation Not Patentable Per Se'
      : 'Patent Pathway Open: Requires Prior-Art Novelty Assessment',
    statutoryRequirements: [
      'Must overcome Section 3(p): Cannot be an aggregation or duplication of known traditional properties.',
      'Must demonstrate unexpected synergistic technical effect (e.g. combination index < 1.0) with comparative data.',
      'Must overcome Section 3(e): Polyherbal mixture must exhibit synergy beyond mere additive effect.',
      'Must satisfy Section 10(4)(ii)(D): Disclose exact geographical origin of all Indian biological materials.',
    ],
    evidenceNeeded: [
      'In-vitro or in-vivo synergistic index assay data comparing individual herbs vs combination',
      'HPLC / LC-MS chromatogram fingerprints proving reproducible batch standardisation',
      'Form III approval from National Biodiversity Authority prior to patent grant (Section 6 BDA 2002)',
    ],
    cautiousNextAction: 'Conduct preliminary prior-art search across TKDL and IPO gazettes. If seeking IP, focus claims on novel extraction apparatus, specific fraction synergistic ratios, or novel delivery carriers rather than raw herbal combinations.',
    statutoryCaveat: 'The Indian Patent Office routinely rejects polyherbal formulations citing classical treatise records under Section 3(p). Patents are only granted where inventive technical synergy is robustly proven.',
    citations: [
      makeCitation('PATENTS_ACT_SEC_3P', 'Statutory exclusion of traditional knowledge and aggregations of known properties.'),
      makeCitation('PATENTS_ACT_SEC_3E', 'Exclusion of mere admixtures producing only additive effects.'),
      makeCitation('PATENTS_ACT_SEC_10_4', 'Mandatory geographical origin disclosure for biological materials.'),
    ],
  });

  ipPathways.push({
    pathwayName: 'Brand & Commercial Identity (Trade Marks Act, 1999)',
    category: 'Trademark',
    applicabilityStatus: 'POTENTIALLY_APPLICABLE',
    headline: 'Trademark Protection Available in Class 5 (ASU Medicines) & Class 3 (Cosmetics)',
    statutoryRequirements: [
      'Trade mark must NOT be descriptive of generic Ayurvedic ingredients (Section 9(1)(b)).',
      'Generic Sanskrit/Hindi botanical terms (e.g. "Ashwagandha", "Kwath") cannot be monopolized.',
      'Mark must be distinctive, coined, or arbitrary.',
    ],
    evidenceNeeded: ['Search report from Trade Marks Registry database confirming no confusingly similar prior marks in Class 5'],
    cautiousNextAction: 'File word mark and distinctive device logo in Nice Classification Class 5. Avoid purely descriptive botanical names.',
    statutoryCaveat: 'Registration does not grant exclusive rights to generic plant names used in the formula.',
    citations: [
      makeCitation('TRADEMARKS_ACT_SEC_9', 'Section 9(1)(b) prohibits registration of purely descriptive product designations.'),
    ],
  });

  const hasRegionalFlora = dna.ingredients.some((i) => i.originState !== 'NOT_PROVIDED' && i.originState !== 'UNKNOWN');
  if (hasRegionalFlora) {
    ipPathways.push({
      pathwayName: 'Geographical Indication (GI Act, 1999)',
      category: 'GI',
      applicabilityStatus: 'POTENTIALLY_APPLICABLE',
      headline: 'Potential GI Origin Linkage for Regional Biological Flora',
      statutoryRequirements: [
        'Biological materials sourced from registered GI zones (e.g. Malabar Pepper, Alleppey Cardamom).',
        'Commercial entity may apply as an Authorized User under Section 8 of the GI Act.',
      ],
      evidenceNeeded: ['Traceability certificates proving harvesting origin from designated GI geographic boundary'],
      cautiousNextAction: 'Verify whether specific herbs have GI registrations and apply for Authorized User certification to enhance export brand value.',
      statutoryCaveat: 'GI is a collective community right; individual commercial entities cannot monopolize a geographic indicator as private property.',
      citations: [
        makeCitation('GI_ACT_SEC_2E', 'Definition of geographical indication for natural and agricultural goods.'),
      ],
    });
  }

  // 4. Copyright (Packaging Artwork & Literary Text)
  ipPathways.push({
    pathwayName: 'Artistic Packaging & Literary Copyright (Copyright Act, 1957)',
    category: 'Copyright',
    applicabilityStatus: 'POTENTIALLY_APPLICABLE',
    headline: 'Copyright Protection for Original Carton Artwork, Illustrations & Formulation Dossiers',
    statutoryRequirements: [
      'Original artistic layout of cartons, labels, and package inserts.',
      'Mandatory Section 45 search certificate from Trade Marks Registry for commercial artistic works.',
      'Excludes underlying botanical recipes or functional manufacturing steps.'
    ],
    evidenceNeeded: ['Original vector design artwork with signed designer NOC assignment deeds'],
    cautiousNextAction: 'Register copyright on package artwork and consumer brochures with the Copyright Office.',
    statutoryCaveat: 'Copyright protects only the specific artistic expression and text, not the herbal recipe or manufacturing method.',
    citations: [
      makeCitation('DC_RULES_161_LABELLING', 'Statutory requirement for packaging labels and declarations.'),
    ],
  });

  // 5. Industrial Design (Bottle & Blister Packaging)
  ipPathways.push({
    pathwayName: 'Industrial Design Protection (Designs Act, 2000)',
    category: 'Industrial Design',
    applicabilityStatus: 'POTENTIALLY_APPLICABLE',
    headline: 'Visual Shape & Configuration Registration for Containers, Dispensers & Blisters',
    statutoryRequirements: [
      'Novel, non-functional outer bottle, dropper, or container shape.',
      'Design must not have been previously disclosed or sold anywhere in India or abroad.',
      'Does not protect functional or therapeutic utility.'
    ],
    evidenceNeeded: ['Six-perspective engineering drawings or photographs of novel bottle/container packaging'],
    cautiousNextAction: 'File industrial design application with the Design Wing, Indian Patent Office, Kolkata prior to public release.',
    statutoryCaveat: 'Functional mechanisms or medicinal efficacy cannot be registered as an industrial design.',
    citations: [
      makeCitation('DC_RULES_161_LABELLING', 'Container packaging specifications under ASU drug rules.'),
    ],
  });

  // 6. Plant Variety Protection (PPV&FR Act, 2001)
  ipPathways.push({
    pathwayName: 'Plant Variety Protection (PPV&FR Act, 2001)',
    category: 'Plant Variety Protection',
    applicabilityStatus: 'POTENTIALLY_APPLICABLE',
    headline: 'Breeder & Cultivar Rights for Novel or Distinct Medicinal Plants',
    statutoryRequirements: [
      'Applicable if proprietary cultivated varieties of medicinal plants are bred.',
      'Must satisfy Distinctiveness, Uniformity, and Stability (DUS) criteria per Section 15.',
      'Farmers traditional rights safeguarded under Section 39.'
    ],
    evidenceNeeded: ['DUS test field trial results and certified botanical lineage from PPV&FR accredited testing centre'],
    cautiousNextAction: 'If new medicinal plant varieties are cultivated, apply for variety registration with the PPV&FR Authority.',
    statutoryCaveat: 'Wild forest-harvested biological varieties cannot be privately monopolized as new plant varieties.',
    citations: [
      makeCitation('PPVFR_ACT_SEC_15', 'Novelty, distinctiveness, uniformity, and stability criteria for plant registration.'),
    ],
  });

  // 7. Biological Diversity / ABS Clearance
  if (dna.biologicalResourcesPresent) {
    ipPathways.push({
      pathwayName: 'Access & Benefit Sharing Clearance (BDA 2002 § 6 & § 7)',
      category: 'Biological Diversity / ABS',
      applicabilityStatus: 'APPLICABLE',
      headline: 'Statutory NBA Approval & SBB Prior Intimation for Commercial Biological Flora',
      statutoryRequirements: [
        'Form I prior intimation to State Biodiversity Board for commercial sourcing.',
        'Form III clearance from National Biodiversity Authority prior to grant of any patent.',
        'Payment of benefit-sharing levy (0.1% to 0.5% ex-factory sales).'
      ],
      evidenceNeeded: ['Supply chain invoice trail proving legal domestic procurement channels and origin'],
      cautiousNextAction: 'Submit Form I to the respective State Biodiversity Board and file NBA Form III before patent sealing.',
      statutoryCaveat: 'Failure to notify SBB or obtain NBA clearance invalidates patent grants and incurs statutory penalties under BDA 2002.',
      citations: [
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'Mandatory NBA approval prior to grant of patent based on biological resources.'),
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'Prior intimation to SBB by Indian commercial entities.'),
      ],
    });
  }

  // 8. Traditional Knowledge (Defensive Protection)
  if (hasKnownHerb) {
    ipPathways.push({
      pathwayName: 'Defensive Traditional Knowledge Protection (TKDL / Treaty)',
      category: 'Traditional Knowledge',
      applicabilityStatus: 'APPLICABLE',
      headline: 'Defensive Protection Grounded in Public Classical Treatises & WIPO GRATK Treaty',
      statutoryRequirements: [
        'Public treatise references (Charaka, Sushruta, AFI) establish non-patentable public domain.',
        'Mandatory disclosure of biological resource and associated traditional knowledge under WIPO GRATK Treaty 2024.',
        'Shields against third-party misappropriation and unlawful biopiracy.'
      ],
      evidenceNeeded: ['Verified sloka references and AFI/API monograph numbers confirming classical provenance'],
      cautiousNextAction: 'Cite authoritative First Schedule texts in commercial filings to establish prior-art and defeat biopiracy attempts.',
      statutoryCaveat: 'Classical Ayurvedic recipes cannot be privatized; commercial monopoly is restricted to coined brands and novel delivery platforms.',
      citations: [
        makeCitation('PATENTS_ACT_SEC_3P', 'Section 3(p) exclusion for traditional knowledge aggregations.'),
      ],
    });
  }

  // 9. Prior-Art Intelligence
  ipPathways.push({
    pathwayName: 'Prior-Art & Freedom-to-Operate Intelligence',
    category: 'Prior-Art Intelligence',
    applicabilityStatus: 'POTENTIALLY_APPLICABLE',
    headline: 'Patent Landscape & Non-Patent Literature Clearance (FTO)',
    statutoryRequirements: [
      'Comprehensive clearance across IPC Class A61K 36/00 (Medicinal botanical preparations).',
      'Evaluation of active competitor patents covering delivery systems, extraction solvents, or micro-encapsulation.',
      'Non-patent literature search in Ayurvedic Pharmacopoeia and scientific journals.'
    ],
    evidenceNeeded: ['Full boolean patent clearance search across Indian, WIPO, and USPTO databases'],
    cautiousNextAction: 'Commission professional FTO landscape search before final formulation freeze and manufacturing line tooling.',
    statutoryCaveat: 'FTO clearance reduces infringement risk but does not guarantee immunity from competitor litigation.',
    citations: [
      makeCitation('PATENTS_ACT_SEC_3E', 'Exclusion of mere admixtures and aggregation of known properties.'),
    ],
  });

  // ─── F. Regulatory Pathway Evaluation ──────────────────────────────────────
  const regulatoryPathways: RegulatoryPathwayEvaluation[] = [];

  regulatoryPathways.push({
    frameworkName: 'Drugs & Cosmetics Act, 1940 — AYUSH Regulatory Regime',
    regulatoryBody: 'State AYUSH Licensing Authority (SALA) & Ministry of AYUSH',
    applicabilityStatus: claimsTherapeutic ? 'MANDATORY_COMPLIANCE' : 'POTENTIALLY_APPLICABLE',
    headline: dna.isClassical
      ? 'Classical Medicine Licensing: Textual Citation Compliance'
      : 'Ayurvedic Proprietary Medicine: Rule 158B Evidence Dossier Required',
    licensingDossierRequirements: [
      dna.isClassical
        ? 'Submission of First Schedule treatise reference indicating verbatim recipe and dosage'
        : 'Rule 158B Category A/B submission: Published textual literature citations or pilot safety/efficacy trials',
      'Batch manufacturing records and formulation qualitative-quantitative breakdown',
      'Stability data and heavy metal / microbial testing compliance with API standards',
    ],
    qualityTestingChecklist: [
      'Heavy metals limits: Lead (<10 ppm), Arsenic (<3 ppm), Cadmium (<0.3 ppm), Mercury (<1 ppm)',
      'Total microbial plate count (<10^5 CFU/g), Yeast and mold (<10^3 CFU/g), Pathogen absence (E. coli, Salmonella)',
      'Aflatoxins B1, B2, G1, G2 within Pharmacopoeial limits',
    ],
    nextReviewStep: 'Compile Rule 158B technical dossier and submit application to the State AYUSH Licensing Authority of the manufacturing state.',
    citations: [
      makeCitation('DRUGS_COSMETICS_RULE_158B', 'Statutory rule governing licensing requirements for Ayurvedic proprietary medicines.'),
      makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'Statutory requirement for Schedule T Good Manufacturing Practices.'),
    ],
  });

  if (claimsDietary) {
    regulatoryPathways.push({
      frameworkName: 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022',
      regulatoryBody: 'Food Safety and Standards Authority of India (FSSAI)',
      applicabilityStatus: 'MANDATORY_COMPLIANCE',
      headline: 'FSSAI Central / State Food License with Ayurveda Aahar Endorsement',
      licensingDossierRequirements: [
        'FoSCoS portal application under Category 13 (Ayurveda Aahar)',
        'Mandatory labeling review: Absolute prohibition of disease cure claims',
        'Official Ayurveda Aahar logo placement and cautionary advisory statements',
      ],
      qualityTestingChecklist: [
        'Pesticide residues and heavy metals compliant with FSS (Contaminants, Toxins and Residues) Regulations',
        'Absence of synthetic active vitamins, minerals, or steroids',
      ],
      nextReviewStep: 'Submit formula to the FSSAI Special Expert Committee on Ayurveda Aahar via the FoSCoS portal.',
      citations: [
        makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'Mandatory compliance with Regulation 8 packaging and disease claim prohibition.'),
      ],
    });
  }

  // ─── G. Biological Diversity Act (ABS) Evaluation ──────────────────────────
  const isWildOrCultivatedIndia = dna.ingredients.some((i) => i.sourceType === 'wild_harvested' || i.sourceType === 'cultivated');
  const isCommercial = Boolean(dna.commercialIntent && !dna.commercialIntent.toLowerCase().includes('academic'));
  const triggersSBB = isWildOrCultivatedIndia && isCommercial && dna.targetJurisdiction === 'India';

  const absEvaluation: ABSEvaluation = {
    triggersNBASection3: false,
    triggersNBASection6: true,
    triggersSBBSection7: triggersSBB,
    exemptionStatus: dna.ingredients.every((i) => i.sourceType === 'cultivated')
      ? 'Cultivated resources may qualify for reduced SBB benefit-sharing rates; commercial manufacturing remains subject to prior intimation.'
      : 'Wild harvested forest flora triggers mandatory SBB prior intimation and benefit-sharing fee schedules.',
    headline: triggersSBB
      ? 'Mandatory State Biodiversity Board (SBB) Prior Intimation under Section 7'
      : 'Potential SBB/NBA Access and Benefit Sharing Review Required',
    statutoryObligations: [
      'File Form I prior intimation with the concerned State Biodiversity Board where herbs are obtained.',
      'If filing a patent in India or overseas, submit Form III to the National Biodiversity Authority (NBA) under Section 6 before grant.',
      'Maintain verifiable supply chain invoices and cultivation trace certificates to claim fair benefit-sharing rates (0.1% - 0.5% ex-factory value).',
    ],
    citations: [
      makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'Mandatory prior intimation to SBB by Indian commercial entities.'),
      makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'Mandatory NBA approval prior to intellectual property grant based on Indian bio-resources.'),
    ],
  };

  // ─── H. Interactive Evidence Chain (Signature Feature) ─────────────────────
  const evidenceChain: EvidenceChainStep[] = [
    {
      stepNumber: 1,
      stageName: 'USER_INPUT',
      title: 'Formulation Asset Parameters',
      description: `Asset: ${dna.productCategory}. Ingredients: ${dna.ingredients.map(i => i.name).join(', ')}. Target: ${dna.targetJurisdiction}.`,
      facts: [
        `Asset category: ${dna.productCategory}`,
        `Ingredients count: ${dna.ingredients.length}`,
        `Declared use: ${dna.intendedUse}`,
        `Jurisdiction: ${dna.targetJurisdiction}`,
      ],
    },
    {
      stepNumber: 2,
      stageName: 'FACTS_DETECTED',
      title: 'Fact Extraction & Normalization',
      description: 'Extracted botanical taxons, biological sourcing, and traditional grounding.',
      facts: dna.ingredients.map((i) => `🌿 ${i.name} (${i.botanicalTaxon}) — Sourced: ${i.sourceType}`),
    },
    {
      stepNumber: 3,
      stageName: 'CANDIDATE_CLASSIFICATION',
      title: 'Deterministic Rule Classification',
      description: candidateClassifications.map(c => c.name).join(' | '),
      ruleTriggered: candidateClassifications[0]?.ruleIdentifier,
      facts: candidateClassifications[0]?.triggeredConditions,
    },
    {
      stepNumber: 4,
      stageName: 'APPLICABLE_PATHWAY',
      title: 'Statutory Pathway Mapping',
      description: `Mapped to IP Patent Sec 3(p), D&C Act Rule 158B, and BDA Section 7 SBB intimation.`,
      actionRecommendation: 'Follow concurrent IP and AYUSH licensing roadmap.',
    },
    {
      stepNumber: 5,
      stageName: 'EVIDENCE_RETRIEVAL',
      title: 'Authoritative Evidence Linkage',
      description: 'Retrieved active statutory provisions from The Patents Act 1970 and Drugs & Cosmetics Rules 1945.',
      citation: makeCitation('PATENTS_ACT_SEC_3P', 'Direct statutory bar for traditional knowledge polyherbal formulations.'),
    },
    {
      stepNumber: 6,
      stageName: 'EXPLANATION',
      title: 'Objective Statutory Explanation',
      description: 'Traditional herbal ingredients cannot be patented as simple aggregations. However, trade mark protection is open, and AYUSH proprietary licensing is available under Rule 158B.',
      citation: makeCitation('DRUGS_COSMETICS_RULE_158B', 'Licensing route for proprietary medicines with classical components.'),
    },
    {
      stepNumber: 7,
      stageName: 'ACTION',
      title: 'Cautious Next Actions',
      description: 'Follow the 5-step prioritized legal and regulatory verification sequence.',
      actionRecommendation: '1. File SBB Form I intimation -> 2. Initiate Rule 158B testing dossier -> 3. Evaluate trademark in Class 5.',
    },
  ];

  // ─── I. Prioritized Next Actions ───────────────────────────────────────────
  const prioritizedNextActions: string[] = [
    '1. File Form I Prior Intimation with the State Biodiversity Board (SBB) for commercial utilization of biological resources under Section 7 of the BDA 2002.',
    '2. Standardize batch manufacturing records and verify raw materials against Ayurvedic Pharmacopoeia of India (API) heavy metal, microbial, and pesticide limits.',
    dna.isClassical
      ? '3. Secure classical First Schedule textual excerpt citations for State AYUSH Licensing Authority submission.'
      : '3. Prepare Rule 158B safety and efficacy pilot data dossier for Ayurvedic Proprietary Medicine licensing.',
    '4. If seeking patent protection, commission experimental combination synergy testing (isobologram analysis) to substantiate inventive step beyond Section 3(p).',
    '5. Apply for trademark registration in Class 5 (herbal medicines) for a distinctive coined brand name before public launch.',
  ];

  // Intelligence Board Stats
  const allCitations = [
    ...candidateClassifications.flatMap(c => c.citations),
    ...ipPathways.flatMap(ip => ip.citations),
    ...regulatoryPathways.flatMap(r => r.citations),
    ...absEvaluation.citations,
  ];
  const uniqueCitations = Array.from(new Set(allCitations.map(c => c.sourceId)));

  return {
    caseId,
    evaluatedAt: new Date().toISOString(),
    formulationDNA: dna,
    candidateClassifications,
    applicableRegimes,
    evidenceGaps,
    priorArtSignals,
    intelligenceBoardStats: {
      strongCount: uniqueCitations.length,
      moderateCount: priorArtSignals.length,
      gapCount: evidenceGaps.length,
    },
    ipPathways,
    regulatoryPathways,
    absEvaluation,
    safeAbstention: abstention,
    evidenceChain,
    prioritizedNextActions,
  };
}
