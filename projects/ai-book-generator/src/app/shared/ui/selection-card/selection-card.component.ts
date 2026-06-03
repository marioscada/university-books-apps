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
 * SelectionCard — card selezionabile premium (icona + titolo + descrizione),
 * dumb/presentational e **riusabile** (tipo progetto, modalità AI, formati output).
 *
 * Selezione singola (`role=radio`) o multipla (`multi` → `role=checkbox`); stato
 * selezionato = ring accento + check. **Self-responsive** via `ScreenTypeDirective`
 * (host `isSmall/…`); stile self-contained sui token globali. Nessuna logica di
 * dominio: emette solo `select`, il padre decide.
 */
@Component({
  selector: 'app-selection-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: {
    class: 'selection-card',
    '[attr.role]': 'multi() ? "checkbox" : "radio"',
    '[attr.aria-checked]': 'selected()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[class.is-selected]': 'selected()',
    '[class.is-disabled]': 'disabled()',
    '(click)': 'activate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  template: `
    @if (icon()) {
      <mat-icon class="selection-card__icon" fontSet="material-symbols-outlined" aria-hidden="true">{{ icon() }}</mat-icon>
    }
    <span class="selection-card__body">
      <span class="selection-card__title">
        {{ title() }}
        @if (badge()) {
          <span class="selection-card__badge">{{ badge() }}</span>
        }
      </span>
      @if (description()) {
        <span class="selection-card__desc">{{ description() }}</span>
      }
    </span>
    <mat-icon class="selection-card__check" fontSet="material-symbols-outlined" aria-hidden="true">{{
      multi() ? 'check_box' : 'check_circle'
    }}</mat-icon>
  `,
  styleUrl: './selection-card.component.scss',
})
export class SelectionCardComponent {
  /** Icona Material Symbols. */
  readonly icon = input<string>('');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  /** Badge opzionale (es. "Pro"). */
  readonly badge = input<string>('');
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Selezione multipla (checkbox) invece di singola (radio). */
  readonly multi = input(false, { transform: booleanAttribute });

  readonly selectCard = output<void>();

  activate(): void {
    if (!this.disabled()) {
      this.selectCard.emit();
    }
  }

  onKey(event: Event): void {
    event.preventDefault();
    this.activate();
  }
}
