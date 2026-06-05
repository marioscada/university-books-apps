import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import { TextFieldComponent } from '../text-field/text-field.component';
import type { ModelTone } from '../model-card/model-card.component';

/**
 * Vista di una singola parte di struttura del documento (riga della lista).
 * Agnostica dal dominio: il padre traduce label/sublabel e mappa il tono icona
 * sui token globali `--tone-<name>-{bg,fg}`.
 */
export interface DocPartView {
  /** Chiave stabile della parte (usata negli output e nel tracking/reorder). */
  key: string;
  /** Etichetta principale (già tradotta). */
  label: string;
  /** Sotto-etichetta (es. lunghezza stimata, già tradotta). */
  sublabel: string;
  /** Icona Material Symbols del riquadro a tono. */
  icon: string;
  /** Tono cromatico del riquadro icona (mappa su token globali). */
  iconTone: ModelTone;
  /** La parte è inclusa nel documento. */
  included: boolean;
  /** La parte è opzionale (toggle); se false è obbligatoria (lucchetto). */
  optional: boolean;
  /** La parte è ripetibile (mostra lo stepper di conteggio). */
  repeatable: boolean;
  /** Numero di occorrenze correnti (per parti ripetibili). */
  count: number;
  /** Numero minimo di occorrenze. */
  countMin: number;
  /** Numero massimo di occorrenze. */
  countMax: number;
  /** Parole stimate per occorrenza. */
  wordCount: number;
}

/**
 * DocStructureListComponent — lista **editabile** delle parti di struttura di un
 * documento (la colonna "Struttura del documento" della pagina model-setup).
 *
 * Dumb/presentational al 100%: nessun DI di servizi/store, nessuna logica di
 * dominio; solo `input()`/`output()` (signals) + uno stato UI interno minimo
 * (`expandedKey`, quale riga ha l'editor aperto). Le label arrivano **già
 * tradotte** (i18n-agnostico).
 *
 * Ogni riga: maniglia di drag, riquadro icona a tono, blocco label + sottotitolo,
 * toggle includi/escludi (o lucchetto se obbligatoria) e un chevron che apre un
 * editor inline (stepper di conteggio per le parti ripetibili + campo parole). La
 * lista è riordinabile via drag&drop (`reorder` emette il nuovo ordine di chiavi).
 *
 * **Self-responsive** via `ScreenTypeDirective`; stile self-contained sui soli
 * token globali; rispetta `prefers-reduced-motion`; a11y integrata (ruoli/aria,
 * tastiera su elementi interattivi).
 *
 * @example
 * ```html
 * <app-doc-structure-list
 *   [parts]="parts()"
 *   [addSectionLabel]="'Aggiungi sezione'"
 *   [editLabel]="'Modifica'"
 *   [countLabel]="'Quante'"
 *   [wordsLabel]="'Parole per parte'"
 *   [activeLabel]="'Attiva'"
 *   [disabledLabel]="'Disattivata'"
 *   [requiredLabel]="'Obbligatoria'"
 *   [reorderHint]="'Trascina per riordinare'"
 *   (toggle)="onToggle($event)"
 *   (countChange)="onCount($event)"
 *   (wordChange)="onWords($event)"
 *   (reorder)="onReorder($event)"
 *   (addSection)="onAdd()"
 * />
 * ```
 */
@Component({
  selector: 'app-doc-structure-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    TextFieldComponent,
  ],
  templateUrl: './doc-structure-list.component.html',
  styleUrl: './doc-structure-list.component.scss',
  host: {
    class: 'doc-structure-list',
  },
})
export class DocStructureListComponent {
  /** Parti della struttura (riferimento immutabile dal padre). */
  readonly parts = input<DocPartView[]>([]);
  /** Abilita il riordino via drag&drop. */
  readonly reorderable = input(true, { transform: booleanAttribute });

  /** Etichetta del pulsante "aggiungi sezione" (già tradotta). */
  readonly addSectionLabel = input('');
  /** Etichetta del controllo di modifica (chevron), per a11y. */
  readonly editLabel = input('');
  /** Etichetta del controllo di conteggio (stepper), per a11y. */
  readonly countLabel = input('');
  /** Etichetta del campo parole. */
  readonly wordsLabel = input('');
  /** Etichetta della legenda "attiva". */
  readonly activeLabel = input('');
  /** Etichetta della legenda "disattivata". */
  readonly disabledLabel = input('');
  /** Suggerimento sul riordino (footer). */
  readonly reorderHint = input('');
  /** Etichetta/tooltip per le parti obbligatorie (lucchetto). */
  readonly requiredLabel = input('');

  /** Emesso al toggle di una parte opzionale: chiave della parte. */
  readonly toggleSection = output<string>();
  /** Emesso al variare del conteggio di una parte ripetibile. */
  readonly countChange = output<{ key: string; count: number }>();
  /** Emesso al variare delle parole per parte. */
  readonly wordChange = output<{ key: string; words: number }>();
  /** Emesso dopo un drag&drop: nuovo ordine completo delle chiavi. */
  readonly reorder = output<string[]>();
  /** Emesso attivando il pulsante "aggiungi sezione". */
  readonly addSection = output<void>();

  /** Chiave della riga il cui editor inline è aperto (`null` = nessuna). */
  protected readonly expandedKey = signal<string | null>(null);

  /** Apre/chiude l'editor inline della riga. */
  protected toggleExpanded(key: string): void {
    this.expandedKey.update((current) => (current === key ? null : key));
  }

  /** Riordino: sposta l'elemento ed emette il nuovo ordine di chiavi. */
  protected onDrop(event: CdkDragDrop<DocPartView[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const keys = this.parts().map((part) => part.key);
    moveItemInArray(keys, event.previousIndex, event.currentIndex);
    this.reorder.emit(keys);
  }

  /** Decremento del conteggio entro il minimo. */
  protected decrement(part: DocPartView): void {
    if (part.count > part.countMin) {
      this.countChange.emit({ key: part.key, count: part.count - 1 });
    }
  }

  /** Incremento del conteggio entro il massimo. */
  protected increment(part: DocPartView): void {
    if (part.count < part.countMax) {
      this.countChange.emit({ key: part.key, count: part.count + 1 });
    }
  }

  /** Normalizza la stringa del campo parole a intero non negativo ed emette. */
  protected onWords(key: string, raw: string): void {
    const parsed = parseInt(raw, 10);
    const words = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    this.wordChange.emit({ key, words });
  }

  /** Track per `@for` sulla chiave stabile della parte. */
  protected trackByKey(_index: number, part: DocPartView): string {
    return part.key;
  }
}
