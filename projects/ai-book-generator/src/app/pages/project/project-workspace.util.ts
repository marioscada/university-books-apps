/**
 * Helper puri e costanti statiche dello Studio (`project-workspace`). Nessun
 * `this`/DI: dati di presentazione + funzioni pure, isolati per snellire il
 * container e renderli testabili.
 */
import type { GenStep } from '../../shared/components-v2/generation-panel/generation-panel.component';
import type {
  ChatBubble,
  QuickOp,
} from '../../shared/components-v2/ai-chat-panel/ai-chat-panel.component';
import type { ChapterItem } from '../../shared/components-v2/chapter-index/chapter-index.component';
import type { Chapter, ChatMessage, DerivedKind } from '../../core/domain';

/** Statistica sintetica mostrata in "Cosa otterrai" (value + label). */
export interface OutcomeStat {
  value: string;
  label: string;
}

/**
 * Step del percorso prodotto (stepper unificato dello Studio) come **chiavi
 * i18n**: le label vengono tradotte dal componente (step-indicator è dumb e
 * i18n-agnostico, riceve label già tradotte).
 */
export const FLOW_STEP_KEYS = [
  'i18n.Workspace.Flow.configure',
  'i18n.Workspace.Flow.analysis',
  'i18n.Workspace.Flow.outline',
  'i18n.Workspace.Flow.chapters',
  'i18n.Workspace.Flow.render',
] as const;

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

/** Tipi di derivato generabili dal documento pubblicato. */
export const DERIVED_OPTIONS: readonly { kind: DerivedKind; title: string; desc: string }[] = [
  { kind: 'summary', title: 'Riassunto', desc: 'Sintesi esecutiva dei punti chiave.' },
  { kind: 'slides', title: 'Presentazione', desc: 'Slide pronte da presentare.' },
  { kind: 'quiz', title: 'Quiz', desc: 'Domande di verifica sul contenuto.' },
  { kind: 'manual', title: 'Manuale', desc: 'Versione operativa, passo-passo.' },
  { kind: 'study_guide', title: 'Guida allo studio', desc: 'Schede e ripasso per studiare.' },
  { kind: 'translation', title: 'Traduzione', desc: 'Il documento in un’altra lingua.' },
];

/** Lingue selezionabili per la traduzione. */
export const LANGUAGES = ['Inglese', 'Spagnolo', 'Francese', 'Tedesco', 'Portoghese', 'Cinese'];

/**
 * Pipeline del pannello di generazione: "Configura" sempre completato (verde),
 * poi done prima dell'attivo, current sull'attivo, todo dopo.
 */
export function buildPipeline(active: 'analisi' | 'indice' | 'capitoli' | 'render'): GenStep[] {
  const order = ['configura', 'analisi', 'indice', 'capitoli', 'render'] as const;
  const labels: Record<string, string> = {
    configura: 'Configura',
    analisi: 'Analisi',
    indice: 'Indice',
    capitoli: 'Capitoli',
    render: 'Render',
  };
  const ai = order.indexOf(active);
  return order.map((k, i) => {
    const status: GenStep['status'] = i < ai ? 'done' : i === ai ? 'current' : 'todo';
    return { label: labels[k], status };
  });
}

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
    case 'approved':
      return 'Approvato';
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
 * stato riflette approvato/in generazione/in lettura/da rivedere.
 */
export function toChapterItems(
  chapters: readonly Chapter[],
  ready: boolean,
  approvedIds: readonly string[],
  selectedKey: string,
): ChapterItem[] {
  const approved = new Set(approvedIds);
  return chapters.map((c) => {
    if (!ready) {
      return {
        key: c.id,
        index: c.index,
        title: c.title,
        status: 'todo' as const,
        statusLabel: `≈ ${pagesFromWords(c.wordCount)} pag.`,
      };
    }
    const status = approved.has(c.id)
      ? 'approved'
      : c.status === 'generating'
        ? 'generating'
        : c.id === selectedKey
          ? 'current'
          : 'review';
    return { key: c.id, index: c.index, title: c.title, status, statusLabel: chapterStatusLabel(status) };
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

/** Statistiche "Cosa otterrai" da capitoli + numero di fonti. */
export function toOutcomeStats(chapters: readonly Chapter[], sourcesCount: number): OutcomeStat[] {
  const words = chapters.reduce((sum, c) => sum + c.wordCount, 0);
  return [
    { value: `≈ ${pagesFromWords(words)}`, label: 'Pagine' },
    { value: `≈ ${words.toLocaleString('it-IT')}`, label: 'Parole' },
    { value: String(chapters.length), label: 'Capitoli' },
    { value: String(sourcesCount), label: 'Fonti' },
    { value: `≈ ${Math.max(1, Math.round(words / 200))} min`, label: 'Lettura' },
  ];
}
