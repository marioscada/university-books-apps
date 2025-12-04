/**
 * Development Environment Configuration
 *
 * This file contains configuration for local development.
 * Values here are NOT committed to git and should be overridden
 * in environment.local.ts for local development.
 */

export const environment = {
  production: false,
  appName: 'University Books Mobile',
  version: '1.0.0',

  // API Configuration
  api: {
    baseUrl: 'https://YOUR_API_ID.execute-api.eu-south-1.amazonaws.com/dev',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication
  auth: {
    // Temporary: API Key for development (until login UI is implemented)
    // TODO: Remove this once proper authentication is in place
    apiKey: '', // Set this to your API Key from backend

    // Future: Cognito configuration (commented out for now)
    // cognito: {
    //   userPoolId: 'eu-south-1_XXXXXXXXX',
    //   userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    //   region: 'eu-south-1',
    // },
  },

  // Feature Flags
  features: {
    enableOfflineMode: false,
    enableAnalytics: false,
    enableDebugLogging: true,
  },

  // AWS Region
  aws: {
    region: 'eu-south-1',
  },
};

/**
 * Usage:
 *
 * 1. Create environment.local.ts (git-ignored) with your API Key:
 *
 * import { environment as base } from './environment';
 *
 * export const environment = {
 *   ...base,
 *   auth: {
 *     ...base.auth,
 *     apiKey: 'YOUR_ACTUAL_API_KEY_HERE',
 *   },
 * };
 *
 * 2. Update angular.json to use environment.local.ts:
 *
 * "fileReplacements": [{
 *   "replace": "projects/university-books-mobile/src/environments/environment.ts",
 *   "with": "projects/university-books-mobile/src/environments/environment.local.ts"
 * }]
 */
