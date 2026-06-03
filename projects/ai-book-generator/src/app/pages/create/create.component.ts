import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import {
  EntityCardComponent,
  type StatusTone,
} from '../../shared/ui/entity-card/entity-card.component';
import { SelectionCardComponent } from '../../shared/ui/selection-card/selection-card.component';
import {
  StatCardComponent,
  type StatTone,
} from '../../shared/ui/stat-card/stat-card.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import type { Project, ProjectKind, ProjectStatus } from '../../core/domain';

/** Stat in cima alla pagina. */
interface CreateStat {
  labelKey: string;
  value: string;
  icon: string;
  tone: StatTone;
}

/** Scelta rapida di tipo nel launcher (label/desc/hint via i18n `Create.Type.<id>`). */
interface TypeChoice {
  id: string;
  kind: ProjectKind;
  icon: string;
}

/** Modello (mock) della sezione "Ispirati a un modello". */
interface TemplateItem {
  id: string;
  title: string;
  coverTheme: Project['coverTheme'];
  kind: ProjectKind;
  meta: string;
}

/** ProjectStatus → tono `entity-card`. */
const STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  draft: 'neutral',
  queued: 'accent',
  processing: 'accent',
  review: 'warning',
  published: 'success',
  archived: 'neutral',
  failed: 'danger',
};

/**
 * Create — pagina "Crea": **launcher** di creazione (inizia da zero · scegli un
 * tipo · ispirati a un modello · suggerimenti AI) + sezione **"Continua a creare"**
 * (progetti vivi dallo store). Tipi/modelli preselezionano il `kind` nel wizard
 * (`/create/new?kind=`). Vedi docs/UI-SPEC-CREATION-AND-GENERATION.md §A0.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule,
    EntityCardComponent,
    SelectionCardComponent,
    StatCardComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly store = inject(ProjectsStore);
  private readonly sourcesStore = inject(SourcesStore);
  private readonly router = inject(Router);

  /** Progetti "vivi" da continuare. */
  readonly activeProjects = this.store.activeProjects;

  /** Stat in cima (progetti attivi · fonti · generazioni in corso). */
  readonly stats = computed<CreateStat[]>(() => {
    const all = this.store.entities();
    const active = this.activeProjects().length;
    const generating = all.filter((p) => p.status === 'processing' || p.status === 'queued').length;
    const sources = this.sourcesStore.entities().length;
    return [
      { labelKey: 'i18n.Create.Stat.active', value: String(active), icon: 'layers', tone: 'accent' },
      { labelKey: 'i18n.Create.Stat.sources', value: String(sources), icon: 'folder_open', tone: 'success' },
      { labelKey: 'i18n.Create.Stat.generating', value: String(generating), icon: 'auto_awesome', tone: 'info' },
    ];
  });

  /** 7 tipi del mock (Libro · Manuale · Guida · Report · Tesi · Corso · Personalizzato). */
  readonly types: readonly TypeChoice[] = [
    { id: 'book', kind: 'book', icon: 'menu_book' },
    { id: 'manual', kind: 'manual', icon: 'build' },
    { id: 'guide', kind: 'study_guide', icon: 'school' },
    { id: 'report', kind: 'research_report', icon: 'analytics' },
    { id: 'thesis', kind: 'research_report', icon: 'history_edu' },
    { id: 'course', kind: 'training_course', icon: 'cast_for_education' },
    { id: 'custom', kind: 'custom', icon: 'tune' },
  ];

  /** Modelli mock (preselezionano un tipo nel wizard). */
  readonly templates: readonly TemplateItem[] = [
    { id: 't1', title: 'Guida introduttiva all’Intelligenza Artificiale', coverTheme: 'aurora', kind: 'book', meta: 'Libro · 12 capitoli' },
    { id: 't2', title: 'Manuale di Fotografia Digitale', coverTheme: 'ember', kind: 'manual', meta: 'Manuale · 7 sezioni' },
    { id: 't3', title: 'Marketing Digitale: strategie e strumenti', coverTheme: 'mint', kind: 'study_guide', meta: 'Guida · 12 sezioni' },
    { id: 't4', title: 'Analisi di Mercato 2024', coverTheme: 'ocean', kind: 'research_report', meta: 'Report · 14 sezioni' },
    { id: 't5', title: 'Tesi: IA e Apprendimento Automatico', coverTheme: 'gold', kind: 'research_report', meta: 'Accademico' },
  ];

  statusTone(status: ProjectStatus): StatusTone {
    return STATUS_TONE[status];
  }

  progressOf(project: Project): number | null {
    if (project.status === 'processing' || project.status === 'queued') {
      return this.store.jobsByProject()[project.id]?.progress ?? 0;
    }
    return null;
  }

  metaLabel(project: Project): string {
    return project.lastActivityLabel ?? relativeTime(project.updatedAt);
  }

  startBlank(): void {
    void this.router.navigate(['/create/new']);
  }
  startKind(kind: ProjectKind): void {
    void this.router.navigate(['/create/new'], { queryParams: { kind } });
  }
  useTemplate(template: TemplateItem): void {
    void this.router.navigate(['/create/new'], { queryParams: { kind: template.kind } });
  }
  openProject(id: string): void {
    void this.router.navigate(['/project', id]);
  }
}

/** Etichetta relativa minimale per `updatedAt` (mock, lato UI). */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `${Math.max(1, minutes)}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.round(hours / 24)}d`;
}
