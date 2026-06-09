import { inject, Injectable } from '@angular/core';
import type { MatSnackBarRef } from '@angular/material/snack-bar';

import { BrowserToastService } from './browser-toast.service';
import type { ToastComponent } from './toast.component';

type ToastRef = MatSnackBarRef<ToastComponent>;

/**
 * Facade unico per le notifiche toast — **mirror** di
 * `marioscadasite/customer-portal` (`shared/services/toast/toast.facade.ts`).
 * Signature/shape/behavior identici; backend web-only (`BrowserToastService`
 * su MatSnackBar). I caller passano stringhe **già tradotte**.
 */
export type ToastBrowserSeverity = 'success' | 'error' | 'info';

export interface ToastFacadeOptions {
  readonly type?: 'mobile' | 'browser';
  readonly mobileMode?: 'persistent' | 'simple' | 'single' | 'single-persistent';
  readonly duration?: number;
  readonly browserMode?: 'persistent' | 'simple';
  readonly severity?: ToastBrowserSeverity;
}

@Injectable({ providedIn: 'root' })
export class ToastFacade {
  private readonly browserToastService = inject(BrowserToastService);

  private options: ToastFacadeOptions = {
    type: 'mobile',
    duration: 3000,
    mobileMode: 'simple',
  };

  setToastOptions(options: Partial<ToastFacadeOptions>): void {
    this.options = { ...this.options, ...options };
  }

  present(
    message: string,
    title?: string,
    options?: ToastFacadeOptions,
  ): Promise<ToastRef> {
    // Caller-wins merge.
    const toastOptions = { ...this.options, ...options };
    switch (toastOptions.type) {
      case 'mobile':
      case 'browser':
      default:
        return this.browserPresent(toastOptions, message, title);
    }
  }

  private browserPresent(
    options: ToastFacadeOptions,
    message: string,
    title?: string,
  ): Promise<ToastRef> {
    const severity = options.severity ?? 'success';
    switch (options.browserMode) {
      case 'persistent':
        return this.browserPersistentPresent(severity, message, title);
      case 'simple':
      default:
        return this.browserSimplePresent(severity, message, title, options.duration);
    }
  }

  private browserPersistentPresent(
    severity: ToastBrowserSeverity,
    message: string,
    title?: string,
  ): Promise<ToastRef> {
    switch (severity) {
      case 'error':
        return this.browserToastService.persistanceError(message, title);
      case 'info':
        return this.browserToastService.persistanceInfo(message, title);
      case 'success':
      default:
        return this.browserToastService.persistanceSuccess(message, title);
    }
  }

  private browserSimplePresent(
    severity: ToastBrowserSeverity,
    message: string,
    title?: string,
    durationMs?: number,
  ): Promise<ToastRef> {
    switch (severity) {
      case 'error':
        return this.browserToastService.simpleError(message, title, durationMs);
      case 'info':
        return this.browserToastService.simpleInfo(message, title, durationMs);
      case 'success':
      default:
        return this.browserToastService.simpleSuccess(message, title, durationMs);
    }
  }
}
