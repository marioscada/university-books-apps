import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, removeEntity } from '@ngrx/signals/entities';

import type { Source } from '../domain';
import { API_PORT } from '../data/api-port';
import type { CreateUploadInput } from '../data/api-port';

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

      /** Crea una nota inline (col `content`) e la aggiunge allo store. */
      async createNote(name: string, content?: string): Promise<Source> {
        const note = await api.createNote(name, content);
        patchState(store, addEntity(note));
        return note;
      },

      /**
       * Upload reale: presigned-url → PUT su S3 (byte del `file`, `onProgress`
       * 0–1) → record `processing`. Lo aggiunge allo store; l'ingest si conferma
       * via `ingestStatus`.
       */
      async createUpload(
        input: CreateUploadInput,
        file: Blob,
        onProgress?: (fraction: number) => void,
      ): Promise<Source> {
        const source = await api.createUpload(input, file, onProgress);
        patchState(store, addEntity(source));
        return source;
      },

      /** Presigned URL per SCARICARE il file. */
      downloadUrl(id: string): Promise<string> {
        return api.getDownloadUrl(id);
      },

      /** Elimina una fonte. */
      async delete(id: string): Promise<void> {
        await api.deleteSource(id);
        patchState(store, removeEntity(id));
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
