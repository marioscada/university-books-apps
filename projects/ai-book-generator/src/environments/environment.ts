/**
 * Development Environment Configuration
 *
 * Configuration for local development (`ng serve`).
 * Auth is fully Cognito-based (JWT via Amplify) — no API key needed.
 * Cognito userPoolId/clientId are public identifiers, safe to commit.
 */

export const environment = {
  production: false,
  appName: 'University Books Mobile',
  version: '1.0.0',

  // API Configuration
  api: {
    baseUrl: 'https://dj0gbp5q7e.execute-api.eu-south-1.amazonaws.com/dev',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication
  auth: {
    // AWS Cognito Configuration
    cognito: {
      userPoolId: 'eu-south-1_4KUM6HHzk',
      userPoolClientId: '64jv9gud9k3r0ea7uf88u9809k',
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
