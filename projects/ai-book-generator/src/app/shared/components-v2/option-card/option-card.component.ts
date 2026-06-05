import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * OptionCardComponent — card dumb/presentational per un'area di personalizzazione
 * apribile (es. Lunghezza, Struttura, Font e stile).
 *
 * Mostra: glifo, titolo, descrizione, un bottone **azione** ("Apri") in alto a
 * destra, e — quando `modified` — un badge "modificato" (verde, senza sfondo) +
 * un link "ripristina default" + un dettaglio testuale. **Non** è cliccabile per
 * intero: le azioni sono bottoni espliciti (apri / ripristina), così restano
 * indipendenti.
 *
 * Dumb e generico: nessun dominio, etichette via input (i18n-agnostico), altezza
 * piena per allinearsi alle card sorelle in una riga. `OnPush` + signals; stile
 * dai soli token globali.
 *
 * @example
 * ```html
 * <app-option-card
 *   glyph="↔" [title]="'Lunghezza'"
 *   [description]="'Più lungo o più corto — in pagine o parole.'"
 *   [openLabel]="'Apri'"
 *   [modified]="true" [modifiedLabel]="'Modificato'"
 *   [resetLabel]="'Ripristina default'"
 *   [detail]="'≈ 30 pagine — più lungo del default (~20).'"
 *   (open)="openEditor()" (reset)="resetArea()" />
 * ```
 */
@Component({
  selector: 'app-option-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'option-card',
    '[class.is-modified]': 'modified()',
  },
  templateUrl: './option-card.component.html',
  styleUrl: './option-card.component.scss',
})
export class OptionCardComponent {
  /** Glifo/etichetta dell'icona (testo, es. "↔" o "Aa"). */
  readonly glyph = input<string>('');
  /** Titolo dell'area (già tradotto). */
  readonly title = input<string>('');
  /** Descrizione breve (già tradotta). */
  readonly description = input<string>('');
  /** Etichetta del bottone d'apertura (es. "Apri"). */
  readonly openLabel = input<string>('');

  /** Area modificata rispetto al default del modello. */
  readonly modified = input(false, { transform: booleanAttribute });
  /** Etichetta del badge "modificato" (già tradotta). */
  readonly modifiedLabel = input<string>('');
  /** Etichetta del link "ripristina default" (già tradotta). */
  readonly resetLabel = input<string>('');
  /** Dettaglio testuale mostrato quando modificata (es. il valore corrente). */
  readonly detail = input<string>('');

  /** Emesso attivando il bottone d'apertura. */
  readonly open = output<void>();
  /** Emesso attivando "ripristina default". */
  readonly resetDefault = output<void>();
}
