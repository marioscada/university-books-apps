import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface OutputType {
  /** Nome icona Material Symbols. */
  icon: string;
  /** Titolo del tipo di output. */
  label: string;
  /** Descrizione breve (1 riga). */
  description: string;
}

/**
 * OutputTypes — griglia centrata dei tipi di output generabili.
 * Sezione "Cosa puoi creare" della Home. Sfondo alternato via :nth-of-type
 * dell'host (coerente con content-section). Vedi docs/CREATE-PAGE-DESIGN.md §5.
 */
@Component({
  selector: 'app-output-types',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './output-types.component.html',
  styleUrl: './output-types.component.scss',
})
export class OutputTypesComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly items = input<readonly OutputType[]>([]);
}
