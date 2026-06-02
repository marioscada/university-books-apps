import { InjectionToken } from '@angular/core';

/**
 * Config di runtime dell'app (valori tunabili senza ricompilare la logica).
 * Promossa a `InjectionToken` (pattern Angular) così è centralizzata,
 * override-abile per ambiente/provider e iniettabile/mockabile nei test
 * (es. `pollIntervalMs: 0` per non attendere in test). Solo config di
 * PRODUZIONE: i timer interni del mock restano costanti locali al mock.
 */
export interface RuntimeConfig {
  /** Cadenza di polling dello stato job (ms). */
  readonly pollIntervalMs: number;
}

/** Default di produzione. */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  pollIntervalMs: 2000,
};

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_RUNTIME_CONFIG,
});
