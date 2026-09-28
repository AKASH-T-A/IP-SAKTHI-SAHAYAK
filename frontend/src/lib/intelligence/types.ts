/**
 * IP-SAKTI Sahayak — Phase 3 Intelligence & Evidence Engine Types
 * SIH26045
 * 
 * Strict types for Formulation DNA, Deterministic Rules, Evidence Corpus,
 * Citations, Evidence Chains, Safe Abstention, Evidence Gaps, Intelligence Board,
 * and Case-Aware Structured Assistant.
 */

// ─── 1. Missing Information Markers ──────────────────────────────────────────
export type MissingMarker = 'UNKNOWN' | 'NOT_PROVIDED' | 'REQUIRES_REVIEW';

// ─── 2. Evidence Strength (No Fake Percentages) ───────────────────────────────
export type EvidenceStrength =
  | 'HIGH_EVIDENCE'       // Supported directly by active official statutory text or Gazette notification
  | 'MODERATE_EVIDENCE'   // Supported by official guidelines/pharmacopoeial monograph with minor interpretation needed
  | 'LIMITED_EVIDENCE'    // Relevant source identified, but applicability depends on missing formulation info
  | 'INSUFFICIENT_EVIDENCE'; // No verified authoritative source directly covers the parameter

// ─── 3. Evidence Corpus Model ────────────────────────────────────────────────
export type SourceStatus = 'ACTIVE' | 'SUPERSEDED' | 'REPEALED' | 'DRAFT' | 'UNKNOWN';

export interface LegalHierarchy {
  act: string;
  chapter?: string;
  section: string;
  subsection?: string;
  clause?: string;
  subclause?: string;
}

export interface EvidenceSource {
  id: string;
  title: string;
  shortTitle: string;
  authority: string;             // e.g. "Indian Patent Office (CGPDTM)", "Ministry of AYUSH", "National Biodiversity Authority"
  sourceType: 'ACT' | 'RULES' | 'REGULATION' | 'PHARMACOPOEIA' | 'GAZETTE_NOTIFICATION' | 'GUIDELINES' | 'INTERNATIONAL_TREATY';
  jurisdiction: 'India' | 'International' | 'EU' | 'US';
  hierarchy: LegalHierarchy;
  publicationDate: string;        // YYYY-MM-DD
  effectiveDate: string;          // YYYY-MM-DD
  version: string;
  status: SourceStatus;
  canonicalUrl: string;          // Link to India Code, Gazette, official repository
  contentHash: string;           // SHA-256 for integrity validation
  retrievedDate: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DISPUTED';
  officialExcerpt: string;       // Exact verbatim text from statute
  plainSummary: string;          // Objective synthesis
  caveatNotes?: string;
}

// ─── 3.1 Source Version Model (Regulatory Time Machine) ──────────────────────
export interface VersionDiffClause {
  clauseId: string;
  type: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  originalText?: string;
  updatedText?: string;
  analysisNote: string;
}

export interface SourceVersionRecord {
  id: string;
  sourceId: string;
  sourceTitle: string;
  authority: string;
  versionNumber: string;
  versionLabel: string;
  publicationDate: string;
  effectiveDate: string;
  status: SourceStatus;
  gazetteReference: string;
  summaryOfChanges: string;
  officialUrl: string;
  hashSha256: string;
  diffClauses: VersionDiffClause[];
}

// ─── 4. Citation Model ───────────────────────────────────────────────────────
export interface Citation {
  sourceId: string;
  sourceTitle: string;
  authority: string;
  hierarchy: LegalHierarchy;
  version: string;
  status: SourceStatus;
  relevanceExplanation: string;
  supportingExcerpt: string;
  canonicalUrl: string;
}

// ─── 5. Evidence Chain Node (Signature Feature) ──────────────────────────────
export interface EvidenceChainStep {
  stepNumber: number;
  stageName: 'USER_INPUT' | 'FACTS_DETECTED' | 'CANDIDATE_CLASSIFICATION' | 'APPLICABLE_PATHWAY' | 'EVIDENCE_RETRIEVAL' | 'EXPLANATION' | 'ACTION';
  title: string;
  description: string;
  facts?: string[];
  ruleTriggered?: string;
  citation?: Citation;
  missingData?: string[];
  actionRecommendation?: string;
}

// ─── 6. Safe Abstention State ────────────────────────────────────────────────
export interface SafeAbstentionState {
  isAbstained: boolean;
  reason?: string;
  triggerCategory?: 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_SOURCES' | 'UNSUPPORTED_JURISDICTION' | 'MISSING_CRITICAL_INFO' | 'OUTDATED_SOURCE';
  missingFields: string[];
  recommendations: string[];
  availableEvidenceFallback?: Citation[];
}

// ─── 7. Normalized Formulation DNA ───────────────────────────────────────────
export interface NormalizedIngredient {
  id: string;
  name: string;
  botanicalTaxon?: string | MissingMarker;
  sanskritName?: string | MissingMarker;
  partUsed?: string | MissingMarker;
  quantityPercentage?: number | MissingMarker;
  sourceType: 'cultivated' | 'wild_harvested' | 'imported' | MissingMarker;
  originState?: string | MissingMarker;
  hasTraditionalPrecedent: boolean;
}

export interface NormalizedFormulationDNA {
  assetType: string;
  productCategory: string;
  dosageForm: string | MissingMarker;
  ingredients: NormalizedIngredient[];
  preparationMethod: string | MissingMarker;
  extractionSolvent?: string | MissingMarker;
  traditionalBasis: string[];
  isClassical: boolean;
  intendedUse: string | MissingMarker;
  claimsType: string[];
  commercialIntent: string | MissingMarker;
  targetJurisdiction: 'India' | 'International' | 'EU' | 'US';
  biologicalResourcesPresent: boolean;
  supportingDocuments: string[];
  dataCompletenessScore: number; // 0 to 100 based on presence of key fields
}

// ─── 8. Applicable Regime Engine ─────────────────────────────────────────────
export type RegimeStatus =
  | 'APPLICABLE'
  | 'POTENTIALLY_APPLICABLE'
  | 'NOT_CURRENTLY_INDICATED'
  | 'INSUFFICIENT_INFORMATION';

export interface ApplicableRegimeEvaluation {
  id: string;
  regimeName: string;
  governingAuthority: string;
  status: RegimeStatus;
  whyTriggered: string;
  evidence: Citation[];
  missingInformation: string[];
  nextAction: string;
}

// ─── 9. Evidence Gap Detector ────────────────────────────────────────────────
export interface EvidenceGap {
  id: string;
  title: string;
  whyItMatters: string;
  whatToProvide: string;
  decisionAffected: string;
  severity: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
}

// ─── 10. "Why am I seeing this?" Model ───────────────────────────────────────
export interface WhySeeingThisData {
  title: string;
  factsDetected: string[];
  ruleTriggered: string;
  evidenceRetrieved: Citation[];
  missingInformation: string[];
  resultSummary: string;
}

// ─── 11. Prior-Art Intelligence Signal ───────────────────────────────────────
export interface PriorArtSignal {
  id: string;
  concept: string;
  similarityNature: string;
  sourceReference: string;
  guidance: string;
}

// ─── 12. Deterministic Classification & Pathways ─────────────────────────────
export interface CandidateClassification {
  id: string;
  name: string;
  confidence: EvidenceStrength;
  confidenceRationale: string;
  ruleIdentifier: string;
  triggeredConditions: string[];
  missingInformation: string[];
  evidenceRequirements: string[];
  citations: Citation[];
}

export interface IPPathwayEvaluation {
  pathwayName: string;
  category: 'Patent' | 'Trademark' | 'GI' | 'Copyright' | 'Industrial Design' | 'Plant Variety Protection' | 'Traditional Knowledge';
  applicabilityStatus: 'POTENTIALLY_APPLICABLE' | 'RESTRICTED_BAR' | 'NOT_APPLICABLE' | 'REQUIRES_FURTHER_DATA';
  headline: string;
  statutoryRequirements: string[];
  evidenceNeeded: string[];
  cautiousNextAction: string;
  statutoryCaveat: string;
  citations: Citation[];
}

export interface RegulatoryPathwayEvaluation {
  frameworkName: string;
  regulatoryBody: string;
  applicabilityStatus: 'POTENTIALLY_APPLICABLE' | 'MANDATORY_COMPLIANCE' | 'NOT_APPLICABLE' | 'REQUIRES_FURTHER_DATA';
  headline: string;
  licensingDossierRequirements: string[];
  qualityTestingChecklist: string[];
  nextReviewStep: string;
  citations: Citation[];
}

export interface ABSEvaluation {
  triggersNBASection3: boolean;
  triggersNBASection6: boolean;
  triggersSBBSection7: boolean;
  exemptionStatus: string;
  headline: string;
  statutoryObligations: string[];
  citations: Citation[];
}

export interface FullCaseIntelligence {
  caseId: string;
  evaluatedAt: string;
  formulationDNA: NormalizedFormulationDNA;
  candidateClassifications: CandidateClassification[];
  applicableRegimes: ApplicableRegimeEvaluation[];
  evidenceGaps: EvidenceGap[];
  priorArtSignals: PriorArtSignal[];
  intelligenceBoardStats: {
    strongCount: number;
    moderateCount: number;
    gapCount: number;
  };
  ipPathways: IPPathwayEvaluation[];
  regulatoryPathways: RegulatoryPathwayEvaluation[];
  absEvaluation: ABSEvaluation;
  safeAbstention: SafeAbstentionState;
  evidenceChain: EvidenceChainStep[];
  prioritizedNextActions: string[];
}

// ─── 13. Case-Aware Structured Assistant Response ────────────────────────────
export interface StructuredAssistantResponse {
  answer: string;
  why: string;
  evidence: Citation[];
  whatIsMissing: string[];
  whatThisMeans: string;
  nextAction: string[];
  confidence: EvidenceStrength;
  confidenceExplanation: string;
  isAbstained: boolean;
}

// ─── 14. Intelligent Search Results ──────────────────────────────────────────
export type SearchIntent =
  | 'PRODUCT'
  | 'FORMULATION'
  | 'IP'
  | 'PATENT'
  | 'TRADEMARK'
  | 'GI'
  | 'COPYRIGHT'
  | 'DESIGN'
  | 'REGULATION'
  | 'ABS'
  | 'TRADITIONAL_KNOWLEDGE'
  | 'PRIOR_ART'
  | 'CASE'
  | 'GENERAL_QUESTION';

export interface GroupedSearchResult {
  query: string;
  detectedIntent: SearchIntent;
  stream: string;
  confidence: number;
  groups: {
    ipPathways: { title: string; subtitle: string; link: string; badge: string }[];
    evidence: Citation[];
    relatedFrameworks: { title: string; authority: string; link: string }[];
    priorArtChecklist: string[];
    cases: { id: string; title: string; status: string; link: string }[];
  };
}
