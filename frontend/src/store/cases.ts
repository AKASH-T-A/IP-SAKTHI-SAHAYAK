/**
 * IP-SAKTI — Zustand Cases Store
 * Manages active cases, formulation DNA, and provides local persistence
 * with backend sync capability.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ingredient {
  id: string;
  name: string;
  botanical_name?: string;
  sanskrit_name?: string;
  part_used?: string;
  percentage?: number;
  source_type: 'cultivated' | 'wild_harvested' | 'imported' | 'unknown';
  origin_state?: string;
}

export interface FormulationDNA {
  product_category: string;
  dosage_form?: string;
  ingredients: Ingredient[];
  preparation_method: string;
  traditional_basis: string[];
  is_classical: boolean;
  intended_use: string;
  claims_type: string[];
  commercial_intent: string;
  target_jurisdiction: 'India' | 'International' | 'EU' | 'US';
  supporting_docs?: string[];
  
  // Preliminary rule flags (transparent & deterministic)
  preliminary_rules: {
    patent_3p_applicable: boolean;
    patent_3p_note: string;
    abs_nba_required: boolean;
    abs_nba_note: string;
    regulatory_framework: string;
    regulatory_note: string;
    fssai_ayurveda_aahar: boolean;
  };
}

export interface CaseItem {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  jurisdiction: 'India' | 'International' | 'EU' | 'US';
  language: string;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
  formulation: FormulationDNA;
}

interface CasesState {
  cases: CaseItem[];
  activeCaseId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCase: (newCase: Omit<CaseItem, 'id' | 'created_at' | 'updated_at'>) => CaseItem;
  updateCase: (id: string, updates: Partial<CaseItem>) => void;
  deleteCase: (id: string) => void;
  getCaseById: (id: string) => CaseItem | undefined;
  setActiveCaseId: (id: string | null) => void;
}

// Initial representative demo case for first-time inspection
const DEMO_CASE: CaseItem = {
  id: 'demo-case-ashwagandha-brahmi',
  title: 'Medhya Rasayana Synergy Formulation',
  description: 'A standardized nootropic formulation blending Withania somnifera and Bacopa monnieri extracts for cognitive support and stress mitigation.',
  status: 'active',
  jurisdiction: 'India',
  language: 'en',
  is_demo: true,
  created_at: '2026-09-20T10:30:00Z',
  updated_at: '2026-09-25T14:15:00Z',
  formulation: {
    product_category: 'Ayurvedic formulation',
    dosage_form: 'Aqueous-Ethanolic Standardized Extract Capsule',
    ingredients: [
      {
        id: 'ing-1',
        name: 'Ashwagandha',
        botanical_name: 'Withania somnifera (L.) Dunal',
        sanskrit_name: 'Aśvagandhā',
        part_used: 'Root (Mūla)',
        percentage: 55,
        source_type: 'cultivated',
        origin_state: 'Madhya Pradesh'
      },
      {
        id: 'ing-2',
        name: 'Brahmi',
        botanical_name: 'Bacopa monnieri (L.) Wettst.',
        sanskrit_name: 'Brāhmī',
        part_used: 'Whole Plant (Pañcāṅga)',
        percentage: 45,
        source_type: 'cultivated',
        origin_state: 'Kerala'
      }
    ],
    preparation_method: 'Standardized extraction (5% Withanolides, 20% Bacosides) blended in synergistic 55:45 ratio using hydro-alcoholic percolation.',
    traditional_basis: [
      'Charaka Samhita (Chikitsa Sthana 1:3 - Medhya Rasayana)',
      'Ayurvedic Formulary of India (AFI Part-I)'
    ],
    is_classical: false, // Novel proprietary ratio / standardized extract
    intended_use: 'Cognitive endurance, neuroprotection, and stress adaptogen support.',
    claims_type: ['Ayurvedic Proprietary Medicine', 'Wellness & Cognitive Vitality'],
    commercial_intent: 'Domestic commercial manufacture with planned US/EU nutraceutical export.',
    target_jurisdiction: 'India',
    supporting_docs: [
      'HPLC chromatogram fingerprints',
      'Heavy metals & pesticide residue CoA (compliant with API limits)',
      'In-vitro acetylcholinesterase inhibition assay'
    ],
    preliminary_rules: {
      patent_3p_applicable: true,
      patent_3p_note: 'Section 3(p) Indian Patents Act: Direct use of traditional herbs is not patentable per se. To claim patentability, must demonstrate non-obvious synergistic technical effect exceeding mere aggregation of known classical properties.',
      abs_nba_required: true,
      abs_nba_note: 'Biological Diversity Act 2002: Commercial utilization of biological resources occurring in India requires prior intimation to SBB (Indian entities) or NBA approval under Section 3 (foreign entities/collaborations).',
      regulatory_framework: 'Drugs & Cosmetics Act 1940 (Rule 158B)',
      regulatory_note: 'Proprietary Ayurvedic Medicine license requires published textual citations or safety/efficacy pilot trials under Rule 158B plus Schedule T GMP compliance.',
      fssai_ayurveda_aahar: true
    }
  }
};

export const useCasesStore = create<CasesState>()(
  persist(
    (set, get) => ({
      cases: [DEMO_CASE],
      activeCaseId: null,
      isLoading: false,
      error: null,

      addCase: (newCaseData) => {
        const id = 'case-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        const now = new Date().toISOString();
        const created: CaseItem = {
          ...newCaseData,
          id,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          cases: [created, ...state.cases],
          activeCaseId: id,
        }));

        return created;
      },

      updateCase: (id, updates) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? { ...c, ...updates, updated_at: new Date().toISOString() }
              : c
          ),
        }));
      },

      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
          activeCaseId: state.activeCaseId === id ? null : state.activeCaseId,
        }));
      },

      getCaseById: (id) => {
        return get().cases.find((c) => c.id === id);
      },

      setActiveCaseId: (id) => {
        set({ activeCaseId: id });
      },
    }),
    {
      name: 'ipsakti_cases_storage',
    }
  )
);
