import { effect, Injectable, Signal, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { LocaleItem } from '../layout/language-switcher/language-switcher.component';

const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'abg.locale';
const FLAG_BASE = 'images/flags';

/** Lingue supportate (single source). `name` = chiave i18n del nome lingua. */
const SUPPORTED_LOCALES: readonly LocaleItem[] = [
  { id: 'en', name: 'i18n.Common.LanguageSwitcher.Language.en' },
  { id: 'it', name: 'i18n.Common.LanguageSwitcher.Language.it' },
  { id: 'de', name: 'i18n.Common.LanguageSwitcher.Language.de' },
];

/**
 * LocaleService — UNICA fonte della lingua attiva (singleton). Mirror del
 * pattern customer-portal/mariosite:
 *  • registra i flag SVG UNA volta sul MatIconRegistry (no flicker);
 *  • a ogni cambio: `TranslateService.use()` (le `| translate` si ri-renderano),
 *    `<html lang>` aggiornato, scelta persistita in localStorage.
 * Default EN. Ordine iniziale: localStorage → navigator.language → EN.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translate = inject(TranslateService);

  readonly locales: readonly LocaleItem[] = SUPPORTED_LOCALES;

  private readonly _currentLocale = signal(this.readInitial());
  readonly currentLocale: Signal<string> = this._currentLocale.asReadonly();

  constructor() {
    this.registerFlagIcons();
    effect(() => {
      const locale = this._currentLocale();
      this.translate.use(locale);
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // storage non disponibile → resta in memoria.
      }
      this.document.documentElement.lang = locale;
    });
  }

  setLocale(locale: string): void {
    if (this.isSupported(locale)) {
      this._currentLocale.set(locale);
    }
  }

  private registerFlagIcons(): void {
    for (const locale of SUPPORTED_LOCALES) {
      this.iconRegistry.addSvgIcon(
        locale.id,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${FLAG_BASE}/${locale.id}.svg`),
      );
    }
  }

  private readInitial(): string {
    // Default EN per scelta di prodotto (niente auto-detect del browser):
    // si parte sempre in EN, salvo la scelta utente persistita in localStorage.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && this.isSupported(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return DEFAULT_LOCALE;
  }

  private isSupported(id: string): boolean {
    return SUPPORTED_LOCALES.some((l) => l.id === id);
  }
}
