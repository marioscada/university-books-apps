/**
 * Helper puri e costanti statiche dello Studio (`project-workspace`). Nessun
 * `this`/DI: dati di presentazione + funzioni pure, isolati per snellire il
 * container e renderli testabili.
 */
import type {
  ChatBubble,
  QuickOp,
} from '../../shared/components-v2/ai-chat-panel/ai-chat-panel.component';
import type { ChapterItem } from '../../shared/components-v2/chapter-index/chapter-index.component';
import type { Chapter, ChatMessage } from '../../core/domain';

/** Stati con un output (versione + capitoli) disponibile. */
export const HAS_OUTPUT = new Set(['review', 'published', 'archived']);

/** Paragrafi per "pagina" nel lettore paginato (niente scroll, sfoglio a pagine). */
export const READER_PAGE_SIZE = 3;

/** Operazioni rapide della chat di modifica. */
export const QUICK_OPS: QuickOp[] = [
  { key: 'reduce', label: 'Riduci' },
  { key: 'expand', label: 'Espandi' },
  { key: 'examples', label: 'Aggiungi esempi' },
  { key: 'technical', label: 'Rendi tecnico' },
  { key: 'translate', label: 'Traduci' },
];

/** Prompt corrispondente a un'operazione rapida della chat. */
export function quickOpText(key: string): string {
  switch (key) {
    case 'reduce':
      return 'Riduci questo capitolo del 20%.';
    case 'expand':
      return 'Espandi questo capitolo con più dettagli.';
    case 'examples':
      return 'Aggiungi un esempio concreto al capitolo.';
    case 'technical':
      return 'Rendi il tono più tecnico.';
    case 'translate':
      return 'Traduci il capitolo in inglese.';
    default:
      return key;
  }
}

/** Etichetta dello stato di un capitolo nella lista indice. */
export function chapterStatusLabel(status: ChapterItem['status']): string {
  switch (status) {
    case 'generating':
      return 'In generazione';
    case 'current':
      return 'In lettura';
    default:
      return 'Da rivedere';
  }
}

/** Suddivide una lista in pagine di dimensione fissa (mai vuota: almeno `[[]]`). */
export function paginate<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length ? pages : [[]];
}

/** Stima pagine da un conteggio parole (≈ 350 parole/pagina). */
export function pagesFromWords(words: number): number {
  return Math.max(1, Math.round(words / 350));
}

/**
 * Mappa i capitoli nel view-model della lista indice. In revisione indice
 * (`ready=false`) lista neutra con stima lunghezza; a capitoli sviluppati lo
 * stato riflette in generazione/in lettura/da rivedere.
 */
export function toChapterItems(
  chapters: readonly Chapter[],
  ready: boolean,
  selectedKey: string,
): ChapterItem[] {
  return chapters.map((c) => {
    const sections = (c.sections ?? []).map((s) => ({ key: s.id, title: s.title }));
    if (!ready) {
      return {
        key: c.id,
        index: c.index,
        title: c.title,
        status: 'todo' as const,
        statusLabel: `≈ ${pagesFromWords(c.wordCount)} pag.`,
        sections,
      };
    }
    const status =
      c.status === 'generating' ? 'generating' : c.id === selectedKey ? 'current' : 'review';
    return {
      key: c.id,
      index: c.index,
      title: c.title,
      status,
      statusLabel: chapterStatusLabel(status),
      sections,
    };
  });
}

/**
 * Bolle della chat dai messaggi dello store; in invio aggiunge una bolla
 * "pending" dell'assistente come feedback ottimistico.
 */
export function toChatBubbles(messages: readonly ChatMessage[], sending: boolean): ChatBubble[] {
  const bubbles: ChatBubble[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.content,
    operationLabel: (m as { operationLabel?: string }).operationLabel,
  }));
  if (sending) {
    bubbles.push({ id: 'pending', role: 'assistant', text: 'Sto applicando la modifica…', pending: true });
  }
  return bubbles;
}
