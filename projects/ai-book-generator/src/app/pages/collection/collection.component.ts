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
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import { BillingService } from '../../core/services/billing.service';
import type { ProjectStatus } from '../../core/domain';
import { type RowVM, projectRow, sourceRow } from './collection-row.mapper';

interface GroupVM {
  id: string;
  project: RowVM;
  sources: RowVM[];
}

const IN_PROGRESS: readonly ProjectStatus[] = ['draft', 'queued', 'processing', 'review', 'failed'];
const LIBRARY: readonly ProjectStatus[] = ['published', 'archived'];

/**
 * Collezioni — pagina unica project-centrica (assorbe le ex "Fonti"): ogni
 * progetto è una riga (copertina piena + apri/scarica/rielabora/elimina) con le
 * **fonti annidate** sotto. Container snello: orchestra `ProjectsStore` +
 * `SourcesStore` + `BillingService` e delega la mappatura a `collection-row.mapper`.
 * Due sezioni: "Continua dove eri" (savepoint) + "La tua libreria". Rielaborare è
 * gated dall'abbonamento (🔒 → upsell).
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
  private readonly billing = inject(BillingService);
  private readonly router = inject(Router);

  /** Stato fatturazione → guida il dialog di rielaborazione. */
  readonly billingStatus = this.billing.status;

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
        this.askDelete('project', id);
        break;
      // 'download': placeholder col backend.
    }
  }
  onSourceAction(id: string, action: string): void {
    if (action === 'delete') this.askDelete('source', id);
    // 'download': placeholder col backend.
  }

  // --- Conferma eliminazione (operazione irreversibile) -----------------------
  readonly pendingDelete = signal<{ kind: 'project' | 'source'; id: string; title: string } | null>(
    null,
  );
  private askDelete(kind: 'project' | 'source', id: string): void {
    const title =
      kind === 'project'
        ? (this.projects.entities().find((p) => p.id === id)?.title ?? '')
        : (this.sources.entities().find((s) => s.id === id)?.name ?? '');
    this.pendingDelete.set({ kind, id, title });
  }
  confirmDelete(): void {
    const d = this.pendingDelete();
    if (!d) return;
    if (d.kind === 'project') void this.projects.delete(d.id);
    else void this.sources.delete(d.id);
    this.pendingDelete.set(null);
  }
  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  // --- Dialog abbonamento (rielaborazione gated) ------------------------------
  readonly reuseOpen = signal(false);
  openReuse(projectId: string): void {
    // Abbonamento attivo con chance → procedi (mock: apri il progetto per rielaborare).
    if (this.billing.canReuse()) {
      this.openProject(projectId);
      return;
    }
    this.reuseOpen.set(true);
  }
  /** Caso `none`: abbonati. Caso `past_due`: regolarizza. → pagina Prezzi. */
  goPricing(): void {
    this.reuseOpen.set(false);
    void this.router.navigate(['/pricing']);
  }
  /** Caso `none`: paga il costo del singolo progetto (mock). */
  paySingle(): void {
    this.reuseOpen.set(false);
    // TODO: checkout singolo progetto (backend).
  }

  // --- Build (orchestrazione store → view-model via mapper) --------------------
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
          project: projectRow(p, srcs.length),
          sources: srcs.map((s) => sourceRow(s)),
        };
      });
  }
}
