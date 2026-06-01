import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { SiteNavItem } from '../site-header-nav/site-header-nav.types';

/**
 * SiteMobileMenu — contenuto del drawer mobile (nav verticale su dark surface)
 * + azioni in fondo (Sign In / Get Started), riprendendo le voci dell'header.
 * Proiettato dentro lo SiteShell. Vedi docs/MIGRATION-TO-WEBSITE.md §3.
 */
@Component({
  selector: 'app-site-mobile-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
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

  onClose(): void {
    this.closeMenu.emit();
  }
}
