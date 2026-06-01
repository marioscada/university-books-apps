/**
 * API Client Configuration
 *
 * Configures the auto-generated OpenAPI client to work with AWS Cognito JWT authentication.
 * This file bridges the generated code with our authentication system.
 *
 * Key Features:
 * - Automatic JWT token injection
 * - Error handling
 * - Debug logging
 *
 * Note: The generated openapi-typescript-codegen client does not support interceptors.
 * Token refresh on 401 is handled automatically by AWS Amplify.
 *
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import { OpenAPI } from '@university-books/backend-api-client';
import type { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configure the OpenAPI client with authentication
 *
 * This function should be called once during app initialization (in main.ts or app.config.ts).
 * It sets up the base URL and authentication token provider.
 *
 * @param authService - Auth service instance for getting JWT tokens
 */
export function configureApiClient(authService: AuthService): void {
  // Set base URL from environment
  const baseUrl = environment.api.baseUrl;

  if (!baseUrl) {
    throw new Error(
      'Missing API base URL in environment.ts.\n' +
      'Please check src/environments/environment.ts'
    );
  }

  OpenAPI.BASE = baseUrl;

  // Configure token provider
  // This function is called before EVERY API request
  OpenAPI.TOKEN = async (): Promise<string> => {
    try {
      const token = await authService.getAccessToken();

      if (!token) {
        if (environment.features.enableDebugLogging) {
          console.warn('⚠️  No access token available');
        }
        return ''; // Return empty string instead of undefined
      }

      if (environment.features.enableDebugLogging) {
        console.log('🔑 JWT token injected into request');
      }

      return token;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return ''; // Return empty string instead of undefined
    }
  };

  console.log('✅ API client configured');
  console.log(`   Base URL: ${baseUrl}`);
}


// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if API client is configured
 */
export function isApiClientConfigured(): boolean {
  return !!OpenAPI.BASE;
}

/**
 * Get current API base URL
 */
export function getApiBaseUrl(): string {
  return OpenAPI.BASE || '';
}

/**
 * Reset API client configuration (for testing)
 */
export function resetApiClient(): void {
  OpenAPI.BASE = '';
  OpenAPI.TOKEN = undefined;
}
