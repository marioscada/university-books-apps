/**
 * Mapper Collezioni — dal dominio (`Project`/`Source`) ai view-model di riga
 * (`RowVM`) per `list-row`. Funzioni pure (no DI): costanti di presentazione +
 * costruttori di riga progetto/fonte e relative azioni.
 */
import type { Tone } from '../../shared/components-v2/tone';
import type { RowAction } from '../../shared/components-v2/list-row/list-row.component';
import type { Project, DocumentType, ProjectStatus, CoverTheme, Source, SourceType, IngestStatus } from '../../core/domain';
import { relTime, humanSize } from './format.util';

/** View-model di una riga (progetto o fonte) per `list-row`. */
export interface RowVM {
  id: string;
  icon: string;
  iconTone: Tone;
  cover: string;
  /** Immagine 3D del modello (se disponibile): sostituisce icona/cover. */
  imageSrc: string;
  title: string;
  meta: string;
  badge: string;
  badgeTone: Tone;
  actions: RowAction[];
}

/** Modelli con immagine 3D in `public/images/models/<id>.png`. */
const MODEL_IMG_IDS = new Set([
  'book',
  'summary',
  'thesis',
  'manual',
  'report',
  'presentation',
  'study_guide',
  'course',
  'custom',
]);

const KIND_LABEL: Record<DocumentType, string> = {
  book: 'Libro',
  summary: 'Riassunto',
  manual: 'Manuale',
  study_guide: 'Guida',
  research_report: 'Report',
  training_course: 'Corso',
  presentation: 'Presentazione',
  documentation: 'Documentazione',
  custom: 'Documento',
};
const KIND_ICON: Record<DocumentType, string> = {
  book: 'menu_book',
  summary: 'article',
  manual: 'description',
  study_guide: 'school',
  research_report: 'query_stats',
  training_course: 'school',
  presentation: 'slideshow',
  documentation: 'description',
  custom: 'draft',
};
const COVER_COLOR: Record<CoverTheme, string> = {
  aurora: 'var(--cover-aurora)',
  ocean: 'var(--cover-ocean)',
  ember: 'var(--cover-ember)',
  rose: 'var(--cover-rose)',
  mint: 'var(--cover-mint)',
  gold: 'var(--cover-gold)',
};
const STATUS_INFO: Record<ProjectStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Bozza', tone: 'neutral' },
  queued: { label: 'In coda', tone: 'info' },
  processing: { label: 'In generazione', tone: 'info' },
  review: { label: 'In revisione', tone: 'amber' },
  published: { label: 'Pubblicato', tone: 'success' },
  failed: { label: 'Errore', tone: 'danger' },
};
const TYPE_META: Record<SourceType, { icon: string; tone: Tone }> = {
  pdf: { icon: 'picture_as_pdf', tone: 'danger' },
  docx: { icon: 'description', tone: 'info' },
  pptx: { icon: 'slideshow', tone: 'amber' },
  image: { icon: 'image', tone: 'success' },
  csv: { icon: 'table_chart', tone: 'success' },
  url: { icon: 'link', tone: 'info' },
  note: { icon: 'article', tone: 'neutral' },
};
const INGEST_META: Record<IngestStatus, { label: string; tone: Tone }> = {
  ready: { label: 'Pronta', tone: 'success' },
  processing: { label: 'In elaborazione', tone: 'info' },
  pending: { label: 'In coda', tone: 'neutral' },
  failed: { label: 'Errore', tone: 'danger' },
};

/** Azioni della riga progetto (per stato). */
export function projectActions(p: Project): RowAction[] {
  const del: RowAction = { id: 'delete', label: 'Elimina', icon: 'delete', danger: true };
  const reuse: RowAction = { id: 'reuse', label: 'Riutilizza', icon: 'autorenew' };
  const download: RowAction = { id: 'download', label: 'Scarica', icon: 'download' };
  if (p.status === 'published') {
    return [download, reuse, del];
  }
  return [{ id: 'open', label: 'Apri', icon: 'open_in_new' }, del];
}

/** Riga di un progetto (copertina piena, badge stato preciso, meta). */
export function projectRow(p: Project, nSources: number): RowVM {
  const info = STATUS_INFO[p.status];
  let badge = info.label;
  let tone = info.tone;
  if (p.status === 'review') {
    const chapters = p.reviewStage === 'chapters';
    badge = chapters ? 'Capitoli pronti' : 'Indice pronto';
    tone = chapters ? 'amber' : 'info';
  }
  const kicker = KIND_LABEL[p.documentType];
  const fonti = `${nSources} ${nSources === 1 ? 'fonte' : 'fonti'}`;
  const imageSrc =
    p.templateId && MODEL_IMG_IDS.has(p.templateId) ? `images/models/${p.templateId}.png` : '';
  return {
    id: p.id,
    icon: KIND_ICON[p.documentType],
    iconTone: 'neutral',
    cover: COVER_COLOR[p.coverTheme],
    imageSrc,
    title: p.title,
    meta: `${kicker} · ${fonti} · ${relTime(p.updatedAt)}`,
    badge,
    badgeTone: tone,
    actions: projectActions(p),
  };
}

/** Riga di una fonte (icona tipo, badge stato ingest). */
export function sourceRow(s: Source): RowVM {
  const tm = TYPE_META[s.type];
  const im = INGEST_META[s.ingestStatus];
  const head =
    s.type === 'url'
      ? s.name.replace(/^https?:\/\//, '').replace(/\.url$/, '')
      : s.type === 'note'
        ? 'Testo'
        : humanSize(s.sizeBytes);
  return {
    id: s.id,
    icon: tm.icon,
    iconTone: tm.tone,
    cover: '',
    imageSrc: '',
    title: s.name,
    meta: `${head} · aggiunta ${relTime(s.uploadedAt)}`,
    badge: im.label,
    badgeTone: im.tone,
    actions: [
      { id: 'download', label: 'Scarica', icon: 'download' },
      { id: 'delete', label: 'Elimina', icon: 'delete', danger: true },
    ],
  };
}
