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
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Application-wide providers configuration
 *
 * Clean slate configuration - Auth library will be imported separately
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // HTTP Client (auth interceptors will be added by the library)
    provideHttpClient(),

    // TODO: Import auth library providers
    // Example: ...provideAuth({ apiUrl: '...', cognitoConfig: {...} })
  ],
};
