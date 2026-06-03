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
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico della status pill: pilota i colori (via token) della pillola di
 * stato, restando agnostico dal dominio. Esportato per consumo dei genitori.
 */
export type StatusTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'violet';

/**
 * EntityCardComponent — card generica di "item" (libro / progetto / documento)
 * per qualunque griglia di catalogo. Dumb/presentational al 100%: nessun DI,
 * nessuna logica di dominio, solo `input()`/`output()` + content projection.
 *
 * Struttura: area cover proiettata + status pill, riga tipo/meta, barra di
 * avanzamento opzionale, badge "pubblicato", footer, e uno slot per il menu
 * azioni in alto a destra. Cliccando il corpo della card emette `open`
 * (accessibile da tastiera); il menu proiettato NON propaga `open`.
 *
 * **Self-responsive** via `ScreenTypeDirective` (host `isSmall/…`). Stile
 * self-contained sui soli token globali; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-entity-card
 *   [title]="book.title"
 *   [statusLabel]="'In bozza'"
 *   statusTone="warning"
 *   [typeLabel]="'Saggio'"
 *   [metaLabel]="'Aggiornato oggi'"
 *   [footerLabel]="'12 capitoli'"
 *   [progress]="42"
 *   [progressLabel]="'42% completato'"
 *   published
 *   [publishedLabel]="'Pubblicato'"
 *   (open)="openBook(book.id)"
 * >
 *   <div cover class="my-gradient"></div>
 *   <button mat-icon-button menu [matMenuTriggerFor]="actions">
 *     <mat-icon fontSet="material-symbols-outlined">more_vert</mat-icon>
 *   </button>
 * </app-entity-card>
 * ```
 */
@Component({
  selector: 'app-entity-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './entity-card.component.html',
  styleUrl: './entity-card.component.scss',
  host: {
    class: 'entity-card',
  },
})
export class EntityCardComponent {
  /** Titolo dell'item (obbligatorio). */
  readonly title = input.required<string>();

  /** Testo della status pill (già tradotto); vuoto = pill nascosta. */
  readonly statusLabel = input<string>('');
  /** Tono cromatico della status pill. */
  readonly statusTone = input<StatusTone>('neutral');

  /** Etichetta del tipo (es. "Saggio"). */
  readonly typeLabel = input<string>('');
  /** Riga meta secondaria (es. "Aggiornato oggi"). */
  readonly metaLabel = input<string>('');

  /** Footer (es. "12 capitoli"). */
  readonly footerLabel = input<string>('');

  /** Percentuale 0–100; `null` = nessuna barra. */
  readonly progress = input<number | null>(null);
  /** Etichetta accanto alla barra di avanzamento (già tradotta). */
  readonly progressLabel = input<string>('');

  /** Mostra il badge "pubblicato" (globo + label) quando true. */
  readonly published = input(false, { transform: booleanAttribute });
  /** Etichetta del badge "pubblicato" (già tradotta). */
  readonly publishedLabel = input<string>('');

  /** Emesso attivando il corpo della card (NON dal menu). */
  readonly open = output<void>();

  /** Percentuale normalizzata in 0–100 per `mat-progress-bar`. */
  protected readonly progressValue = computed<number>(() => {
    const raw = this.progress();
    const value = numberAttribute(raw, 0);
    return Math.min(100, Math.max(0, value));
  });

  /** True quando va mostrata la barra di avanzamento. */
  protected readonly hasProgress = computed<boolean>(
    () => this.progress() !== null,
  );

  /** Attiva il corpo della card (mouse). */
  protected activate(): void {
    this.open.emit();
  }

  /** Attiva il corpo della card da tastiera (Enter/Space). */
  protected onKey(event: Event): void {
    event.preventDefault();
    this.open.emit();
  }

  /**
   * Ferma la propagazione attorno allo slot menu così che interagire col menu
   * azioni non attivi mai `open`.
   */
  protected stopMenu(event: Event): void {
    event.stopPropagation();
  }
}
