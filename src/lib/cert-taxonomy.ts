/**
 * Curated certification taxonomy sourced from the Moblyze Google Sheet
 * "Certifications Reference" tab (gid=344079091).
 *
 * Used for autocomplete when adding certifications on the confirmation page.
 * Categories are ordered by relevance to skilled trades job seekers.
 */

export interface CertCategory {
  category: string;
  certs: string[];
}

export const CERT_TAXONOMY: CertCategory[] = [
  {
    category: 'Safety',
    certs: ['OSHA 10', 'OSHA 30', 'OSHA 40', 'HAZMAT', 'HAZWOPER', 'H2S'],
  },
  {
    category: 'First Aid',
    certs: ['CPR/First Aid', 'AED'],
  },
  {
    category: 'Trades',
    certs: ['Master Electrician', 'Journeyman Electrician', 'EPA 608', 'Forklift Operator'],
  },
  {
    category: 'Welding',
    certs: ['CWI', 'CWB', 'AWS Certification'],
  },
  {
    category: 'API Certifications',
    certs: ['API 510', 'API 570', 'API 653', 'API 571', 'API 580', 'API 1169'],
  },
  {
    category: 'Rigging & Lifting',
    certs: ['Rigger Certification', 'Signal Person'],
  },
  {
    category: 'Crane',
    certs: ['NCCCO Crane Operator'],
  },
  {
    category: 'Well Control',
    certs: ['IADC WellSharp', 'IWCF'],
  },
  {
    category: 'Offshore Survival',
    certs: ['BOSIET', 'HUET', 'FOET'],
  },
  {
    category: 'Corrosion',
    certs: ['NACE CIP', 'NACE CP'],
  },
  {
    category: 'Maritime',
    certs: ['USCG License', 'DPO', 'STCW'],
  },
  {
    category: 'Professional',
    certs: ['PE License', 'PMP', 'Six Sigma', 'CDL'],
  },
  {
    category: 'Industry Bodies',
    certs: ['IADC', 'IMCA', 'NICET'],
  },
];

/** Flat list of all certification names for search/autocomplete. */
export const ALL_CERT_NAMES: string[] = CERT_TAXONOMY.flatMap((c) => c.certs);
