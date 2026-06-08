import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';

/**
 * ActionBarComponent — barra di azioni dumb/presentational con tre aree
 * proiettate: **start** (sinistra), **center** (centro, es. stepper) e **end**
 * (destra). Layout a griglia `1fr auto 1fr`: il centro resta centrato anche
 * quando start/end sono vuoti.
 *
 * Puro layout: nessun dato, nessuna logica, nessun output — i contenuti
 * (bottoni, link…) arrivano via content projection dal padre. Opzionalmente
 * `sticky` (resta in basso allo scroll). Stile dai soli token globali.
 *
 * @example
 * ```html
 * <app-action-bar sticky>
 *   <app-back-link start [label]="'Indietro'" (navigate)="back()" />
 *   <button end mat-flat-button color="primary" (click)="next()">Continua</button>
 * </app-action-bar>
 * ```
 */
@Component({
  selector: 'app-action-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'action-bar',
    '[class.is-sticky]': 'sticky()',
    '[class.is-top]': "placement() === 'top'",
  },
  template: `
    <div class="action-bar__inner">
      <div class="action-bar__start">
        <ng-content select="[start]" />
      </div>
      <div class="action-bar__center">
        <ng-content select="[center]" />
      </div>
      <div class="action-bar__end">
        <ng-content select="[end]" />
      </div>
    </div>
  `,
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  /** Rende la barra appiccicata (in basso, o in alto se `placement="top"`). */
  readonly sticky = input(false, { transform: booleanAttribute });
  /** Posizione della barra: in basso (default) o in alto sotto l'header. */
  readonly placement = input<'top' | 'bottom'>('bottom');
}
