import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * NoDataComponent — empty-state riutilizzabile: immagine centrale + messaggio
 * **dinamico** (input, già tradotto). Mirror del `no-data` di customer-portal
 * (azzurro), adattato senza Ionic. Dimensioni override-abili via CSS vars
 * (`--no-data-*`).
 */
@Component({
  selector: 'app-no-data',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.scss',
})
export class NoDataComponent {
  /** Messaggio mostrato sotto l'immagine (già tradotto). */
  readonly message = input<string>();
}
