import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { SiteNavItem } from './site-header-nav.types';
import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * SiteHeaderNav — header sticky a 3 zone (fedele a mariosite):
 *   • logo a SINISTRA
 *   • voci di navigazione al CENTRO
 *   • azioni a DESTRA (search + Sign In / Get Started o profilo)
 * Responsive: pattern `[appScreenType]` come mariosite — su isMedium/isSmall
 * (< 960px) nav + azioni si nascondono e compare l'hamburger.
 * Vedi docs/MIGRATION-TO-WEBSITE.md §3.
 */
@Component({
  selector: 'app-site-header-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, ScreenTypeDirective],
  templateUrl: './site-header-nav.component.html',
  styleUrl: './site-header-nav.component.scss',
})
export class SiteHeaderNavComponent {
  /** Voci di navigazione centrali (vuoto = nessuna nav). */
  readonly navItems = input<readonly SiteNavItem[]>([]);
  /** Etichetta del brand mostrata accanto al logo. */
  readonly brand = input<string>('AI Book Generator');
  /** Destinazione del click sul logo (landing pubblica: '/'; area app: '/home'). */
  readonly logoRoute = input<string>('/');

  /** Mostra il bottone di ricerca a destra (come top-app-bar). */
  readonly showSearch = input<boolean>(false);
  /** Mostra i link Sign In + Get Started a destra (come landing-header). */
  readonly showAuthLinks = input<boolean>(false);
  /** Mostra il bottone profilo a destra (contesto autenticato). */
  readonly showProfile = input<boolean>(false);

  /** Apertura del menu mobile (collegata a site-shell.toggleSidebar). */
  readonly toggleSidebar = output<void>();
  /** Click sul bottone di ricerca: emette l'elemento origine per l'overlay. */
  readonly search = output<HTMLElement>();
  /** Click sul bottone profilo. */
  readonly profile = output<void>();

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onSearch(origin: HTMLElement): void {
    this.search.emit(origin);
  }

  onProfile(): void {
    this.profile.emit();
  }
}
