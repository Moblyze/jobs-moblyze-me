import { gql } from '@apollo/client';

/**
 * Fetch a single public job by slug.
 * Used on the job detail page (RSC).
 */
export const PUBLIC_JOB_QUERY = gql`
  query publicJob($slug: ID!) {
    publicJob(slug: $slug) {
      id
      slug
      title
      employerName
      employerLogoUrl
      clientOrganizationId
      location
      employmentTypeText
      payRateText
      requirementsDescription
      responsibilitiesDescription
      otherDescription
      roles {
        id
        name
      }
      startDateText
      createdAt
      updatedAt
    }
  }
`;

/**
 * List public jobs, optionally filtered by employer.
 * Used on the jobs listing page (RSC).
 */
export const PUBLIC_JOBS_QUERY = gql`
  query publicJobs($employerId: ID, $limit: Int, $offset: Int) {
    publicJobs(employerId: $employerId, limit: $limit, offset: $offset) {
      id
      slug
      title
      employerName
      location
      employmentTypeText
      payRateText
      createdAt
    }
  }
`;

/**
 * Fetch the current authenticated user's profile.
 * Used after SMS auth to populate wizard state and check for resume.
 * Requires auth (JWT).
 */
export const CURRENT_USER_QUERY = gql`
  query currentUser {
    currentUser {
      id
      firstName
      lastName
      email
      primaryPhone
      candidateProfile {
        resumeUrl
        roles {
          id
          name
        }
      }
    }
  }
`;

/**
 * Fetch similar jobs based on a given job ID.
 * Used on job detail page for recommendations.
 */
export const SIMILAR_JOBS_QUERY = gql`
  query similarJobs($jobId: ID!, $limit: Int) {
    similarJobs(jobId: $jobId, limit: $limit) {
      id
      slug
      title
      employerName
      location
      employmentTypeText
      payRateText
      startDateText
      createdAt
    }
  }
`;

/**
 * Fetch paginated candidate roles for role selection.
 * Requires auth (JWT) — called after phone OTP verification.
 */
export const CANDIDATE_ROLES_QUERY = gql`
  query paginatedCandidateRoles($limit: Int, $search: String) {
    paginatedCandidateRoles(limit: $limit, search: $search) {
      roles {
        id
        name
        category
        subCategory
      }
      total
    }
  }
`;

/**
 * Fetch minimal candidate pool info for personalizing the /start landing page.
 * Public query — no auth required.
 * Returns only firstName to avoid exposing sensitive data.
 *
 * NOTE: This query must be added to the moblyze-api schema as well.
 * Until then, this will fail gracefully (the landing page shows generic copy).
 */
export const CANDIDATE_POOL_PREVIEW_QUERY = gql`
  query candidatePoolPreview($id: ID!) {
    candidatePoolPreview(id: $id) {
      firstName
    }
  }
`;
