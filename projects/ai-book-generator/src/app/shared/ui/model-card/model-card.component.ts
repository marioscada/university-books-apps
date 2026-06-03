import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico del riquadro icona (agnostico dal dominio): mappa su token
 * globali `--tone-<name>-{bg,fg}`. Esportato per consumo dei genitori.
 */
export type ModelTone =
  | 'info'
  | 'success'
  | 'amber'
  | 'warning'
  | 'rose'
  | 'violet'
  | 'danger'
  | 'neutral';

/**
 * ModelCardComponent — card "modello di pubblicazione" per la galleria di
 * creazione. Dumb/presentational al 100% (nessun DI, nessuna logica di dominio):
 * solo `input()`/`output()`.
 *
 * Struttura: riquadro icona a tono, titolo, descrizione, elenco di **highlight**
 * (parti salienti della struttura, ciascuna con spunta), footer con la **stima**
 * (pagine/slide/moduli) e freccia. Selezionabile (ring accento). Le label sono
 * già tradotte (i18n-agnostico).
 *
 * **Self-responsive** via `ScreenTypeDirective`; stile self-contained sui token
 * globali; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-model-card
 *   icon="menu_book"
 *   iconTone="info"
 *   [title]="'Libro'"
 *   [description]="'Un libro completo organizzato in capitoli.'"
 *   [highlights]="['Prefazione, indice, capitoli', 'Conclusione e bibliografia']"
 *   [estimateLabel]="'≈ 300 pagine'"
 *   (selectModel)="choose('book')"
 * />
 * ```
 */
@Component({
  selector: 'app-model-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: {
    class: 'model-card',
    role: 'button',
    '[attr.aria-pressed]': 'selected()',
    '[attr.tabindex]': '0',
    '[class.is-selected]': 'selected()',
    '[style.--model-tone-bg]': '"var(--tone-" + iconTone() + "-bg)"',
    '[style.--model-tone-fg]': '"var(--tone-" + iconTone() + "-fg)"',
    '(click)': 'activate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  template: `
    <span class="model-card__icon" aria-hidden="true">
      <mat-icon fontSet="material-symbols-outlined">{{ icon() }}</mat-icon>
    </span>

    <span class="model-card__title">{{ title() }}</span>
    @if (description()) {
      <span class="model-card__desc">{{ description() }}</span>
    }

    @if (highlights().length) {
      <ul class="model-card__highlights">
        @for (h of highlights(); track $index) {
          <li class="model-card__highlight">
            <mat-icon class="model-card__check" fontSet="material-symbols-outlined" aria-hidden="true">check</mat-icon>
            <span>{{ h }}</span>
          </li>
        }
      </ul>
    }

    <span class="model-card__footer">
      <span class="model-card__estimate">{{ estimateLabel() }}</span>
      <mat-icon class="model-card__arrow" fontSet="material-symbols-outlined" aria-hidden="true">arrow_forward</mat-icon>
    </span>
  `,
  styleUrl: './model-card.component.scss',
})
export class ModelCardComponent {
  /** Icona Material Symbols. */
  readonly icon = input<string>('');
  /** Tono del riquadro icona (mappa su token globali). */
  readonly iconTone = input<ModelTone>('neutral');
  /** Titolo del modello (già tradotto). */
  readonly title = input.required<string>();
  /** Descrizione breve (già tradotta). */
  readonly description = input<string>('');
  /** Parti salienti della struttura (già tradotte), una per riga con spunta. */
  readonly highlights = input<readonly string[]>([]);
  /** Stima sintetica (già tradotta), es. "≈ 300 pagine" / "Libero". */
  readonly estimateLabel = input<string>('');
  /** Stato selezionato (ring accento). */
  readonly selected = input(false, { transform: booleanAttribute });

  /** Emesso attivando la card (mouse/tastiera). */
  readonly selectModel = output<void>();

  protected activate(): void {
    this.selectModel.emit();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.selectModel.emit();
  }
}
