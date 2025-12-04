/**
 * API Key HTTP Interceptor
 *
 * Automatically injects the API Key header into all HTTP requests.
 * This is a temporary solution for development until proper authentication
 * (Cognito) is implemented.
 *
 * @see https://angular.dev/guide/http/interceptors
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Functional HTTP Interceptor for API Key injection
 *
 * Modern Angular (v14+) uses functional interceptors instead of class-based ones.
 * This is the recommended approach as per Angular best practices.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add API Key if:
  // 1. API Key is configured in environment
  // 2. Request is going to our API (not external APIs)
  const apiKey = environment.auth.apiKey;
  const isApiRequest = req.url.startsWith(environment.api.baseUrl);

  if (apiKey && isApiRequest) {
    // Clone the request and add the x-api-key header
    const clonedRequest = req.clone({
      setHeaders: {
        'x-api-key': apiKey,
      },
    });

    return next(clonedRequest);
  }

  // Pass through unchanged if no API Key or not our API
  return next(req);
};

/**
 * Usage in app.config.ts:
 *
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([apiKeyInterceptor])
 *     ),
 *   ],
 * };
 */
