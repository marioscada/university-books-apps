import type { DerivedKind } from '../domain';

/** Etichette leggibili dei tipi di derivato (presentazione, non dato di backend). */
const KIND_LABEL: Record<DerivedKind, string> = {
  summary: 'Riassunto',
  slides: 'Presentazione',
  quiz: 'Quiz',
  manual: 'Manuale',
  study_guide: 'Guida allo studio',
  translation: 'Traduzione',
};

/** Etichetta leggibile del tipo di derivato. */
export function derivedKindLabel(kind: DerivedKind): string {
  return KIND_LABEL[kind];
}
