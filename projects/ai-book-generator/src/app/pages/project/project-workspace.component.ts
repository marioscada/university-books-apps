import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { ProjectsStore } from '../../core/state/projects.store';
import type { JobStep } from '../../core/domain';

/**
 * ProjectWorkspace — pagina dinamica del singolo progetto (`/project/:id`).
 *
 * La shell cambia in base allo `status` live del progetto (state machine §2),
 * letto dai signal dello `ProjectsStore` (che si auto-inizializza e polla i job
 * via `rxMethod`). Il componente NON polla né contiene business logic: legge
 * signal e chiama i metodi dello store. A 100% lo store passa `processing →
 * review` e lo `@switch` ricompone la shell da solo, senza reload.
 *
 * Contenuti ricchi (outline/capitoli/preview/export, log, versioni) = F5/F8:
 * qui sono placeholder. Le azioni avanzate sono presenti ma disabilitate
 * (tooltip "in arrivo").
 */
@Component({
  selector: 'app-project-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    PageHeaderComponent,
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './project-workspace.component.html',
  styleUrl: './project-workspace.component.scss',
})
export class ProjectWorkspaceComponent {
  private readonly store = inject(ProjectsStore);

  /** Id del progetto dalla route (`withComponentInputBinding`). */
  readonly id = input.required<string>();

  /** Vero finché il primo load dello store non è completato. */
  readonly loading = this.store.loading;

  /** Progetto corrente dallo store (undefined se non trovato dopo il load). */
  readonly project = computed(() =>
    this.store.entities().find((p) => p.id === this.id()),
  );

  /** Job corrente del progetto (live panel) — null se nessun job attivo. */
  readonly job = computed(() => this.store.jobsByProject()[this.id()] ?? null);

  /** Chiave i18n della label di stato per l'eyebrow dell'header. */
  readonly statusLabelKey = computed(() => {
    const project = this.project();
    return project ? `i18n.Project.Status.${project.status}` : '';
  });

  /** Step corrente del job (per labelKey i18n nel live panel). */
  readonly currentStep = computed<JobStep | null>(() => {
    const job = this.job();
    if (!job) {
      return null;
    }
    return job.steps.find((s) => s.key === job.currentStepKey) ?? null;
  });

  generate(): void {
    void this.store.generate(this.id());
  }

  cancel(): void {
    void this.store.cancel(this.id());
  }

  publish(): void {
    void this.store.publish(this.id());
  }

  archive(): void {
    void this.store.archive(this.id());
  }

  reopen(): void {
    void this.store.reopen(this.id());
  }
}
