import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import type { ModelTone } from '../model-card/model-card.component';

/**
 * Una riga della sezione "statistiche" del riepilogo: una coppia etichetta/valore
 * con icona opzionale di guida.
 *
 * @property label - Didascalia muta (già tradotta) mostrata a sinistra.
 * @property value - Contenuto enfatizzato (già tradotto) mostrato a destra.
 * @property icon  - Nome icona Material Symbols opzionale accanto all'etichetta.
 */
export interface SummaryRow {
  label: string;
  value: string;
  icon?: string;
}

/**
 * Una modifica apportata rispetto ai default del modello: etichetta, dettaglio e
 * tono cromatico (mappato sui token globali `--tone-<tone>-fg`).
 *
 * @property label  - Cosa è cambiato (già tradotto), enfatizzato.
 * @property detail - Dettaglio della modifica (già tradotto), muto.
 * @property tone   - Tono del puntino indicatore.
 */
export interface ChangeRow {
  label: string;
  detail: string;
  tone: ModelTone;
}

/**
 * ProjectSummaryComponent — colonna "Riepilogo del progetto" della pagina di
 * setup del modello. Dumb/presentational al 100% (nessun DI, nessuna logica di
 * dominio): solo `input()`/`output()`, `OnPush`, standalone.
 *
 * Struttura a card con sezioni verticali separate da hairline:
 * - **Statistiche**: definition list etichetta/valore (icona opzionale).
 * - **Modifiche**: elenco di {@link ChangeRow} (puntino a tono + label + dettaglio)
 *   con un pulsante testuale "vedi tutte" che emette {@link viewAllChanges}.
 *   L'intera sezione è nascosta se `changes()` è vuoto.
 * - **Esclusi**: insieme di chip mute con le parti escluse; nascosta se vuoto.
 * - **Conferma**: box accentato rassicurante con icona di spunta.
 *
 * Le label arrivano **via input già tradotte** (i18n-agnostico). **Self-responsive**
 * via {@link ScreenTypeDirective}; stile self-contained sui token globali del design
 * system; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-project-summary
 *   [title]="'Riepilogo del progetto'"
 *   [rows]="[
 *     { label: 'Modello', value: 'Libro', icon: 'menu_book' },
 *     { label: 'Pagine', value: '≈ 300' }
 *   ]"
 *   [changesTitle]="'Modifiche'"
 *   [changes]="[
 *     { label: 'Tono', detail: 'Divulgativo → Accademico', tone: 'info' }
 *   ]"
 *   [changesMoreLabel]="'Vedi tutte le modifiche'"
 *   [excludedTitle]="'Parti escluse'"
 *   [excluded]="['Bibliografia', 'Esercizi']"
 *   [confirmTitle]="'Tutto pronto'"
 *   [confirmText]="'Potrai modificare ogni dettaglio in seguito.'"
 *   (viewAllChanges)="openChangesDialog()"
 * />
 * ```
 */
@Component({
  selector: 'app-project-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatChipsModule],
  host: {
    class: 'project-summary',
    role: 'group',
    '[attr.aria-label]': 'title() || null',
  },
  templateUrl: './project-summary.component.html',
  styleUrl: './project-summary.component.scss',
})
export class ProjectSummaryComponent {
  /** Titolo del riepilogo (già tradotto). Nascosto se vuoto. */
  readonly title = input('');

  /** Righe statistiche etichetta/valore. Array vuoto nasconde la lista. */
  readonly rows = input<SummaryRow[]>([]);

  /** Intestazione della sezione modifiche (già tradotta, resa maiuscola via CSS). */
  readonly changesTitle = input('');
  /** Modifiche rispetto ai default del modello. Array vuoto nasconde la sezione. */
  readonly changes = input<ChangeRow[]>([]);
  /** Etichetta del pulsante "vedi tutte le modifiche" (già tradotta). */
  readonly changesMoreLabel = input('');

  /** Intestazione della sezione parti escluse (già tradotta). */
  readonly excludedTitle = input('');
  /** Parti escluse rese come chip. Array vuoto nasconde la sezione. */
  readonly excluded = input<string[]>([]);

  /** Titolo del box di conferma (già tradotto). */
  readonly confirmTitle = input('');
  /** Testo rassicurante del box di conferma (già tradotto). */
  readonly confirmText = input('');

  /** Emesso quando l'utente richiede l'elenco completo delle modifiche. */
  readonly viewAllChanges = output<void>();

  /** True quando c'è almeno una riga statistica. */
  protected readonly hasRows = computed(() => this.rows().length > 0);
  /** True quando c'è almeno una modifica da mostrare. */
  protected readonly hasChanges = computed(() => this.changes().length > 0);
  /** True quando c'è almeno una parte esclusa. */
  protected readonly hasExcluded = computed(() => this.excluded().length > 0);
  /** True quando il box di conferma ha del contenuto. */
  protected readonly hasConfirm = computed(
    () => !!this.confirmTitle() || !!this.confirmText(),
  );

  protected emitViewAll(): void {
    this.viewAllChanges.emit();
  }
}
