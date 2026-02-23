import type { CountryCode } from 'libphonenumber-js';

export interface CountryEntry {
  code: CountryCode;
  name: string;
  dialCode: string;
}

/** Countries pinned to the top of the selector — matches mobile app */
export const PREFERRED_COUNTRIES: CountryEntry[] = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
];

/** Remaining countries in alphabetical order */
export const OTHER_COUNTRIES: CountryEntry[] = [
  { code: 'AF', name: 'Afghanistan', dialCode: '+93' },
  { code: 'AL', name: 'Albania', dialCode: '+355' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'HR', name: 'Croatia', dialCode: '+385' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502' },
  { code: 'HN', name: 'Honduras', dialCode: '+504' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'JM', name: 'Jamaica', dialCode: '+1' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'PA', name: 'Panama', dialCode: '+507' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'TH', name: 'Thailand', dialCode: '+66' },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
];

/** All countries: preferred first, then the rest */
export const ALL_COUNTRIES: CountryEntry[] = [
  ...PREFERRED_COUNTRIES,
  ...OTHER_COUNTRIES,
];

export function findCountryByCode(code: CountryCode): CountryEntry | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}
