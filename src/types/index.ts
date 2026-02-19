/**
 * A candidate role/trade (e.g., Electrician, Pipefitter)
 */
export interface CandidateRole {
  id: string;
  name: string;
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
  location: string;
  employmentTypeText?: string | null;
  payRateText?: string | null;
  requirementsDescription?: string | null;
  responsibilitiesDescription?: string | null;
  otherDescription?: string | null;
  roles: CandidateRole[];
  startDateText?: string | null;
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
  location: string;
  employmentTypeText?: string | null;
  payRateText?: string | null;
  createdAt: string;
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
}
