import { inject, Injectable } from '@angular/core';
import { MatSnackBar, type MatSnackBarConfig, type MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { ToastComponent } from './toast.component';

/**
 * Web backend del toast — mirror di `marioscadasite/customer-portal`
 * (`browser-toast.service.ts`). Espone i 6 metodi (`simple*` + `persistance*`
 * — typo "persistance" mantenuto per mirror letterale) che `ToastFacade` invoca
 * in base a `severity` + `browserMode`. Backend `MatSnackBar` con
 * `openFromComponent(ToastComponent)` → titolo + messaggio separati come
 * customer-portal. Posizione **top-right**; `simple` con auto-dismiss,
 * `persistance` senza timeout + bottone "Chiudi". Stili globali in `styles.scss`.
 */
const TOAST_CLASS = 'custom-toast';
const DISMISS_KEY = 'i18n.Common.dismiss';

type ToastRef = MatSnackBarRef<ToastComponent>;

@Injectable({ providedIn: 'root' })
export class BrowserToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  simpleInfo(message: string, title?: string, durationMs?: number): Promise<ToastRef> {
    return this.open(message, title, this.simpleConfig('info', durationMs));
  }
  persistanceInfo(message: string, title?: string): Promise<ToastRef> {
    return this.open(message, title, this.persistanceConfig('info'));
  }
  simpleSuccess(message: string, title?: string, durationMs?: number): Promise<ToastRef> {
    return this.open(message, title, this.simpleConfig('success', durationMs));
  }
  persistanceSuccess(message: string, title?: string): Promise<ToastRef> {
    return this.open(message, title, this.persistanceConfig('success'));
  }
  simpleError(message: string, title?: string, durationMs?: number): Promise<ToastRef> {
    return this.open(message, title, this.simpleConfig('error', durationMs));
  }
  persistanceError(message: string, title?: string): Promise<ToastRef> {
    return this.open(message, title, this.persistanceConfig('error'));
  }

  private simpleConfig(severity: 'info' | 'success' | 'error', durationMs?: number): MatSnackBarConfig {
    return {
      duration: durationMs ?? 5000,
      panelClass: [TOAST_CLASS, `${TOAST_CLASS}--${severity}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: severity === 'error' ? 'assertive' : 'polite',
    };
  }

  private persistanceConfig(severity: 'info' | 'success' | 'error'): MatSnackBarConfig {
    return {
      duration: undefined, // no auto-dismiss
      panelClass: [TOAST_CLASS, `${TOAST_CLASS}--${severity}`, `${TOAST_CLASS}--persistent`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: severity === 'error' ? 'assertive' : 'polite',
    };
  }

  private open(message: string, title: string | undefined, config: MatSnackBarConfig): Promise<ToastRef> {
    const isPersistent = (config.panelClass as string[]).includes(`${TOAST_CLASS}--persistent`);
    const dismissLabel = isPersistent ? this.translate.instant(DISMISS_KEY) : undefined;
    const ref = this.snackBar.openFromComponent(ToastComponent, {
      ...config,
      data: { title, message, dismissLabel },
    });
    return Promise.resolve(ref);
  }
}
