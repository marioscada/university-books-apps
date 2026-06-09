import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import type { Chapter, ChatMessage, DerivedContent, Version } from '../domain';
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
  /** Capitoli approvati in revisione (stato locale finché non c'è il backend). */
  approvedChapterIds: string[];
  /** Contenuto del derivato (riassunto/slide/quiz/…) o null. */
  derived: DerivedContent | null;
  /** Elaborazione del derivato in corso. */
  derivedGenerating: boolean;
  /** Avanzamento 0–100 dell'elaborazione del derivato. */
  derivedProgress: number;
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
  approvedChapterIds: [],
  derived: null,
  derivedGenerating: false,
  derivedProgress: 0,
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
    /** Numero di capitoli approvati. */
    approvedCount: computed(() => store.approvedChapterIds().length),
    /**
     * I capitoli sono stati sviluppati (fase Capitoli). Se falso ma esiste una
     * versione → fase **revisione indice** (solo outline, capitoli non sviluppati).
     */
    chaptersReady: computed(
      () => (store.version()?.chapters ?? []).some((c) => c.status === 'ready'),
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

      /** Sviluppa i capitoli dall'indice approvato (review indice → capitoli). */
      async generateChapters(projectId: string): Promise<void> {
        if (store.generating()) {
          return;
        }
        patchState(store, { generating: true });
        try {
          const version = await api.generateChapters(projectId);
          if (store.projectId() === projectId) {
            patchState(store, { version });
          }
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

      /** Apre un progetto DERIVATO: elabora e carica il contenuto dal server. */
      async openDerived(projectId: string): Promise<void> {
        patchState(store, { ...INITIAL, projectId, derivedGenerating: true });
        try {
          const derived = await api.generateDerived(projectId);
          if (store.projectId() === projectId) {
            patchState(store, { derived });
          }
        } finally {
          if (store.projectId() === projectId) {
            patchState(store, { derivedGenerating: false });
          }
        }
      },

      /** Rigenera il derivato applicando il feedback dell'utente all'AI. */
      async regenerateDerived(projectId: string, feedback: string): Promise<void> {
        if (store.derivedGenerating()) {
          return;
        }
        patchState(store, { derivedGenerating: true });
        try {
          const derived = await api.regenerateDerived(projectId, feedback);
          patchState(store, { derived });
        } finally {
          patchState(store, { derivedGenerating: false });
        }
      },

      /** Marca/smarca un capitolo come approvato (revisione). */
      toggleApproved(chapterId: string): void {
        patchState(store, (s) => ({
          approvedChapterIds: s.approvedChapterIds.includes(chapterId)
            ? s.approvedChapterIds.filter((id) => id !== chapterId)
            : [...s.approvedChapterIds, chapterId],
        }));
      },

      /** Approva tutti i capitoli della versione. */
      approveAll(): void {
        patchState(store, (s) => ({
          approvedChapterIds: (s.version?.chapters ?? []).map((c) => c.id),
        }));
      },
    };
  }),
);
