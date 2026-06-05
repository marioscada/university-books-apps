/**
 * Job — unità di elaborazione asincrona.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.4. Il job è SEPARATO dal Project:
 * il Project ha al più un `currentJobId`. Espone progress/step/log/ETA e gestisce
 * la coda delle fonti aggiunte durante l'elaborazione.
 */

export type JobType = 'generate' | 'regenerate_partial' | 'derive' | 'ingest';
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface JobStep {
  key: string;                     // 'analyze' | 'outline' | 'chapters' | 'render' …
  labelKey: string;                // chiave i18n
  status: 'pending' | 'running' | 'done' | 'failed';
  detail?: string;                 // es. "12 fonti analizzate"
  startedAt?: string;
  finishedAt?: string;
}

export interface JobLogEntry {
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface Job {
  id: string;
  projectId?: string;              // assente per ingest di Source
  sourceId?: string;               // valorizzato per ingest
  versionId?: string;              // la versione che il job sta costruendo
  type: JobType;
  status: JobStatus;

  steps: JobStep[];                // pipeline (es. analyze → outline → chapters → render)
  currentStepKey?: string;
  progress: number;                // 0..100
  etaSeconds?: number;

  targetChapterIds?: string[];     // per regenerate_partial ("aggiorna cap. 2 e 5")
  queuedSourceIds: string[];       // fonti aggiunte durante il job → prossima revisione

  log: JobLogEntry[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: { code: string; message: string };
}
