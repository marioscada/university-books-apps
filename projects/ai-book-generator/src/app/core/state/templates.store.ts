import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';

import type { ProjectTemplate } from '../domain';
import { API_PORT } from '../data/api-port';

/**
 * TemplatesStore — SignalStore (NgRx) dei modelli di pubblicazione.
 *
 * I modelli sono immutabili (sola lettura): la collezione si auto-carica via
 * `ApiPort.listTemplates` alla prima injection. La galleria Create e la pagina
 * "Personalizza il modello" leggono solo i signal. Map id→template per il lookup.
 */
export const TemplatesStore = signalStore(
  { providedIn: 'root' },
  withState<{ loading: boolean }>({ loading: false }),
  withEntities<ProjectTemplate>(),
  withComputed((store) => ({
    /** Tutti i modelli, nell'ordine del seed (galleria). */
    templates: computed(() => store.entities()),
    /** Lookup per id. */
    templateById: computed(() => {
      const map: Record<string, ProjectTemplate> = {};
      for (const t of store.entities()) {
        map[t.id] = t;
      }
      return map;
    }),
  })),
  withMethods((store) => {
    const api = inject(API_PORT);
    return {
      async loadAll(): Promise<void> {
        patchState(store, { loading: true });
        const templates = await api.listTemplates();
        patchState(store, setAllEntities(templates), { loading: false });
      },
    };
  }),
  withHooks({
    onInit(store) {
      void store.loadAll();
    },
  }),
);
