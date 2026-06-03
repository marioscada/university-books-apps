/**
 * Seed dei modelli di pubblicazione (`ProjectTemplate`).
 *
 * Fedele a docs/MODELLI-PUBBLICAZIONE-DEFINIZIONI.md: per ogni tipo, la struttura
 * standard ancorata a uno standard riconosciuto (Chicago, IEC/IEEE 82079-1, IMRaD,
 * ADDIE, executive summary), i default del wizard e la tipografia di partenza.
 *
 * I modelli sono **immutabili**: la pagina "Personalizza il modello" produce un
 * Project con i soli scostamenti (vedi `ProjectSettings`).
 *
 * Le label/nomi/fonti sono chiavi i18n (`Models.*`).
 */

import type {
  ProjectTemplate,
  StructurePart,
  TypographySettings,
} from '../domain';
import type { StructureConfig } from '../domain';

/** Tipografia editoriale di default (saggistica). */
const SERIF_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'Times New Roman',
  fontSizePt: 12,
  textColor: '#1a1d21',
  lineHeight: 1.5,
  marginMm: 20,
  alignment: 'justify',
};

/** Tipografia "sans" per documenti tecnici/business/accademici scansionabili. */
const SANS_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'Inter',
  fontSizePt: 11,
  textColor: '#1a1d21',
  lineHeight: 1.5,
  marginMm: 20,
  alignment: 'left',
};

/** StructureConfig completo a partire dai flag rilevanti (gli altri a false). */
function structure(over: Partial<StructureConfig>): StructureConfig {
  return {
    length: 'medium',
    tone: 'neutral',
    depth: 'standard',
    bibliography: false,
    glossary: false,
    quiz: false,
    exercises: false,
    appendices: false,
    tables: false,
    images: false,
    ...over,
  };
}

/** Helper compatto per dichiarare una parte di struttura. */
function part(
  key: string,
  group: StructurePart['group'],
  opts: Partial<StructurePart> = {},
): StructurePart {
  return {
    key,
    labelKey: `i18n.Models.Part.${key}`,
    group,
    optional: opts.optional ?? true,
    includedByDefault: opts.includedByDefault ?? true,
    repeatable: opts.repeatable,
    countRange: opts.countRange,
    defaultCount: opts.defaultCount,
    defaultWordCount: opts.defaultWordCount,
  };
}

// ---------------------------------------------------------------------------
// 1. Libro — Chicago Manual (front/body/back matter)
// ---------------------------------------------------------------------------
const BOOK: ProjectTemplate = {
  id: 'book',
  kind: 'book',
  nameKey: 'i18n.Models.book.name',
  descKey: 'i18n.Models.book.desc',
  sourceKey: 'i18n.Models.book.source',
  coverTheme: 'aurora',
  estimatedPages: 220,
  parts: [
    part('cover', 'front', { defaultWordCount: 0 }),
    part('preface', 'front', { defaultWordCount: 600 }),
    part('toc', 'front', { defaultWordCount: 0 }),
    part('introduction', 'body', { defaultWordCount: 1500 }),
    part('chapters', 'body', {
      optional: false,
      repeatable: true,
      countRange: [4, 20],
      defaultCount: 12,
      defaultWordCount: 6500,
    }),
    part('conclusion', 'body', { defaultWordCount: 1500 }),
    part('glossary', 'back', { defaultWordCount: 800 }),
    part('bibliography', 'back', { defaultWordCount: 600 }),
    part('index', 'back', { includedByDefault: false, defaultWordCount: 400 }),
    part('appendix', 'back', { defaultWordCount: 1000 }),
  ],
  defaults: {
    processingMode: 'balanced',
    outputFormats: ['pdf', 'epub'],
    language: 'it',
    structure: structure({ bibliography: true, glossary: true, appendices: true, chapters: 12 }),
  },
  typography: SERIF_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 2. Riassunto — executive summary (no capitoli)
// ---------------------------------------------------------------------------
const SUMMARY: ProjectTemplate = {
  id: 'summary',
  kind: 'summary',
  nameKey: 'i18n.Models.summary.name',
  descKey: 'i18n.Models.summary.desc',
  sourceKey: 'i18n.Models.summary.source',
  coverTheme: 'ocean',
  estimatedPages: 8,
  parts: [
    part('purpose', 'section', { defaultWordCount: 120 }),
    part('keypoints', 'section', { optional: false, defaultWordCount: 1200 }),
    part('conclusions', 'section', { defaultWordCount: 600 }),
    part('conceptmap', 'section', { includedByDefault: false, defaultWordCount: 300 }),
  ],
  defaults: {
    processingMode: 'fast_draft',
    outputFormats: ['pdf'],
    language: 'it',
    structure: structure({ length: 'short' }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 3. Guida allo studio — retrieval practice (quiz/esercizi ATTIVI)
// ---------------------------------------------------------------------------
const STUDY_GUIDE: ProjectTemplate = {
  id: 'study_guide',
  kind: 'study_guide',
  nameKey: 'i18n.Models.study_guide.name',
  descKey: 'i18n.Models.study_guide.desc',
  sourceKey: 'i18n.Models.study_guide.source',
  coverTheme: 'mint',
  estimatedPages: 40,
  parts: [
    part('introduction', 'front', { defaultWordCount: 500 }),
    part('topics', 'body', {
      optional: false,
      repeatable: true,
      countRange: [3, 12],
      defaultCount: 6,
      defaultWordCount: 1800,
    }),
    part('objectives', 'body', { defaultWordCount: 400 }),
    part('keyconcepts', 'body', { optional: false, defaultWordCount: 1500 }),
    part('visuals', 'body', { defaultWordCount: 300 }),
    part('examples', 'body', { defaultWordCount: 1200 }),
    part('quiz', 'body', { defaultWordCount: 1000 }),
    part('exercises', 'body', { defaultWordCount: 1000 }),
    part('selfassessment', 'back', { defaultWordCount: 500 }),
    part('glossary', 'back', { defaultWordCount: 600 }),
  ],
  defaults: {
    processingMode: 'educational',
    outputFormats: ['pdf'],
    language: 'it',
    structure: structure({ quiz: true, exercises: true, glossary: true, images: true }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 4. Manuale — IEC/IEEE 82079-1:2019 (concettuale/istruzionale/riferimento)
// ---------------------------------------------------------------------------
const MANUAL: ProjectTemplate = {
  id: 'manual',
  kind: 'manual',
  nameKey: 'i18n.Models.manual.name',
  descKey: 'i18n.Models.manual.desc',
  sourceKey: 'i18n.Models.manual.source',
  coverTheme: 'ember',
  estimatedPages: 60,
  parts: [
    part('overview', 'front', { defaultWordCount: 900 }),
    part('safety', 'front', { defaultWordCount: 700 }),
    part('procedures', 'body', {
      optional: false,
      repeatable: true,
      countRange: [3, 16],
      defaultCount: 8,
      defaultWordCount: 1400,
    }),
    part('reference', 'body', { defaultWordCount: 1200 }),
    part('troubleshooting', 'back', { defaultWordCount: 900 }),
    part('glossary', 'back', { defaultWordCount: 600 }),
  ],
  defaults: {
    processingMode: 'technical',
    outputFormats: ['pdf', 'docx'],
    language: 'it',
    structure: structure({ glossary: true, tables: true, depth: 'deep', tone: 'technical' }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 5. Report — business report (exec summary → findings → recommendations)
// ---------------------------------------------------------------------------
const REPORT: ProjectTemplate = {
  id: 'report',
  kind: 'research_report',
  nameKey: 'i18n.Models.report.name',
  descKey: 'i18n.Models.report.desc',
  sourceKey: 'i18n.Models.report.source',
  coverTheme: 'gold',
  estimatedPages: 30,
  parts: [
    part('titlepage', 'front', { defaultWordCount: 0 }),
    part('executivesummary', 'front', { optional: false, defaultWordCount: 700 }),
    part('toc', 'front', { defaultWordCount: 0 }),
    part('introduction', 'body', { defaultWordCount: 800 }),
    part('methodology', 'body', { defaultWordCount: 900 }),
    part('findings', 'body', { optional: false, defaultWordCount: 2000 }),
    part('analysis', 'body', { defaultWordCount: 1500 }),
    part('recommendations', 'body', { optional: false, defaultWordCount: 900 }),
    part('appendix', 'back', { defaultWordCount: 800 }),
  ],
  defaults: {
    processingMode: 'business',
    outputFormats: ['pdf', 'docx'],
    language: 'it',
    structure: structure({ bibliography: true, tables: true, images: true, tone: 'formal' }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 6. Presentazione — slide e note del relatore
// ---------------------------------------------------------------------------
const PRESENTATION: ProjectTemplate = {
  id: 'presentation',
  kind: 'presentation',
  nameKey: 'i18n.Models.presentation.name',
  descKey: 'i18n.Models.presentation.desc',
  sourceKey: 'i18n.Models.presentation.source',
  coverTheme: 'ember',
  estimatedPages: 20,
  parts: [
    part('cover', 'front', { defaultWordCount: 0 }),
    part('agenda', 'front', { defaultWordCount: 80 }),
    part('slides', 'body', {
      optional: false,
      repeatable: true,
      countRange: [6, 60],
      defaultCount: 20,
      defaultWordCount: 80,
    }),
    part('speakernotes', 'body', { defaultWordCount: 60 }),
    part('conclusion', 'body', { defaultWordCount: 80 }),
  ],
  defaults: {
    processingMode: 'balanced',
    outputFormats: ['pdf'],
    language: 'it',
    structure: structure({ images: true, length: 'short', depth: 'overview' }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 7. Corso — ADDIE (moduli/lezioni con quiz)
// ---------------------------------------------------------------------------
const COURSE: ProjectTemplate = {
  id: 'course',
  kind: 'training_course',
  nameKey: 'i18n.Models.course.name',
  descKey: 'i18n.Models.course.desc',
  sourceKey: 'i18n.Models.course.source',
  coverTheme: 'rose',
  estimatedPages: 80,
  parts: [
    part('overview', 'front', { defaultWordCount: 800 }),
    part('modules', 'body', {
      optional: false,
      repeatable: true,
      countRange: [4, 16],
      defaultCount: 8,
      defaultWordCount: 3000,
    }),
    part('finalassessment', 'back', { defaultWordCount: 1000 }),
  ],
  defaults: {
    processingMode: 'educational',
    outputFormats: ['pdf', 'docx'],
    language: 'it',
    structure: structure({ quiz: true, exercises: true, images: true }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 8. Tesi / Ricerca — IMRaD (ANSI 1972)
// ---------------------------------------------------------------------------
const THESIS: ProjectTemplate = {
  id: 'thesis',
  kind: 'research_report',
  nameKey: 'i18n.Models.thesis.name',
  descKey: 'i18n.Models.thesis.desc',
  sourceKey: 'i18n.Models.thesis.source',
  coverTheme: 'gold',
  estimatedPages: 50,
  parts: [
    part('abstract', 'front', { optional: false, defaultWordCount: 300 }),
    part('introduction', 'body', { optional: false, defaultWordCount: 1500 }),
    part('methods', 'body', { optional: false, defaultWordCount: 1800 }),
    part('results', 'body', { optional: false, defaultWordCount: 2000 }),
    part('discussion', 'body', { optional: false, defaultWordCount: 2000 }),
    part('conclusion', 'body', { defaultWordCount: 800 }),
    part('bibliography', 'back', { optional: false, defaultWordCount: 1000 }),
    part('acknowledgments', 'back', { includedByDefault: false, defaultWordCount: 200 }),
    part('appendix', 'back', { defaultWordCount: 1000 }),
  ],
  defaults: {
    processingMode: 'academic',
    outputFormats: ['pdf', 'docx'],
    language: 'it',
    structure: structure({ bibliography: true, appendices: true, tone: 'academic', depth: 'deep' }),
  },
  typography: SANS_TYPOGRAPHY,
};

// ---------------------------------------------------------------------------
// 9. Personalizzato — struttura libera (nessuna parte imposta)
// ---------------------------------------------------------------------------
const CUSTOM: ProjectTemplate = {
  id: 'custom',
  kind: 'custom',
  nameKey: 'i18n.Models.custom.name',
  descKey: 'i18n.Models.custom.desc',
  sourceKey: 'i18n.Models.custom.source',
  coverTheme: 'aurora',
  parts: [],
  defaults: {
    processingMode: 'balanced',
    outputFormats: ['pdf'],
    language: 'it',
    structure: structure({}),
  },
  typography: SANS_TYPOGRAPHY,
};

/** Tutti i modelli, nell'ordine della galleria Create (Personalizzato per ultimo). */
export const SEED_TEMPLATES: readonly ProjectTemplate[] = [
  BOOK,
  SUMMARY,
  STUDY_GUIDE,
  MANUAL,
  REPORT,
  PRESENTATION,
  COURSE,
  THESIS,
  CUSTOM,
];
