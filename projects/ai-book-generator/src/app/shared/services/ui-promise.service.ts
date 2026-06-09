import { inject, Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { SpinnerComponent } from '../ui/spinner/spinner.component';
import { ToastFacade } from './toast/toast.facade';

export interface UiPromiseOptions {
  /** Mostra lo spinner overlay durante l'attesa. */
  loading?: boolean;
  loadingMessage?: string;
  /** Toast di successo a risoluzione. */
  success?: { title?: string; message: string };
  /** Toast di errore in caso di reject. */
  error?: { title?: string; message: string };
  /** Handler errore custom (in aggiunta al toast). */
  errorHandler?: (error: unknown) => void | Promise<void>;
  /** Timeout ms (default 30s). */
  timeout?: number;
}

/**
 * UiPromiseService — equivalente nativo (Material/CDK) di UiPromiseService di
 * ngx-zcs-components, **senza Ionic**. Mostra uno spinner overlay (CDK Overlay +
 * `SpinnerComponent`) mentre attende una Promise e, opzionalmente, un toast di
 * esito (via `ToastFacade`/MatSnackBar). API compatibile: `run(fn, opts)` e
 * `spinner(message)`. Da usare ovunque per le attese sulle azioni.
 */
@Injectable({ providedIn: 'root' })
export class UiPromiseService {
  private readonly overlay = inject(Overlay);
  private readonly toast = inject(ToastFacade);

  /** Mostra uno spinner overlay bloccante; ritorna `hide()` per chiuderlo. */
  spinner(message?: string): { hide: () => void } {
    const ref = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'ui-spinner-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    const cmp = ref.attach(new ComponentPortal(SpinnerComponent));
    cmp.setInput('message', message ?? '');
    return { hide: () => ref.dispose() };
  }

  /** Esegue `fn` con spinner (opzionale) e toast di esito (opzionali). */
  async run<T>(
    fn: () => Promise<T>,
    opt: UiPromiseOptions = {},
  ): Promise<{ success?: T; error?: unknown }> {
    const spin = opt.loading ? this.spinner(opt.loadingMessage) : null;
    try {
      const work = fn();
      const result = opt.timeout
        ? await Promise.race([work, this.rejectAfter(opt.timeout)])
        : await work;
      if (opt.success) {
        this.toast.present(opt.success.message, opt.success.title, { severity: 'success' });
      }
      return { success: result as T };
    } catch (error) {
      if (opt.error) {
        this.toast.present(opt.error.message, opt.error.title, { severity: 'error' });
      }
      if (opt.errorHandler) {
        await opt.errorHandler(error);
      }
      return { error };
    } finally {
      spin?.hide();
    }
  }

  private rejectAfter(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
  }
}
