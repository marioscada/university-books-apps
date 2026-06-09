import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';

import type { ProjectTemplate } from '../domain';
import { TEMPLATE_CATALOG } from '../data/templates-catalog';

/**
 * TemplatesStore — SignalStore (NgRx) dei modelli di pubblicazione.
 *
 * I modelli sono **definizioni statiche e immutabili dell'app** (catalogo, non
 * dato di backend): la collezione si popola dal `TEMPLATE_CATALOG` alla prima
 * injection. La galleria Create e la pagina "Personalizza il modello" leggono
 * solo i signal. Map id→template per il lookup.
 */
export const TemplatesStore = signalStore(
  { providedIn: 'root' },
  withEntities<ProjectTemplate>(),
  withComputed((store) => ({
    /** Tutti i modelli, nell'ordine del catalogo (galleria). */
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
  withHooks({
    onInit(store) {
      patchState(store, setAllEntities(TEMPLATE_CATALOG.map((t) => structuredClone(t))));
    },
  }),
);
