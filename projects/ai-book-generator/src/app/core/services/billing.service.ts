import { Injectable, computed, signal } from '@angular/core';

/**
 * Stato di fatturazione dell'utente.
 * - `active`   → abbonamento attivo con chance disponibili → rielaborazione consentita.
 * - `past_due` → abbonamento attivo ma con un pagamento da **regolarizzare**.
 * - `none`     → nessun abbonamento → deve **abbonarsi** o pagare il singolo progetto.
 */
export type BillingStatus = 'active' | 'past_due' | 'none';

/**
 * BillingService — stato abbonamento (MOCK, v1). In futuro dal backend.
 * Cambia `status` per testare i casi del dialog di rielaborazione:
 *   'none' → abbonati / paga singolo · 'past_due' → regolarizza · 'active' → consentito.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {
  /** MOCK: stato corrente (modificabile per testare i due casi gated). */
  readonly status = signal<BillingStatus>('none');
  /** Chance di rielaborazione residue nel mese (solo se `active`). */
  readonly chancesLeft = signal(0);

  /** Rielaborazione consentita senza costi aggiuntivi. */
  readonly canReuse = computed(() => this.status() === 'active' && this.chancesLeft() > 0);
}
