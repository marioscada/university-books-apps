/**
 * Auth Library Configuration
 * Permette di personalizzare comportamento e styling della libreria
 */
export interface AuthConfig {
  /**
   * Firebase configuration
   */
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };

  /**
   * Features abilitate
   */
  features: {
    emailPassword: boolean;
    googleAuth: boolean;
    appleAuth: boolean;
    emailVerification: boolean;
    passwordReset: boolean;
    twoFactor: boolean;
    rememberMe: boolean;
  };

  /**
   * Routing
   */
  routing: {
    loginRoute: string;
    registerRoute: string;
    dashboardRoute: string;
    forgotPasswordRoute: string;
  };

  /**
   * Storage strategy
   */
  storage: {
    type: 'localStorage' | 'sessionStorage';
    tokenKey: string;
    userKey: string;
  };

  /**
   * Styling dinamico
   */
  styling?: AuthStyling;

  /**
   * Platform detection
   */
  platform?: 'web' | 'ios' | 'android';
}

/**
 * Styling Configuration
 * Permette override dinamico degli stili
 */
export interface AuthStyling {
  /**
   * Colori primari
   */
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    error?: string;
    success?: string;
    text?: string;
    background?: string;
  };

  /**
   * Typography
   */
  typography?: {
    fontFamily?: string;
    fontSize?: {
      small?: string;
      base?: string;
      large?: string;
      heading?: string;
    };
  };

  /**
   * Spacing
   */
  spacing?: {
    small?: string;
    medium?: string;
    large?: string;
  };

  /**
   * Border radius
   */
  borderRadius?: {
    small?: string;
    medium?: string;
    large?: string;
  };

  /**
   * Custom CSS classes
   */
  customClasses?: {
    container?: string;
    form?: string;
    input?: string;
    button?: string;
    buttonPrimary?: string;
    buttonSecondary?: string;
    link?: string;
    error?: string;
  };

  /**
   * Logo URL
   */
  logoUrl?: string;

  /**
   * Background image/gradient
   */
  backgroundImage?: string;
}

/**
 * Default configuration
 */
export const DEFAULT_AUTH_CONFIG: Partial<AuthConfig> = {
  features: {
    emailPassword: true,
    googleAuth: true,
    appleAuth: false,
    emailVerification: true,
    passwordReset: true,
    twoFactor: false,
    rememberMe: true
  },
  routing: {
    loginRoute: '/login',
    registerRoute: '/register',
    dashboardRoute: '/dashboard',
    forgotPasswordRoute: '/forgot-password'
  },
  storage: {
    type: 'localStorage',
    tokenKey: 'auth_token',
    userKey: 'auth_user'
  },
  platform: 'web'
};
