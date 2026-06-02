/**
 * Project — il container "vivo" del dominio.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.2. Un Project attraversa la state
 * machine (§2), conserva versioni immutabili, è rigenerabile e può derivare
 * altri progetti. `coverTheme` riusa i temi cover-art globali.
 */

export type ProjectKind =
  | 'book' | 'summary' | 'manual' | 'study_guide'
  | 'research_report' | 'training_course' | 'documentation' | 'custom';

export type ProjectStatus =
  | 'draft'        // creato, non ancora lanciato
  | 'queued'       // in coda di elaborazione
  | 'processing'   // l'AI sta lavorando (job attivo)
  | 'review'       // versione pronta, l'utente deve controllare → "needs attention"
  | 'published'    // risultato approvato/esportato (aggiornabile con nuove versioni)
  | 'archived'     // non attivo, consultabile/riapribile
  | 'failed';      // generazione fallita → retry

/** Tema della copertina astratta — riusa i temi cover-art globali. */
export type CoverTheme = 'aurora' | 'ocean' | 'ember' | 'rose' | 'mint' | 'gold';

export type DerivedKind =
  | 'summary' | 'slides' | 'quiz' | 'manual' | 'study_guide' | 'translation';

export type ProcessingMode =
  | 'fast_draft' | 'balanced' | 'deep_research'
  | 'academic' | 'business' | 'educational' | 'technical';

export type OutputFormat = 'pdf' | 'docx' | 'epub' | 'markdown' | 'html'; // slides: fase futura

export interface StructureConfig {
  chapters?: number;               // n° capitoli (o 'auto')
  length?: 'short' | 'medium' | 'long';
  tone?: 'neutral' | 'formal' | 'friendly' | 'technical' | 'academic';
  depth?: 'overview' | 'standard' | 'deep';
  bibliography: boolean;
  glossary: boolean;
  quiz: boolean;
  exercises: boolean;
  tables: boolean;
  images: boolean;
}

export interface ProjectSettings {
  instructions: string;            // prompt libero (Step 3 wizard)
  processingMode: ProcessingMode;  // Step 4 — incide su costo/tempo/qualità
  structure: StructureConfig;      // Step 5
  outputFormats: OutputFormat[];   // Step 6
  language: string;                // ISO (es. 'en')
}

export interface Project {
  id: string;
  workspaceId: string;
  ownerId: string;

  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  coverTheme: CoverTheme;          // riusa i temi cover-art (aurora|ocean|…)

  settings: ProjectSettings;       // config di generazione (dal wizard)

  currentJobId?: string;           // job attivo se status=processing/queued
  currentVersionId?: string;       // versione "attiva" mostrata di default
  versionIds: string[];            // ordinate per number crescente

  // Lineage progetti derivati (summary/slides/quiz da un libro, ecc.)
  parentProjectId?: string;
  derivedKind?: DerivedKind;       // valorizzato se è un derivato
  derivedProjectIds: string[];     // figli derivati da questo

  sourceIds: string[];             // many-to-many (vedi ProjectSource)

  createdAt: string;
  updatedAt: string;
  lastActivityLabel?: string;      // derivato lato UI (es. "2 ore fa")
}
