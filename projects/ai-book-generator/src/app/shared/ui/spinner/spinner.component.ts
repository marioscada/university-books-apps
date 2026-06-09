import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * SpinnerComponent — indicatore di caricamento dumb/presentational: anello che
 * gira (token-only) + messaggio opzionale. Usato sia inline (schermate di
 * attesa) sia dentro l'overlay di `UiPromiseService`. Nessuna dipendenza dal
 * dominio; i18n-agnostico (il messaggio arriva già tradotto dal chiamante).
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'spinner', role: 'status', 'aria-live': 'polite' },
  template: `
    <span class="spinner__ring" aria-hidden="true"></span>
    @if (message()) {
      <span class="spinner__message">{{ message() }}</span>
    }
  `,
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  /** Messaggio opzionale sotto l'anello (già tradotto). */
  readonly message = input<string>('');
}
