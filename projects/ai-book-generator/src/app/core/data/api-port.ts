import { InjectionToken } from '@angular/core';

import type {
  Project,
  ProjectStatus,
  ProjectKind,
  DerivedKind,
  Job,
  Source,
  Plan,
} from '../domain';

/**
 * ApiPort — il "buco" per il backend.
 *
 * Mappa il contratto REST-ish di PRODUCT-ARCHITECTURE.md §7 in metodi tipizzati
 * `Promise`-based. In v1 è implementato da `MockApiService`; quando subentra il
 * backend reale, basterà fornire un'altra implementazione dietro lo stesso token,
 * senza toccare store né UI.
 */
export interface ApiPort {
  // --- Projects -------------------------------------------------------------
  /** GET /projects?status=&kind=&q= */
  listProjects(filter?: ListProjectsFilter): Promise<Project[]>;
  /** GET /projects/:id */
  getProject(id: string): Promise<Project>;
  /** POST /projects (crea draft dal wizard) */
  createProject(input: CreateProjectInput): Promise<Project>;
  /** PATCH /projects/:id (title/settings) */
  patchProject(id: string, patch: PatchProjectInput): Promise<Project>;
  /** POST /projects/:id/generate (draft→queued, crea Version draft) */
  generate(id: string): Promise<Job>;
  /** POST /projects/:id/cancel */
  cancel(id: string): Promise<Project>;
  /** POST /projects/:id/publish (review→published, congela Version) */
  publish(id: string): Promise<Project>;
  /** POST /projects/:id/archive */
  archive(id: string): Promise<Project>;
  /** POST /projects/:id/reopen */
  reopen(id: string): Promise<Project>;
  /** POST /projects/:id/duplicate */
  duplicate(id: string): Promise<Project>;
  /** POST /projects/:id/derive ({ derivedKind }) figlio collegato */
  derive(id: string, derivedKind: DerivedKind): Promise<Project>;

  // --- Jobs (polling live) --------------------------------------------------
  /** GET /projects/:id/job (polled ~2s) */
  getJob(projectId: string): Promise<Job | null>;

  // --- Library (Sources) ----------------------------------------------------
  /** GET /sources?folder=&tag=&q= */
  listSources(filter?: ListSourcesFilter): Promise<Source[]>;
  /** GET /sources/:id */
  getSource(id: string): Promise<Source>;
  /** POST /sources — crea una nota inline (mock, ingest immediato `ready`). */
  createNote(name: string): Promise<Source>;
  /** PATCH /sources/:id (tags/folder/category) */
  patchSource(id: string, patch: PatchSourceInput): Promise<Source>;
  /** DELETE /sources/:id */
  deleteSource(id: string): Promise<void>;
  /** GET /sources/:id/ingest (stato estrazione) */
  getIngestJob(sourceId: string): Promise<Job>;

  // --- Workspace / plan (gating) -------------------------------------------
  /** Piano del workspace corrente (v1 mock: `free`) — usato per il gating soft. */
  getPlan(): Promise<Plan>;
}

export interface ListProjectsFilter {
  status?: ProjectStatus;
  kind?: ProjectKind;
  q?: string;
}

export interface CreateProjectInput {
  title: string;
  kind: ProjectKind;
}

export interface PatchProjectInput {
  title?: string;
  settings?: Project['settings'];
  sourceIds?: string[];
}

export interface ListSourcesFilter {
  folder?: string;
  tag?: string;
  q?: string;
}

export interface PatchSourceInput {
  tags?: string[];
  folder?: string;
  category?: string;
}

/**
 * Token DI per `ApiPort`. In v1 è mappato a `MockApiService`
 * (`useExisting`), così gli store dipendono dall'interfaccia, non dal mock.
 */
export const API_PORT = new InjectionToken<ApiPort>('ApiPort');
