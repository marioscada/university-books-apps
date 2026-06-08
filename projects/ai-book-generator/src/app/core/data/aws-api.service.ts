import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MockApiService } from './mock-api.service';
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
  ProjectTemplate,
  DerivedKind,
  Job,
  Source,
  Plan,
  Version,
  ChatMessage,
  DerivedContent,
  ProjectSettings,
} from '../domain';

/**
 * AwsApiService — implementazione REALE di `ApiPort` verso il backend
 * `ai-platform-university-books` (API Gateway + Cognito). L'`authInterceptor`
 * aggiunge automaticamente il Bearer token alle richieste `execute-api`.
 *
 * È un adapter IBRIDO: i metodi già coperti dal backend usano HttpClient verso
 * gli endpoint reali (`/v1/projects`, `/v1/documents`); quelli non ancora pronti
 * lato server (templates, upload presigned, chat/derivati AI, piano/billing,
 * lifecycle avanzato, getSource/ingest) DELEGANO a `MockApiService`, così lo
 * switch del provider `API_PORT` è graduale e senza regressioni.
 *
 * Mapping di dominio: il backend `Project` è 1:1 col dominio FE (by design) →
 * pass-through. Per `Version`/`Job` si normalizzano i campi assenti con default.
 */
@Injectable({ providedIn: 'root' })
export class AwsApiService implements ApiPort {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(MockApiService);

  private readonly base = environment.api.baseUrl;
  private url(path: string): string {
    return `${this.base}${path}`;
  }

  // ===========================================================================
  // Templates — DELEGATI a mock (shape backend ≠ ProjectTemplate, da concordare)
  // ===========================================================================
  listTemplates(): Promise<ProjectTemplate[]> {
    return this.mock.listTemplates();
  }
  getTemplate(id: string): Promise<ProjectTemplate> {
    return this.mock.getTemplate(id);
  }

  // ===========================================================================
  // Projects — REALI (/v1/projects)
  // ===========================================================================
  async listProjects(filter?: ListProjectsFilter): Promise<Project[]> {
    let params = new HttpParams();
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.kind) params = params.set('kind', filter.kind);
    if (filter?.q) params = params.set('q', filter.q);
    const res = await firstValueFrom(
      this.http.get<{ projects: Project[]; nextCursor?: string }>(this.url('/v1/projects'), {
        params,
      }),
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
    return firstValueFrom(
      this.http.post<unknown>(this.url(`/v1/projects/${id}/generate`), {}),
    ).then((j) => this.mapJob(j));
  }

  cancel(id: string): Promise<Project> {
    return firstValueFrom(this.http.post<Project>(this.url(`/v1/projects/${id}/cancel`), {}));
  }

  async getJob(projectId: string): Promise<Job | null> {
    const j = await firstValueFrom(
      this.http.get<unknown>(this.url(`/v1/projects/${projectId}/job`)),
    );
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

  // ----- Lifecycle / publish / derive: backend non ancora pronto → mock --------
  publish(id: string): Promise<Project> {
    return this.mock.publish(id);
  }
  archive(id: string): Promise<Project> {
    return this.mock.archive(id);
  }
  reopen(id: string): Promise<Project> {
    return this.mock.reopen(id);
  }
  duplicate(id: string): Promise<Project> {
    return this.mock.duplicate(id);
  }
  derive(id: string, derivedKind: DerivedKind, language?: string): Promise<Project> {
    return this.mock.derive(id, derivedKind, language);
  }

  // ===========================================================================
  // Derivati + Chat — AI: restano MOCK (come da accordo)
  // ===========================================================================
  generateDerived(projectId: string): Promise<DerivedContent> {
    return this.mock.generateDerived(projectId);
  }
  regenerateDerived(projectId: string, feedback: string): Promise<DerivedContent> {
    return this.mock.regenerateDerived(projectId, feedback);
  }
  listChatMessages(projectId: string): Promise<ChatMessage[]> {
    return this.mock.listChatMessages(projectId);
  }
  sendChatMessage(projectId: string, text: string): Promise<ChatMessage[]> {
    return this.mock.sendChatMessage(projectId, text);
  }

  // ===========================================================================
  // Sources / Library — REALI (/v1/documents) dove il backend è pronto
  // ===========================================================================
  async listSources(filter?: ListSourcesFilter): Promise<Source[]> {
    let params = new HttpParams();
    if (filter?.folder) params = params.set('folder', filter.folder);
    if (filter?.tag) params = params.set('tag', filter.tag);
    if (filter?.q) params = params.set('q', filter.q);
    const res = await firstValueFrom(
      this.http.get<{ sources: Source[]; nextCursor?: string }>(this.url('/v1/documents'), {
        params,
      }),
    );
    return res.sources ?? [];
  }

  createNote(name: string): Promise<Source> {
    return firstValueFrom(
      this.http.post<Source>(this.url('/v1/documents'), { name, content: '' }),
    );
  }

  patchSource(id: string, patch: PatchSourceInput): Promise<Source> {
    return firstValueFrom(this.http.patch<Source>(this.url(`/v1/documents/${id}`), patch));
  }

  async deleteSource(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/v1/documents/${id}`)));
  }

  // ----- getSource / upload / ingest / plan: shape o flusso non 1:1 → mock -----
  getSource(id: string): Promise<Source> {
    return this.mock.getSource(id);
  }
  createUpload(input: CreateUploadInput): Promise<Source> {
    return this.mock.createUpload(input);
  }
  getIngestJob(sourceId: string): Promise<Job> {
    return this.mock.getIngestJob(sourceId);
  }
  getPlan(): Promise<Plan> {
    return this.mock.getPlan();
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
      settingsSnapshot: (b.settingsSnapshot as ProjectSettings) ?? ({} as ProjectSettings),
      sourcesUsedIds: (b.sourcesUsedIds as string[]) ?? [],
      outline: (b.outline as Version['outline']) ?? [],
      chapters: (b.chapters as Version['chapters']) ?? [],
      outputs: (b.outputs as Version['outputs']) ?? [],
      changeSummary: b.changeSummary as string | undefined,
    };
  }
}
