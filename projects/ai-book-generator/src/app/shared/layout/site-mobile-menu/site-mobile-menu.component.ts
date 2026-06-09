import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, type QueryParamsHandling } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { SiteNavItem } from '../site-header-nav/site-header-nav.types';
import { navQueryParamsHandling } from '../../navigation/site-navigation';

/**
 * SiteMobileMenu — contenuto del drawer mobile (nav verticale su dark surface)
 * + azioni in fondo (Sign In / Get Started), riprendendo le voci dell'header.
 * Proiettato dentro lo SiteShell. Vedi docs/MIGRATION-TO-WEBSITE.md §3.
 */
@Component({
  selector: 'app-site-mobile-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslateModule],
  templateUrl: './site-mobile-menu.component.html',
  styleUrl: './site-mobile-menu.component.scss',
})
export class SiteMobileMenuComponent {
  /** Voci di navigazione del drawer. */
  readonly navItems = input<readonly SiteNavItem[]>([]);
  /** Etichetta del brand. */
  readonly brand = input<string>('AI Book Generator');
  /** Mostra in fondo i link Sign In + Get Started. */
  readonly showAuthLinks = input<boolean>(false);

  /** Chiusura del drawer (collegata a site-shell.toggleSidebar). */
  readonly closeMenu = output<void>();

  private readonly router = inject(Router);
  /** Voce della sezione corrente → preserva il sotto-step (no reset del flusso). */
  qph(item: SiteNavItem): QueryParamsHandling {
    return navQueryParamsHandling(this.router.url, item.route);
  }

  onClose(): void {
    this.closeMenu.emit();
  }
}
