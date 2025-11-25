/**
 * User Model
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  providerId?: string;
  roles?: string[];
  createdAt?: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * User Profile (esteso)
 */
export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  address?: Address;
  preferences?: UserPreferences;
}

/**
 * Address
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: boolean;
  newsletter?: boolean;
}
