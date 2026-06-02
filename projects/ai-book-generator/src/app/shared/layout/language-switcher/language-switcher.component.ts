import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

export interface LocaleItem {
  /** ISO 639-1 (`en`, `it`, `de`): pilota il flag SVG e l'etichetta. */
  readonly id: string;
  /** Chiave i18n del nome lingua (es. `i18n.Common.LanguageSwitcher.Language.en`). */
  readonly name: string;
}

/**
 * LanguageSwitcher — flag SVG + codice locale + dropdown coi nomi lingua
 * tradotti. Mirror 1:1 di mariosite. Componente dump: lo stato e la
 * registrazione dei flag vivono nel LocaleService (singleton).
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly currentLocale = input.required<string>();
  readonly locales = input.required<readonly LocaleItem[]>();
  readonly ariaLabel = input<string>('Cambia lingua');

  readonly localeChange = output<string>();

  protected readonly displayLabel = computed(() => this.currentLocale().toUpperCase());

  protected onSelect(locale: string): void {
    if (locale !== this.currentLocale()) {
      this.localeChange.emit(locale);
    }
  }
}
