import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard - Prevents authenticated users from accessing auth pages
 *
 * Usage:
 * {
 *   path: 'auth',
 *   loadChildren: () => import('./auth/auth.routes'),
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.state().isAuthenticated;

  if (isAuthenticated) {
    // Already logged in, redirect to home
    router.navigate(['/home']);
    return false;
  }

  return true;
};
