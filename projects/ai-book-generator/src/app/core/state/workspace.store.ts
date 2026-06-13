import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { Chapter, ChatMessage, Version } from '../domain';
import { API_PORT } from '../data/api-port';
import { ProjectsStore } from './projects.store';

interface WorkspaceState {
  /** Progetto attualmente aperto nello Studio. */
  projectId: string | null;
  /** Versione corrente (indice + capitoli) o null finché non c'è output. */
  version: Version | null;
  /** Thread di chat del progetto. */
  messages: ChatMessage[];
  /** Caricamento iniziale di versione + chat. */
  loading: boolean;
  /** Invio di un messaggio in corso (l'assistente "sta scrivendo"). */
  sending: boolean;
  /** Sviluppo dei capitoli in corso (revisione indice → capitoli). */
  generating: boolean;
  /** Avanzamento 0–100 dello sviluppo capitoli (per il generation-panel). */
  genProgress: number;
  /** Pubblicazione/render in corso. */
  publishing: boolean;
  /** Avanzamento 0–100 della pubblicazione. */
  pubProgress: number;
}

const INITIAL: WorkspaceState = {
  projectId: null,
  version: null,
  messages: [],
  loading: false,
  sending: false,
  generating: false,
  genProgress: 0,
  publishing: false,
  pubProgress: 0,
};

/**
 * WorkspaceStore — sessione di editing dello **Studio** per il progetto attivo:
 * versione corrente (indice + capitoli) e chat AI contestuale. Passa SEMPRE dal
 * `ApiPort` (mai dal mock). Stato immutabile via `patchState`. I componenti dumb
 * (chapter-index/reader, ai-chat-panel) ricevono view-model derivati da qui.
 */
export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState<WorkspaceState>(INITIAL),
  withComputed((store) => ({
    /** Capitoli della versione corrente (vuoto se nessun output). */
    chapters: computed<Chapter[]>(() => store.version()?.chapters ?? []),
    /**
     * I capitoli sono stati sviluppati (fase Capitoli). Se falso ma esiste una
     * versione → fase **revisione indice** (solo outline, capitoli non sviluppati).
     */
    chaptersReady: computed(() =>
      (store.version()?.chapters ?? []).some((c) => c.status === 'ready'),
    ),
  })),
  withMethods((store) => {
    const api = inject(API_PORT);
    const projects = inject(ProjectsStore);

    return {
      /** Apre un progetto nello Studio: carica versione + chat. */
      async open(projectId: string): Promise<void> {
        // Evita reload se è già il progetto aperto.
        if (store.projectId() === projectId && store.version() !== null) {
          return;
        }
        patchState(store, { ...INITIAL, projectId, loading: true });
        const [version, messages] = await Promise.all([
          api.getCurrentVersion(projectId),
          api.listChatMessages(projectId),
        ]);
        // Ignora risposte tardive se nel frattempo si è aperto un altro progetto.
        if (store.projectId() !== projectId) {
          return;
        }
        patchState(store, { version, messages, loading: false });
      },

      /** Invia un messaggio in chat; appende utente + risposta assistente. */
      async send(projectId: string, text: string): Promise<void> {
        const trimmed = text.trim();
        if (!trimmed || store.sending()) {
          return;
        }
        patchState(store, { sending: true });
        try {
          const created = await api.sendChatMessage(projectId, trimmed);
          patchState(store, (s) => ({ messages: [...s.messages, ...created] }));
        } finally {
          patchState(store, { sending: false });
        }
      },

      /**
       * Sviluppa il **prossimo capitolo** `pending` (generazione capitolo per
       * capitolo): approvi quello corrente → si genera il successivo, fino alla
       * fine. Aggiornamento ottimistico (capitolo → `generating`) per feedback
       * immediato, con **revert** in caso di errore. Guardia anti-doppio-invio.
       */
      async generateNextChapter(projectId: string): Promise<void> {
        if (store.generating()) {
          return;
        }
        const next = (store.version()?.chapters ?? []).find((c) => c.status === 'pending');
        if (!next) {
          return; // tutti i capitoli già generati
        }
        const setStatus = (status: Chapter['status']): void =>
          patchState(store, (s) =>
            s.version
              ? {
                  version: {
                    ...s.version,
                    chapters: s.version.chapters.map((c) =>
                      c.id === next.id ? { ...c, status } : c,
                    ),
                  },
                }
              : {},
          );
        patchState(store, { generating: true });
        setStatus('generating'); // ottimistico
        try {
          const version = await api.generateChapters(projectId, next.id);
          if (store.projectId() === projectId) {
            patchState(store, { version });
          }
        } catch (error) {
          if (store.projectId() === projectId) {
            setStatus('pending'); // revert
          }
          throw error;
        } finally {
          patchState(store, { generating: false });
        }
      },

      /** Pubblica: delega a `ProjectsStore.publish` (review → published). */
      async publish(projectId: string): Promise<void> {
        if (store.publishing()) {
          return;
        }
        patchState(store, { publishing: true });
        try {
          await projects.publish(projectId);
        } finally {
          patchState(store, { publishing: false });
        }
      },
    };
  }),
);
