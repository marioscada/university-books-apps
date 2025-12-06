/**
 * Authentication Models
 *
 * Type definitions for authentication-related data structures.
 */

/**
 * AWS Cognito error structure
 *
 * Represents errors returned from AWS Cognito operations
 */
export interface CognitoError {
  /** Error name/type (e.g., 'UserNotFoundException') */
  name?: string;
  /** Error code (alternative to name) */
  code?: string;
  /** Human-readable error message */
  message?: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
