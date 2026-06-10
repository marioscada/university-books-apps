import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Tono del chip di stato del capitolo (mappa sui token globali dei toni). */
export type ChapterReaderTone = 'neutral' | 'accent' | 'success' | 'warning';

/**
 * ChapterReaderComponent — lettura di un capitolo, dumb/presentational: titolo,
 * chip di stato, meta (es. n° parole), corpo (paragrafi via input o contenuto
 * proiettato) e navigazione prev/successivo.
 *
 * Le modifiche al testo NON avvengono qui (si fanno via `app-ai-chat-panel`):
 * questo componente mostra e basta. i18n-agnostico (label/paragrafi via input),
 * `OnPush` + signals, token globali, a11y (heading, nav con aria-label).
 *
 * @example
 * ```html
 * <app-chapter-reader
 *   [title]="'6 · Opportunità e rischi'" [meta]="'≈ 1.240 parole'"
 *   [statusLabel]="'Da rivedere'" statusTone="warning"
 *   [paragraphs]="chapter().paragraphs"
 *   [prevLabel]="'5 · Trend e scenari 2024'" [nextLabel]="'7 · Raccomandazioni'"
 *   (prev)="goPrev()" (next)="goNext()" />
 * ```
 */
@Component({
  selector: 'app-chapter-reader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chapter-reader' },
  imports: [MatIconModule],
  templateUrl: './chapter-reader.component.html',
  styleUrl: './chapter-reader.component.scss',
})
export class ChapterReaderComponent {
  /** Titolo del documento/libro (overline sopra il titolo del capitolo). */
  readonly documentTitle = input<string>('');
  /** Titolo del capitolo (già tradotto/composto, es. "6 · Opportunità e rischi"). */
  readonly title = input<string>('');
  /** Meta sotto il titolo (es. "≈ 1.240 parole", già tradotto). */
  readonly meta = input<string>('');
  /** Etichetta del chip di stato (vuoto = nessun chip). */
  readonly statusLabel = input<string>('');
  /** Tono del chip di stato. */
  readonly statusTone = input<ChapterReaderTone>('neutral');
  /** Paragrafi del corpo (in alternativa/aggiunta al contenuto proiettato). */
  readonly paragraphs = input<string[]>([]);
  /** Azione primaria in basso a destra del footer (vuoto = nascosta), es. "Pubblica". */
  readonly actionLabel = input<string>('');
  /** Icona (Material Symbols) dell'azione primaria, dopo l'etichetta. */
  readonly actionIcon = input<string>('');
  /** Etichetta del capitolo precedente (vuoto = disabilitato). */
  readonly prevLabel = input<string>('');
  /** Etichetta del capitolo successivo (vuoto = disabilitato). */
  readonly nextLabel = input<string>('');
  /** Mostra l'icona "apri a schermo intero" (stacca nel lettore immersivo). */
  readonly expandable = input(false, { transform: booleanAttribute });

  /** Emesso al click su "apri a schermo intero". */
  readonly expand = output<void>();
  /** Emesso al click sull'azione primaria del footer. */
  readonly action = output<void>();
  /** Emesso al capitolo precedente. */
  readonly prev = output<void>();
  /** Emesso al capitolo successivo. */
  readonly next = output<void>();

  /** Un blocco è un heading markdown se inizia con 1–6 `#` seguiti da spazio. */
  protected isHeading(block: string): boolean {
    return /^#{1,6}\s/.test(block);
  }
  /** Livello del heading (1–6). */
  protected headingLevel(block: string): number {
    return block.match(/^(#{1,6})\s/)?.[1].length ?? 0;
  }
  /** Testo del heading senza i `#`. */
  protected headingText(block: string): string {
    return block.replace(/^#{1,6}\s+/, '');
  }
}
