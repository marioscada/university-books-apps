import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Tipo di schermo corrente (copia 1:1 da mariosite).
 * CDK XSmall → 'small' · Small → 'medium' · Medium → 'large' ·
 * Large/XLarge → 'extra-large'.
 */
export type ScreenType = 'small' | 'medium' | 'large' | 'extra-large';

/**
 * Espone il tipo di schermo corrente derivato dal CDK `BreakpointObserver`.
 *
 * API pubblica (signals-first):
 *  • `screenType` — **Signal**, single source of truth: i consumer (template via
 *    `screenType()`, direttive via `effect`) leggono lo stato senza subscribe.
 *  • `screenType$` — versione Observable, per chi necessita ancora di async pipe.
 *
 * Mirror di ~/marianoscada-site/.../shared/services/breakpoint-helper.service.ts
 */
@Injectable({
  providedIn: 'root',
})
export class BreakpointHelperService {
  // === DI ===
  private readonly breakpointObserver = inject(BreakpointObserver);

  // === State ===
  /** Sorgente sincrona con valore corrente, alimentata dal BreakpointObserver. */
  readonly screenType$ = new BehaviorSubject<ScreenType>('medium');

  /** Stato corrente come Signal — primitiva reattiva preferita per i consumer. */
  readonly screenType: Signal<ScreenType> = toSignal(this.screenType$, {
    initialValue: 'medium',
  });

  private readonly _screenType$: Observable<ScreenType> = this.breakpointObserver
    .observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
    .pipe(
      map((result) => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          return 'small';
        }
        if (result.breakpoints[Breakpoints.Small]) {
          return 'medium';
        }
        if (result.breakpoints[Breakpoints.Medium]) {
          return 'large';
        }
        if (
          result.breakpoints[Breakpoints.Large] ||
          result.breakpoints[Breakpoints.XLarge]
        ) {
          return 'extra-large';
        }
        return 'medium';
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

  // === Constructor (setup) ===
  constructor() {
    // ⚠️ Persistent subscription: service singleton (providedIn root), fa da bridge
    // tra il BreakpointObserver e il BehaviorSubject che alimenta la signal.
    // Vive per l'intera durata dell'app — nessun cleanup necessario.
    this._screenType$.subscribe(this.screenType$);
  }
}
