/**
 * Authentication Models
 *
 * Type definitions for authentication-related data structures.
 */

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
