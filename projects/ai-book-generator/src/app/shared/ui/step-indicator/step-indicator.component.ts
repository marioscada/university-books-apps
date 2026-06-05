import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Single step descriptor consumed by {@link StepIndicatorComponent}.
 * `label` is expected to be already translated by the parent (i18n-agnostic).
 */
export interface StepItem {
  /** Human-readable step label (already translated). */
  label: string;
}

/**
 * `StepIndicatorComponent` — a horizontal, themeable step-progress indicator.
 *
 * Pure presentational / dumb component: it renders an ordered sequence of steps
 * (numbered dots that turn into a check when done, joined by connectors) and
 * highlights the active one. It has **no** dependency injection, no business
 * logic and no app-domain coupling — every value comes in via signal inputs and
 * the only side effect is the `stepSelect` output emitted on user interaction.
 * Reusable in any wizard / stepper, in any project.
 *
 * A step `i` is **selectable** when `i <= activeIndex()` or `completed()[i]`;
 * other steps are disabled. Done (non-active) steps show a check, otherwise the
 * 1-based number. Connectors up to the furthest completed/active step are
 * accented, the rest neutral. Self-responsive via {@link ScreenTypeDirective}
 * (labels collapse on small viewports, numbered dots remain).
 *
 * @example
 * ```html
 * <app-step-indicator
 *   [steps]="[{ label: 'Account' }, { label: 'Profile' }, { label: 'Done' }]"
 *   [activeIndex]="1"
 *   [completed]="[true, false, false]"
 *   (stepSelect)="goToStep($event)" />
 * ```
 */
@Component({
  selector: 'app-step-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: { class: 'step-indicator', role: 'list' },
  template: `
    @for (step of steps(); track $index; let i = $index) {
      <button
        type="button"
        class="step-indicator__step"
        role="listitem"
        [class.is-active]="i === activeIndex()"
        [class.is-done]="isDone(i)"
        [class.is-reached]="isReached(i)"
        [disabled]="!isSelectable(i)"
        [attr.aria-current]="i === activeIndex() ? 'step' : null"
        (click)="selectStep(i)">
        <span class="step-indicator__connector step-indicator__connector--before" aria-hidden="true"></span>
        <span class="step-indicator__dot">
          @if (isDone(i) && i !== activeIndex()) {
            <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">check</mat-icon>
          } @else {
            {{ i + 1 }}
          }
        </span>
        <span class="step-indicator__connector step-indicator__connector--after" aria-hidden="true"></span>
        <span class="step-indicator__label">{{ step.label }}</span>
      </button>
    }
  `,
  styleUrl: './step-indicator.component.scss',
})
export class StepIndicatorComponent {
  /** Ordered steps to render (labels already translated). */
  readonly steps = input.required<StepItem[]>();

  /** Zero-based index of the currently active step. */
  readonly activeIndex = input.required<number, number>({ transform: numberAttribute });

  /** Per-step completion flags; a `true` entry renders a check icon. */
  readonly completed = input<boolean[]>([]);

  /** Emits the zero-based index of a step when the user selects a selectable step. */
  readonly stepSelect = output<number>();

  /**
   * Furthest accented position: the highest index that is either the active
   * step or a completed step. Connectors at/below it are rendered accented.
   */
  private readonly accentBoundary = computed(() => {
    const done = this.completed();
    let boundary = this.activeIndex();
    for (let i = 0; i < this.steps().length; i++) {
      if (done[i] === true && i > boundary) {
        boundary = i;
      }
    }
    return boundary;
  });

  /** Whether step `i` is flagged completed. */
  isDone(i: number): boolean {
    return this.completed()[i] === true;
  }

  /** Whether step `i` is at/below the accent boundary (active/done reach). */
  isReached(i: number): boolean {
    return i <= this.accentBoundary();
  }

  /** Whether step `i` can be selected (already reached or completed). */
  isSelectable(i: number): boolean {
    return i <= this.activeIndex() || this.isDone(i);
  }

  /** Emit `stepSelect` for a selectable step. */
  selectStep(i: number): void {
    if (this.isSelectable(i)) {
      this.stepSelect.emit(i);
    }
  }
}
