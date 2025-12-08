import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject, of } from 'rxjs';
import { switchMap, map, catchError, startWith, tap, shareReplay } from 'rxjs/operators';
import {
  trigger,
  style,
  transition,
  animate,
} from '@angular/animations';

import { AuthService } from '../../../auth/services/auth.service';

/**
 * User Profile Sidebar Component
 *
 * Right sidebar that displays user account information and logout option.
 * Opened by clicking on the user avatar in navigation or home page.
 *
 * Pattern similar to GitHub's user profile dropdown.
 */
@Component({
  selector: 'app-user-profile-sidebar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './user-profile-sidebar.component.html',
  styleUrls: ['./user-profile-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Backdrop fade-in animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    // Sidebar slide-in from right
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class UserProfileSidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Output event to close sidebar
  public readonly closeSidebar = output<void>();

  // View state: 'menu' | 'account'
  public readonly currentView = signal<'menu' | 'account'>('menu');

  // User data from auth state
  public readonly user = computed(() => this.authService.state().user);

  /**
   * Display name (for showing under avatar)
   * Only show givenName (first name only)
   */
  public readonly displayName = computed(() => {
    const user = this.user();
    if (!user) return '';

    // Use givenName (first name only)
    if (user.givenName) return user.givenName.toUpperCase();

    // Don't show full name, email or username under avatar
    return '';
  });

  /**
   * Check if username is different from userId (to avoid showing UUID twice)
   */
  public readonly hasDistinctUsername = computed(() => {
    const user = this.user();
    return user && user.username !== user.userId;
  });

  /**
   * Logout trigger subject
   */
  private readonly logoutTrigger$ = new Subject<void>();

  /**
   * Logout state observable (used with async pipe)
   */
  public readonly logoutState$ = this.logoutTrigger$.pipe(
    switchMap(() =>
      this.authService.signOut$().pipe(
        map(() => ({
          loading: false,
          error: null as string | null,
          success: true
        })),
        tap(() => {
          // Navigate to login and close sidebar
          this.router.navigate(['/auth/login']);
          this.closeSidebar.emit();
        }),
        catchError((error: unknown) => {
          console.error('Logout failed:', error);
          const errorMessage = error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Logout failed';
          return of({
            loading: false,
            error: errorMessage,
            success: false
          });
        }),
        startWith({ loading: true, error: null as string | null, success: false })
      )
    ),
    startWith({ loading: false, error: null as string | null, success: false }),
    shareReplay(1)
  );

  /**
   * Close sidebar
   */
  public onClose(): void {
    this.currentView.set('menu'); // Reset to menu when closing
    this.closeSidebar.emit();
  }

  /**
   * Show account info
   */
  public showAccount(): void {
    this.currentView.set('account');
  }

  /**
   * Back to menu
   */
  public backToMenu(): void {
    this.currentView.set('menu');
  }

  /**
   * Trigger logout
   */
  public onLogout(): void {
    this.logoutTrigger$.next();
  }
}
