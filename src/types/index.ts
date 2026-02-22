/**
 * A candidate role/trade (e.g., Electrician, Pipefitter)
 */
export interface CandidateRole {
  id: string;
  name: string;
}

/**
 * A required or preferred certification for a job listing
 */
export interface RequiredCert {
  name: string;
  required: boolean; // true = required, false = preferred
}

/**
 * A public job listing as returned by the GraphQL API
 */
export interface PublicJob {
  id: string;
  slug: string;
  title: string;
  employerName: string;
  employerLogoUrl?: string | null;
  /** Client organization ID — present for white-label (Tier 0) jobs */
  clientOrganizationId?: string | null;
  location: string;
  employmentTypeText?: string | null;
  payRateText?: string | null;
  requirementsDescription?: string | null;
  responsibilitiesDescription?: string | null;
  otherDescription?: string | null;
  roles: CandidateRole[];
  startDateText?: string | null;
  requiredCertifications?: RequiredCert[];
  whiteLabel?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A public job listing card (subset of PublicJob, for list views)
 */
export interface PublicJobCard {
  id: string;
  slug: string;
  title: string;
  employerName: string;
  employerLogoUrl?: string | null;
  location: string;
  employmentTypeText?: string | null;
  payRateText?: string | null;
  startDateText?: string | null;
  whiteLabel?: boolean;
  createdAt: string;
}

/**
 * Branch attribution data captured from URL params on outreach link click.
 * Matches the BranchInfo GraphQL input type on the backend.
 */
export interface BranchInfo {
  channel?: string | null;
  campaign?: string | null;
  campaignId?: string | null;
  candidatePoolId?: string | null;
  referringLink?: string | null;
}

/**
 * Auth state for the current user session
 */
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

/**
 * Steps in the job application wizard
 */
export type WizardStep =
  | 'phone'
  | 'verify'
  | 'name'
  | 'roles'
  | 'resume'
  | 'confirm'
  | 'success';

/**
 * Steps in the profile claim wizard
 */
export type ClaimStep =
  | 'landing'
  | 'phone'
  | 'verify'
  | 'roles'
  | 'certs'
  | 'location'
  | 'resume'
  | 'confirmation';

/**
 * Location data from Mapbox geocoding
 */
export interface GeocodedLocation {
  displayName: string;
  city?: string | null;
  state?: string | null;
  stateCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  coordinates?: { lat: number; lng: number } | null;
}

/**
 * Wizard state stored in Zustand persist store
 */
export interface WizardState {
  step: WizardStep;
  jobId: string | null;
  jobSlug: string | null;
  phone: string | null;
  token: string | null;
  selectedRoleIds: string[];
  resumeFileId: string | null;
  name: string | null;
  /** Cert names the user claimed to have before authenticating */
  claimedCertifications: string[];
  /** When true, all API calls are simulated with fake delays */
  demo: boolean;
  /** When true in demo mode, simulate a returning user with pre-selected roles */
  demoReturning: boolean;
  /** When true, the apply flow is white-label (employer-branded) */
  whiteLabel: boolean;
  /** Client organization ID for white-label (Tier 0) jobs — used to fetch employer jobs on confirm page */
  employerId: string | null;
  /** Branch attribution data from outreach link URL params */
  branchInfo: BranchInfo | null;
}
