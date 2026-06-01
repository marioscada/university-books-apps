import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ShowcaseItem {
  /** Immagine dell'esempio generato. */
  src: string;
  /** Alt accessibilità. */
  alt: string;
  /** Didascalia breve. */
  caption: string;
}

/**
 * OutputShowcase — gallery di esempi reali di output generati ("ecco cosa
 * otterrai"). Sezione conversione della Home. Sfondo alternato via
 * :nth-of-type dell'host. Vedi docs/CREATE-PAGE-DESIGN.md §5.
 */
@Component({
  selector: 'app-output-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './output-showcase.component.html',
  styleUrl: './output-showcase.component.scss',
})
export class OutputShowcaseComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly items = input<readonly ShowcaseItem[]>([]);
}
