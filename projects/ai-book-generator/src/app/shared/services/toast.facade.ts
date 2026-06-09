import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  severity?: ToastSeverity;
  /** Durata ms (default: 6s per error, 4s altrimenti). */
  duration?: number;
}

/**
 * ToastFacade — notifiche transitorie su **MatSnackBar** (equivalente nativo del
 * ToastFacade di ngx-zcs-components, senza Ionic). API: `present(message, title?,
 * opts?)`. La severità è veicolata via `panelClass` (`toast toast--<severity>`);
 * gli stili vivono nel CSS globale (`src/styles.scss`).
 */
@Injectable({ providedIn: 'root' })
export class ToastFacade {
  private readonly snackBar = inject(MatSnackBar);

  present(message: string, title?: string, opts: ToastOptions = {}): void {
    const severity = opts.severity ?? 'info';
    const text = title ? `${title} — ${message}` : message;
    this.snackBar.open(text, '', {
      duration: opts.duration ?? (severity === 'error' ? 6000 : 4000),
      panelClass: ['toast', `toast--${severity}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
