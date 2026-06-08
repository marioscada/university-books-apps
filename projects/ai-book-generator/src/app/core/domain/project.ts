/**
 * Project — il container "vivo" del dominio.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.2. Un Project attraversa la state
 * machine (§2), conserva versioni immutabili, è rigenerabile e può derivare
 * altri progetti. `coverTheme` riusa i temi cover-art globali.
 */

export type ProjectKind =
  | 'book' | 'summary' | 'manual' | 'study_guide'
  | 'research_report' | 'training_course' | 'presentation'
  | 'documentation' | 'custom';

export type ProjectStatus =
  | 'draft'        // creato, non ancora lanciato
  | 'queued'       // in coda di elaborazione
  | 'processing'   // l'AI sta lavorando (job attivo)
  | 'review'       // versione pronta, l'utente deve controllare → "needs attention"
  | 'published'    // risultato approvato/esportato (aggiornabile con nuove versioni)
  | 'archived'     // non attivo, consultabile/riapribile
  | 'failed';      // generazione fallita → retry

/** Stati "vivi" (lavori in corso) mostrati nella Create hub. */
export const ACTIVE_STATUSES: readonly ProjectStatus[] = [
  'draft',
  'queued',
  'processing',
  'review',
  'failed',
];

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
  appendices: boolean;
  tables: boolean;
  images: boolean;
}

/** Impostazioni tipografiche/impaginazione (default per modello, override sul progetto). */
export interface TypographySettings {
  fontFamily: string;              // famiglia font del corpo testo
  fontSizePt: number;              // dimensione corpo testo in punti
  textColor: string;               // colore del testo (hex)
  lineHeight: number;              // interlinea (moltiplicatore, es. 1.5)
  marginMm: number;                // margine pagina in mm
  alignment?: 'left' | 'justify';  // allineamento corpo testo
}

/** Override di una parte della struttura rispetto al modello (memorizzato nel progetto). */
export interface PartOverride {
  key: string;
  included: boolean;               // inclusa/esclusa
  count?: number;                  // conteggio (parti ripetibili: capitoli/moduli)
  wordCount?: number;              // parole target per la parte
}

export interface ProjectSettings {
  instructions: string;            // prompt libero (Step 3 wizard)
  processingMode: ProcessingMode;  // Step 4 — incide su costo/tempo/qualità
  structure: StructureConfig;      // Step 5
  outputFormats: OutputFormat[];   // Step 6
  language: string;                // ISO (es. 'en')

  // Flusso "scegli modello → personalizza struttura → genera" (modello immutabile)
  templateId?: string;             // modello di partenza
  parts?: PartOverride[];          // scostamenti per-parte rispetto al modello
  typography?: TypographySettings; // override tipografia rispetto al modello
  totalWords?: number;             // parole totali del manoscritto
}

export interface Project {
  id: string;
  workspaceId: string;
  ownerId: string;

  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  /** Sotto-stadio della revisione: indice pronto vs capitoli sviluppati. */
  reviewStage?: 'index' | 'chapters';
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
