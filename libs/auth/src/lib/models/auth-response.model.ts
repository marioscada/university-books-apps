import { User } from './user.model';

/**
 * Auth Response from login/register
 */
export interface AuthResponse {
  user: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Data
 */
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset Confirm
 */
export interface PasswordResetConfirm {
  code: string;
  newPassword: string;
}

/**
 * Auth State
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Social Auth Provider
 */
export type SocialAuthProvider = 'google' | 'apple' | 'facebook' | 'twitter';
