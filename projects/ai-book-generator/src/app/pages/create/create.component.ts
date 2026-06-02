import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { StatusTone } from '../../shared/layout/icon-tile/icon-tile.component';
import { ProjectsStore } from '../../core/state/projects.store';
import type { Project, ProjectStatus } from '../../core/domain';

/** Voce della timeline "Recent activity". */
interface ActivityEntry {
  id: string;
  text: string;
  timeLabel: string;
  icon: string;
}

/** Card "lavoro in corso" derivata dal dominio per il rendering. */
interface ProjectCardVm {
  id: string;
  title: string;
  /** Tono visivo della label di stato (classe status--*). */
  statusTone: StatusTone;
  /** Chiave i18n della label di stato. */
  statusLabelKey: string;
  coverTheme: Project['coverTheme'];
  /** Avanzamento 0–100 (dal job corrente, mock). */
  progress: number;
  updatedLabel: string;
}

/** ProjectStatus → tono visivo `status--*` esistente (visual invariato). */
const STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  draft: 'draft',
  queued: 'gen',
  processing: 'gen',
  review: 'review',
  published: 'done',
  archived: 'muted',
  failed: 'muted',
};

/**
 * Create — hub post-login: lavori in corso da continuare + avvio di nuovi.
 * Hero (testo + immagine), card con copertine astratte. I dati delle card
 * provengono dal dominio via `ProjectsStore` (F1); la recent-activity resta mock
 * fino alle fasi successive. Vedi docs/PRODUCT-ARCHITECTURE.md §5.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    RouterLink,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatProgressBarModule,
    MatListModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly store = inject(ProjectsStore);

  /** Card "in corso" mappate dai progetti vivi dello store. */
  readonly inProgress = computed<ProjectCardVm[]>(() =>
    this.store.activeProjects().map((project) => this.toCardVm(project)),
  );

  readonly recentActivity = signal<ActivityEntry[]>([
    { id: 'a1', icon: 'auto_stories', text: 'Generato il capitolo 5 di "AI & Machine Learning Book"', timeLabel: '2 ore fa' },
    { id: 'a2', icon: 'upload_file', text: 'Caricato "Appunti_Algoritmi.pdf"', timeLabel: 'ieri' },
    { id: 'a3', icon: 'edit_note', text: 'Modificato l’outline di "Physics Summary"', timeLabel: '2 giorni fa' },
  ]);

  private toCardVm(project: Project): ProjectCardVm {
    const job = this.store.jobsByProject()[project.id] ?? null;
    return {
      id: project.id,
      title: project.title,
      statusTone: STATUS_TONE[project.status],
      statusLabelKey: `i18n.Project.Status.${project.status}`,
      coverTheme: project.coverTheme,
      // Progress dal job corrente (mock) se presente; in review l'output è
      // pronto (100%), altrimenti 0 (draft non ancora lanciato).
      progress: job?.progress ?? (project.status === 'review' ? 100 : 0),
      updatedLabel: project.lastActivityLabel ?? relativeTime(project.updatedAt),
    };
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
  const days = Math.round(hours / 24);
  return `${days}d`;
}
