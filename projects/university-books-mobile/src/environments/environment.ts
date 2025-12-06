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
    baseUrl: 'https://omrsvjwsfh.execute-api.eu-south-1.amazonaws.com/dev',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication
  auth: {
    // Temporary: API Key for development (until Cognito is implemented)
    apiKey: 'RErezCnnQ2a80EWrT7BXtPs1pcq708J1l66v0pY1',

    // AWS Cognito Configuration
    cognito: {
      userPoolId: 'eu-south-1_jEu8Stbmc',
      userPoolClientId: '2k6isr2cfi30429noupl4bak0t',
      region: 'eu-south-1',
    },
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
