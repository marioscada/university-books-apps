import { DestroyRef, Injectable, inject } from '@angular/core';

import type {
  Project,
  ProjectStatus,
  ProjectTemplate,
  DerivedKind,
  Job,
  JobStep,
  Source,
  Plan,
  Version,
  Chapter,
  ChatMessage,
  DerivedContent,
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
import { SEED_TEMPLATES } from './templates-seed';
import {
  SEED_CHAPTER_TITLES,
  SEED_CHAPTER_BODY,
  SEED_CHAPTER_BODY_LONG,
  SEED_CHAT_GREETING,
  SEED_CHAT_REPLY_WITH_OP,
  SEED_CHAT_REPLY_DEFAULT,
} from './workspace-seed';
import { buildDerivedContent } from './derived-seed';

/** Latenza simulata di rete (ms). */
const NETWORK_DELAY_MS = 120;
/** Cadenza dell'avanzamento del job simulato (ms). Veloce come lo sviluppo
 * capitoli (~2s totali) per non far perdere tempo nella demo. */
const JOB_TICK_MS = 220;
/** Incremento di progress per tick (≈ 9 tick → ~2s). */
const JOB_PROGRESS_STEP = 12;

/** Deduce il `SourceType` dall'estensione del nome file (o dal mime). */
function inferSourceType(name: string, mime?: string): Source['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'ppt' || ext === 'pptx') return 'pptx';
  if (ext === 'csv' || ext === 'xls' || ext === 'xlsx') return 'csv';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime?.startsWith('image/')) return 'image';
  // Solo formati AWS-safe (Textract/OCR/parsing): niente audio/video.
  return 'note';
}

/**
 * Pipeline del job `generate` = **generazione dell'INDICE** (analisi + outline).
 * I capitoli e il render sono una fase separata (`generateChapters`), così lo
 * step "Analisi" non avanza fino a Capitoli/Render mentre si genera l'indice.
 */
const GENERATE_STEPS: readonly Omit<JobStep, 'status'>[] = [
  { key: 'analyze', labelKey: 'i18n.Job.Step.analyze' },
  { key: 'outline', labelKey: 'i18n.Job.Step.outline' },
];

/** Stati con un output (versione + capitoli) disponibile. */
const HAS_OUTPUT: readonly ProjectStatus[] = ['review', 'published', 'archived'];

/** Deduce un'etichetta di operazione tipizzata dal testo (mock euristico). */
function inferOperationLabel(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/riduc|accorc|breve/.test(t)) return 'lunghezza −20%';
  if (/espand|allung|approfond/.test(t)) return 'lunghezza +20%';
  if (/tecnic/.test(t)) return 'tono tecnico';
  if (/esempi/.test(t)) return 'aggiunti esempi';
  if (/traduc|english|inglese/.test(t)) return 'traduzione';
  if (/tono|formale|informale/.test(t)) return 'tono aggiornato';
  return undefined;
}

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
  /** Versione corrente (indice + capitoli) per progetto, materializzata on-demand. */
  private readonly versions = new Map<string, Version>();
  /** Thread di chat per progetto. */
  private readonly chats = new Map<string, ChatMessage[]>();
  /** Lingua di destinazione per i derivati di tipo traduzione (per progetto). */
  private readonly derivedLang = new Map<string, string>();
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
  // Templates (modelli di pubblicazione — immutabili)
  // ===========================================================================

  async listTemplates(): Promise<ProjectTemplate[]> {
    await this.delay();
    return SEED_TEMPLATES.map((t) => structuredClone(t));
  }

  async getTemplate(id: string): Promise<ProjectTemplate> {
    await this.delay();
    const template = SEED_TEMPLATES.find((t) => t.id === id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return structuredClone(template);
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
      coverTheme: input.coverTheme ?? 'ocean',
      settings: input.settings
        ? structuredClone(input.settings)
        : {
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

  async deleteProject(id: string): Promise<void> {
    await this.delay();
    this.projects.delete(id);
    this.versions.delete(id);
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

  async derive(id: string, derivedKind: DerivedKind, language?: string): Promise<Project> {
    await this.delay();
    const parent = this.requireProject(id);
    const now = new Date().toISOString();
    const child: Project = {
      id: this.newId('proj'),
      workspaceId: parent.workspaceId,
      ownerId: parent.ownerId,
      title: `${parent.title} — ${derivedKind}`,
      kind: 'custom',
      status: 'processing',
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
    if (language) {
      this.derivedLang.set(child.id, language);
    }
    parent.derivedProjectIds = [...parent.derivedProjectIds, child.id];
    parent.updatedAt = now;
    return structuredClone(child);
  }

  /** Titolo del progetto sorgente (genitore) per comporre il derivato. */
  private derivedBaseTitle(child: Project): string {
    const parent = child.parentProjectId ? this.projects.get(child.parentProjectId) : undefined;
    return parent?.title ?? child.title;
  }

  async generateDerived(projectId: string): Promise<DerivedContent> {
    await this.delay();
    const project = this.requireProject(projectId);
    if (!project.derivedKind) {
      throw new Error(`Il progetto ${projectId} non è un derivato`);
    }
    const content = buildDerivedContent(
      project.derivedKind,
      this.derivedBaseTitle(project),
      this.derivedLang.get(projectId),
    );
    project.status = 'review';
    project.updatedAt = new Date().toISOString();
    return structuredClone(content);
  }

  async regenerateDerived(projectId: string, _feedback: string): Promise<DerivedContent> {
    await this.delay();
    const project = this.requireProject(projectId);
    if (!project.derivedKind) {
      throw new Error(`Il progetto ${projectId} non è un derivato`);
    }
    // Mock: la rigenerazione restituisce lo stesso contenuto (con backend reale
    // qui il feedback verrebbe applicato per correggere il derivato).
    return buildDerivedContent(
      project.derivedKind,
      this.derivedBaseTitle(project),
      this.derivedLang.get(projectId),
    );
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
      etaSeconds: 12,
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
    job.etaSeconds = Math.max(0, Math.round(((100 - job.progress) / 100) * 12));
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
    project.reviewStage = 'index'; // indice pronto; capitoli da sviluppare
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
  // Versions (indice + capitoli)
  // ===========================================================================

  async getCurrentVersion(projectId: string): Promise<Version | null> {
    await this.delay();
    const project = this.requireProject(projectId);
    // Materializza on-demand una versione coi capitoli per i progetti con output.
    if (!HAS_OUTPUT.includes(project.status)) {
      return null;
    }
    let version = this.versions.get(projectId);
    if (!version) {
      version = this.buildVersion(project);
      this.versions.set(projectId, version);
    }
    // Capitoli sviluppati per pubblicati/archiviati e per le revisioni già a
    // stadio "capitoli" (da pubblicare). La revisione "indice" resta con i
    // capitoli pending (outline soltanto).
    if (project.status !== 'review' || project.reviewStage === 'chapters') {
      this.developChapters(version);
    }
    return structuredClone(version);
  }

  async generateChapters(projectId: string): Promise<Version> {
    await this.delay(260);
    const project = this.requireProject(projectId);
    let version = this.versions.get(projectId);
    if (!version) {
      version = this.buildVersion(project);
      this.versions.set(projectId, version);
    }
    this.developChapters(version);
    project.reviewStage = 'chapters'; // capitoli sviluppati → pronti da pubblicare
    project.updatedAt = new Date().toISOString();
    return structuredClone(version);
  }

  /** Sviluppa i corpi dei capitoli (pending → ready). */
  private developChapters(version: Version): void {
    for (const c of version.chapters) {
      if (c.status !== 'ready') {
        // Un capitolo "lungo" (cap. 2) per testare la paginazione del lettore.
        c.body = c.index === 2 ? SEED_CHAPTER_BODY_LONG : SEED_CHAPTER_BODY;
        c.status = 'ready';
      }
    }
  }

  // ===========================================================================
  // Chat contestuale al progetto
  // ===========================================================================

  async listChatMessages(projectId: string): Promise<ChatMessage[]> {
    await this.delay();
    return this.ensureChat(projectId).map((m) => structuredClone(m));
  }

  async sendChatMessage(projectId: string, text: string): Promise<ChatMessage[]> {
    await this.delay(220);
    const thread = this.ensureChat(projectId);
    const now = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: this.newId('msg'),
      threadId: `thread-${projectId}`,
      role: 'user',
      content: text,
      createdAt: now,
    };
    const op = inferOperationLabel(text);
    const assistantMsg: ChatMessage = {
      id: this.newId('msg'),
      threadId: `thread-${projectId}`,
      role: 'assistant',
      content: op ? SEED_CHAT_REPLY_WITH_OP : SEED_CHAT_REPLY_DEFAULT,
      createdAt: now,
      ...(op ? { operationId: this.newId('op') } : {}),
    };
    // memorizza l'etichetta operazione fuori dal tipo dominio (mock-only) via campo extra
    if (op) {
      (assistantMsg as ChatMessage & { operationLabel?: string }).operationLabel = op;
    }
    thread.push(userMsg, assistantMsg);
    return [structuredClone(userMsg), structuredClone(assistantMsg)];
  }

  /** Crea (una volta) il thread con un saluto dell'assistente. */
  private ensureChat(projectId: string): ChatMessage[] {
    let thread = this.chats.get(projectId);
    if (!thread) {
      thread = [
        {
          id: this.newId('msg'),
          threadId: `thread-${projectId}`,
          role: 'assistant',
          content: SEED_CHAT_GREETING,
          createdAt: new Date().toISOString(),
        },
      ];
      this.chats.set(projectId, thread);
    }
    return thread;
  }

  /** Costruisce una Version draft coi capitoli (mock) per un progetto con output. */
  private buildVersion(project: Project): Version {
    const now = new Date().toISOString();
    const versionId = this.newId('ver');
    // Dopo la sola analisi: solo l'indice. I capitoli sono `pending` (corpo da
    // sviluppare), il `wordCount` è la stima mostrata in "Cosa otterrai".
    const chapters: Chapter[] = SEED_CHAPTER_TITLES.map((title, i) => ({
      id: `${versionId}-c${i + 1}`,
      versionId,
      index: i + 1,
      title,
      body: '',
      status: 'pending',
      wordCount: 900 + i * 120,
    }));
    return {
      id: versionId,
      projectId: project.id,
      number: 1,
      status: project.status === 'published' ? 'published' : 'draft',
      createdAt: now,
      createdBy: project.ownerId,
      settingsSnapshot: structuredClone(project.settings),
      sourcesUsedIds: [...project.sourceIds],
      outline: chapters.map((c) => ({ id: c.id, title: c.title, level: 1, childrenIds: [] })),
      chapters,
      outputs: [],
    };
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
