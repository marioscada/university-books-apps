/**
 * AWS Amplify Configuration
 *
 * Configures AWS Amplify for Cognito authentication.
 * This follows AWS best practices for secure authentication.
 *
 * Security:
 * - Uses environment variables (never hardcode credentials)
 * - Cognito User Pool for user management
 * - JWT tokens for API authentication
 *
 * @see https://docs.amplify.aws/angular/
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import { ResourcesConfig } from 'aws-amplify';
import { environment } from '../../../environments/environment';

/**
 * Amplify Configuration
 *
 * This configuration is loaded from environment files.
 *
 * Note: Using type assertion because AWS Amplify types incorrectly require
 * identityPoolId even when only using Cognito User Pools (not Identity Pools).
 * This is a known issue with Amplify v6 type definitions.
 */
export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: environment.auth.cognito.userPoolId,
      userPoolClientId: environment.auth.cognito.userPoolClientId,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  },
};

/**
 * Validate Amplify configuration
 *
 * Call this during app initialization to catch configuration errors early.
 */
export function validateAmplifyConfig(): void {
  const { userPoolId, userPoolClientId } = environment.auth.cognito;

  if (!userPoolId || !userPoolClientId) {
    throw new Error(
      'Missing Cognito configuration in environment.ts\n' +
      'Please check src/environments/environment.ts',
    );
  }
}
