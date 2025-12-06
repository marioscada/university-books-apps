/**
 * Application Configuration
 *
 * Modern Angular (v14+) standalone configuration.
 * Configures AWS Amplify and API client integration.
 *
 * @see https://angular.dev/guide/standalone-components
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Amplify } from 'aws-amplify';

import { routes } from './app.routes';
import { amplifyConfig } from './core/config/amplify.config';
import { configureApiClient } from './core/config/api-client.config';
import { AuthService } from './auth/services/auth.service';

// =============================================================================
// Amplify Configuration
// =============================================================================

/**
 * Configure AWS Amplify on app startup
 *
 * This runs ONCE when the app starts, before Angular bootstraps.
 */
try {
  Amplify.configure(amplifyConfig);
  console.log('✅ Amplify configured');
} catch (error) {
  console.error('❌ Failed to configure Amplify:', error);
  throw error;
}

// =============================================================================
// Application Config
// =============================================================================

/**
 * Application-wide providers configuration
 *
 * Configures:
 * - Zone.js change detection
 * - Router
 * - HTTP Client
 * - API Client with JWT authentication
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP Client (for generated API client)
    provideHttpClient(),

    // Configure API Client on app initialization
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => {
        return () => {
          configureApiClient(authService);
          console.log('✅ API client configured');
        };
      },
      deps: [AuthService],
      multi: true,
    },
  ],
};
