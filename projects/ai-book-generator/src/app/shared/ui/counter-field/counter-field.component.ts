import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  output,
} from '@angular/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * CounterFieldComponent — campo di testo dumb/presentational con **intestazione
 * (label + indicatore obbligatorio/facoltativo + contatore caratteri)** e un
 * controllo `<input>`/`<textarea>` nativo (stile "simple input" con fill tenue,
 * come gli altri campi del progetto). Riusabile ovunque serva un campo con
 * conteggio caratteri.
 *
 * i18n-agnostico (label/placeholder/hint/optionalLabel via input), two-way
 * `[(value)]`, themeable dai soli token globali `--field-*`, a11y (label `for`,
 * `aria-invalid`, contatore `aria-live`). **Self-responsive** via
 * `ScreenTypeDirective`; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-counter-field
 *   label="Titolo della presentazione"
 *   [maxLength]="80"
 *   required
 *   placeholder="Es. Analisi del mercato 2024"
 *   [(value)]="title" />
 *
 * <app-counter-field
 *   label="Descrizione" optionalLabel="(facoltativa)"
 *   [maxLength]="500" multiline [rows]="5"
 *   [(value)]="description" />
 * ```
 */
@Component({
  selector: 'app-counter-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  host: { class: 'counter-field', '[class.cf--fill]': 'fill()' },
  template: `
    @if (label() || maxLength() > 0) {
      <div class="cf__top">
        @if (label()) {
          <label class="cf__label" [attr.for]="fieldId">
            {{ label() }}
            @if (required()) {
              <span class="cf__req" aria-hidden="true">*</span>
            }
            @if (optionalLabel()) {
              <span class="cf__opt">{{ optionalLabel() }}</span>
            }
          </label>
        }
        @if (maxLength() > 0) {
          <span class="cf__counter" [class.is-full]="isFull()" aria-live="polite">
            {{ value().length }}/{{ maxLength() }}
          </span>
        }
      </div>
    }

    @if (multiline()) {
      <textarea
        class="cf__control cf__control--area"
        [id]="fieldId"
        [rows]="rows()"
        [disabled]="disabled()"
        [attr.maxlength]="maxLength() > 0 ? maxLength() : null"
        [attr.aria-invalid]="error() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        [value]="value()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (blur)="blurred.emit()"></textarea>
    } @else {
      <input
        class="cf__control"
        [id]="fieldId"
        [type]="type()"
        [disabled]="disabled()"
        [attr.maxlength]="maxLength() > 0 ? maxLength() : null"
        [attr.aria-invalid]="error() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        [value]="value()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (blur)="blurred.emit()" />
    }

    @if (error()) {
      <span class="cf__msg cf__msg--error">{{ error() }}</span>
    } @else if (hint()) {
      <span class="cf__msg">{{ hint() }}</span>
    }
  `,
  styleUrl: './counter-field.component.scss',
})
export class CounterFieldComponent {
  /** Etichetta sopra il campo (già tradotta). */
  readonly label = input('');
  /** Placeholder del controllo. */
  readonly placeholder = input('');
  /** Messaggio di aiuto sotto il campo. */
  readonly hint = input('');
  /** Messaggio di errore (sostituisce l'hint, attiva lo stato invalido). */
  readonly error = input('');
  /** Tipo dell'input (ignorato in multiline). */
  readonly type = input('text');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Textarea invece di input. */
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly rows = input(5, { transform: numberAttribute });
  /** In multiline, fa crescere la textarea per riempire l'altezza disponibile. */
  readonly fill = input(false, { transform: booleanAttribute });
  /** Lunghezza massima: >0 attiva il contatore caratteri. */
  readonly maxLength = input(0, { transform: numberAttribute });
  /** Mostra l'asterisco obbligatorio. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Etichetta "facoltativo" accanto alla label (già tradotta). */
  readonly optionalLabel = input('');

  /** Valore two-way: `[(value)]`. */
  readonly value = model('');

  /** Emesso alla perdita di focus: il padre marca "touched" e valida. */
  readonly blurred = output<void>();

  /** True quando si è raggiunto il limite di caratteri. */
  protected readonly isFull = computed(
    () => this.maxLength() > 0 && this.value().length >= this.maxLength(),
  );

  private static seq = 0;
  protected readonly fieldId = `cf-${CounterFieldComponent.seq++}`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
