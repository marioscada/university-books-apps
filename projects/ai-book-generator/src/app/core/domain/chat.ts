/**
 * Project AI Chat + operazioni tipizzate.
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.6. La chat NON è testo libero: ogni
 * messaggio utente può produrre una Operation tipizzata che agisce su
 * outline/capitoli/versioni/derivati. La chat è contestuale al progetto.
 */

import type { DerivedKind } from './project';

export interface ChatThread {
  id: string;
  projectId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  operationId?: string;            // se il messaggio ha generato un'operazione
}

export type OperationType =
  | 'refine_chapter' | 'reduce_length' | 'expand' | 'change_tone' | 'make_technical'
  | 'add_examples' | 'update_chapters' | 'add_sources' | 'change_format'
  | 'translate' | 'derive';

export interface Operation {
  id: string;
  projectId: string;
  type: OperationType;
  params: Record<string, unknown>;   // es. { percent: 30 } | { tone: 'technical' }
  targetChapterIds?: string[];       // rigenerazione parziale
  derivedKind?: DerivedKind;         // per type='derive'
  status: 'pending' | 'running' | 'done' | 'failed';
  resultingJobId?: string;
  resultingVersionId?: string;
  resultingProjectId?: string;       // per derive → nuovo progetto figlio
  createdAt: string;
}
