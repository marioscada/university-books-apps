import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * ModalShellComponent — guscio dumb/presentational per un dialog modale: backdrop
 * + pannello centrato con header (titolo + sottotitolo + chiusura), corpo
 * proiettato e footer proiettato (`[footer]`).
 *
 * Generico e riusabile: non conosce il contenuto (arriva via content projection)
 * né il dominio. Si apre/chiude in modo controllato (`open` input → `close`
 * output): backdrop, tasto Esc e bottone "×" emettono `close`; il padre decide.
 * `OnPush` + signals; a11y (`role="dialog"`, `aria-modal`); stile dai soli token
 * globali.
 *
 * @example
 * ```html
 * <app-modal-shell [open]="editing()" [title]="'Lunghezza'" (close)="editing.set(false)">
 *   <!-- corpo -->
 *   <div footer>…azioni…</div>
 * </app-modal-shell>
 * ```
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'modal-shell',
    '[class.is-open]': 'open()',
    '(document:keydown.escape)': 'onEsc()',
  },
  template: `
    @if (open()) {
      <div class="modal-shell__backdrop" (click)="close.emit()"></div>
      <div class="modal-shell__panel" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <header class="modal-shell__head">
          <div class="modal-shell__heading">
            <h2 class="modal-shell__title">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="modal-shell__subtitle">{{ subtitle() }}</p>
            }
          </div>
          <button class="modal-shell__close" type="button" [attr.aria-label]="closeLabel()" (click)="close.emit()">
            <mat-icon fontSet="material-symbols-outlined">close</mat-icon>
          </button>
        </header>

        <div class="modal-shell__body">
          <ng-content />
        </div>

        <footer class="modal-shell__footer">
          <ng-content select="[footer]" />
        </footer>
      </div>
    }
  `,
  styleUrl: './modal-shell.component.scss',
})
export class ModalShellComponent {
  /** Visibilità del dialog (controllata dal padre). */
  readonly open = input(false, { transform: booleanAttribute });
  /** Titolo del dialog (già tradotto). */
  readonly title = input<string>('');
  /** Sottotitolo opzionale (già tradotto). */
  readonly subtitle = input<string>('');
  /** Etichetta accessibile del bottone di chiusura. */
  readonly closeLabel = input<string>('');

  /** Emesso quando si richiede la chiusura (backdrop / Esc / "×"). */
  readonly close = output<void>();

  protected onEsc(): void {
    if (this.open()) {
      this.close.emit();
    }
  }
}
