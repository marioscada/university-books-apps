/**
 * Version — snapshot immutabile dell'output.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.3. Mai sovrascrivere: ogni
 * generazione/rigenerazione "pubblicata" produce una Version con `number`
 * crescente. Gli edit minori (chat) lavorano su una draft della versione.
 */

import type { ProjectSettings, OutputFormat } from './project';

export interface OutlineNode {
  id: string;
  title: string;
  level: number;                   // 1 = capitolo, 2 = sezione…
  childrenIds: string[];
}

/** Sotto-sezione di un capitolo (voce dell'indice completo). */
export interface ChapterSection {
  id: string;
  title: string;
}

export interface Chapter {
  id: string;
  versionId: string;
  index: number;
  title: string;
  body: string;                    // markdown/HTML
  status: 'pending' | 'generating' | 'ready' | 'failed';
  wordCount: number;
  sections?: ChapterSection[];     // sotto-sezioni titolate (indice completo)
}

export interface RenderedOutput {
  format: OutputFormat;
  url: string;                     // mock: blob/data url
  generatedAt: string;
  sizeBytes?: number;
}

export interface Version {
  id: string;
  projectId: string;
  number: number;                  // 1, 2, 3…
  label?: string;                  // es. "Versione studenti"
  status: 'draft' | 'published';   // draft = in lavorazione; published = congelata
  createdAt: string;
  createdBy: string;

  settingsSnapshot: ProjectSettings; // settings con cui è stata generata
  sourcesUsedIds: string[];          // snapshot delle fonti usate
  outline: OutlineNode[];            // struttura capitoli
  chapters: Chapter[];               // contenuto
  outputs: RenderedOutput[];         // export materializzati
  changeSummary?: string;            // cosa è cambiato vs versione precedente (per compare)
}
