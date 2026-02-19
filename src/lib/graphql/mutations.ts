import { gql } from '@apollo/client';

/**
 * Initiate SMS verification — sends OTP to the given phone number.
 */
export const VERIFY_SMS_START = gql`
  mutation verifySMSStart($phone: String!) {
    verifySMSStart(phone: $phone) {
      success
      message
    }
  }
`;

/**
 * Confirm SMS OTP code and receive a JWT token.
 */
export const VERIFY_SMS_CHECK = gql`
  mutation verifySMSCheck($phone: String!, $code: String!) {
    verifySMSCheck(phone: $phone, code: $code) {
      token
      isNewUser
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

/**
 * Submit a job application.
 * Requires auth (JWT). Sends role selections and optional resume.
 */
export const APPLY_TO_JOB = gql`
  mutation applyToJob($input: ApplyToJobInput!) {
    applyToJob(input: $input) {
      success
      applicationId
      message
    }
  }
`;

/**
 * Upload a resume/CV file.
 * Returns a fileId for use in applyToJob.
 */
export const UPLOAD_RESUME = gql`
  mutation uploadResume($file: Upload!) {
    uploadResume(file: $file) {
      fileId
      filename
      url
    }
  }
`;
