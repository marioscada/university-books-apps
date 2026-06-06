import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../auth/services/auth.service';
import { SiteShellComponent } from '../site-shell/site-shell.component';
import { SiteHeaderNavComponent } from '../site-header-nav/site-header-nav.component';
import { SiteMobileMenuComponent } from '../site-mobile-menu/site-mobile-menu.component';
import { SiteFooterBlockComponent } from '../site-footer-block/site-footer-block.component';
import { UserProfileSidebarComponent } from '../../../shared/widgets/user-profile-sidebar/user-profile-sidebar.component';
import { APP_NAV_ITEMS, APP_FOOTER_COLUMNS, BRAND } from '../../navigation/site-navigation';

/**
 * AuthShell — guscio dell'area AUTENTICATA, riusabile da ogni pagina interna
 * (Create, Projects, Library, Pricing…). Incapsula UNA volta:
 *   • header con nav completa + profilo (sidebar)
 *   • mobile menu (drawer hamburger)
 *   • footer completo (showAuthOnly)
 * Le pagine proiettano SOLO il proprio contenuto via `<ng-content>` → niente
 * duplicazione del markup di shell. Pattern: site-shell + projection (mariosite),
 * un livello sopra. Vedi docs/CREATE-PAGE-DESIGN.md §3.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteShellComponent,
    SiteHeaderNavComponent,
    SiteMobileMenuComponent,
    SiteFooterBlockComponent,
    UserProfileSidebarComponent,
  ],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Utente corrente per il drawer profilo (dumb). */
  readonly profileUser = computed(() => this.auth.state().user);
  readonly loggingOut = signal(false);
  readonly logoutError = signal<string | null>(null);

  /**
   * Mostra il footer marketing. Default `true` per le pagine hub (collection,
   * library, pricing…). Le schermate di **flusso task-focused** (create/new,
   * Studio) passano `false`: niente footer sotto l'action bar sticky (best
   * practice app-shell — focus, no doppio "fondo").
   */
  readonly showFooter = input(true, { transform: booleanAttribute });

  readonly brand = BRAND;
  readonly navItems = APP_NAV_ITEMS;
  readonly footerColumns = APP_FOOTER_COLUMNS;

  readonly profileOpen = signal(false);

  onProfile(): void {
    this.profileOpen.set(true);
  }

  onProfileClose(): void {
    this.profileOpen.set(false);
  }

  /** Logout: gestito dal container (il drawer è dumb). */
  async onProfileLogout(): Promise<void> {
    this.loggingOut.set(true);
    this.logoutError.set(null);
    try {
      await firstValueFrom(this.auth.signOut$());
      this.profileOpen.set(false);
      void this.router.navigate(['/auth/login']);
    } catch {
      this.logoutError.set('Logout failed. Please try again.');
    } finally {
      this.loggingOut.set(false);
    }
  }
}
