/**
 * Helper puri e costanti statiche dello Studio (`project-workspace`). Nessun
 * `this`/DI: dati di presentazione + funzioni pure, isolati per snellire il
 * container e renderli testabili.
 */
import type { StepItem } from '../../shared/ui/step-indicator/step-indicator.component';
import type { GenStep } from '../../shared/components-v2/generation-panel/generation-panel.component';
import type { QuickOp } from '../../shared/components-v2/ai-chat-panel/ai-chat-panel.component';
import type { ChapterItem } from '../../shared/components-v2/chapter-index/chapter-index.component';
import type { DerivedKind } from '../../core/domain';

/** Step del percorso prodotto (stepper unificato dello Studio). */
export const FLOW_STEPS: StepItem[] = [
  { label: 'Configura' },
  { label: 'Analisi' },
  { label: 'Indice' },
  { label: 'Capitoli' },
  { label: 'Render' },
];

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

/** Stima pagine da un conteggio parole (≈ 350 parole/pagina). */
export function pagesFromWords(words: number): number {
  return Math.max(1, Math.round(words / 350));
}
