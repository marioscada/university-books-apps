/**
 * Application Configuration
 *
 * Modern Angular (v14+) standalone configuration.
 * Configures AWS Amplify and API client integration.
 *
 * @see https://angular.dev/guide/standalone-components
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';
import { Amplify } from 'aws-amplify';

import { routes } from './app.routes';
import { amplifyConfig } from './core/config/amplify.config';
import { configureApiClient } from './core/config/api-client.config';
import { AuthService } from './auth/services/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LocaleService } from './shared/services/locale.service';
import { API_PORT } from './core/data/api-port';
import { AwsApiService } from './core/data/aws-api.service';

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
 * - Animations
 * - API Client with JWT authentication
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration — withComponentInputBinding() per bindare i param di
    // route (es. `:id`) direttamente su `input()` dei componenti (Angular 19).
    provideRouter(routes, withComponentInputBinding()),

    // HTTP Client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // Animations (for Angular animations like slide-in, fade-in, etc.)
    provideAnimations(),

    // Data layer: l'ApiPort è mappato all'AwsApiService (backend reale via HTTP).
    // Nessun mock: tutto reale (/v1/projects, /v1/documents, /auth/me); l'AI
    // (chat + derivati) resta VUOTA finché non c'è Bedrock/Claude; i templates
    // sono catalogo statico dell'app. Store/UI dipendono solo da ApiPort.
    { provide: API_PORT, useExisting: AwsApiService },

    // Icone: il progetto carica SOLO "Material Symbols Outlined" (index.html).
    // Impostiamo il fontSet di default così anche le icone interne dei componenti
    // Material (es. mat-stepper edit/done) usano Symbols e non renderizzano la
    // ligature come testo ("create"→"cr"). Vedi i18n/mariosite.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),

    // i18n (ngx-translate) — pattern mariosite/customer-portal, default EN.
    // I file flat dot-path vivono in /public/i18n/<lang>.json.
    provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
    provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),

    // Init dello stato auth PRIMA del bootstrap (evita il flash della login).
    provideAppInitializer(() => inject(AuthService).initializeAuth()),

    // Configura l'API client all'avvio.
    provideAppInitializer(() => {
      configureApiClient(inject(AuthService));
    }),

    // Gate del boot sul caricamento delle traduzioni della lingua attiva:
    // finché il JSON non è pronto resta lo splash col logo (no flash di chiavi).
    // Iniettare LocaleService ne esegue il costruttore (flag SVG + effect use()).
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const locale = inject(LocaleService);
      return firstValueFrom(translate.use(locale.currentLocale()));
    }),
  ],
};
