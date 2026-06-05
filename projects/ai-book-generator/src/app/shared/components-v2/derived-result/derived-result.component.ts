import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type { DerivedContent } from '../../../core/domain';

/**
 * DerivedResultComponent — rende il **risultato di un derivato** (riassunto,
 * presentazione, quiz, manuale, guida, traduzione) in **sola lettura**. Dumb:
 * riceve `content` dal padre e fa lo switch sul tipo; nessuna logica di dominio.
 * Tutti i dati arrivano dal server (via store), il componente solo li visualizza.
 */
@Component({
  selector: 'app-derived-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'derived-result' },
  imports: [MatIconModule],
  templateUrl: './derived-result.component.html',
  styleUrl: './derived-result.component.scss',
})
export class DerivedResultComponent {
  readonly content = input.required<DerivedContent>();
}
