/**
 * Tono cromatico condiviso dai componenti `components-v2`. Mappa sui token
 * globali `--tone-<name>-{bg,fg}` (e `--accent-*` per `accent`): cambiando i token
 * si ri-tematizzano tutti i componenti senza toccarne il codice. Agnostico dal
 * dominio.
 */
export type Tone =
  | 'info'
  | 'success'
  | 'amber'
  | 'warning'
  | 'rose'
  | 'violet'
  | 'danger'
  | 'neutral'
  | 'accent';
