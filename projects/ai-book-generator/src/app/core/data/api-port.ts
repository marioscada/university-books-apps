import { InjectionToken } from '@angular/core';

import type { components } from './api-types.generated';
import type {
  Project,
  ProjectStatus,
  DocumentType,
  CoverTheme,
  DerivedKind,
  Job,
  Source,
  Plan,
  Version,
  ChatMessage,
  DerivedContent,
} from '../domain';

/**
 * ApiPort — il "buco" per il backend.
 *
 * Mappa il contratto REST-ish di PRODUCT-ARCHITECTURE.md §7 in metodi tipizzati
 * `Promise`-based. Implementato da `AwsApiService` (backend reale); gli store/UI
 * dipendono solo da questa interfaccia, non dall'implementazione.
 */
export interface ApiPort {
  // NB: i modelli di pubblicazione (ProjectTemplate) NON sono qui: sono config
  // statica dell'app (catalogo `TEMPLATE_CATALOG`), letta direttamente dal
  // TemplatesStore. Questo port espone solo ciò che è (o sarà) servito dal backend.

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
  /** DELETE /projects/:id */
  deleteProject(id: string): Promise<void>;
  /** POST /projects/:id/derive ({ derivedKind, language? }) figlio collegato */
  derive(id: string, derivedKind: DerivedKind, language?: string): Promise<Project>;

  // --- Derivati (contenuto elaborato dal server) ----------------------------
  /** POST /projects/:id/derived — elabora e restituisce il contenuto del derivato. */
  generateDerived(projectId: string): Promise<DerivedContent>;
  /** POST /projects/:id/derived/regenerate — rielabora dato il feedback dell'utente. */
  regenerateDerived(projectId: string, feedback: string): Promise<DerivedContent>;

  // --- Jobs (polling live) --------------------------------------------------
  /** GET /projects/:id/job (polled ~2s) */
  getJob(projectId: string): Promise<Job | null>;

  // --- Versions (output: indice + capitoli) ---------------------------------
  /**
   * GET /projects/:id/version — versione corrente. Dopo la sola analisi i capitoli
   * sono in `pending` (solo indice/outline); dopo `generateChapters` sono `ready`.
   */
  getCurrentVersion(projectId: string): Promise<Version | null>;
  /** POST /projects/:id/chapters — sviluppa i capitoli dall'indice approvato. */
  generateChapters(projectId: string): Promise<Version>;

  // --- Chat contestuale al progetto -----------------------------------------
  /** GET /projects/:id/chat — il thread di messaggi del progetto. */
  listChatMessages(projectId: string): Promise<ChatMessage[]>;
  /**
   * POST /projects/:id/chat — invia un messaggio utente; ritorna i NUOVI messaggi
   * ([utente, risposta assistente]). In v1 la risposta è simulata.
   */
  sendChatMessage(projectId: string, text: string): Promise<ChatMessage[]>;

  // --- Library (Sources) ----------------------------------------------------
  /** GET /sources?folder=&tag=&q= */
  listSources(filter?: ListSourcesFilter): Promise<Source[]>;
  /** GET /sources/:id */
  getSource(id: string): Promise<Source>;
  /** POST /sources — crea una nota inline (mock, ingest immediato `ready`). */
  createNote(name: string): Promise<Source>;
  /**
   * POST /sources (upload). Mock: crea una Source dal file (tipo dedotto da
   * estensione/mime), ingest immediato `ready`. Con backend AWS diventerà un PUT
   * presigned su S3 + record via API Gateway, dietro questa stessa firma.
   */
  createUpload(input: CreateUploadInput): Promise<Source>;
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
  documentType?: DocumentType;
  q?: string;
}

/** Input creazione progetto — generato 1:1 dallo schema backend (OpenAPI). */
export type CreateProjectInput = components['schemas']['CreateProjectRequest'];

export interface CreateUploadInput {
  name: string;
  sizeBytes: number;
  mime?: string;
}

export interface PatchProjectInput {
  title?: string;
  description?: string;
  generationOptions?: Project['generationOptions'];
  materialFileIds?: string[];
  instructionFileIds?: string[];
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
 * Token DI per `ApiPort`. Mappato a `AwsApiService` (`useExisting`), così gli
 * store dipendono dall'interfaccia, non dall'implementazione.
 */
export const API_PORT = new InjectionToken<ApiPort>('ApiPort');
