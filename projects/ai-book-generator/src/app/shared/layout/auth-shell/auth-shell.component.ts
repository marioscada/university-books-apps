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
import { SearchDropdownComponent } from '../../../shared/widgets/search/search-dropdown/search-dropdown.component';
import { SearchOverlayService } from '../../../core/services/search-overlay.service';
import { MOCK_SEARCH_ITEMS } from '../../navigation/mock-search-items';
import { APP_NAV_ITEMS, APP_FOOTER_COLUMNS, BRAND } from '../../navigation/site-navigation';
import type { SearchItem } from '../../../core/models/search-item.model';

/**
 * AuthShell — guscio dell'area AUTENTICATA, riusabile da ogni pagina interna
 * (Create, Projects, Library, Pricing…). Incapsula UNA volta:
 *   • header con nav completa + search (overlay) + profilo (sidebar)
 *   • mobile menu (drawer hamburger)
 *   • footer completo (showAuthOnly)
 *   • orchestrazione search/profilo (riuso SearchOverlayService / UserProfileSidebar)
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
  private readonly searchOverlay = inject(SearchOverlayService);
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

  /** Apre l'overlay di ricerca ancorato al bottone (riuso SearchOverlayService). */
  onSearch(origin: HTMLElement): void {
    const ref = this.searchOverlay.open<SearchDropdownComponent>(
      origin,
      SearchDropdownComponent
    );
    ref.instance.items = [...MOCK_SEARCH_ITEMS];
    ref.instance.placeholder = 'Search books, chapters, documents...';
    ref.instance.emptyMessage = 'Type to search across your content';
    ref.instance.noResultsMessage = 'No results found for "{query}"';
    ref.instance.noResultsHint = 'Try using different keywords or check spelling';
    ref.instance.jumpToHint = 'Jump to';
    ref.instance.onSelect = (item: SearchItem) => this.onSearchItemSelected(item);
  }

  private onSearchItemSelected(_item: SearchItem): void {
    this.searchOverlay.close();
    // TODO: navigazione verso la risorsa selezionata.
  }

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
