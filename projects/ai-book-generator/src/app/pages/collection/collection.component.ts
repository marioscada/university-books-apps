import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import {
  ModelCardComponent,
  type ModelCardAction,
  type ModelTone,
} from '../../shared/ui/model-card/model-card.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { derivedKindLabel } from '../../core/data/derived-seed';
import type { Project, ProjectKind, ProjectStatus } from '../../core/domain';

type TypeFilter = 'all' | 'book' | 'summary' | 'course' | 'notes' | 'derived';
type StatusFilter = 'all' | 'published' | 'archived';

/** View-model di una card (il dominio Project mappato per il dumb component). */
interface CardVM {
  id: string;
  kicker: string;
  title: string;
  stats: string;
  lineage: string;
  statusLabel: string;
  statusTone: ModelTone;
  updated: string;
  menu: ModelCardAction[];
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

const STATUS_INFO: Record<ProjectStatus, { label: string; tone: ModelTone }> = {
  draft: { label: 'Bozza', tone: 'neutral' },
  queued: { label: 'In coda', tone: 'info' },
  processing: { label: 'In generazione', tone: 'info' },
  review: { label: 'In revisione', tone: 'amber' },
  published: { label: 'Pubblicato', tone: 'success' },
  archived: { label: 'Archiviato', tone: 'neutral' },
  failed: { label: 'Errore', tone: 'danger' },
};

const IN_PROGRESS: readonly ProjectStatus[] = ['draft', 'queued', 'processing', 'review', 'failed'];
const LIBRARY: readonly ProjectStatus[] = ['published', 'archived'];

/**
 * Collection — workspace operativo: "Continua dove eri" (lavori in corso, con
 * azione contestuale) + "La tua libreria" (pubblicati/archiviati), con filtri
 * per tipo e stato e ricerca. Dati dal `ProjectsStore` (signals); le card sono
 * dumb (`project-card`). Vedi docs/COMPONENT-RULES.md.
 */
@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    ModelCardComponent,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionComponent {
  private readonly store = inject(ProjectsStore);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly typeFilter = signal<TypeFilter>('all');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly typeTabs: readonly { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'book', label: 'Libri' },
    { value: 'summary', label: 'Riassunti' },
    { value: 'course', label: 'Corsi' },
    { value: 'notes', label: 'Note' },
    { value: 'derived', label: 'Derivati' },
  ];
  readonly statusOptions: readonly { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'published', label: 'Pubblicati' },
    { value: 'archived', label: 'Archiviati' },
  ];
  readonly statusFilterLabel = computed(
    () => this.statusOptions.find((o) => o.value === this.statusFilter())?.label ?? 'Tutti',
  );

  /** Lavori in corso (bozza → revisione), ordinati per ultima attività. */
  readonly continua = computed<CardVM[]>(() =>
    this.sorted(this.store.entities().filter((p) => IN_PROGRESS.includes(p.status)))
      .filter((p) => this.matchesType(p) && this.matchesQuery(p))
      .map((p) => this.toVM(p)),
  );

  /** Libreria: pubblicati/archiviati, con filtro stato. */
  readonly library = computed<CardVM[]>(() =>
    this.sorted(this.store.entities().filter((p) => LIBRARY.includes(p.status)))
      .filter(
        (p) =>
          this.matchesType(p) &&
          this.matchesQuery(p) &&
          (this.statusFilter() === 'all' || p.status === this.statusFilter()),
      )
      .map((p) => this.toVM(p)),
  );

  // --- Navigazione / azioni ---------------------------------------------------
  openProject(id: string): void {
    void this.router.navigate(['/project', id]);
  }
  newProject(): void {
    void this.router.navigate(['/create']);
  }
  setType(t: TypeFilter): void {
    this.typeFilter.set(t);
  }
  setStatus(s: StatusFilter): void {
    this.statusFilter.set(s);
  }
  onMenu(id: string, action: string): void {
    switch (action) {
      case 'open':
      case 'derive':
        this.openProject(id);
        break;
      case 'archive':
        void this.store.archive(id);
        break;
      case 'reopen':
        void this.store.reopen(id);
        break;
    }
  }

  // --- Mapping -----------------------------------------------------------------
  private sorted(list: readonly Project[]): Project[] {
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  private matchesType(p: Project): boolean {
    switch (this.typeFilter()) {
      case 'all':
        return true;
      case 'book':
        return p.kind === 'book';
      case 'summary':
        return p.kind === 'summary';
      case 'course':
        return p.kind === 'training_course';
      case 'notes':
        return p.kind === 'study_guide';
      case 'derived':
        return !!p.derivedKind;
    }
  }
  private matchesQuery(p: Project): boolean {
    const q = this.query().trim().toLowerCase();
    return !q || p.title.toLowerCase().includes(q);
  }

  private toVM(p: Project): CardVM {
    const info = STATUS_INFO[p.status];
    // Revisione: distingui "Indice pronto" (outline) da "Capitoli pronti" (sviluppati).
    let statusLabel = info.label;
    let statusTone = info.tone;
    if (p.status === 'review') {
      const chapters = p.reviewStage === 'chapters';
      statusLabel = chapters ? 'Capitoli pronti' : 'Indice pronto';
      statusTone = chapters ? 'amber' : 'info';
    }
    const formats = (p.settings.outputFormats ?? []).map((f) => f.toUpperCase()).join(' · ');
    const parent = p.parentProjectId
      ? this.store.entities().find((x) => x.id === p.parentProjectId)
      : undefined;
    return {
      id: p.id,
      kicker: p.derivedKind ? `Derivato · ${derivedKindLabel(p.derivedKind)}` : KIND_LABEL[p.kind],
      title: p.title,
      stats: formats,
      lineage: parent ? `da: ${parent.title}` : '',
      statusLabel,
      statusTone,
      updated: this.relTime(p.updatedAt),
      menu: this.menuFor(p),
    };
  }

  private menuFor(p: Project): ModelCardAction[] {
    const m: ModelCardAction[] = [{ id: 'open', label: 'Apri', icon: 'open_in_new' }];
    if (p.status === 'published') {
      m.push({ id: 'derive', label: 'Genera derivato', icon: 'auto_awesome' });
      m.push({ id: 'archive', label: 'Archivia', icon: 'archive' });
    } else if (p.status === 'archived') {
      m.push({ id: 'reopen', label: 'Riapri', icon: 'unarchive' });
    }
    return m;
  }

  /** Tempo relativo leggibile da una data ISO. */
  private relTime(iso: string): string {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const d = Math.floor(s / 86400);
    if (s < 3600) {
      const m = Math.floor(s / 60);
      return m <= 1 ? 'poco fa' : `${m} min fa`;
    }
    if (s < 86400) {
      const h = Math.floor(s / 3600);
      return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
    }
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
