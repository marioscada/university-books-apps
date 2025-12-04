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
    baseUrl: '', // TODO: Set your API Gateway URL
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication
  auth: {
    // Temporary: API Key for development (until Cognito is implemented)
    apiKey: '', // TODO: Set this to your API Key from backend

    // AWS Cognito Configuration
    cognito: {
      userPoolId: '', // TODO: Set your Cognito User Pool ID
      userPoolClientId: '', // TODO: Set your Cognito App Client ID
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
