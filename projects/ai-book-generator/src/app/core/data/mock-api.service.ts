import { DestroyRef, Injectable, inject } from '@angular/core';

import type {
  Project,
  ProjectStatus,
  DerivedKind,
  Job,
  JobStep,
  Source,
  Plan,
} from '../domain';
import type {
  ApiPort,
  ListProjectsFilter,
  CreateProjectInput,
  CreateUploadInput,
  PatchProjectInput,
  ListSourcesFilter,
  PatchSourceInput,
} from './api-port';
import { SEED_PROJECTS, SEED_SOURCES } from './mock-seed';

/** Latenza simulata di rete (ms). */
const NETWORK_DELAY_MS = 120;
/** Cadenza dell'avanzamento del job simulato (ms). */
const JOB_TICK_MS = 1000;
/** Incremento di progress per tick. */
const JOB_PROGRESS_STEP = 4;

/** Deduce il `SourceType` dall'estensione del nome file (o dal mime). */
function inferSourceType(name: string, mime?: string): Source['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'ppt' || ext === 'pptx') return 'pptx';
  if (ext === 'csv') return 'csv';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime?.startsWith('image/')) return 'image';
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext) || mime?.startsWith('audio/')) return 'audio';
  return 'note';
}

/** Pipeline standard di un job `generate` (label come chiavi i18n). */
const GENERATE_STEPS: readonly Omit<JobStep, 'status'>[] = [
  { key: 'analyze', labelKey: 'i18n.Job.Step.analyze' },
  { key: 'outline', labelKey: 'i18n.Job.Step.outline' },
  { key: 'chapters', labelKey: 'i18n.Job.Step.chapters' },
  { key: 'render', labelKey: 'i18n.Job.Step.render' },
];

/**
 * MockApiService — implementazione v1 di `ApiPort`.
 *
 * Sorgente dati: `mock-seed`. Mantiene uno stato interno mutabile (clone del seed)
 * e simula i job asincroni con `setInterval`: progress/step/ETA avanzano nel tempo,
 * così il polling via `getJob` mostra l'avanzamento e, al completamento, il
 * progetto transita `processing → review`. Le firme rispettano il contratto §7,
 * così lo swap col backend reale è indolore.
 *
 * Nessuna sottoscrizione RxJS: tutto Promise-based.
 */
@Injectable({ providedIn: 'root' })
export class MockApiService implements ApiPort {
  /** Stato interno (clone profondo del seed → il seed resta immutabile). */
  private readonly projects = new Map<string, Project>();
  private readonly sources = new Map<string, Source>();
  private readonly jobs = new Map<string, Job>();
  /** Timer attivi per job in corso, per id job. */
  private readonly jobTimers = new Map<string, ReturnType<typeof setInterval>>();

  constructor() {
    for (const project of SEED_PROJECTS) {
      this.projects.set(project.id, structuredClone(project));
    }
    for (const source of SEED_SOURCES) {
      this.sources.set(source.id, structuredClone(source));
    }
    // Avvia il job del progetto seed già "processing" → progress che avanza.
    this.startSeedProcessingJobs();
    // Rete di sicurezza: azzera tutti i timer attivi allo smontaggio.
    inject(DestroyRef).onDestroy(() => {
      this.jobTimers.forEach((timer) => clearInterval(timer));
      this.jobTimers.clear();
    });
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async listProjects(filter?: ListProjectsFilter): Promise<Project[]> {
    await this.delay();
    let list = [...this.projects.values()];
    if (filter?.status) {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter?.kind) {
      list = list.filter((p) => p.kind === filter.kind);
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list.map((p) => structuredClone(p));
  }

  async getProject(id: string): Promise<Project> {
    await this.delay();
    return structuredClone(this.requireProject(id));
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    await this.delay();
    const now = new Date().toISOString();
    const project: Project = {
      id: this.newId('proj'),
      workspaceId: 'ws-personal',
      ownerId: 'user-1',
      title: input.title,
      kind: input.kind,
      status: 'draft',
      coverTheme: 'ocean',
      settings: {
        instructions: '',
        processingMode: 'balanced',
        structure: {
          bibliography: false,
          glossary: false,
          quiz: false,
          exercises: false,
          appendices: false,
          tables: false,
          images: false,
        },
        outputFormats: ['pdf'],
        language: 'en',
      },
      versionIds: [],
      derivedProjectIds: [],
      sourceIds: [],
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return structuredClone(project);
  }

  async patchProject(id: string, patch: PatchProjectInput): Promise<Project> {
    await this.delay();
    const project = this.requireProject(id);
    if (patch.title !== undefined) {
      project.title = patch.title;
    }
    if (patch.settings !== undefined) {
      project.settings = structuredClone(patch.settings);
    }
    if (patch.sourceIds !== undefined) {
      project.sourceIds = [...patch.sourceIds];
    }
    project.updatedAt = new Date().toISOString();
    return structuredClone(project);
  }

  async generate(id: string): Promise<Job> {
    await this.delay();
    const project = this.requireProject(id);
    const job = this.createGenerateJob(project.id);
    this.jobs.set(job.id, job);
    project.status = 'queued';
    project.currentJobId = job.id;
    project.updatedAt = new Date().toISOString();
    this.runJob(job.id);
    return structuredClone(job);
  }

  async cancel(id: string): Promise<Project> {
    await this.delay();
    const project = this.requireProject(id);
    if (project.currentJobId) {
      const job = this.jobs.get(project.currentJobId);
      if (job) {
        this.stopTimer(job.id);
        job.status = 'cancelled';
        job.finishedAt = new Date().toISOString();
      }
    }
    project.status = 'draft';
    project.currentJobId = undefined;
    project.updatedAt = new Date().toISOString();
    return structuredClone(project);
  }

  async publish(id: string): Promise<Project> {
    await this.delay();
    const project = this.requireProject(id);
    project.status = 'published';
    project.updatedAt = new Date().toISOString();
    return structuredClone(project);
  }

  async archive(id: string): Promise<Project> {
    await this.delay();
    const project = this.requireProject(id);
    project.status = 'archived';
    project.updatedAt = new Date().toISOString();
    return structuredClone(project);
  }

  async reopen(id: string): Promise<Project> {
    await this.delay();
    const project = this.requireProject(id);
    project.status = project.versionIds.length > 0 ? 'review' : 'draft';
    project.updatedAt = new Date().toISOString();
    return structuredClone(project);
  }

  async duplicate(id: string): Promise<Project> {
    await this.delay();
    const source = this.requireProject(id);
    const now = new Date().toISOString();
    const copy: Project = {
      ...structuredClone(source),
      id: this.newId('proj'),
      title: `${source.title} (copy)`,
      status: 'draft',
      currentJobId: undefined,
      currentVersionId: undefined,
      versionIds: [],
      derivedProjectIds: [],
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(copy.id, copy);
    return structuredClone(copy);
  }

  async derive(id: string, derivedKind: DerivedKind): Promise<Project> {
    await this.delay();
    const parent = this.requireProject(id);
    const now = new Date().toISOString();
    const child: Project = {
      id: this.newId('proj'),
      workspaceId: parent.workspaceId,
      ownerId: parent.ownerId,
      title: `${parent.title} — ${derivedKind}`,
      kind: 'custom',
      status: 'draft',
      coverTheme: parent.coverTheme,
      settings: structuredClone(parent.settings),
      versionIds: [],
      parentProjectId: parent.id,
      derivedKind,
      derivedProjectIds: [],
      sourceIds: [...parent.sourceIds],
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(child.id, child);
    parent.derivedProjectIds = [...parent.derivedProjectIds, child.id];
    parent.updatedAt = now;
    return structuredClone(child);
  }

  // ===========================================================================
  // Jobs
  // ===========================================================================

  async getJob(projectId: string): Promise<Job | null> {
    await this.delay();
    const project = this.projects.get(projectId);
    if (!project?.currentJobId) {
      return null;
    }
    const job = this.jobs.get(project.currentJobId);
    return job ? structuredClone(job) : null;
  }

  // ===========================================================================
  // Sources
  // ===========================================================================

  async listSources(filter?: ListSourcesFilter): Promise<Source[]> {
    await this.delay();
    let list = [...this.sources.values()];
    if (filter?.folder) {
      list = list.filter((s) => s.folder === filter.folder);
    }
    if (filter?.tag) {
      list = list.filter((s) => s.tags.includes(filter.tag as string));
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list.map((s) => structuredClone(s));
  }

  async getSource(id: string): Promise<Source> {
    await this.delay();
    return structuredClone(this.requireSource(id));
  }

  async createNote(name: string): Promise<Source> {
    await this.delay();
    const now = new Date().toISOString();
    const note: Source = {
      id: this.newId('src'),
      workspaceId: 'ws-personal',
      ownerId: 'user-1',
      name,
      type: 'note',
      mime: 'text/plain',
      sizeBytes: name.length,
      uploadedAt: now,
      ingestStatus: 'ready',
      lastAnalyzedAt: now,
      tags: [],
      usedInProjectIds: [],
      permission: 'owner',
    };
    this.sources.set(note.id, note);
    return structuredClone(note);
  }

  async createUpload(input: CreateUploadInput): Promise<Source> {
    await this.delay();
    const now = new Date().toISOString();
    const source: Source = {
      id: this.newId('src'),
      workspaceId: 'ws-personal',
      ownerId: 'user-1',
      name: input.name,
      type: inferSourceType(input.name, input.mime),
      mime: input.mime,
      sizeBytes: input.sizeBytes,
      uploadedAt: now,
      ingestStatus: 'ready',
      lastAnalyzedAt: now,
      tags: [],
      usedInProjectIds: [],
      permission: 'owner',
    };
    this.sources.set(source.id, source);
    return structuredClone(source);
  }

  async patchSource(id: string, patch: PatchSourceInput): Promise<Source> {
    await this.delay();
    const source = this.requireSource(id);
    if (patch.tags !== undefined) {
      source.tags = [...patch.tags];
    }
    if (patch.folder !== undefined) {
      source.folder = patch.folder;
    }
    if (patch.category !== undefined) {
      source.category = patch.category;
    }
    return structuredClone(source);
  }

  async deleteSource(id: string): Promise<void> {
    await this.delay();
    this.sources.delete(id);
  }

  async getIngestJob(sourceId: string): Promise<Job> {
    await this.delay();
    const source = this.requireSource(sourceId);
    const now = new Date().toISOString();
    const done = source.ingestStatus === 'ready';
    return {
      id: `job-ingest-${sourceId}`,
      sourceId,
      type: 'ingest',
      status: done ? 'succeeded' : 'running',
      steps: [
        {
          key: 'extract',
          labelKey: 'i18n.Job.Step.extract',
          status: done ? 'done' : 'running',
        },
      ],
      currentStepKey: 'extract',
      progress: done ? 100 : 40,
      queuedSourceIds: [],
      log: [],
      createdAt: source.uploadedAt,
      startedAt: source.uploadedAt,
      finishedAt: done ? now : undefined,
    };
  }

  // ===========================================================================
  // Workspace / plan
  // ===========================================================================

  async getPlan(): Promise<Plan> {
    await this.delay();
    // v1 mock: workspace personale su piano `free` → gating soft del wizard.
    return 'free';
  }

  // ===========================================================================
  // Job simulation engine
  // ===========================================================================

  /** Avvia (al boot) i job dei progetti seed già in `processing`. */
  private startSeedProcessingJobs(): void {
    for (const project of this.projects.values()) {
      if (project.status !== 'processing' || !project.currentJobId) {
        continue;
      }
      if (!this.jobs.has(project.currentJobId)) {
        const job = this.createGenerateJob(project.id, project.currentJobId);
        job.status = 'running';
        job.startedAt = new Date().toISOString();
        job.progress = 45; // riprende dal valore mostrato in precedenza
        this.advanceStepsTo(job, 45);
        this.jobs.set(job.id, job);
      }
      this.runJob(project.currentJobId);
    }
  }

  /** Crea un Job `generate` in stato `queued`. */
  private createGenerateJob(projectId: string, id?: string): Job {
    const now = new Date().toISOString();
    return {
      id: id ?? this.newId('job'),
      projectId,
      type: 'generate',
      status: 'queued',
      steps: GENERATE_STEPS.map((step, i) => ({
        ...step,
        status: i === 0 ? 'running' : 'pending',
      })),
      currentStepKey: GENERATE_STEPS[0].key,
      progress: 0,
      etaSeconds: 120,
      queuedSourceIds: [],
      log: [{ at: now, level: 'info', message: 'Job queued' }],
      createdAt: now,
    };
  }

  /** Avvia il timer che fa avanzare progress/step/ETA del job. */
  private runJob(jobId: string): void {
    if (this.jobTimers.has(jobId)) {
      return;
    }
    const timer = setInterval(() => this.tickJob(jobId), JOB_TICK_MS);
    this.jobTimers.set(jobId, timer);
  }

  /** Un tick di avanzamento del job. */
  private tickJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || !job.projectId) {
      this.stopTimer(jobId);
      return;
    }
    const project = this.projects.get(job.projectId);
    if (!project) {
      this.stopTimer(jobId);
      return;
    }

    if (job.status === 'queued') {
      job.status = 'running';
      job.startedAt = new Date().toISOString();
      project.status = 'processing';
    }

    job.progress = Math.min(100, job.progress + JOB_PROGRESS_STEP);
    job.etaSeconds = Math.max(0, Math.round(((100 - job.progress) / 100) * 120));
    this.advanceStepsTo(job, job.progress);
    project.updatedAt = new Date().toISOString();

    if (job.progress >= 100) {
      this.finishJob(job, project);
    }
  }

  /** Sincronizza lo stato degli step con il progress corrente. */
  private advanceStepsTo(job: Job, progress: number): void {
    const total = job.steps.length;
    const activeIndex = Math.min(total - 1, Math.floor((progress / 100) * total));
    job.steps.forEach((step, i) => {
      if (i < activeIndex) {
        step.status = 'done';
      } else if (i === activeIndex) {
        step.status = progress >= 100 ? 'done' : 'running';
      } else {
        step.status = 'pending';
      }
    });
    job.currentStepKey = job.steps[Math.min(activeIndex, total - 1)].key;
  }

  /** Completa il job con successo → progetto in `review`. */
  private finishJob(job: Job, project: Project): void {
    this.stopTimer(job.id);
    const now = new Date().toISOString();
    job.status = 'succeeded';
    job.progress = 100;
    job.etaSeconds = 0;
    job.finishedAt = now;
    job.log = [...job.log, { at: now, level: 'info', message: 'Job succeeded' }];
    project.status = 'review';
    project.currentJobId = undefined;
    project.updatedAt = now;
  }

  private stopTimer(jobId: string): void {
    const timer = this.jobTimers.get(jobId);
    if (timer !== undefined) {
      clearInterval(timer);
      this.jobTimers.delete(jobId);
    }
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /** Latenza di rete simulata: tutte le chiamate la attendono. */
  private delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private requireProject(id: string): Project {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error(`Project not found: ${id}`);
    }
    return project;
  }

  private requireSource(id: string): Source {
    const source = this.sources.get(id);
    if (!source) {
      throw new Error(`Source not found: ${id}`);
    }
    return source;
  }

  private idCounter = 0;
  private newId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${this.idCounter}`;
  }
}

/** Stati "vivi" mostrati nella Create hub. */
export const ACTIVE_STATUSES: readonly ProjectStatus[] = [
  'draft',
  'queued',
  'processing',
  'review',
  'failed',
];
