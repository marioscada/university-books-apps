import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 *
 * Usage:
 * {
 *   path: 'home',
 *   component: HomeComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.state().isAuthenticated;

  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl }
    });
    return false;
  }

  return true;
};
