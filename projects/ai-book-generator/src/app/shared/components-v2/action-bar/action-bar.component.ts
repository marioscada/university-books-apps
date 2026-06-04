import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';

/**
 * ActionBarComponent — barra di azioni dumb/presentational con due aree
 * proiettate: **start** (sinistra) e **end** (destra). Tipicamente piè di pagina
 * con "Indietro" a sinistra e la CTA primaria a destra.
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
  },
  template: `
    <div class="action-bar__start">
      <ng-content select="[start]" />
    </div>
    <div class="action-bar__end">
      <ng-content select="[end]" />
    </div>
  `,
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  /** Rende la barra appiccicata in basso allo scroll. */
  readonly sticky = input(false, { transform: booleanAttribute });
}
