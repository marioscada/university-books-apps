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

export interface LocaleItem {
  /** ISO 639-1 (`en`, `it`, `de`): pilota il flag SVG e l'etichetta. */
  readonly id: string;
}

/** Nomi lingua (in attesa di ngx-translate: hardcoded come fallback). */
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  it: 'Italiano',
  de: 'Deutsch',
};

/**
 * LanguageSwitcher — flag SVG + etichetta locale + dropdown. Mirror 1:1 di
 * mariosite (flag in `images/flags/<id>.svg`), senza ngx-translate (nomi
 * lingua hardcoded). Componente dump: lo stato locale vive nel parent.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
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

  protected readonly menuItems = computed(() =>
    this.locales().map((locale) => ({
      id: locale.id,
      name: LOCALE_NAMES[locale.id] ?? locale.id.toUpperCase(),
    })),
  );

  protected onSelect(locale: string): void {
    if (locale !== this.currentLocale()) {
      this.localeChange.emit(locale);
    }
  }
}
