import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentSectionData } from './content-section.types';

/**
 * ContentSection — blocco di contenuto polimorfico (testo + media opzionale)
 * usato per ogni sezione sotto l'hero. Lo **sfondo alternato** (zebra striping)
 * è automatico via `:host(:nth-of-type(even))` nello SCSS. Layout selezionato
 * via `[class]="'content-section--' + layout"`. Pattern fedele a mariosite.
 */
@Component({
  selector: 'app-content-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './content-section.component.html',
  styleUrl: './content-section.component.scss',
})
export class ContentSectionComponent {
  readonly data = input.required<ContentSectionData>();
}
