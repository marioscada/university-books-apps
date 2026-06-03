import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import {
  ModelCardComponent,
  type ModelTone,
} from '../../shared/ui/model-card/model-card.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { TemplatesStore } from '../../core/state/templates.store';
import type { Project, ProjectStatus, ProjectTemplate } from '../../core/domain';

/** Presentazione (icona + tono) per modello, indicizzata per `template.id`. */
interface ModelVisual {
  icon: string;
  tone: ModelTone;
}

const MODEL_VISUAL: Record<string, ModelVisual> = {
  book: { icon: 'menu_book', tone: 'info' },
  summary: { icon: 'short_text', tone: 'success' },
  study_guide: { icon: 'school', tone: 'amber' },
  manual: { icon: 'build', tone: 'violet' },
  report: { icon: 'analytics', tone: 'info' },
  presentation: { icon: 'slideshow', tone: 'warning' },
  course: { icon: 'cast_for_education', tone: 'rose' },
  thesis: { icon: 'history_edu', tone: 'success' },
  custom: { icon: 'tune', tone: 'neutral' },
};

const FALLBACK_VISUAL: ModelVisual = { icon: 'description', tone: 'neutral' };

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
 * Create — pagina "Crea": (1) **"Riprendi da dove hai interrotto"** (progetti
 * vivi dallo store), (2) **galleria modelli** (dal `TemplatesStore`) — scegliere
 * un modello apre la pagina di personalizzazione (`/create/new?template=<id>`),
 * (3) banner suggerimenti AI. Vedi docs/UI-SPEC-CREATION-AND-GENERATION.md.
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
    ModelCardComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly store = inject(ProjectsStore);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly router = inject(Router);

  /** Progetti "vivi" da riprendere. */
  readonly activeProjects = this.store.activeProjects;
  /** Modelli di pubblicazione (galleria). */
  readonly templates = this.templatesStore.templates;

  visual(template: ProjectTemplate): ModelVisual {
    return MODEL_VISUAL[template.id] ?? FALLBACK_VISUAL;
  }

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

  /** Scelto un modello → pagina di personalizzazione. */
  chooseModel(template: ProjectTemplate): void {
    void this.router.navigate(['/create/new'], {
      queryParams: { template: template.id },
    });
  }

  openProject(id: string): void {
    void this.router.navigate(['/project', id]);
  }

  /** CTA suggerimenti AI (placeholder: apre Personalizzato). */
  suggest(): void {
    void this.router.navigate(['/create/new'], {
      queryParams: { template: 'custom' },
    });
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
