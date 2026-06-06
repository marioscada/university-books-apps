import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { SiteNavItem } from './site-header-nav.types';
import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { LocaleService } from '../../services/locale.service';

/**
 * SiteHeaderNav — header sticky a 3 zone (fedele a mariosite):
 *   • logo a SINISTRA
 *   • voci di navigazione al CENTRO
 *   • azioni a DESTRA (Sign In / Get Started o profilo)
 * Responsive: pattern `[appScreenType]` come mariosite — su isMedium/isSmall
 * (< 960px) nav + azioni si nascondono e compare l'hamburger.
 * Vedi docs/MIGRATION-TO-WEBSITE.md §3.
 */
@Component({
  selector: 'app-site-header-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    ScreenTypeDirective,
    LanguageSwitcherComponent,
    TranslateModule,
  ],
  templateUrl: './site-header-nav.component.html',
  styleUrl: './site-header-nav.component.scss',
})
export class SiteHeaderNavComponent {
  /** Voci di navigazione centrali (vuoto = nessuna nav). */
  readonly navItems = input<readonly SiteNavItem[]>([]);
  /** Etichetta del brand mostrata accanto al logo. */
  readonly brand = input<string>('AI Book Generator');
  /** Destinazione del click sul logo (landing pubblica: '/'; area app: '/create'). */
  readonly logoRoute = input<string>('/');

  /** Mostra i link Sign In + Get Started a destra (come landing-header). */
  readonly showAuthLinks = input<boolean>(false);
  /** Mostra il bottone profilo a destra (contesto autenticato). */
  readonly showProfile = input<boolean>(false);

  /** Apertura del menu mobile (collegata a site-shell.toggleSidebar). */
  readonly toggleSidebar = output<void>();
  /** Click sul bottone profilo. */
  readonly profile = output<void>();

  // Lingua condivisa da TUTTO il sito (singleton): la scelta persiste tra le
  // pagine e tra le sessioni.
  private readonly localeService = inject(LocaleService);
  readonly currentLocale = this.localeService.currentLocale;
  readonly locales = this.localeService.locales;

  onLocaleChange(locale: string): void {
    this.localeService.setLocale(locale);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onProfile(): void {
    this.profile.emit();
  }
}
