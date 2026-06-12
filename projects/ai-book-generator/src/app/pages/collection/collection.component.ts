import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { ListRowComponent } from '../../shared/components-v2/list-row/list-row.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import { NoDataComponent } from '../../shared/components-v2/no-data/no-data.component';
import { SkeletonComponent } from '../../shared/components-v2/skeleton/skeleton.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import { BillingService } from '../../core/services/billing.service';
import { UiPromiseService } from '../../shared/services/ui-promise.service';
import { injectI18nText } from '../../shared/services/i18n-text';
import { ToastFacade } from '../../shared/services/toast/toast.facade';
import { BookReaderComponent } from '../../shared/components-v2/book-reader/book-reader.component';
import { API_PORT } from '../../core/data/api-port';
import type { ProjectStatus, Chapter } from '../../core/domain';
import { type RowVM, projectRow, sourceRow } from './collection-row.mapper';

interface GroupVM {
  id: string;
  project: RowVM;
  sources: RowVM[];
}

const LIBRARY: readonly ProjectStatus[] = ['published'];

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
    ListRowComponent,
    ModalShellComponent,
    NoDataComponent,
    SkeletonComponent,
    BookReaderComponent,
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
  private readonly uiPromise = inject(UiPromiseService);
  private readonly api = inject(API_PORT);
  private readonly toast = inject(ToastFacade);
  private readonly t = injectI18nText();

  // --- Lettore del libro (click sul progetto) ---------------------------------
  readonly readerOpen = signal(false);
  readonly readerLoading = signal(false);
  readonly readerTitle = signal('');
  readonly readerChapters = signal<readonly Chapter[]>([]);

  // --- Scarica output (icona download sul progetto) ---------------------------
  readonly downloadOpen = signal(false);
  readonly downloadTitle = signal('');
  readonly downloadFormats = signal<readonly string[]>([]);
  private readonly downloadProjectId = signal('');

  /** Stato fatturazione → guida il dialog di rielaborazione. */
  readonly billingStatus = this.billing.status;

  readonly query = signal('');

  readonly library = computed<GroupVM[]>(() => this.build(LIBRARY));

  /** Nessun lavoro pubblicato → empty-state globale (i progetti in corso si
   *  riprendono da "Crea", vincolo un-progetto-alla-volta). */
  readonly hasNoProjects = computed(() => !this.library().length);
  /** True dopo il primo caricamento: l'empty-state appare solo se è DAVVERO
   *  vuoto, non come falsa interpretazione dell'attesa dei dati. */
  readonly loaded = this.projects.loaded;
  readonly showEmpty = computed(() => this.loaded() && this.hasNoProjects());
  /** Placeholder dello skeleton mostrato durante l'attesa dei dati. */
  protected readonly skeletonRows = [1, 2, 3];
  readonly emptyMessage = computed(() => this.t('i18n.Collection.empty.message'));

  // --- Navigazione / azioni ---------------------------------------------------
  /** Click sul progetto → apre il LIBRO nel lettore read-only (capitoli dalla
   *  versione corrente). Se non c'è contenuto leggibile (bozza) → Studio. */
  async openProject(id: string): Promise<void> {
    // Apertura OTTIMISTICA: il dialog (col titolo) appare subito con lo spinner,
    // poi si popola coi capitoli. Niente attesa di rete prima dell'apertura.
    this.readerTitle.set(this.projects.entities().find((p) => p.id === id)?.title ?? '');
    this.readerChapters.set([]);
    this.readerLoading.set(true);
    this.readerOpen.set(true);
    const version = await this.api.getCurrentVersion(id);
    const chapters = version?.chapters ?? [];
    this.readerLoading.set(false);
    if (chapters.length) {
      this.readerChapters.set(chapters);
    } else {
      // Nessun contenuto leggibile (bozza) → Studio per continuare.
      this.readerOpen.set(false);
      void this.router.navigate(['/project', id]);
    }
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
      case 'delete':
        this.askDelete('project', id);
        break;
      case 'download':
        this.openDownload(id);
        break;
    }
  }

  /** Icona download sul progetto → modale con i formati di output scaricabili. */
  openDownload(id: string): void {
    const project = this.projects.entities().find((p) => p.id === id);
    const formats = project?.generationOptions.outputFormats ?? ['pdf'];
    this.downloadTitle.set(project?.title ?? '');
    this.downloadFormats.set(formats.map((f) => f.toUpperCase()));
    this.downloadProjectId.set(id);
    this.downloadOpen.set(true);
  }

  /** Copia negli appunti il link al documento + toast di conferma. */
  async copyProjectLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/project/${this.downloadProjectId()}`,
      );
      void this.toast.present(this.t('i18n.Workspace.linkCopied'), this.t('i18n.Common.done'), {
        severity: 'success',
      });
    } catch {
      void this.toast.present(this.t('i18n.Common.error'), this.t('i18n.Common.error'), {
        severity: 'error',
      });
    }
  }
  onSourceAction(id: string, action: string): void {
    if (action === 'delete') this.askDelete('source', id);
    else if (action === 'download') this.downloadSource(id);
  }

  /** Scarica il file della fonte via presigned URL (Content-Disposition: attachment). */
  downloadSource(id: string): void {
    void this.uiPromise.run(
      async () => {
        window.location.href = await this.sources.downloadUrl(id);
      },
      {
        error: {
          title: this.t('i18n.Common.error'),
          message: 'Impossibile scaricare il file.',
        },
      },
    );
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
    this.pendingDelete.set(null);
    // Spinner d'attesa + toast (esito) via uiPromise; il dialog di conferma è già stato mostrato.
    void this.uiPromise.run(
      async () => {
        if (d.kind === 'project') {
          // Elimina il progetto E tutte le sue fonti (material + instruction).
          const project = this.projects.entities().find((p) => p.id === d.id);
          const sourceIds = [
            ...(project?.materialFileIds ?? []),
            ...(project?.instructionFileIds ?? []),
          ];
          await Promise.allSettled(sourceIds.map((sid) => this.sources.delete(sid)));
          await this.projects.delete(d.id);
        } else {
          await this.sources.delete(d.id);
        }
      },
      {
        loading: true,
        loadingMessage: this.t(`i18n.Collection.delete.${d.kind}.loading`),
        success: {
          title: this.t('i18n.Common.done'),
          message: this.t(`i18n.Collection.delete.${d.kind}.success`),
        },
        error: {
          title: this.t('i18n.Common.error'),
          message: this.t(`i18n.Collection.delete.${d.kind}.error`),
        },
      },
    );
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
        // Le fonti del progetto sono la sua lista (forward-reference, popolata da
        // createProject): material + instruction file. NON usiamo `usedInProjectIds`
        // dei documenti (back-reference che il backend non mantiene → "0 fonti").
        const ids = new Set([...(p.materialFileIds ?? []), ...(p.instructionFileIds ?? [])]);
        const srcs = all.filter((s) => ids.has(s.id));
        return {
          id: p.id,
          project: projectRow(p, srcs.length),
          sources: srcs.map((s) => sourceRow(s)),
        };
      });
  }
}
