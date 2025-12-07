import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { switchMap, map, catchError, startWith, tap, shareReplay } from 'rxjs/operators';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '../../auth/services/auth.service';
import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly responsive = inject(ResponsiveService);

  public readonly authState = this.authService.state;

  // Responsive signals
  public readonly isMobile = this.responsive.isMobile;

  public readonly userName = computed(() => {
    const user = this.authState().user;
    return user?.username || 'User';
  });

  // ✅ Subject per trigger del logout (no subscribe nel .ts)
  private readonly logoutTrigger$ = new Subject<void>();

  // ✅ Observable per lo stato - usato con async pipe nel template
  public readonly logoutState$ = this.logoutTrigger$.pipe(
    switchMap(() =>
      this.authService.signOut$().pipe(
        map(() => ({
          loading: false,
          error: null as string | null,
          success: true
        })),
        tap(() => {
          // ✅ Navigation side effect (eseguito dall'async pipe)
          this.router.navigate(['/auth/login']);
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

  onLogout(): void {
    // ✅ Trigger observable stream (no subscribe)
    this.logoutTrigger$.next();
  }
}
