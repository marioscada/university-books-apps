/**
 * Seed mock realistico per il data layer v1.
 *
 * Copre più stati della state machine (§2): almeno un `processing`, un `review`
 * e un `draft` (richiesti dai criteri F1), più un `published` e un `archived` per
 * completezza. 5 fonti in relazione many-to-many con i progetti.
 *
 * NB: la Create hub mostra solo i progetti "vivi" (draft|queued|processing|
 * review|failed). I 3 progetti vivi del seed (review/processing/draft) riproducono
 * 1:1 le card precedenti (cover aurora/ocean/ember) → pagina visivamente identica.
 */

import type { Project, ProjectSettings, Source } from '../domain';

const WORKSPACE_ID = 'ws-personal';
const OWNER_ID = 'user-1';

/** Settings di default per il seed (il wizard reale arriverà in F4). */
function seedSettings(language = 'en'): ProjectSettings {
  return {
    instructions: '',
    processingMode: 'balanced',
    structure: {
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
    },
    outputFormats: ['pdf'],
    language,
  };
}

/** Progetti seed. `updatedAt` regola l'ordinamento "più recente prima". */
export const SEED_PROJECTS: readonly Project[] = [
  // --- VIVO: review (needs attention) — copertura cover aurora -------------
  {
    id: 'proj-ai-ml',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    title: 'AI & Machine Learning Book',
    kind: 'book',
    status: 'review',
    reviewStage: 'index',
    coverTheme: 'aurora',
    settings: seedSettings(),
    currentVersionId: 'ver-ai-ml-1',
    versionIds: ['ver-ai-ml-1'],
    derivedProjectIds: [],
    sourceIds: ['src-algorithms', 'src-ai-course'],
    createdAt: '2026-05-29T09:00:00.000Z',
    updatedAt: '2026-05-31T08:00:00.000Z',
  },
  // --- VIVO: processing (job attivo, progress che avanza) — cover ocean ----
  {
    id: 'proj-physics',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    title: 'Analisi del mercato 2024',
    kind: 'book',
    status: 'review',
    reviewStage: 'chapters', // capitoli sviluppati → da pubblicare
    coverTheme: 'ocean',
    settings: seedSettings(),
    currentVersionId: 'ver-physics-1',
    versionIds: ['ver-physics-1'],
    derivedProjectIds: [],
    sourceIds: ['src-networks'],
    createdAt: '2026-05-30T10:00:00.000Z',
    updatedAt: '2026-06-06T09:00:00.000Z',
  },
  // --- VIVO: draft (non ancora lanciato) — cover ember ---------------------
  {
    id: 'proj-manual',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    title: 'Technical Manual',
    kind: 'manual',
    status: 'draft',
    coverTheme: 'ember',
    settings: seedSettings(),
    versionIds: [],
    derivedProjectIds: [],
    sourceIds: [],
    createdAt: '2026-05-28T12:00:00.000Z',
    updatedAt: '2026-05-28T12:00:00.000Z',
  },
  // --- ARCHIVIO: published (NON in Create) — cover gold --------------------
  {
    id: 'proj-history',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    title: 'History of Computing',
    kind: 'study_guide',
    status: 'published',
    coverTheme: 'gold',
    settings: seedSettings(),
    currentVersionId: 'ver-history-2',
    versionIds: ['ver-history-1', 'ver-history-2'],
    derivedProjectIds: [],
    sourceIds: ['src-graph-data'],
    createdAt: '2026-05-20T09:00:00.000Z',
    updatedAt: '2026-05-26T15:00:00.000Z',
  },
  // --- ARCHIVIO: archived (NON in Create) — cover mint --------------------
  {
    id: 'proj-research',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    title: 'Research Notes Compendium',
    kind: 'research_report',
    status: 'archived',
    coverTheme: 'mint',
    settings: seedSettings(),
    currentVersionId: 'ver-research-1',
    versionIds: ['ver-research-1'],
    derivedProjectIds: [],
    sourceIds: ['src-research-url', 'src-book-ideas'],
    createdAt: '2026-05-10T09:00:00.000Z',
    updatedAt: '2026-05-18T11:00:00.000Z',
  },
];

/** Fonti seed (Library) — relazione many-to-many con i progetti. */
export const SEED_SOURCES: readonly Source[] = [
  {
    id: 'src-algorithms',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'Appunti_Algoritmi.pdf',
    type: 'pdf',
    mime: 'application/pdf',
    sizeBytes: 2_516_582,
    uploadedAt: '2026-05-29T08:30:00.000Z',
    ingestStatus: 'ready',
    lastAnalyzedAt: '2026-05-29T08:32:00.000Z',
    language: 'it',
    tags: ['esame', 'cs'],
    category: 'university',
    folder: 'university',
    usedInProjectIds: ['proj-ai-ml'],
    permission: 'owner',
  },
  {
    id: 'src-ai-course',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'Slide_Corso_AI.pptx',
    type: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    sizeBytes: 8_493_465,
    uploadedAt: '2026-05-30T07:00:00.000Z',
    ingestStatus: 'ready',
    lastAnalyzedAt: '2026-05-30T07:05:00.000Z',
    language: 'en',
    tags: ['ai'],
    category: 'university',
    folder: 'university',
    usedInProjectIds: ['proj-ai-ml'],
    permission: 'owner',
  },
  {
    id: 'src-networks',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'Dispensa_Reti.docx',
    type: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 1_258_291,
    uploadedAt: '2026-05-26T09:00:00.000Z',
    ingestStatus: 'ready',
    lastAnalyzedAt: '2026-05-26T09:03:00.000Z',
    language: 'it',
    tags: ['networking'],
    category: 'research',
    folder: 'research',
    usedInProjectIds: ['proj-physics'],
    permission: 'owner',
  },
  {
    id: 'src-graph-data',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'Grafico_dati.png',
    type: 'image',
    mime: 'image/png',
    sizeBytes: 655_360,
    uploadedAt: '2026-05-24T14:00:00.000Z',
    ingestStatus: 'ready',
    lastAnalyzedAt: '2026-05-24T14:01:00.000Z',
    tags: ['dati'],
    category: 'research',
    folder: 'research',
    usedInProjectIds: ['proj-history'],
    permission: 'owner',
  },
  {
    id: 'src-research-url',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'articolo-ricerca.url',
    type: 'url',
    sizeBytes: 0,
    uploadedAt: '2026-05-31T06:00:00.000Z',
    ingestStatus: 'processing',
    tags: ['fonte'],
    category: 'business',
    folder: 'business',
    usedInProjectIds: ['proj-research'],
    permission: 'owner',
  },
  {
    id: 'src-book-ideas',
    workspaceId: WORKSPACE_ID,
    ownerId: OWNER_ID,
    name: 'Idee_libro.txt',
    type: 'note',
    mime: 'text/plain',
    sizeBytes: 12_288,
    uploadedAt: '2026-05-28T13:00:00.000Z',
    ingestStatus: 'ready',
    lastAnalyzedAt: '2026-05-28T13:01:00.000Z',
    language: 'it',
    tags: ['bozza'],
    category: 'personal',
    folder: 'personal',
    usedInProjectIds: ['proj-research'],
    permission: 'owner',
  },
];
