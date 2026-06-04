import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Opzione di un FieldSelect. */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * FieldSelectComponent — menu a tendina dumb/presentational con header
 * (etichetta + suggerimento opzionale) e controllo bordato. Variante **accent**
 * (default) per i valori "scelti" preimpostati, o **plain** neutra.
 *
 * `<select>` nativo (coerente con i campi del progetto), two-way `[(value)]`,
 * i18n-agnostico, stile dai soli token globali. `OnPush` + signals.
 *
 * @example
 * ```html
 * <app-field-select label="Obiettivo" hint="scopo del documento"
 *   [options]="goals" [(value)]="goal" />
 * ```
 */
@Component({
  selector: 'app-field-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'field-select',
    '[class.is-accent]': 'accent()',
  },
  imports: [MatIconModule],
  template: `
    @if (label() || hint()) {
      <span class="field-select__head">
        @if (label()) {
          <label class="field-select__label" [attr.for]="fieldId">{{ label() }}</label>
        }
        @if (hint()) {
          <span class="field-select__hint">{{ hint() }}</span>
        }
      </span>
    }

    <div class="field-select__wrap">
      <select
        class="field-select__control"
        [id]="fieldId"
        [disabled]="disabled()"
        [value]="value()"
        (change)="onChange($event)">
        @if (placeholder()) {
          <option value="" disabled>{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      <mat-icon class="field-select__chevron" fontSet="material-symbols-outlined" aria-hidden="true">expand_more</mat-icon>
    </div>
  `,
  styleUrl: './field-select.component.scss',
})
export class FieldSelectComponent {
  /** Etichetta sopra il controllo (già tradotta). */
  readonly label = input<string>('');
  /** Suggerimento accanto all'etichetta (già tradotto). */
  readonly hint = input<string>('');
  /** Placeholder mostrato come prima opzione disabilitata. */
  readonly placeholder = input<string>('');
  /** Opzioni del menu. */
  readonly options = input<FieldOption[]>([]);
  /** Stile accent (true) o neutro (false). */
  readonly accent = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Valore selezionato (two-way `[(value)]`). */
  readonly value = model<string>('');

  private static seq = 0;
  protected readonly fieldId = `fs-${FieldSelectComponent.seq++}`;

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
