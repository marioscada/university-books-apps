/**
 * Application Configuration
 *
 * Modern Angular (v14+) standalone configuration.
 * Replaces the traditional NgModule approach with functional providers.
 *
 * @see https://angular.dev/guide/standalone-components
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';

/**
 * Application-wide providers configuration
 *
 * Benefits of this approach:
 * - Tree-shakeable: Only used providers are included in the bundle
 * - Type-safe: Compile-time checking of provider configuration
 * - Functional: Easier to test and compose
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP Client with interceptors
    // Modern functional interceptors (recommended over class-based)
    provideHttpClient(
      withInterceptors([
        apiKeyInterceptor, // Automatically adds API Key to requests
        // Add more interceptors here as needed:
        // - authInterceptor (for JWT tokens when implementing Cognito)
        // - errorInterceptor (global error handling)
        // - loadingInterceptor (show/hide loading spinner)
        // - retryInterceptor (advanced retry logic)
      ])
    ),

    // Add more providers here:
    // - provideAnimations() for Angular animations
    // - provideStore(...) for NgRx state management
    // - provideLottieOptions() for Lottie animations
  ],
};

/**
 * Future enhancements:
 *
 * 1. Add Cognito authentication:
 *    import { provideAmplify } from 'aws-amplify/adapter-angular';
 *    provideAmplify(amplifyConfig)
 *
 * 2. Add state management (NgRx):
 *    import { provideStore, provideState } from '@ngrx/store';
 *    provideStore(),
 *    provideState({ books: booksReducer })
 *
 * 3. Add service worker for offline support:
 *    import { provideServiceWorker } from '@angular/service-worker';
 *    provideServiceWorker('ngsw-worker.js')
 */
