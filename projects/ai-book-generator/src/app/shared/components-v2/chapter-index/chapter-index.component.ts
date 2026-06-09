import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Stato di un capitolo nell'indice (pilota icona + colore). */
export type ChapterStatus = 'review' | 'current' | 'generating' | 'todo';

/** Voce dell'indice capitoli (view-model dumb, i18n-agnostico). */
export interface ChapterItem {
  /** Chiave stabile (tracking + select). */
  key: string;
  /** Numero capitolo mostrato nel pallino. */
  index: number;
  /** Titolo del capitolo (già tradotto). */
  title: string;
  /** Stato (colore/icona). */
  status: ChapterStatus;
  /** Etichetta di stato a destra (già tradotta, opzionale). */
  statusLabel?: string;
  /** Sotto-sezioni (indice completo): voci annidate sotto il capitolo. */
  sections?: { key: string; title: string }[];
}

/**
 * ChapterIndexComponent — indice capitoli dumb/presentational: lista navigabile
 * con numero, titolo e **stato** (corrente = accent), voce selezionata
 * evidenziata. Opzionalmente **collassabile** (toggle nell'header) e con un link
 * "aggiungi".
 *
 * Non ospita il contenuto del capitolo (vedi `app-chapter-reader`): emette solo
 * `select(key)`. Riusabile su desktop (3 pannelli), mobile (accordion) e in sola
 * lettura. i18n-agnostico, `OnPush` + signals, token globali, a11y (lista, voce
 * corrente `aria-current`).
 *
 * @example
 * ```html
 * <app-chapter-index
 *   [heading]="'Indice'" [countLabel]="'8 capitoli'"
 *   [chapters]="chapters()" [selectedKey]="openKey()"
 *   (select)="openKey.set($event)" />
 * ```
 */
@Component({
  selector: 'app-chapter-index',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chapter-index', '[class.is-collapsed]': 'collapsed()' },
  imports: [MatIconModule],
  templateUrl: './chapter-index.component.html',
  styleUrl: './chapter-index.component.scss',
})
export class ChapterIndexComponent {
  /** Titolo dell'indice (già tradotto). */
  readonly heading = input<string>('');
  /** Conteggio/stato sintetico (es. "5 di 8 approvati", già tradotto). */
  readonly countLabel = input<string>('');
  /** Voci dell'indice. */
  readonly chapters = input<ChapterItem[]>([]);
  /** Chiave del capitolo selezionato. */
  readonly selectedKey = input<string>('');
  /** Etichetta del link "aggiungi capitolo" (vuoto = nascosto). */
  readonly addLabel = input<string>('');
  /** Mostra il toggle di collasso del pannello. */
  readonly collapsible = input(false, { transform: booleanAttribute });

  /** Stato collassato (two-way), gestito dal padre per il layout. */
  readonly collapsed = model<boolean>(false);

  /** Emesso al click su una voce: porta la `key`. */
  readonly selected = output<string>();
  /** Emesso al click su "aggiungi capitolo". */
  readonly add = output<void>();

  /** Icona Material per stato (numero a parte). */
  protected icon(status: ChapterStatus): string {
    return status === 'generating' ? 'progress_activity' : '';
  }
}
