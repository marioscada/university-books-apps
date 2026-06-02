import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';

import type { Source } from '../domain';
import { API_PORT } from '../data/api-port';

/**
 * SourcesStore — SignalStore (NgRx) per le fonti (Library).
 *
 * `withEntities<Source>` per la collezione; `loadAll` carica dalle firme
 * dell'`ApiPort` (mai dal mock direttamente). Stato immutabile via `patchState`.
 */
export const SourcesStore = signalStore(
  { providedIn: 'root' },
  withState<{ loading: boolean }>({ loading: false }),
  withEntities<Source>(),
  withMethods((store) => {
    const api = inject(API_PORT);
    return {
      /** Carica tutte le fonti dall'ApiPort nello store. */
      async loadAll(): Promise<void> {
        patchState(store, { loading: true });
        const sources = await api.listSources();
        patchState(store, setAllEntities(sources), { loading: false });
      },
    };
  }),
  // Self-init alla prima injection (pattern ufficiale `withHooks.onInit`).
  withHooks({
    onInit(store) {
      void store.loadAll();
    },
  }),
);
