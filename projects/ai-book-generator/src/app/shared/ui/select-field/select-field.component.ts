import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Opzione di un SelectField. */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * SelectField — menu a tendina dumb/presentational con lo stesso look dei campi
 * di testo (label sopra + controllo bordato con fill tenue + chevron). Usa un
 * `<select>` nativo (come marioscadasite) per coerenza con `TextField`; stile dai
 * token globali `--field-*`. i18n-agnostico, themeable, a11y, two-way `[(value)]`.
 *
 * @example
 * <app-select-field label="Modalità" placeholder="Seleziona…"
 *   [options]="modes" [(value)]="mode" />
 */
@Component({
  selector: 'app-select-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'select-field' },
  imports: [MatIconModule],
  template: `
    @if (label()) {
      <label class="select-field__label" [attr.for]="fieldId">{{ label() }}</label>
    }

    <div class="select-field__wrap">
      <select
        class="select-field__control"
        [id]="fieldId"
        [disabled]="disabled()"
        [value]="value()"
        [attr.aria-invalid]="error() ? 'true' : null"
        (change)="onChange($event)">
        @if (placeholder()) {
          <option value="" disabled>{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      <mat-icon class="select-field__chevron" fontSet="material-symbols-outlined" aria-hidden="true">expand_more</mat-icon>
    </div>

    @if (error()) {
      <span class="select-field__msg select-field__msg--error">{{ error() }}</span>
    } @else if (hint()) {
      <span class="select-field__msg">{{ hint() }}</span>
    }
  `,
  styleUrl: './select-field.component.scss',
})
export class SelectFieldComponent {
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly options = input<SelectOption[]>([]);

  /** Valore two-way: `[(value)]`. */
  readonly value = model('');

  private static seq = 0;
  protected readonly fieldId = `sf-${SelectFieldComponent.seq++}`;

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
