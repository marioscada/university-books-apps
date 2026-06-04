import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type { Tone } from '../tone';

/**
 * TagReadoutComponent — readout dumb/presentational di un valore "in chiaro":
 * un'etichetta seguita da una **chip** colorata (icona opzionale + testo).
 * Es. "Modello scelto: [● Report]".
 *
 * Sola lettura, nessun output. Generico e riusabile (mostra qualunque coppia
 * etichetta→valore). i18n-agnostico; tono via token globali `--tone-*`/`--accent-*`.
 * `OnPush` + signals.
 *
 * @example
 * ```html
 * <app-tag-readout [label]="'Modello scelto:'" [value]="'Report'" tone="violet" icon="analytics" />
 * ```
 */
@Component({
  selector: 'app-tag-readout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'tag-readout',
    '[style.--readout-bg]': 'toneBg()',
    '[style.--readout-fg]': 'toneFg()',
  },
  template: `
    @if (label()) {
      <span class="tag-readout__label">{{ label() }}</span>
    }
    <span class="tag-readout__chip">
      @if (icon()) {
        <mat-icon class="tag-readout__icon" fontSet="material-symbols-outlined" aria-hidden="true">{{ icon() }}</mat-icon>
      }
      <span class="tag-readout__value">{{ value() }}</span>
    </span>
  `,
  styleUrl: './tag-readout.component.scss',
})
export class TagReadoutComponent {
  /** Etichetta prima della chip (già tradotta). */
  readonly label = input<string>('');
  /** Valore mostrato nella chip (già tradotto). */
  readonly value = input<string>('');
  /** Icona Material Symbols dentro la chip (opzionale). */
  readonly icon = input<string>('');
  /** Tono cromatico della chip. */
  readonly tone = input<Tone>('accent');

  protected readonly toneBg = computed(() =>
    this.tone() === 'accent'
      ? 'var(--accent-100)'
      : `var(--tone-${this.tone()}-bg, var(--accent-100))`,
  );
  protected readonly toneFg = computed(() =>
    this.tone() === 'accent'
      ? 'var(--accent-700)'
      : `var(--tone-${this.tone()}-fg, var(--accent-700))`,
  );
}
