import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tonalità semantica della stat: tinta icona/accento senza imporre semantica di dominio.
 */
export type StatTone = 'neutral' | 'accent' | 'success' | 'warning' | 'info';

/**
 * StatCard — card metrica/filtro compatta (valore grande + label + icona),
 * dumb/presentational e **riusabile** in qualsiasi progetto (stat di dashboard
 * oppure filtri tipo chip-as-card).
 *
 * Il valore è già formattato dal padre (es. "128", "12.4k", "€3.200"). La `tone`
 * mappa una classe sull'host (`is-accent`/`is-success`/…) che colora icona e
 * accento via token CSS. Con `interactive` la card diventa un bottone accessibile
 * (`role=button`, focusabile, operabile da tastiera) ed emette `activate`; con
 * `selected` mostra il ring/sfondo accento (`aria-pressed`). Senza `interactive`
 * è una pura card di display, priva di semantica bottone.
 *
 * **Self-responsive** via `ScreenTypeDirective` (host `isSmall/…`); stile
 * self-contained sui soli token globali. Nessuna logica di dominio.
 *
 * @example
 * ```html
 * <!-- Stat di dashboard (display) -->
 * <app-stat-card label="Progetti attivi" value="128" icon="folder" tone="accent" />
 *
 * <!-- Filtro selezionabile (chip-as-card) -->
 * <app-stat-card
 *   label="In bozza"
 *   value="12"
 *   icon="edit_note"
 *   tone="warning"
 *   interactive
 *   [selected]="filter() === 'draft'"
 *   (activate)="filter.set('draft')"
 * />
 * ```
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: {
    class: 'stat-card',
    '[class]': 'toneClass()',
    '[class.is-interactive]': 'interactive()',
    '[class.is-selected]': 'selected()',
    '[attr.role]': 'interactive() ? "button" : null',
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '[attr.aria-pressed]': 'interactive() ? selected() : null',
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  template: `
    @if (icon()) {
      <mat-icon class="stat-card__icon" fontSet="material-symbols-outlined" aria-hidden="true">{{
        icon()
      }}</mat-icon>
    }
    <span class="stat-card__body">
      <span class="stat-card__value">{{ value() }}</span>
      <span class="stat-card__label">{{ label() }}</span>
    </span>
  `,
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  /** Etichetta descrittiva (già tradotta dal padre). */
  readonly label = input.required<string>();

  /** Valore già formattato dal padre (es. "128", "12.4k"). */
  readonly value = input.required<string>();

  /** Icona Material Symbols (vuoto = nessuna icona). */
  readonly icon = input<string>('');

  /** Tonalità semantica: tinta icona/accento. */
  readonly tone = input<StatTone>('neutral');

  /** Stato selezionato (ring/sfondo accento); riflette `aria-pressed` se interattiva. */
  readonly selected = input(false, { transform: booleanAttribute });

  /** Rende la card un bottone accessibile e operabile da tastiera. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Emesso su click/Enter/Space quando `interactive`. */
  readonly activate = output<void>();

  /** Classe di tono applicata sull'host (`is-accent`/`is-success`/…). */
  protected readonly toneClass = computed(() => `is-${this.tone()}`);

  protected onActivate(): void {
    if (this.interactive()) {
      this.activate.emit();
    }
  }

  protected onKey(event: Event): void {
    if (this.interactive()) {
      event.preventDefault();
      this.activate.emit();
    }
  }
}
