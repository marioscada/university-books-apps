import { Injectable, inject, signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { LocaleItem } from '../layout/language-switcher/language-switcher.component';

/**
 * LocaleService — UNICA fonte della lingua attiva, condivisa da tutto il sito
 * (singleton providedIn root). Il language switcher nell'header legge/scrive
 * qui, quindi la scelta persiste navigando tra le pagine (e tra sessioni, via
 * localStorage). i18n vero (ngx-translate) non ancora cablato: per ora guida
 * solo flag/etichetta.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private static readonly STORAGE_KEY = 'abg.locale';
  private static readonly DEFAULT = 'it';

  /** Lingue disponibili (single source per il language switcher). */
  readonly locales: readonly LocaleItem[] = [{ id: 'en' }, { id: 'it' }, { id: 'de' }];

  /** Lingua attiva come signal condiviso. */
  readonly locale = signal<string>(this.readStored());

  constructor() {
    // Registra i flag SVG UNA volta sola (singleton) → niente re-fetch/flicker
    // quando l'header viene ricreato cambiando pagina.
    const registry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    for (const { id } of this.locales) {
      registry.addSvgIcon(
        id,
        sanitizer.bypassSecurityTrustResourceUrl(`images/flags/${id}.svg`),
      );
    }
  }

  /** Imposta la lingua e la persiste. */
  set(locale: string): void {
    if (locale === this.locale()) return;
    this.locale.set(locale);
    try {
      localStorage.setItem(LocaleService.STORAGE_KEY, locale);
    } catch {
      // storage non disponibile (es. modalità privata) → resta in memoria.
    }
  }

  private readStored(): string {
    try {
      const stored = localStorage.getItem(LocaleService.STORAGE_KEY);
      if (stored && this.locales.some((l) => l.id === stored)) {
        return stored;
      }
    } catch {
      // ignore
    }
    return LocaleService.DEFAULT;
  }
}
