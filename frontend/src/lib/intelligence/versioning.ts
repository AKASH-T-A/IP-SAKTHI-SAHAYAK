/**
 * IP-SAKTI Sahayak — Statutory Versioning & Regulatory Time Machine Data
 * SIH26045
 * 
 * Tracks historical versions, official gazette notifications, and clause-level diffs
 * across major Indian IP and regulatory statutory frameworks.
 */

import { SourceVersionRecord } from './types';

export const STATUTORY_VERSIONS: SourceVersionRecord[] = [
  // ─── 1. Biological Diversity Act: 2002 Original vs 2023 Amendment ────────────
  {
    id: 'BDA-2023-AMD',
    sourceId: 'BIO_DIVERSITY_ACT_SEC_7',
    sourceTitle: 'The Biological Diversity (Amendment) Act, 2023',
    authority: 'Ministry of Environment, Forest and Climate Change (MoEFCC) / Parliament of India',
    versionNumber: 'Act No. 10 of 2023',
    versionLabel: '2023 Amendment (Current Active)',
    publicationDate: '2023-08-03',
    effectiveDate: '2023-09-01',
    status: 'ACTIVE',
    gazetteReference: 'The Gazette of India, Extraordinary, Part II, Section 1, No. 13',
    summaryOfChanges: 'Decriminalizes procedural offenses, exempts registered AYUSH practitioners and cultivated medicinal plants from State Biodiversity Board (SBB) prior intimation under Section 7, and streamlines National Biodiversity Authority (NBA) approval timelines under Section 6.',
    officialUrl: 'https://egazette.gov.in/WriteReadData/2023/247844.pdf',
    hashSha256: 'sha256-a94f381c84b238d94e1837cfb62e49c71a3962bfa03657b8c2e5b72183e8fa91',
    diffClauses: [
      {
        clauseId: 'Section 7(Proviso)',
        type: 'ADDED',
        originalText: 'No person who is a citizen of India shall obtain any biological resource for commercial utilisation except after giving prior intimation to the State Biodiversity Board.',
        updatedText: 'Provided that the provisions of this section shall not apply to the local people and communities of the area, including vaids and hakims who have been practicing indigenous medicine, and cultivated medicinal plants and their products.',
        analysisNote: 'Crucial for Ayurvedic innovators: Cultivated herbal raw materials with demonstrable agricultural source trace are exempt from SBB prior intimation fee requirements.'
      },
      {
        clauseId: 'Section 6(1A)',
        type: 'MODIFIED',
        originalText: 'Approval of NBA required before applying for IPR in or outside India.',
        updatedText: 'Approval of NBA required before grant of patent, or before commercialisation of patent, with expedited 90-day digital consultation window.',
        analysisNote: 'Allows innovators to file patent applications first and obtain NBA Form III clearance prior to official patent seal/grant.'
      },
      {
        clauseId: 'Section 55 (Penalties)',
        type: 'MODIFIED',
        originalText: 'Whoever contravenes the provisions of section 6 shall be punishable with imprisonment for a term which may extend to five years, or with fine.',
        updatedText: 'Whoever contravenes the provisions of section 6 shall be liable to pay penalty which shall not be less than one lakh rupees but which may extend to fifty lakh rupees (Imprisonment repealed).',
        analysisNote: 'Offenses transitioned from criminal prosecution to civil adjudicated fiscal penalties.'
      }
    ]
  },
  {
    id: 'BDA-2002-ORIGINAL',
    sourceId: 'BIO_DIVERSITY_ACT_SEC_7',
    sourceTitle: 'The Biological Diversity Act, 2002',
    authority: 'Ministry of Environment, Forest and Climate Change / Parliament of India',
    versionNumber: 'Act No. 18 of 2003',
    versionLabel: '2002 Original Enactment',
    publicationDate: '2003-02-05',
    effectiveDate: '2004-07-01',
    status: 'SUPERSEDED',
    gazetteReference: 'The Gazette of India, Extraordinary, Part II, Section 1, No. 22',
    summaryOfChanges: 'Original enactment mandating universal SBB intimation and strict criminal sanctions for unauthorized utilization of Indian biological materials.',
    officialUrl: 'https://www.indiacode.nic.in/handle/123456789/2046',
    hashSha256: 'sha256-4c78103d89ef23b7a58145a90d81b490f488667a23469e38e12154c86e08d511',
    diffClauses: [
      {
        clauseId: 'Section 7',
        type: 'UNCHANGED',
        originalText: 'Mandated universal prior intimation to SBB without explicit statutory exemption for cultivated medicinal herbs.',
        updatedText: '',
        analysisNote: 'All commercial entities faced ambiguous jurisdiction over cultivated vs wild botanicals.'
      }
    ]
  },

  // ─── 2. Patents Act: 2005 Amendment vs Pre-2005 ─────────────────────────────
  {
    id: 'PATENTS-2005-AMD',
    sourceId: 'PATENTS_ACT_SEC_3P',
    sourceTitle: 'The Patents (Amendment) Act, 2005',
    authority: 'Indian Patent Office (CGPDTM), DPIIT, Ministry of Commerce and Industry',
    versionNumber: 'Act No. 15 of 2005',
    versionLabel: '2005 Amendment (Current Active)',
    publicationDate: '2005-04-04',
    effectiveDate: '2005-01-01',
    status: 'ACTIVE',
    gazetteReference: 'The Gazette of India, Extraordinary, Part II, Section 1, No. 18',
    summaryOfChanges: 'Introduced explicit statutory Section 3(p) bar for traditional knowledge, Section 3(d) efficacy enhancements, and Section 10(4)(ii)(D) biological origin disclosures.',
    officialUrl: 'https://www.indiacode.nic.in/handle/123456789/1392',
    hashSha256: 'sha256-e91b689a9f4c3917bc429188d8b94155a0248a318285513257f867491d960f4e',
    diffClauses: [
      {
        clauseId: 'Section 3(p)',
        type: 'ADDED',
        originalText: '',
        updatedText: 'An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components.',
        analysisNote: 'Instituted the primary defense safeguard shielding codified Indian traditional knowledge from non-inventive patent monopolies.'
      },
      {
        clauseId: 'Section 10(4)(ii)(D)',
        type: 'ADDED',
        originalText: '',
        updatedText: 'Disclose the source and geographical origin of the biological material in the specification, when used in an invention.',
        analysisNote: 'Ensures patent applications cannot obscure the domestic biological genesis of active botanical agents.'
      }
    ]
  },

  // ─── 3. FSSAI Ayurveda Aahar Regulations, 2022 ──────────────────────────────
  {
    id: 'FSSAI-AAHAR-2022',
    sourceId: 'FSSAI_AYURVEDA_AAHAR_2022',
    sourceTitle: 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022',
    authority: 'Food Safety and Standards Authority of India (FSSAI)',
    versionNumber: 'F. No. Stds/SP-05/A-1.2022',
    versionLabel: '2022 Initial Notification (Current Active)',
    publicationDate: '2022-05-05',
    effectiveDate: '2022-05-05',
    status: 'ACTIVE',
    gazetteReference: 'The Gazette of India, Extraordinary, Part III, Section 4, No. 209',
    summaryOfChanges: 'First dedicated regulatory framework standardizing Ayurvedic dietetic foods and supplements, separating food supplements from therapeutic pharmaceuticals.',
    officialUrl: 'https://www.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Ayurveda_Aahar_09_05_2022.pdf',
    hashSha256: 'sha256-78b12f67ac1489e2118491295b90d2381fcae12739268800115598124efb0922',
    diffClauses: [
      {
        clauseId: 'Regulation 8(1)',
        type: 'ADDED',
        originalText: '',
        updatedText: 'No person shall manufacture or sell Ayurveda Aahar with claims for prevention, mitigation, treatment, or cure of any human disease.',
        analysisNote: 'Strict statutory dividing line between AYUSH proprietary drugs and FSSAI dietetics.'
      }
    ]
  }
];

export function getVersionsForSource(sourceId: string): SourceVersionRecord[] {
  return STATUTORY_VERSIONS.filter(v => v.sourceId === sourceId);
}

export function getAllSourceVersions(): SourceVersionRecord[] {
  return STATUTORY_VERSIONS;
}
