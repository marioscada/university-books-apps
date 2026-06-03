import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * WizardProgress — indicatore di avanzamento custom per wizard (dumb/riusabile).
 *
 * Sostituisce l'header debole di `mat-stepper`. Mostra gli step come segmenti
 * numerati con stato todo/active/done; gli step raggiunti/completati sono
 * **cliccabili** (navigazione non lineare) → emette `stepClick`. i18n-agnostico:
 * il padre passa le label già tradotte. **Self-responsive** (host `isSmall/…`).
 */
@Component({
  selector: 'app-wizard-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: { class: 'wizard-progress', role: 'list' },
  template: `
    @for (label of steps(); track $index; let i = $index) {
      <button
        type="button"
        class="wp__step"
        role="listitem"
        [class.is-active]="i === current()"
        [class.is-done]="isDone(i)"
        [disabled]="!isClickable(i)"
        [attr.aria-current]="i === current() ? 'step' : null"
        (click)="stepClick.emit(i)">
        <span class="wp__dot">
          @if (isDone(i) && i !== current()) {
            <mat-icon fontSet="material-symbols-outlined" aria-hidden="true">check</mat-icon>
          } @else {
            {{ i + 1 }}
          }
        </span>
        <span class="wp__label">{{ label }}</span>
      </button>
    }
  `,
  styleUrl: './wizard-progress.component.scss',
})
export class WizardProgressComponent {
  /** Label degli step (già tradotte dal padre). */
  readonly steps = input.required<string[]>();
  /** Indice dello step attivo (0-based). */
  readonly current = input.required<number>();
  /** Step completati (per il segno di spunta). */
  readonly completed = input<boolean[]>([]);

  readonly stepClick = output<number>();

  protected readonly maxReached = computed(() => this.current());

  isDone(i: number): boolean {
    return this.completed()[i] === true;
  }

  /** Cliccabile se già raggiunto o completato. */
  isClickable(i: number): boolean {
    return i <= this.current() || this.isDone(i);
  }
}
