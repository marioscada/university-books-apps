/**
 * Register Component Utilities
 *
 * Utility functions for registration and email verification error handling.
 */

/**
 * Parse registration errors into user-friendly messages
 *
 * @param error - Error from Cognito signUp
 * @returns User-friendly error message
 */
export function parseRegistrationError(error: any): string {
  if (error.name === 'UsernameExistsException') {
    return 'An account with this email already exists.';
  }
  if (error.name === 'InvalidPasswordException') {
    return 'Password does not meet requirements.';
  }
  if (error.name === 'InvalidParameterException') {
    return 'Invalid email or password format.';
  }
  return error.message || 'Registration failed. Please try again.';
}

/**
 * Parse email confirmation errors into user-friendly messages
 *
 * @param error - Error from Cognito confirmSignUp
 * @returns User-friendly error message
 */
export function parseConfirmationError(error: any): string {
  if (error.name === 'CodeMismatchException') {
    return 'Invalid verification code. Please check and try again.';
  }
  if (error.name === 'ExpiredCodeException') {
    return 'Verification code has expired. Please request a new one.';
  }
  if (error.name === 'LimitExceededException') {
    return 'Too many attempts. Please try again later.';
  }
  return error.message || 'Verification failed. Please try again.';
}
