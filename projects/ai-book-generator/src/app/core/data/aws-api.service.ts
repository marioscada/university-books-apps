import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  ApiPort,
  ListProjectsFilter,
  CreateProjectInput,
  PatchProjectInput,
  CreateUploadInput,
  ListSourcesFilter,
  PatchSourceInput,
} from './api-port';
import type {
  Project,
  DerivedKind,
  Job,
  Source,
  Plan,
  Version,
  ChatMessage,
  DerivedContent,
  GenerationOptions,
} from '../domain';

/**
 * AwsApiService — implementazione di PRODUZIONE di `ApiPort` verso il backend
 * `ai-platform-university-books` (API Gateway + Cognito). NESSUN dato mock:
 *
 * - Tutto ciò che il backend espone → HTTP reale (`/v1/projects`, `/v1/documents`).
 * - **AI non ancora collegata** (chat + contenuti derivati): ritorna **vuoto**
 *   (no dati finti) finché Bedrock/Claude non sarà disponibile. È l'**unico** punto
 *   da collegare per completare la produzione.
 * - **Plan**: default `free` finché non c'è il servizio billing.
 *
 * I modelli di pubblicazione NON passano da qui: sono config statica dell'app
 * (`TEMPLATE_CATALOG`), letta direttamente dal `TemplatesStore`.
 *
 * L'`authInterceptor` aggiunge il Bearer Cognito alle richieste `execute-api`.
 */
@Injectable({ providedIn: 'root' })
export class AwsApiService implements ApiPort {
  private readonly http = inject(HttpClient);
  private readonly base = environment.api.baseUrl;
  private url(path: string): string {
    return `${this.base}${path}`;
  }

  // ===========================================================================
  // Projects — REALI (/v1/projects)
  // ===========================================================================
  async listProjects(filter?: ListProjectsFilter): Promise<Project[]> {
    let params = new HttpParams();
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.documentType) params = params.set('documentType', filter.documentType);
    if (filter?.q) params = params.set('q', filter.q);
    const res = await firstValueFrom(
      this.http.get<{ projects: Project[] }>(this.url('/v1/projects'), { params }),
    );
    return res.projects ?? [];
  }

  getProject(id: string): Promise<Project> {
    return firstValueFrom(this.http.get<Project>(this.url(`/v1/projects/${id}`)));
  }

  createProject(input: CreateProjectInput): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(this.url('/v1/projects'), input));
  }

  patchProject(id: string, patch: PatchProjectInput): Promise<Project> {
    return firstValueFrom(this.http.patch<Project>(this.url(`/v1/projects/${id}`), patch));
  }

  generate(id: string): Promise<Job> {
    return firstValueFrom(this.http.post<unknown>(this.url(`/v1/projects/${id}/generate`), {})).then(
      (j) => this.mapJob(j),
    );
  }

  cancel(id: string): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(this.url(`/v1/projects/${id}/cancel`), {}));
  }

  async getJob(projectId: string): Promise<Job | null> {
    const j = await firstValueFrom(this.http.get<unknown>(this.url(`/v1/projects/${projectId}/job`)));
    return j ? this.mapJob(j) : null;
  }

  async getCurrentVersion(projectId: string): Promise<Version | null> {
    const v = await firstValueFrom(
      this.http.get<unknown>(this.url(`/v1/projects/${projectId}/version`)),
    );
    return v ? this.mapVersion(v) : null;
  }

  generateChapters(projectId: string): Promise<Version> {
    return firstValueFrom(
      this.http.post<unknown>(this.url(`/v1/projects/${projectId}/chapters`), {}),
    ).then((v) => this.mapVersion(v));
  }

  async deleteProject(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/v1/projects/${id}`)));
  }

  // ----- Lifecycle: una sola rotta reale, azione nel body ---------------------
  private lifecycle(id: string, payload: Record<string, unknown>): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(this.url(`/v1/projects/${id}/lifecycle`), payload));
  }
  publish(id: string): Promise<Project> {
    return this.lifecycle(id, { action: 'publish' });
  }
  archive(id: string): Promise<Project> {
    return this.lifecycle(id, { action: 'archive' });
  }
  reopen(id: string): Promise<Project> {
    return this.lifecycle(id, { action: 'reopen' });
  }
  duplicate(id: string): Promise<Project> {
    return this.lifecycle(id, { action: 'duplicate' });
  }
  derive(id: string, derivedKind: DerivedKind, language?: string): Promise<Project> {
    return this.lifecycle(id, { action: 'derive', derivedKind, language });
  }

  // ===========================================================================
  // AI (chat + derivati) — NON collegata: ritorna VUOTO (no dati finti).
  // Unico punto da implementare quando Bedrock/Claude sarà disponibile.
  // ===========================================================================
  async listChatMessages(_projectId: string): Promise<ChatMessage[]> {
    return [];
  }
  async sendChatMessage(_projectId: string, _text: string): Promise<ChatMessage[]> {
    // AI non collegata: nessuna risposta finché non c'è il servizio AI.
    return [];
  }
  async generateDerived(projectId: string): Promise<DerivedContent> {
    const project = await this.getProject(projectId);
    return { kind: project.derivedKind ?? 'summary', title: project.title };
  }
  async regenerateDerived(projectId: string, _feedback: string): Promise<DerivedContent> {
    return this.generateDerived(projectId);
  }

  // ===========================================================================
  // Sources / Library — REALI (/v1/documents)
  // ===========================================================================
  async listSources(filter?: ListSourcesFilter): Promise<Source[]> {
    let params = new HttpParams();
    if (filter?.folder) params = params.set('folder', filter.folder);
    if (filter?.tag) params = params.set('tag', filter.tag);
    if (filter?.q) params = params.set('q', filter.q);
    const res = await firstValueFrom(
      this.http.get<{ sources: Source[] }>(this.url('/v1/documents'), { params }),
    );
    return res.sources ?? [];
  }

  async getSource(id: string): Promise<Source> {
    // Il dettaglio Source usa la stessa proiezione della lista (shape coerente).
    const all = await this.listSources();
    const found = all.find((s) => s.id === id);
    if (!found) throw new Error(`Source not found: ${id}`);
    return found;
  }

  createNote(name: string): Promise<Source> {
    return firstValueFrom(this.http.post<Source>(this.url('/v1/documents'), { name, content: '' }));
  }

  patchSource(id: string, patch: PatchSourceInput): Promise<Source> {
    return firstValueFrom(this.http.patch<Source>(this.url(`/v1/documents/${id}`), patch));
  }

  async deleteSource(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/v1/documents/${id}`)));
  }

  async getIngestJob(sourceId: string): Promise<Job> {
    const res = await firstValueFrom(
      this.http.get<{ sourceId: string; status: string }>(
        this.url(`/v1/documents/${sourceId}/ingest`),
      ),
    );
    // L'ingest non è un Job completo: lo normalizziamo a Job minimale.
    const done = res.status === 'ready';
    const failed = res.status === 'failed';
    return {
      id: `ingest-${sourceId}`,
      sourceId,
      type: 'ingest',
      status: failed ? 'failed' : done ? 'succeeded' : 'running',
      steps: [],
      progress: done ? 100 : 0,
      queuedSourceIds: [],
      log: [],
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Upload fonte file: crea il record reale via presigned-url. NB: il caricamento
   * dei byte (PUT su S3) richiede il File, non presente in questa firma `ApiPort`
   * → quando il flusso upload del FE passerà il File, qui si aggiunge il PUT.
   */
  async createUpload(input: CreateUploadInput): Promise<Source> {
    const res = await firstValueFrom(
      this.http.post<{ documentId: string }>(this.url('/v1/documents/presigned-url'), {
        fileName: input.name,
        contentType: input.mime ?? 'application/pdf',
        fileSize: input.sizeBytes,
      }),
    );
    return {
      id: res.documentId,
      workspaceId: '',
      ownerId: '',
      name: input.name,
      type: 'pdf',
      mime: input.mime,
      sizeBytes: input.sizeBytes,
      uploadedAt: new Date().toISOString(),
      ingestStatus: 'pending',
      tags: [],
      usedInProjectIds: [],
    };
  }

  // ===========================================================================
  // Plan — default `free` finché non c'è il servizio billing.
  // ===========================================================================
  async getPlan(): Promise<Plan> {
    return 'free';
  }

  // ===========================================================================
  // Mapping helpers (normalizzano i campi assenti rispetto al dominio FE)
  // ===========================================================================
  private mapJob(j: unknown): Job {
    const b = j as Partial<Job> & Record<string, unknown>;
    return {
      id: b.id as string,
      projectId: b.projectId as string | undefined,
      sourceId: b.sourceId as string | undefined,
      versionId: b.versionId as string | undefined,
      type: b.type as Job['type'],
      status: b.status as Job['status'],
      steps: (b.steps as Job['steps']) ?? [],
      currentStepKey: b.currentStepKey as string | undefined,
      progress: (b.progress as number) ?? 0,
      etaSeconds: b.etaSeconds as number | undefined,
      targetChapterIds: b.targetChapterIds as string[] | undefined,
      queuedSourceIds: (b.queuedSourceIds as string[]) ?? [],
      log: (b.log as Job['log']) ?? [],
      createdAt: b.createdAt as string,
      startedAt: b.startedAt as string | undefined,
      finishedAt: b.finishedAt as string | undefined,
      error: b.error as Job['error'],
    };
  }

  private mapVersion(v: unknown): Version {
    const b = v as Partial<Version> & Record<string, unknown>;
    return {
      id: b.id as string,
      projectId: b.projectId as string,
      number: (b.number as number) ?? 1,
      label: b.label as string | undefined,
      status: (b.status as Version['status']) ?? 'draft',
      createdAt: b.createdAt as string,
      createdBy: (b.createdBy as string) ?? '',
      settingsSnapshot: (b.settingsSnapshot as GenerationOptions) ?? ({} as GenerationOptions),
      sourcesUsedIds: (b.sourcesUsedIds as string[]) ?? [],
      outline: (b.outline as Version['outline']) ?? [],
      chapters: (b.chapters as Version['chapters']) ?? [],
      outputs: (b.outputs as Version['outputs']) ?? [],
      changeSummary: b.changeSummary as string | undefined,
    };
  }
}
