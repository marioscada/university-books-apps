import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SiteShellComponent } from '../../shared/layout/site-shell/site-shell.component';
import { SiteHeaderNavComponent } from '../../shared/layout/site-header-nav/site-header-nav.component';
import { SiteFooterBlockComponent } from '../../shared/layout/site-footer-block/site-footer-block.component';
import { AuthService } from '../../auth/services/auth.service';
import { BRAND, APP_FOOTER_COLUMNS, APP_NAV_ITEMS } from '../../shared/navigation/site-navigation';
import { LEGAL_PAGES, type LegalKey } from './legal.content';

/**
 * LegalPage — pagina informativa/legale generica del footer (about, contatti,
 * privacy, termini, cookie, note legali). Una sola pagina che renderizza il
 * contenuto in base alla `legalKey` di rotta, con lo stesso shell pubblico della
 * landing (header + footer). L'header si adatta allo stato di autenticazione:
 * ospite → Sign In/Sign Up; loggato → nav dell'app (logo verso /create). Così le
 * voci del footer non cadono più nel catch-all (che finiva nello Studio).
 */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [SiteShellComponent, SiteHeaderNavComponent, SiteFooterBlockComponent],
  templateUrl: './legal.page.html',
  styleUrl: './legal.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly brand = BRAND;
  readonly footerColumns = APP_FOOTER_COLUMNS;

  /** Header e footer si adattano allo stato di autenticazione. */
  readonly isAuth = computed(() => this.auth.state().isAuthenticated);
  readonly navItems = computed(() =>
    this.isAuth() ? APP_NAV_ITEMS.filter((i) => i.id !== 'home') : [],
  );
  readonly logoRoute = computed(() => (this.isAuth() ? '/create' : '/'));

  /** Contenuto della pagina dalla `legalKey` di rotta (default privacy). */
  private readonly key = (this.route.snapshot.data['legalKey'] as LegalKey | undefined) ?? 'privacy';
  readonly page = LEGAL_PAGES[this.key];
}
