import { gql } from '@apollo/client';

/**
 * Initiate SMS verification — sends OTP to the given phone number.
 * Schema: verifySmsStart(phoneNumber: String!, token: String): Any!
 */
export const VERIFY_SMS_START = gql`
  mutation verifySmsStart($phoneNumber: String!) {
    verifySmsStart(phoneNumber: $phoneNumber)
  }
`;

/**
 * Confirm SMS OTP code and receive a JWT token.
 * Schema: verifySmsCheck(phoneNumber: String!, code: String!, referralCode: String, referrerId: String, branchInfo: BranchInfo): Any!
 * Returns: { token: String, userId: ID, role: String, email: String }
 */
export const VERIFY_SMS_CHECK = gql`
  mutation verifySmsCheck($phoneNumber: String!, $code: String!, $branchInfo: BranchInfo) {
    verifySmsCheck(phoneNumber: $phoneNumber, code: $code, branchInfo: $branchInfo)
  }
`;

/**
 * Submit a job application.
 * Schema: applyToJob(moblyzeJobId: ID!): MoblyzeJobApplication!
 * Requires auth (JWT).
 */
export const APPLY_TO_JOB = gql`
  mutation applyToJob($moblyzeJobId: ID!) {
    applyToJob(moblyzeJobId: $moblyzeJobId) {
      id
    }
  }
`;

/**
 * Update candidate role preferences (used after applying to save selected roles).
 * Schema: updateCandidateRolePreferences(candidateRoleIds: [ID!]!, skillIds: [SkillIdsInput], aiSuggest: Boolean): [CandidateRole!]!
 * Requires auth (JWT).
 */
export const UPDATE_ROLE_PREFERENCES = gql`
  mutation updateCandidateRolePreferences($candidateRoleIds: [ID!]!) {
    updateCandidateRolePreferences(candidateRoleIds: $candidateRoleIds) {
      id
      name
    }
  }
`;

/**
 * Upload a resume/CV file for the current authenticated candidate.
 * Schema: candidateUserUploadResume(resumeFile: Upload!): User! @auth
 * Returns the updated User with candidateProfile.resumeUrl set.
 */
export const UPLOAD_RESUME = gql`
  mutation candidateUserUploadResume($resumeFile: Upload!) {
    candidateUserUploadResume(resumeFile: $resumeFile) {
      id
      candidateProfile {
        resumeUrl
      }
    }
  }
`;

/**
 * Set the user's first password (only works if no password is currently set).
 * Schema: setFirstPassword(password: String!): User! @auth
 * Requires auth (JWT).
 */
export const SET_FIRST_PASSWORD = gql`
  mutation setFirstPassword($password: String!) {
    setFirstPassword(password: $password) {
      id
      needsPassword
    }
  }
`;

/**
 * Update candidate work location preferences.
 * Schema: updateCandidateWorkLocationPreferences(candidateWorkLocationIds: [ID!]!): [CandidateWorkLocation!]! @auth
 * Replaces all existing preferences with the given location IDs.
 * Requires auth (JWT).
 */
export const UPDATE_WORK_LOCATION_PREFERENCES = gql`
  mutation updateCandidateWorkLocationPreferences($candidateWorkLocationIds: [ID!]!) {
    updateCandidateWorkLocationPreferences(candidateWorkLocationIds: $candidateWorkLocationIds) {
      id
      name
    }
  }
`;

/**
 * Upload a certification for the current authenticated candidate.
 * Schema: candidateUserUploadCertification(file: Upload!, name: String, expiry: Time, issue: Time): User! @auth
 * Note: file is required — certs without an uploaded file cannot be saved via this mutation.
 */
export const UPLOAD_CERTIFICATION = gql`
  mutation candidateUserUploadCertification($file: Upload!, $name: String, $expiry: Time, $issue: Time) {
    candidateUserUploadCertification(file: $file, name: $name, expiry: $expiry, issue: $issue) {
      id
      candidateProfile {
        certification {
          id
          name
        }
      }
    }
  }
`;
