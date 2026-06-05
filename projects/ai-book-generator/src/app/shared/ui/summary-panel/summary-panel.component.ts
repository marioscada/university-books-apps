import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * A single key/value entry rendered as one row of {@link SummaryPanelComponent}.
 *
 * @property label - Already-translated muted caption shown on the left.
 * @property value - Already-translated emphasised content shown on the right.
 */
export interface SummaryRow {
  label: string;
  value: string;
}

/**
 * SummaryPanelComponent — a generic, library-grade titled summary/preview card.
 *
 * Pure presentational and **domain-agnostic**: a header (title + optional status
 * badge), an optional projected cover, an accessible key/value list and an
 * optional projected footer. Use it as a "live preview", a "summary card" or any
 * recap surface in any project. No DI, no business logic, no outputs — the parent
 * owns all data and decisions; this component only renders inputs and content.
 *
 * **Self-responsive** via {@link ScreenTypeDirective} (host gains
 * `isSmall/isMedium/isLarge/isXLarge`); the SCSS compacts on `:host(.isSmall)`.
 * Styling relies solely on global design-system token custom properties, so it
 * re-themes with the host application.
 *
 * @example
 * ```html
 * <app-summary-panel
 *   [panelTitle]="'Anteprima'"
 *   [badge]="'In tempo reale'"
 *   [rows]="[
 *     { label: 'Titolo', value: 'Algoritmi' },
 *     { label: 'Pagine', value: '120' }
 *   ]"
 * >
 *   <app-book-cover cover />
 *   <p footer>Le modifiche sono salvate automaticamente.</p>
 * </app-summary-panel>
 * ```
 */
@Component({
  selector: 'app-summary-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  host: {
    class: 'summary-panel',
    role: 'group',
    '[attr.aria-label]': 'panelTitle()',
  },
  templateUrl: './summary-panel.component.html',
  styleUrl: './summary-panel.component.scss',
})
export class SummaryPanelComponent {
  /** Already-translated panel heading. Required. */
  readonly panelTitle = input.required<string>();

  /** Optional already-translated pill text (e.g. "In tempo reale"). Hidden when empty. */
  readonly badge = input<string>('');

  /** Key/value entries rendered as the panel's list. Empty array hides the list. */
  readonly rows = input<SummaryRow[]>([]);

  /** True when at least one row is provided. */
  protected readonly hasRows = computed(() => this.rows().length > 0);
}
