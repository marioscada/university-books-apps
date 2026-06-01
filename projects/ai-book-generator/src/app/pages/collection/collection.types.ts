/** Tipo (categoria) di lavoro generato. */
export type CollectionKind = 'book' | 'summary' | 'course' | 'notes';

export interface CollectionItem {
  id: string;
  title: string;
  kind: CollectionKind;
  /** Data di completamento (stringa già formattata, mock). */
  completedLabel: string;
}

/** Filtro attivo nella Collezione: per categoria ('all' = tutte). */
export type CollectionFilter = CollectionKind | 'all';

/** Azione eseguibile su un elemento della collezione (tutti completati). */
export interface CollectionAction {
  id: 'open' | 'duplicate' | 'export' | 'delete';
  label: string;
  icon: string;
  /** Azione distruttiva (stile rosso). */
  danger?: boolean;
}
