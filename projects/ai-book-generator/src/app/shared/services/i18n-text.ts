import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

/**
 * `injectI18nText()` — risolutore di traduzioni **reattivo** da usare dentro i
 * `computed()` dei componenti. Ritorna una funzione `t(key, params?)` che:
 *  - legge un "tick" i18n (lingua/traduzioni/fallback) così i `computed` che la
 *    usano si **ricalcolano** al cambio lingua o al caricamento delle traduzioni;
 *  - delega a `TranslateService.instant`.
 *
 * Da chiamare in injection context (inizializzatore di campo del componente):
 *   `private readonly t = injectI18nText();`
 * Sostituisce il pattern duplicato `i18nTick` + `t()` nei componenti.
 */
export function injectI18nText(): (key: string, params?: object) => string {
  const translate = inject(TranslateService);

  const tick = toSignal(
    merge(
      translate.onLangChange,
      translate.onTranslationChange,
      translate.onFallbackLangChange,
    ).pipe(map(() => Symbol())),
    { initialValue: Symbol() },
  );

  return (key: string, params?: object): string => {
    tick(); // dipendenza reattiva: ricalcola al cambio lingua/traduzioni
    return translate.instant(key, params);
  };
}
