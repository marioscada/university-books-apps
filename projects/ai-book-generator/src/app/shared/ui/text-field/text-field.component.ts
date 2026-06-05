import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  numberAttribute,
} from '@angular/core';

/**
 * TextField — campo di testo dumb/presentational (label sopra + controllo bordato
 * con fill tenue), riusabile in qualunque progetto. Stile "simple input" (non il
 * notched-outline di Material): label esterna, bordo continuo arrotondato, focus
 * in accent. i18n-agnostico (label/placeholder/hint via input), themeable dai
 * token globali, a11y (label associata, aria-invalid). Two-way: `[(value)]`.
 *
 * @example
 * <app-text-field label="Email" placeholder="nome@dominio.it" [(value)]="email" />
 * <app-text-field label="Note" multiline [rows]="5" [(value)]="note" />
 */
@Component({
  selector: 'app-text-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'text-field' },
  template: `
    @if (label()) {
      <label class="text-field__label" [attr.for]="fieldId">{{ label() }}</label>
    }

    @if (multiline()) {
      <textarea
        class="text-field__control"
        [id]="fieldId"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        [attr.aria-invalid]="error() ? 'true' : null"
        (input)="onInput($event)"></textarea>
    } @else {
      <input
        class="text-field__control"
        [id]="fieldId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        [attr.aria-invalid]="error() ? 'true' : null"
        (input)="onInput($event)" />
    }

    @if (error()) {
      <span class="text-field__msg text-field__msg--error">{{ error() }}</span>
    } @else if (hint()) {
      <span class="text-field__msg">{{ hint() }}</span>
    }
  `,
  styleUrl: './text-field.component.scss',
})
export class TextFieldComponent {
  /** Etichetta sopra il campo (vuota = nascosta). */
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  /** Messaggio d'errore (valorizzato = stato invalid). */
  readonly error = input('');
  /** type dell'input (ignorato se multiline). */
  readonly type = input('text');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** textarea invece di input. */
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly rows = input(4, { transform: numberAttribute });

  /** Valore two-way: `[(value)]`. */
  readonly value = model('');

  private static seq = 0;
  protected readonly fieldId = `tf-${TextFieldComponent.seq++}`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
