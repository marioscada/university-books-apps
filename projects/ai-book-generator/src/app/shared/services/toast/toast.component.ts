import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

/** Dati del toast (titolo opzionale + messaggio, già tradotti). */
export interface ToastData {
  readonly title?: string;
  readonly message: string;
  /** Etichetta del bottone di chiusura (solo varianti persistenti). */
  readonly dismissLabel?: string;
}

/**
 * Contenuto del toast — titolo (in evidenza) + messaggio su righe separate,
 * come customer-portal (ngx-toastr `.toast-title`/`.toast-message`). Gli stili
 * vivono in `styles.scss` (`.custom-toast__*`, globali). Niente stile locale.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'custom-toast__content' },
  template: `
    <div class="custom-toast__text">
      @if (data.title) {
        <span class="custom-toast__title">{{ data.title }}</span>
      }
      <span class="custom-toast__message">{{ data.message }}</span>
    </div>
    @if (data.dismissLabel) {
      <button class="custom-toast__close" type="button" (click)="dismiss()">
        {{ data.dismissLabel }}
      </button>
    }
  `,
})
export class ToastComponent {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef);

  protected dismiss(): void {
    this.ref.dismiss();
  }
}
