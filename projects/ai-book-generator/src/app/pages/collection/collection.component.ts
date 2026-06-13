import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
import type { Project, ProjectStatus, Chapter } from '../../core/domain';
import {
  type RowVM,
  type ProjectTableVM,
  projectTableRow,
  sourceRow,
} from './collection-row.mapper';

/** Opzione del filtro per stato (etichette IT). */
interface StatusOption {
  value: 'all' | ProjectStatus;
  label: string;
}

const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 'all', label: 'Tutti' },
  { value: 'draft', label: 'Bozza' },
  { value: 'queued', label: 'In coda' },
  { value: 'processing', label: 'In generazione' },
  { value: 'review', label: 'In revisione' },
  { value: 'published', label: 'Pubblicato' },
  { value: 'failed', label: 'Errore' },
];

/** MatPaginatorIntl in italiano (pattern ufficiale Material). */
function italianPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Per pagina:';
  intl.nextPageLabel = 'Pagina successiva';
  intl.previousPageLabel = 'Pagina precedente';
  intl.firstPageLabel = 'Prima pagina';
  intl.lastPageLabel = 'Ultima pagina';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) return `0 di ${length}`;
    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1}–${end} di ${length}`;
  };
  return intl;
}

/**
 * Collezioni — tabella **Material** dei progetti (tutti gli stati, con filtro):
 * paginazione/sort/ricerca client-side via `MatTableDataSource`, **riga
 * espandibile** (pattern `multiTemplateDataRows`) che mostra le **fonti** del
 * progetto con le relative azioni. Container snello: orchestra `ProjectsStore` +
 * `SourcesStore` + `BillingService`, delega la mappatura a `collection-row.mapper`.
 */
@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: italianPaginatorIntl }],
  imports: [
    ModalShellComponent,
    NoDataComponent,
    SkeletonComponent,
    BookReaderComponent,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
  // Animazione detail-row (pattern ufficiale tabella espandibile Material).
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
  ],
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

  // --- Tabella ----------------------------------------------------------------
  readonly displayedColumns = ['title', 'type', 'status', 'sources', 'updated', 'actions'] as const;
  readonly dataSource = new MatTableDataSource<ProjectTableVM>([]);
  readonly statusOptions = STATUS_OPTIONS;
  readonly statusFilter = signal<'all' | ProjectStatus>('all');
  readonly query = signal('');
  /** Id della riga espansa (mostra le fonti); null = nessuna. */
  readonly expandedId = signal<string | null>(null);

  private readonly paginator = viewChild(MatPaginator);
  private readonly sort = viewChild(MatSort);

  /** Indice fonte per id: lookup O(1), evita le scansioni P×S. */
  private readonly sourceById = computed(
    () => new Map(this.sources.entities().map((s) => [s.id, s])),
  );
  private static sourceIds(p: Project): readonly string[] {
    return [...(p.materialFileIds ?? []), ...(p.instructionFileIds ?? [])];
  }

  /** Tutti i progetti → righe tabella (ordinati per aggiornamento desc di base). */
  private readonly rows = computed<ProjectTableVM[]>(() => {
    const byId = this.sourceById();
    return this.projects
      .entities()
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((p) =>
        projectTableRow(p, CollectionComponent.sourceIds(p).filter((id) => byId.has(id)).length),
      );
  });

  /** Fonti per progetto (per la riga espansa). */
  private readonly sourcesByProject = computed<Map<string, RowVM[]>>(() => {
    const byId = this.sourceById();
    const map = new Map<string, RowVM[]>();
    for (const p of this.projects.entities()) {
      const srcs: RowVM[] = [];
      for (const id of CollectionComponent.sourceIds(p)) {
        const s = byId.get(id);
        if (s) srcs.push(sourceRow(s));
      }
      map.set(p.id, srcs);
    }
    return map;
  });

  /** Righe filtrate per stato + ricerca (la paginazione lavora su queste). */
  private readonly filtered = computed<ProjectTableVM[]>(() => {
    const status = this.statusFilter();
    const q = this.query().trim().toLowerCase();
    return this.rows()
      .filter((r) => status === 'all' || this.statusOf(r.id) === status)
      .filter((r) => !q || r.title.toLowerCase().includes(q));
  });

  /** Pronto solo quando progetti E fonti sono arrivati (skeleton fino ad allora). */
  readonly loaded = computed(() => this.projects.loaded() && this.sources.loaded());
  /** Righe placeholder dello skeleton-tabella durante l'attesa. */
  protected readonly skeletonRows = [1, 2, 3, 4, 5];
  readonly hasNoProjects = computed(() => !this.rows().length);
  readonly showEmpty = computed(() => this.loaded() && this.hasNoProjects());
  readonly emptyMessage = computed(() => this.t('i18n.Collection.empty.message'));

  constructor() {
    this.dataSource.sortingDataAccessor = (row, col) => {
      if (col === 'updated') return row.updatedAt;
      if (col === 'sources') return row.sourcesCount;
      if (col === 'type') return row.typeLabel;
      if (col === 'status') return row.statusLabel;
      return row.title.toLowerCase();
    };
    // Material non è signal-aware: sincronizzo dati + paginator/sort via effect.
    // (paginator/sort esistono solo dopo che la tabella entra in pagina — è dentro
    // un @if — quindi NON in ngAfterViewInit ma reattivamente al loro viewChild.)
    effect(() => {
      const p = this.paginator();
      const s = this.sort();
      if (p && this.dataSource.paginator !== p) this.dataSource.paginator = p;
      if (s && this.dataSource.sort !== s) this.dataSource.sort = s;
      this.dataSource.data = this.filtered();
    });
    // Reset a pagina 1 SOLO al cambio filtro/ricerca (intenzione utente), non a
    // ogni aggiornamento dello store → niente "salto" di pagina in background.
    effect(() => {
      this.statusFilter();
      this.query();
      this.paginator()?.firstPage();
    });
  }

  /** trackBy della tabella: identità per id (no re-render di righe invariate). */
  readonly trackById = (_: number, row: ProjectTableVM): string => row.id;

  private statusOf(id: string): ProjectStatus | undefined {
    return this.projects.entities().find((p) => p.id === id)?.status;
  }

  // --- Espansione fonti -------------------------------------------------------
  toggleExpand(row: ProjectTableVM, event?: Event): void {
    event?.stopPropagation();
    this.expandedId.update((cur) => (cur === row.id ? null : row.id));
  }
  isExpanded(row: ProjectTableVM): boolean {
    return this.expandedId() === row.id;
  }
  sourcesFor(id: string): RowVM[] {
    return this.sourcesByProject().get(id) ?? [];
  }

  // --- Lettore del libro ------------------------------------------------------
  readonly readerOpen = signal(false);
  readonly readerLoading = signal(false);
  readonly readerTitle = signal('');
  readonly readerChapters = signal<readonly Chapter[]>([]);

  // --- Scarica output ---------------------------------------------------------
  readonly downloadOpen = signal(false);
  readonly downloadTitle = signal('');
  readonly downloadFormats = signal<readonly string[]>([]);
  private readonly downloadProjectId = signal('');

  readonly billingStatus = this.billing.status;

  async openProject(id: string): Promise<void> {
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
      this.readerOpen.set(false);
      void this.router.navigate(['/project', id]);
    }
  }
  newProject(): void {
    void this.router.navigate(['/create']);
  }
  onProjectAction(id: string, action: string, event?: Event): void {
    event?.stopPropagation();
    switch (action) {
      case 'open':
      case 'read':
        void this.openProject(id);
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

  openDownload(id: string): void {
    const project = this.projects.entities().find((p) => p.id === id);
    const formats = project?.generationOptions.outputFormats ?? ['pdf'];
    this.downloadTitle.set(project?.title ?? '');
    this.downloadFormats.set(formats.map((f) => f.toUpperCase()));
    this.downloadProjectId.set(id);
    this.downloadOpen.set(true);
  }

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

  downloadSource(id: string): void {
    void this.uiPromise.run(
      async () => {
        window.location.href = await this.sources.downloadUrl(id);
      },
      {
        error: { title: this.t('i18n.Common.error'), message: 'Impossibile scaricare il file.' },
      },
    );
  }

  // --- Conferma eliminazione --------------------------------------------------
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
    void this.uiPromise.run(
      async () => {
        if (d.kind === 'project') {
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

  // --- Elimina TUTTI i progetti (bulk, irreversibile) -------------------------
  /** Numero di progetti (per il testo di conferma e la visibilità del bottone). */
  readonly total = computed(() => this.rows().length);
  readonly deleteAllOpen = signal(false);
  askDeleteAll(): void {
    this.deleteAllOpen.set(true);
  }
  confirmDeleteAll(): void {
    this.deleteAllOpen.set(false);
    const projects = this.projects.entities();
    if (!projects.length) return;
    // Raccoglie le fonti di TUTTI i progetti (deduplicate), poi elimina fonti e
    // progetti. allSettled: un errore singolo non blocca il resto.
    const sourceIds = new Set<string>();
    for (const p of projects) {
      for (const id of CollectionComponent.sourceIds(p)) sourceIds.add(id);
    }
    void this.uiPromise.run(
      async () => {
        await Promise.allSettled([...sourceIds].map((id) => this.sources.delete(id)));
        await Promise.allSettled(projects.map((p) => this.projects.delete(p.id)));
      },
      {
        loading: true,
        loadingMessage: 'Eliminazione di tutti i progetti…',
        success: {
          title: this.t('i18n.Common.done'),
          message: 'Tutti i progetti sono stati eliminati.',
        },
        error: {
          title: this.t('i18n.Common.error'),
          message: 'Non è stato possibile eliminare tutti i progetti.',
        },
      },
    );
  }

  // --- Dialog abbonamento (rielaborazione gated) ------------------------------
  readonly reuseOpen = signal(false);
  openReuse(projectId: string): void {
    if (this.billing.canReuse()) {
      this.openProject(projectId);
      return;
    }
    this.reuseOpen.set(true);
  }
  goPricing(): void {
    this.reuseOpen.set(false);
    void this.router.navigate(['/pricing']);
  }
  paySingle(): void {
    this.reuseOpen.set(false);
  }
}
