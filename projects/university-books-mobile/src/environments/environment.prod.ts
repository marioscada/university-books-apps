/**
 * Production Environment Configuration
 *
 * This file contains configuration for production deployments.
 * Sensitive values should be injected via CI/CD environment variables.
 */

export const environment = {
  production: true,
  appName: 'University Books Mobile',
  version: '1.0.0',

  // API Configuration
  api: {
    baseUrl: '', // Injected via CI/CD: process.env['API_BASE_URL']
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication
  auth: {
    apiKey: '', // Injected via CI/CD (temporary until Cognito is fully implemented)

    // AWS Cognito Configuration
    cognito: {
      userPoolId: '', // TODO: Injected via CI/CD
      userPoolClientId: '', // TODO: Injected via CI/CD
      region: 'eu-south-1',
    },
  },

  // Feature Flags
  features: {
    enableOfflineMode: true,
    enableAnalytics: true,
    enableDebugLogging: false,
  },

  // AWS Region
  aws: {
    region: 'eu-south-1',
  },
};
