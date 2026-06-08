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

/** Stato di uno step della pipeline mostrata nel pannello. */
export type GenStepStatus = 'done' | 'current' | 'todo';

/** Step della pipeline (view-model dumb, i18n-agnostico). */
export interface GenStep {
  /** Etichetta (già tradotta). */
  label: string;
  status: GenStepStatus;
  /** Icona Material opzionale nel pallino (override del default per stato). */
  icon?: string;
}

/**
 * GenerationPanelComponent — pannello UNICO di **elaborazione/attesa**
 * (dumb/presentational), riusabile ovunque: generazione indice, generazione
 * capitoli, **attesa di pubblicazione/render**, derivati… Tutto è iniettato dal
 * padre (cover, stato, heading, step, %, sotto-step, ETA, annulla): il componente
 * non conosce il dominio.
 *
 * `flat` rimuove la chrome di card per l'uso **dentro un dialog** o un altro
 * contenitore. `OnPush` + signals, token globali, a11y (progressbar, `aria-live`).
 *
 * @example
 * ```html
 * <app-generation-panel
 *   [coverTitle]="title()" coverKicker="REPORT"
 *   statusLabel="In generazione…" heading="Sto generando il tuo report…"
 *   [subtitle]="'Analizzo le fonti, scrivo le sezioni e impagino il documento.'"
 *   [steps]="steps()" [percent]="64" [detailLabel]="'Scrittura capitolo 4 di 6'"
 *   etaLabel="~1 min rimanente" cancelLabel="Annulla" (cancel)="onCancel()" />
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

  // --- Testi ------------------------------------------------------------------
  readonly statusLabel = input<string>('');
  readonly heading = input<string>('');
  readonly subtitle = input<string>('');

  // --- Pipeline + avanzamento -------------------------------------------------
  /**
   * Mostra lo stepper interno. **Opt-in**: è il PADRE a decidere se visualizzarlo
   * (`showSteps`) e quali step passare (`steps`). Il figlio si limita a mostrarli;
   * ogni aggiornamento arriva dal padre (signals → reattività massima).
   */
  readonly showSteps = input(false, { transform: booleanAttribute });
  readonly steps = input<GenStep[]>([]);
  readonly percent = input(0, { transform: numberAttribute });
  /** Sotto-step corrente (es. "Scrittura capitolo 4 di 6"). */
  readonly detailLabel = input<string>('');
  readonly etaLabel = input<string>('');

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
