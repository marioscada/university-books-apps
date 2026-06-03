/**
 * ProjectTemplate — modello di pubblicazione (punto di partenza con struttura
 * standard + default), per il flusso "scegli modello → personalizza struttura →
 * genera". Vedi docs/MODELLI-PUBBLICAZIONE-DEFINIZIONI.md.
 *
 * Il **modello resta immutabile**: la pagina di personalizzazione produce un
 * `Project` che porta solo gli **override** rispetto al modello (parti
 * incluse/escluse, conteggi, parole, tipografia) — vedi `ProjectSettings`.
 */

import type {
  OutputFormat,
  ProcessingMode,
  ProjectKind,
  StructureConfig,
  TypographySettings,
} from './project';

/** Raggruppamento editoriale di una parte di struttura. */
export type StructureGroup =
  | 'front' // front matter (frontespizio, indice, prefazione…)
  | 'body' // corpo (introduzione, capitoli/sezioni, conclusione…)
  | 'back' // back matter (glossario, bibliografia, appendici…)
  | 'section'; // sezione generica (per tipi non a capitoli, es. IMRaD, report)

/**
 * Una parte della struttura standard del modello. Le parti `repeatable`
 * (capitoli, moduli, argomenti) hanno un `countRange` e un `defaultCount`.
 */
export interface StructurePart {
  key: string;
  /** Chiave i18n della label. */
  labelKey: string;
  group: StructureGroup;
  /** Può essere esclusa dall'utente. */
  optional: boolean;
  /** Inclusa di default. */
  includedByDefault: boolean;
  /** Parte ripetibile (es. capitoli) con conteggio regolabile. */
  repeatable?: boolean;
  /** Range [min, max] del conteggio per le parti ripetibili. */
  countRange?: readonly [number, number];
  /** Conteggio di default per le parti ripetibili. */
  defaultCount?: number;
  /** Parole target di default (per la parte, o per unità se ripetibile). */
  defaultWordCount?: number;
}

/** Default di generazione del modello (smart defaults del wizard). */
export interface TemplateDefaults {
  processingMode: ProcessingMode;
  outputFormats: OutputFormat[];
  language: string;
  /** Flag struttura (bibliografia/glossario/quiz/…) e parametri base. */
  structure: StructureConfig;
}

/** Modello di pubblicazione (immutabile). */
export interface ProjectTemplate {
  id: string;
  kind: ProjectKind;
  /** Chiavi i18n di nome/descrizione/fonte standard. */
  nameKey: string;
  descKey: string;
  sourceKey: string;
  /** Struttura standard, ordinata. */
  parts: StructurePart[];
  defaults: TemplateDefaults;
  typography: TypographySettings;
  /** Tema cover di default per l'anteprima. */
  coverTheme?: string;
  /** Stima pagine (per la card galleria nella pagina Create). */
  estimatedPages?: number;
}
