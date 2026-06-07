/**
 * Source (Library) + relazione con i progetti.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.5. Le fonti vivono nella Library con
 * metadati e stato di ingest, in relazione many-to-many con i progetti
 * (denormalizzata su `usedInProjectIds` + join esplicito `ProjectSource`).
 */

// Solo formati AWS-safe (Textract/OCR/parsing): niente audio/video.
export type SourceType = 'pdf' | 'docx' | 'pptx' | 'image' | 'url' | 'note' | 'csv';
export type IngestStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Source {
  id: string;
  workspaceId: string;
  ownerId: string;

  name: string;
  type: SourceType;
  mime?: string;
  sizeBytes: number;
  uploadedAt: string;

  ingestStatus: IngestStatus;      // job di estrazione all'upload
  lastAnalyzedAt?: string;
  extract?: string;                // estratto automatico (riassunto)
  conceptIndex?: string[];         // indice concetti / keyword
  language?: string;

  tags: string[];
  category?: string;
  folder?: string;

  usedInProjectIds: string[];      // many-to-many (denormalizzato)
  permission?: 'owner';            // predisposto (v1: sempre owner)
}

// Join esplicito (se serve lato API) — many-to-many Project↔Source
export interface ProjectSource {
  projectId: string;
  sourceId: string;
  addedAt: string;
  queued?: boolean;                // aggiunta durante un job → prossima revisione
}
