import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Tipo di schermo corrente (copia 1:1 da mariosite).
 * CDK XSmall → 'small' · Small → 'medium' · Medium → 'large' ·
 * Large/XLarge → 'extra-large'.
 */
export type ScreenType = 'small' | 'medium' | 'large' | 'extra-large';

/**
 * Espone lo `screenType$` corrente come Observable, derivato dal CDK
 * BreakpointObserver. Usato da `SiteShellComponent` e dalla direttiva
 * `[appScreenType]`. Affianca il `ResponsiveService` esistente finché la
 * migrazione non lo rende ridondante.
 * Mirror di ~/marianoscada-site/.../shared/services/breakpoint-helper.service.ts
 */
@Injectable({
  providedIn: 'root',
})
export class BreakpointHelperService {
  // === DI ===
  private readonly breakpointObserver = inject(BreakpointObserver);

  // === State ===
  readonly screenType$ = new BehaviorSubject<ScreenType>('medium');

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
      shareReplay({ bufferSize: 1, refCount: true })
    );

  // === Constructor (setup) ===
  constructor() {
    // ⚠️ Subscription persistente: service singleton, vive per tutta la vita
    // dell'app — nessun cleanup necessario.
    this._screenType$.subscribe(this.screenType$);
  }
}
