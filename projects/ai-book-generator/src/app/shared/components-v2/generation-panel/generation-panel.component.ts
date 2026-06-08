import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * GenerationPanelComponent — pannello UNICO di **elaborazione/attesa**
 * (dumb/presentational): copertina con spinner, heading, riga di dettaglio
 * (`% — testo`) e Annulla. L'avanzamento "a passi" è mostrato dalla barra
 * segmentata sopra (vedi `segmented-progress`), non qui.
 *
 * `flat` rimuove la chrome di card per l'uso **dentro un dialog**. OnPush +
 * signals, token globali.
 *
 * @example
 * ```html
 * <app-generation-panel
 *   loading [coverTitle]="title()" coverKicker="REPORT"
 *   heading="Sto generando il tuo report…"
 *   [percent]="64" [detailLabel]="'Scrittura capitolo 4 di 6'"
 *   cancelLabel="Annulla" (cancelled)="onCancel()" />
 * ```
 */
@Component({
  selector: 'app-generation-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'generation-panel',
    '[class.is-flat]': 'flat()',
  },
  imports: [MatIconModule],
  templateUrl: './generation-panel.component.html',
  styleUrl: './generation-panel.component.scss',
})
export class GenerationPanelComponent {
  // --- Copertina (opzionale) --------------------------------------------------
  /** Mostra la copertina libro. */
  readonly showCover = input(true, { transform: booleanAttribute });
  readonly coverKicker = input<string>('');
  readonly coverTitle = input<string>('');
  readonly coverBrand = input<string>('SCADÁ');
  /** Colore della copertina (qualsiasi CSS color/var). */
  readonly coverColor = input<string>('var(--tone-violet-fg, #6b3fb5)');
  /** Mostra lo spinner di elaborazione al centro della copertina. */
  readonly loading = input(false, { transform: booleanAttribute });

  // --- Testi + avanzamento ----------------------------------------------------
  readonly heading = input<string>('');
  readonly percent = input(0, { transform: numberAttribute });
  /** Sotto-step corrente (es. "Scrittura capitolo 4 di 6"). */
  readonly detailLabel = input<string>('');

  // --- Azioni / layout --------------------------------------------------------
  /** Etichetta del bottone Annulla (vuoto = nascosto). */
  readonly cancelLabel = input<string>('');
  /** Variante senza chrome di card (per dialog / contenitori). */
  readonly flat = input(false, { transform: booleanAttribute });

  /** Emesso all'Annulla. */
  readonly cancelled = output<void>();

  /** Percentuale normalizzata 0–100. */
  protected readonly clamped = computed(() =>
    Math.max(0, Math.min(100, Math.round(this.percent()))),
  );
}
