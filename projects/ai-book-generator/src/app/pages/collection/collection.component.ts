import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { ListRowComponent } from '../../shared/components-v2/list-row/list-row.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import type { ModelTone, ModelCardAction } from '../../shared/ui/model-card/model-card.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import { derivedKindLabel } from '../../core/data/derived-seed';
import type {
  Project,
  ProjectKind,
  ProjectStatus,
  CoverTheme,
  Source,
  SourceType,
  IngestStatus,
} from '../../core/domain';

interface RowVM {
  id: string;
  icon: string;
  iconTone: ModelTone;
  cover: string;
  title: string;
  meta: string;
  badge: string;
  badgeTone: ModelTone;
  actions: ModelCardAction[];
}
interface GroupVM {
  id: string;
  project: RowVM;
  sources: RowVM[];
}

const KIND_LABEL: Record<ProjectKind, string> = {
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
const KIND_ICON: Record<ProjectKind, string> = {
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
const STATUS_INFO: Record<ProjectStatus, { label: string; tone: ModelTone }> = {
  draft: { label: 'Bozza', tone: 'neutral' },
  queued: { label: 'In coda', tone: 'info' },
  processing: { label: 'In generazione', tone: 'info' },
  review: { label: 'In revisione', tone: 'amber' },
  published: { label: 'Pubblicato', tone: 'success' },
  archived: { label: 'Archiviato', tone: 'neutral' },
  failed: { label: 'Errore', tone: 'danger' },
};
const TYPE_META: Record<SourceType, { icon: string; tone: ModelTone }> = {
  pdf: { icon: 'picture_as_pdf', tone: 'danger' },
  docx: { icon: 'description', tone: 'info' },
  pptx: { icon: 'slideshow', tone: 'amber' },
  image: { icon: 'image', tone: 'success' },
  csv: { icon: 'table_chart', tone: 'success' },
  url: { icon: 'link', tone: 'info' },
  note: { icon: 'article', tone: 'neutral' },
};
const INGEST_META: Record<IngestStatus, { label: string; tone: ModelTone }> = {
  ready: { label: 'Pronta', tone: 'success' },
  processing: { label: 'In elaborazione', tone: 'info' },
  pending: { label: 'In coda', tone: 'neutral' },
  failed: { label: 'Errore', tone: 'danger' },
};

const IN_PROGRESS: readonly ProjectStatus[] = ['draft', 'queued', 'processing', 'review', 'failed'];
const LIBRARY: readonly ProjectStatus[] = ['published', 'archived'];

/**
 * Collezioni — pagina unica project-centrica (assorbe le ex "Fonti"): ogni
 * progetto è una riga (copertina piena + apri/scarica/rielabora/elimina) con le
 * **fonti annidate** sotto. Le azioni sono icone inline su desktop, menu "⋯" su
 * mobile (`list-row`). Due sezioni: "Continua dove eri" (savepoint) + "La tua
 * libreria". Rielaborare è gated dall'abbonamento (🔒 → upsell). Dati da
 * `ProjectsStore` + `SourcesStore` (signals).
 */
@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    ListRowComponent,
    ModalShellComponent,
    NgTemplateOutlet,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionComponent {
  private readonly projects = inject(ProjectsStore);
  private readonly sources = inject(SourcesStore);
  private readonly router = inject(Router);

  /** v1: nessun abbonamento attivo → rielaborare è gated. */
  private readonly canReuse = false;

  readonly query = signal('');

  readonly continua = computed<GroupVM[]>(() => this.build(IN_PROGRESS));
  readonly library = computed<GroupVM[]>(() => this.build(LIBRARY));

  // --- Navigazione / azioni ---------------------------------------------------
  openProject(id: string): void {
    void this.router.navigate(['/project', id]);
  }
  newProject(): void {
    void this.router.navigate(['/create']);
  }
  openSource(_id: string): void {
    // TODO: anteprima fonte (col backend).
  }
  onProjectAction(id: string, action: string): void {
    switch (action) {
      case 'open':
        this.openProject(id);
        break;
      case 'reuse':
        this.openReuse(id);
        break;
      case 'archive':
        void this.projects.archive(id);
        break;
      case 'reopen':
        void this.projects.reopen(id);
        break;
      case 'delete':
        void this.projects.delete(id);
        break;
      // 'download': placeholder col backend.
    }
  }
  onSourceAction(id: string, action: string): void {
    if (action === 'delete') void this.sources.delete(id);
    // 'download': placeholder col backend.
  }

  // --- Dialog abbonamento (rielaborazione gated) ------------------------------
  readonly reuseOpen = signal(false);
  openReuse(_projectId: string): void {
    this.reuseOpen.set(true);
  }
  goPricing(): void {
    this.reuseOpen.set(false);
    void this.router.navigate(['/pricing']);
  }

  // --- Build ------------------------------------------------------------------
  private build(statuses: readonly ProjectStatus[]): GroupVM[] {
    const q = this.query().trim().toLowerCase();
    const all = this.sources.entities();
    return this.projects
      .entities()
      .filter((p) => statuses.includes(p.status))
      .filter((p) => !q || p.title.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((p) => {
        const srcs = all.filter((s) => s.usedInProjectIds.includes(p.id));
        return {
          id: p.id,
          project: this.projectRow(p, srcs.length),
          sources: srcs.map((s) => this.sourceRow(s)),
        };
      });
  }

  private projectRow(p: Project, nSources: number): RowVM {
    const info = STATUS_INFO[p.status];
    let badge = info.label;
    let tone = info.tone;
    if (p.status === 'review') {
      const chapters = p.reviewStage === 'chapters';
      badge = chapters ? 'Capitoli pronti' : 'Indice pronto';
      tone = chapters ? 'amber' : 'info';
    }
    const kicker = p.derivedKind ? `Derivato · ${derivedKindLabel(p.derivedKind)}` : KIND_LABEL[p.kind];
    const fonti = `${nSources} ${nSources === 1 ? 'fonte' : 'fonti'}`;
    return {
      id: p.id,
      icon: p.derivedKind ? 'auto_awesome' : KIND_ICON[p.kind],
      iconTone: 'neutral',
      cover: COVER_COLOR[p.coverTheme],
      title: p.title,
      meta: `${kicker} · ${fonti} · ${this.relTime(p.updatedAt)}`,
      badge,
      badgeTone: tone,
      actions: this.projectActions(p),
    };
  }

  private projectActions(p: Project): ModelCardAction[] {
    const del: ModelCardAction = { id: 'delete', label: 'Elimina', icon: 'delete', danger: true };
    const reuse: ModelCardAction = {
      id: 'reuse',
      label: 'Riutilizza',
      icon: this.canReuse ? 'autorenew' : 'lock',
    };
    const download: ModelCardAction = { id: 'download', label: 'Scarica', icon: 'download' };
    if (p.status === 'published') {
      return [download, reuse, { id: 'archive', label: 'Archivia', icon: 'archive' }, del];
    }
    if (p.status === 'archived') {
      return [download, reuse, { id: 'reopen', label: 'Riapri', icon: 'unarchive' }, del];
    }
    // in lavorazione → apri/riprendi + elimina
    return [{ id: 'open', label: 'Apri', icon: 'open_in_new' }, del];
  }

  private sourceRow(s: Source): RowVM {
    const tm = TYPE_META[s.type];
    const im = INGEST_META[s.ingestStatus];
    return {
      id: s.id,
      icon: tm.icon,
      iconTone: tm.tone,
      cover: '',
      title: s.name,
      meta: this.sourceMeta(s),
      badge: im.label,
      badgeTone: im.tone,
      actions: [
        { id: 'download', label: 'Scarica', icon: 'download' },
        { id: 'delete', label: 'Elimina', icon: 'delete', danger: true },
      ],
    };
  }

  private sourceMeta(s: Source): string {
    const head =
      s.type === 'url'
        ? s.name.replace(/^https?:\/\//, '').replace(/\.url$/, '')
        : s.type === 'note'
          ? 'Testo'
          : this.humanSize(s.sizeBytes);
    return `${head} · aggiunta ${this.relTime(s.uploadedAt)}`;
  }
  private humanSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  }
  private relTime(iso: string): string {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const d = Math.floor(s / 86400);
    if (s < 86400) return 'oggi';
    if (d === 1) return 'ieri';
    if (d < 7) return `${d} giorni fa`;
    if (d < 30) {
      const w = Math.floor(d / 7);
      return `${w} ${w === 1 ? 'settimana' : 'settimane'} fa`;
    }
    const mo = Math.floor(d / 30);
    return `${mo} ${mo === 1 ? 'mese' : 'mesi'} fa`;
  }
}
