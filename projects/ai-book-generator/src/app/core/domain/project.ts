/**
 * Project — il container "vivo" del dominio.
 *
 * I nomi rispecchiano 1:1 il contratto backend (Zod → OpenAPI): vedi
 * `core/data/api-types.generated.ts`. Tipi scritti a mano ma allineati al
 * contratto; la create usa direttamente il tipo generato (`CreateProjectInput`).
 */

export type DocumentType =
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

export type ProcessingMode =
  | 'fast_draft' | 'balanced' | 'deep_research'
  | 'academic' | 'business' | 'educational' | 'technical';

export type OutputFormat = 'pdf' | 'docx' | 'epub' | 'markdown' | 'html'; // slides: fase futura

/** Codice lingua ISO 639-1 (es. 'it', 'en'). */
export type LanguageCode = string;

export interface DocumentStructure {
  chapterCount?: number;           // n° capitoli (assente = auto)
  length?: 'short' | 'medium' | 'long';
  tone?: 'neutral' | 'formal' | 'friendly' | 'technical' | 'academic';
  depth?: 'overview' | 'standard' | 'deep';
  includeAppendices: boolean;
  includeBibliography: boolean;
  includeExercises: boolean;
  includeGlossary: boolean;
  includeImages: boolean;
  includeQuiz: boolean;
  includeTables: boolean;
}

/** Impostazioni tipografiche/impaginazione (default per modello, override sul progetto). */
export interface TypographyOptions {
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

/** Configurazione di generazione del documento (ex "settings"). */
export interface GenerationOptions {
  aiInstructions?: string;            // istruzioni libere per l'AI
  processingMode: ProcessingMode;     // incide su costo/tempo/qualità
  outputLanguage: LanguageCode;       // lingua dell'output (ISO)
  outputFormats: OutputFormat[];      // formati export
  documentStructure: DocumentStructure;
  partOverrides?: PartOverride[];     // scostamenti per-parte rispetto al modello
  typography?: TypographyOptions;     // override tipografia rispetto al modello
  targetWordCount?: number;           // parole totali del manoscritto
}

export interface Project {
  id: string;
  workspaceId: string;
  ownerId: string;

  title: string;
  description?: string;            // breve descrizione del contenuto
  documentType: DocumentType;
  templateId?: string;            // modello di partenza
  status: ProjectStatus;
  /** Sotto-stadio della revisione: indice pronto vs capitoli sviluppati. */
  reviewStage?: 'index' | 'chapters';
  coverTheme: CoverTheme;          // riusa i temi cover-art (aurora|ocean|…)

  generationOptions: GenerationOptions; // config di generazione

  currentJobId?: string;           // job attivo se status=processing/queued
  currentVersionId?: string;       // versione "attiva" mostrata di default
  versionIds: string[];            // ordinate per number crescente

  materialFileIds: string[];       // file di materiale (contenuti da cui generare)
  instructionFileIds: string[];    // file di istruzione (regole/tracce/vincoli)

  createdAt: string;
  updatedAt: string;
  lastActivityLabel?: string;      // derivato lato UI (es. "2 ore fa")
}
