import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  addEntity,
  updateEntity,
  removeEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EMPTY,
  catchError,
  filter,
  finalize,
  mergeMap,
  pipe,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';

import type { DerivedKind, Job, Plan, Project, GenerationOptions } from '../domain';
import { API_PORT, type CreateProjectInput } from '../data/api-port';
import { RUNTIME_CONFIG } from '../config/runtime.config';
import { ACTIVE_STATUSES } from '../domain';

/**
 * ProjectsStore — SignalStore (NgRx) per i progetti.
 *
 * `withEntities<Project>` per la collezione; `withComputed` per i derivati
 * (attivi/pubblicati/needs-attention); `withMethods` per la business logic
 * (load/create/generate/cancel/publish/archive/pollJob), che passa SEMPRE dal
 * `ApiPort` (mai dal mock direttamente). Stato immutabile via `patchState`.
 */
export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<{
    loading: boolean;
    jobsByProject: Record<string, Job | null>;
    plan: Plan;
  }>({
    loading: false,
    jobsByProject: {},
    plan: 'free',
  }),
  withEntities<Project>(),
  withComputed((store) => ({
    /** Progetti "vivi" (Create hub) — ordinati per ultima attività. */
    activeProjects: computed(() =>
      [...store.entities()]
        .filter((p) => ACTIVE_STATUSES.includes(p.status))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    ),
    /** Progetti con almeno una versione pubblicata (Collection). */
    publishedProjects: computed(() =>
      store.entities().filter((p) => p.status === 'published'),
    ),
    /** Flag derivato "needs attention" = review|failed. */
    needsAttention: computed(() =>
      store.entities().filter((p) => p.status === 'review' || p.status === 'failed'),
    ),
  })),
  withMethods((store) => {
    const api = inject(API_PORT);
    const { pollIntervalMs } = inject(RUNTIME_CONFIG);

    /** Stati "in elaborazione" che giustificano il polling. */
    const isLive = (status: Project['status']): boolean =>
      status === 'processing' || status === 'queued';

    /** Aggiorna job + progetto nello store e ritorna il progetto. */
    const refresh = async (id: string): Promise<Project> => {
      const job = await api.getJob(id);
      patchState(store, (state) => ({
        jobsByProject: { ...state.jobsByProject, [id]: job },
      }));
      const project = await api.getProject(id);
      patchState(store, updateEntity({ id, changes: project }));
      return project;
    };

    /** Id con un poller già attivo → niente doppioni. */
    const polling = new Set<string>();

    /**
     * Polling reattivo del job (pattern ufficiale `rxMethod`): la subscription
     * è gestita sul lifecycle dello store → cleanup automatico, niente leak.
     * `timer` emette subito poi ogni POLL_INTERVAL_MS; `switchMap` evita overlap
     * di richieste; `takeWhile(…, true)` chiude appena il progetto esce dagli
     * stati "vivi" (emettendo lo stato finale); `mergeMap` permette il polling
     * concorrente di più progetti; `catchError` isola gli errori per-id.
     * Sostituibile con SSE/WS dietro la stessa firma.
     */
    const pollJob = rxMethod<string>(
      pipe(
        filter((id) => !polling.has(id)),
        tap((id) => polling.add(id)),
        mergeMap((id) =>
          timer(0, pollIntervalMs).pipe(
            switchMap(() => refresh(id)),
            takeWhile((project) => isLive(project.status), true),
            catchError(() => EMPTY),
            finalize(() => polling.delete(id)),
          ),
        ),
      ),
    );

    const loadAll = async (): Promise<void> => {
      patchState(store, { loading: true });
      const projects = await api.listProjects();
      patchState(store, setAllEntities(projects), { loading: false });
      // Avvia il polling per i progetti in elaborazione.
      for (const project of projects) {
        if (isLive(project.status)) {
          pollJob(project.id);
        }
      }
    };

    /** Carica il piano del workspace (gating soft del wizard). */
    const loadPlan = async (): Promise<void> => {
      const plan = await api.getPlan();
      patchState(store, { plan });
    };

    return {
      loadAll,
      loadPlan,
      pollJob,

      /** Aggiorna le opzioni di generazione di un progetto (autosave del wizard). */
      async updateSettings(id: string, generationOptions: GenerationOptions): Promise<void> {
        const project = await api.patchProject(id, { generationOptions });
        patchState(store, updateEntity({ id, changes: project }));
      },

      /**
       * Aggiorna i metadati di una draft (titolo + file scelti nel wizard).
       * Separato da `updateSettings` per non gonfiarne la firma di dominio.
       */
      async updateDraftMeta(
        id: string,
        patch: { title?: string; materialFileIds?: string[]; instructionFileIds?: string[] },
      ): Promise<void> {
        const project = await api.patchProject(id, patch);
        patchState(store, updateEntity({ id, changes: project }));
      },

      /** Crea un nuovo progetto (draft) e lo aggiunge allo store. */
      async create(title: string, documentType: Project['documentType']): Promise<Project> {
        const project = await api.createProject({
          title,
          documentType,
          materialFileIds: [],
          instructionFileIds: [],
        });
        patchState(store, addEntity(project));
        return project;
      },

      /**
       * Crea un progetto draft dal flusso "Personalizza il modello" passando il
       * payload del contratto (titolo + opzioni di generazione + file + tema).
       */
      async createFromTemplate(input: CreateProjectInput): Promise<Project> {
        const project = await api.createProject(input);
        patchState(store, addEntity(project));
        return project;
      },

      /** Lancia la generazione: draft→queued e avvia il polling del job. */
      async generate(id: string): Promise<void> {
        await api.generate(id);
        const project = await api.getProject(id);
        patchState(store, updateEntity({ id, changes: project }));
        pollJob(id);
      },

      /** Annulla il job in corso: torna a draft. */
      async cancel(id: string): Promise<void> {
        const project = await api.cancel(id);
        patchState(store, updateEntity({ id, changes: project }), (state) => ({
          jobsByProject: omitKey(state.jobsByProject, id),
        }));
      },

      /** Pubblica un progetto in review. */
      async publish(id: string): Promise<void> {
        const project = await api.publish(id);
        patchState(store, updateEntity({ id, changes: project }));
      },

      /** Archivia un progetto. */
      async archive(id: string): Promise<void> {
        const project = await api.archive(id);
        patchState(store, updateEntity({ id, changes: project }));
      },

      /** Riapre un progetto archiviato → review|draft (vedi mock). */
      async reopen(id: string): Promise<void> {
        const project = await api.reopen(id);
        patchState(store, updateEntity({ id, changes: project }));
      },

      /** Elimina definitivamente un progetto. */
      async delete(id: string): Promise<void> {
        await api.deleteProject(id);
        patchState(store, removeEntity(id));
      },

      /** Crea un progetto derivato collegato (lingua opzionale per traduzione). */
      async derive(id: string, derivedKind: DerivedKind, language?: string): Promise<Project> {
        const child = await api.derive(id, derivedKind, language);
        await loadAll();
        return child;
      },
    };
  }),
  // Self-init: lo store si popola alla prima injection (pattern ufficiale
  // `withHooks.onInit`, eseguito in injection context). I consumer leggono solo
  // i signal — niente orchestrazione di `loadAll` nei componenti.
  withHooks({
    onInit(store) {
      void store.loadAll();
      void store.loadPlan();
    },
  }),
);

/** Rimuove una chiave da un record in modo immutabile. */
function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const { [key]: _removed, ...rest } = record;
  return rest;
}
