import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly authState = this.authService.state;

  public readonly userName = computed(() => {
    const user = this.authState().user;
    return user?.username || 'User';
  });

  onLogout(): void {
    // ⚠️ Subscribe necessario (non async pipe) perché:
    // 1. Navigazione imperativa richiesta (router.navigate)
    // 2. Side effect dopo logout (redirect)
    this.authService.signOut$()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Logout failed:', error);
        }
      });
  }
}
