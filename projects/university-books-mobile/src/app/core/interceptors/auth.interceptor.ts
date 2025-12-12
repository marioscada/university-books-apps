import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { from, switchMap } from 'rxjs';

/**
 * Authentication HTTP Interceptor
 *
 * Automatically adds JWT Bearer token to all outgoing HTTP requests
 * to the backend API.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only add token to API requests (skip other domains)
  if (!req.url.includes('execute-api')) {
    return next(req);
  }

  // Get access token and add to request
  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (token) {
        // Clone request and add Authorization header
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(clonedReq);
      }

      // No token available, proceed without auth header
      return next(req);
    })
  );
};
