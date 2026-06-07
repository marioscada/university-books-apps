/**
 * Forgot Password Component Utilities
 *
 * Utility functions for password reset error handling.
 */

import { CognitoError } from '../../models/auth.model';

/**
 * Parse password reset errors into user-friendly messages
 *
 * @param error - Error from Cognito resetPassword or confirmResetPassword
 * @returns User-friendly error message
 */
export function parsePasswordResetError(error: CognitoError): string {
  if (error.name === 'UserNotFoundException') {
    return 'No account found with this email.';
  }
  if (error.name === 'CodeMismatchException') {
    return 'Invalid verification code.';
  }
  if (error.name === 'ExpiredCodeException') {
    return 'Verification code has expired. Please request a new one.';
  }
  if (error.name === 'InvalidPasswordException') {
    return 'Password does not meet requirements.';
  }
  if (error.name === 'InvalidParameterException') {
    return 'Invalid email format.';
  }
  if (
    error.name === 'LimitExceededException' ||
    error.name === 'TooManyRequestsException' ||
    error.name === 'TooManyFailedAttemptsException'
  ) {
    return 'Too many attempts. Please try again later.';
  }
  if (error.name === 'CodeDeliveryFailureException') {
    return 'Could not send the verification code. Please try again.';
  }
  if (error.name === 'NotAuthorizedException') {
    return 'Unable to reset the password for this account.';
  }
  return error.message || 'An error occurred. Please try again.';
}
