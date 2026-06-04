import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

/**
 * FormSectionComponent — guscio dumb/presentational per una sezione di form:
 * header (titolo + tag "facoltativo" opzionale + link d'azione opzionale +
 * sottotitolo) e un'area contenuto proiettata.
 *
 * Riusabile da qualunque sezione (struttura, briefing, fonti…): non conosce il
 * dominio, riceve solo etichette (i18n-agnostico) ed emette `action` quando si
 * attiva il link dell'header (es. "Ripristina"). Stile dai soli token globali;
 * `OnPush` + signals.
 *
 * @example
 * ```html
 * <app-form-section
 *   [heading]="'Briefing per l’AI'"
 *   optional [optionalLabel]="'Facoltativo'"
 *   [subtitle]="'Cambia solo ciò che vuoi.'"
 *   [actionLabel]="'Ripristina'" actionIcon="undo"
 *   (action)="reset()">
 *   <!-- contenuto della sezione -->
 * </app-form-section>
 * ```
 */
@Component({
  selector: 'app-form-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ui-form-section' },
  template: `
    <header class="form-section__head">
      <div class="form-section__titlerow">
        <h2 class="form-section__title">{{ heading() }}</h2>
        @if (optional() && optionalLabel()) {
          <span class="form-section__tag">{{ optionalLabel() }}</span>
        }
        @if (actionLabel()) {
          <button class="form-section__action" type="button" (click)="action.emit()">
            @if (actionIcon()) {
              <span class="form-section__action-icon" aria-hidden="true">{{ actionGlyph() }}</span>
            }
            {{ actionLabel() }}
          </button>
        }
      </div>
      @if (subtitle()) {
        <p class="form-section__subtitle">{{ subtitle() }}</p>
      }
    </header>

    <div class="form-section__body">
      <ng-content />
    </div>
  `,
  styleUrl: './form-section.component.scss',
})
export class FormSectionComponent {
  /** Titolo della sezione (già tradotto). */
  readonly heading = input<string>('');
  /** Mostra il tag "facoltativo". */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Etichetta del tag facoltativo (già tradotta). */
  readonly optionalLabel = input<string>('');
  /** Sottotitolo/descrizione della sezione (già tradotto). */
  readonly subtitle = input<string>('');
  /** Etichetta del link d'azione nell'header (vuoto = nascosto). */
  readonly actionLabel = input<string>('');
  /** Glifo testuale opzionale prima dell'azione (es. "↩"). */
  readonly actionIcon = input<string>('');

  /** Emesso attivando il link d'azione dell'header. */
  readonly action = output<void>();

  protected actionGlyph(): string {
    return this.actionIcon();
  }
}
