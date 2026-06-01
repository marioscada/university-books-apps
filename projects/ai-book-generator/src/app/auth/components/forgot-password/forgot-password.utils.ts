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
  return error.message || 'An error occurred. Please try again.';
}
