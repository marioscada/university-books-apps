import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { BackLinkComponent } from '../../shared/components-v2/back-link/back-link.component';
import { ActionBarComponent } from '../../shared/components-v2/action-bar/action-bar.component';
import { DerivedResultComponent } from '../../shared/components-v2/derived-result/derived-result.component';
import { ReviewShellComponent } from '../../shared/components-v2/review-shell/review-shell.component';
import { derivedKindLabel } from '../../core/data/derived.util';
import {
  ChapterIndexComponent,
  type ChapterItem,
} from '../../shared/components-v2/chapter-index/chapter-index.component';
import { ChapterReaderComponent } from '../../shared/components-v2/chapter-reader/chapter-reader.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import {
  AiChatPanelComponent,
  type ChatBubble,
} from '../../shared/components-v2/ai-chat-panel/ai-chat-panel.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { WorkspaceStore } from '../../core/state/workspace.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import { UiPromiseService } from '../../shared/services/ui-promise.service';
import type { Chapter, DerivedKind } from '../../core/domain';
import {
  HAS_OUTPUT,
  READER_PAGE_SIZE,
  QUICK_OPS,
  DERIVED_OPTIONS,
  LANGUAGES,
  paginate,
  quickOpText,
  toChapterItems,
  toChatBubbles,
  toOutcomeStats,
} from './project-workspace.util';

/**
 * ProjectWorkspace — **Studio** del singolo progetto (`/project/:id`).
 *
 * Smart container: legge i signal di `ProjectsStore` (stato/job, polling) e
 * `WorkspaceStore` (versione/capitoli/chat) e compone i dumb component del
 * design system (`step-indicator`, `generation-panel`, `chapter-index`,
 * `chapter-reader`, `ai-chat-panel`). Niente business logic qui: deriva
 * view-model e delega ai metodi degli store.
 */
@Component({
  selector: 'app-project-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BackLinkComponent,
    ActionBarComponent,
    DerivedResultComponent,
    ReviewShellComponent,
    ChapterIndexComponent,
    ChapterReaderComponent,
    AiChatPanelComponent,
    StatCardComponent,
    ModalShellComponent,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './project-workspace.component.html',
  styleUrl: './project-workspace.component.scss',
})
export class ProjectWorkspaceComponent {
  private readonly store = inject(ProjectsStore);
  protected readonly workspace = inject(WorkspaceStore);
  private readonly router = inject(Router);
  private readonly uiPromise = inject(UiPromiseService);

  /** Id del progetto dalla route (`withComponentInputBinding`). */
  readonly id = input.required<string>();

  /** Risolutore i18n reattivo (ricomputa al cambio lingua/traduzioni). */
  private readonly t = injectI18nText();

  readonly loading = this.store.loading;
  readonly project = computed(() => this.store.entities().find((p) => p.id === this.id()));
  readonly job = computed(() => this.store.jobsByProject()[this.id()] ?? null);

  constructor() {
    // Apre lo Studio quando il progetto ha un output; per i DERIVATI apre il
    // flusso dedicato (attesa elaborazione → risultato). Guard: una sola apertura
    // per id (evita restart quando lo store ricarica le entità).
    effect(() => {
      const p = this.project();
      if (!p || this.workspace.projectId() === p.id) {
        return;
      }
      if (p.derivedKind) {
        void this.workspace.openDerived(p.id);
      } else if (HAS_OUTPUT.has(p.status)) {
        void this.workspace.open(p.id);
      }
    });

    // Attesa (generazione/pubblicazione) → spinner OVERLAY sopra lo Studio, non
    // una schermata a sé. Appena i dati arrivano, l'overlay sparisce e compare
    // il contenuto. `onCleanup` chiude lo spinner al cambio stato/destroy.
    effect((onCleanup) => {
      if (this.waiting()) {
        const ref = this.uiPromise.spinner(untracked(() => this.waitMessage()));
        onCleanup(() => ref.hide());
      }
    });
  }

  // --- Derivato (riassunto/slide/quiz/…) --------------------------------------
  readonly isDerived = computed(() => !!this.project()?.derivedKind);
  readonly derived = computed(() => this.workspace.derived());
  readonly derivedGenerating = computed(() => this.workspace.derivedGenerating());
  readonly derivedProgress = computed(() => this.workspace.derivedProgress());
  readonly derivedLabel = computed(() => {
    const k = this.project()?.derivedKind;
    return k ? derivedKindLabel(k) : '';
  });
  /** Pubblica il derivato (riusa l'attesa di pubblicazione). */
  publishDerived(): void {
    void this.workspace.publish(this.id());
  }
  /** Apre il progetto sorgente (genitore) del derivato. */
  openParent(): void {
    const pid = this.project()?.parentProjectId;
    if (pid) {
      void this.router.navigate(['/project', pid]);
    }
  }

  // --- Attesa (spinner overlay) ----------------------------------------------
  /** True durante qualsiasi elaborazione (indice/capitoli/pubblicazione/derivato). */
  readonly waiting = computed(
    () => this.isGenerating() || this.derivedGenerating() || this.publishing(),
  );
  /** Messaggio sotto lo spinner, in base alla fase corrente. */
  readonly waitMessage = computed(() => {
    const p = this.project();
    if (!p) {
      return '';
    }
    if (this.publishing()) {
      return this.publishDetail();
    }
    if (p.derivedKind) {
      return this.derivedLabel();
    }
    if (p.status === 'queued' || p.status === 'processing') {
      return this.indexDetail();
    }
    if (p.status === 'review' && this.workspace.generating()) {
      return this.chapterDetail();
    }
    return '';
  });

  // --- Avanzamento ------------------------------------------------------------
  readonly genProgress = computed(() => this.workspace.genProgress());
  readonly publishing = computed(() => this.workspace.publishing());
  readonly pubProgress = computed(() => this.workspace.pubProgress());
  /** Kicker della copertina (es. "REPORT"). */
  readonly coverKicker = computed(() => (this.project()?.kind ?? '').toUpperCase());

  /**
   * Stato di attesa/generazione → la pagina mostra SOLO il generation-panel a
   * tutta pagina (nessuna chrome dello Studio): generazione indice, capitoli,
   * pubblicazione.
   */
  readonly isGenerating = computed(() => {
    const p = this.project();
    if (!p) {
      return false;
    }
    if (p.status === 'queued' || p.status === 'processing') {
      return true;
    }
    return p.status === 'review' && (this.workspace.generating() || this.workspace.publishing());
  });

  // Generazione indice (queued/processing) — il detail traduce la labelKey
  // dello step corrente del job (es. job.step.analyze → "Analisi delle fonti").
  readonly progress = computed(() => this.job()?.progress ?? 0);
  readonly indexDetail = computed(() => {
    const job = this.job();
    const s = job?.steps.find((x) => x.key === job?.currentStepKey);
    return s ? this.t(s.labelKey) : '';
  });

  // Generazione capitoli (review + generating)
  readonly chapterDetail = computed(() => {
    const n = this.workspace.chapters().length || 1;
    const k = Math.min(n, Math.max(1, Math.ceil((this.genProgress() / 100) * n)));
    return this.t('i18n.Workspace.Detail.writingChapter', { k, n });
  });

  // Pubblicazione (review + publishing)
  readonly publishDetail = computed(() => {
    const p = this.pubProgress();
    const key = p < 40 ? 'layout' : p < 80 ? 'render' : 'export';
    return this.t(`i18n.Workspace.Detail.${key}`);
  });

  // --- Capitoli (revisione) ---------------------------------------------------
  private readonly pickedKey = signal('');
  readonly selectedKey = computed(
    () => this.pickedKey() || this.workspace.chapters()[0]?.id || '',
  );
  readonly selectedChapter = computed<Chapter | undefined>(() => {
    const key = this.selectedKey();
    return this.workspace.chapters().find((c) => c.id === key);
  });
  readonly selectedParagraphs = computed(() =>
    (this.selectedChapter()?.body ?? '').split('\n\n').filter((p) => p.trim()),
  );
  readonly selectedApproved = computed(() =>
    this.workspace.approvedChapterIds().includes(this.selectedKey()),
  );

  // --- Lettore paginato (dialog read-only): sfoglio a pagine, niente scroll ----
  private readonly readerPage = signal(0);
  /** Paragrafi del capitolo suddivisi in pagine. */
  readonly readerPages = computed<string[][]>(() =>
    paginate(this.selectedParagraphs(), READER_PAGE_SIZE),
  );
  readonly readerPageCount = computed(() => this.readerPages().length);
  readonly readerCurrentPage = computed(() =>
    Math.min(this.readerPage(), this.readerPageCount() - 1),
  );
  /** Paragrafi della pagina corrente. */
  readonly readerParagraphs = computed(
    () => this.readerPages()[this.readerCurrentPage()] ?? [],
  );
  readonly readerPosLabel = computed(() => {
    const ch = this.selectedChapter();
    if (!ch) {
      return '';
    }
    const total = this.workspace.chapters().length;
    return `Capitolo ${ch.index} di ${total} · pagina ${this.readerCurrentPage() + 1} di ${this.readerPageCount()}`;
  });
  private chapterIndexOf(): number {
    return this.workspace.chapters().findIndex((c) => c.id === this.selectedKey());
  }
  readonly canReadPrev = computed(
    () => this.readerCurrentPage() > 0 || this.chapterIndexOf() > 0,
  );
  readonly canReadNext = computed(
    () =>
      this.readerCurrentPage() < this.readerPageCount() - 1 ||
      this.chapterIndexOf() < this.workspace.chapters().length - 1,
  );
  /** Pagina/capitolo successivo (continua la lettura). */
  readNext(): void {
    if (this.readerCurrentPage() < this.readerPageCount() - 1) {
      this.readerPage.set(this.readerCurrentPage() + 1);
      return;
    }
    const list = this.workspace.chapters();
    const i = this.chapterIndexOf();
    if (i < list.length - 1) {
      this.pickedKey.set(list[i + 1].id);
      this.readerPage.set(0);
    }
  }
  /** Pagina/capitolo precedente (continua a ritroso). */
  readPrev(): void {
    if (this.readerCurrentPage() > 0) {
      this.readerPage.set(this.readerCurrentPage() - 1);
      return;
    }
    const list = this.workspace.chapters();
    const i = this.chapterIndexOf();
    if (i > 0) {
      this.pickedKey.set(list[i - 1].id);
      this.readerPage.set(this.readerPages().length - 1);
    }
  }

  /** True nella fase Capitoli (corpi sviluppati); false in revisione indice. */
  readonly chaptersReady = computed(() => this.workspace.chaptersReady());

  readonly chapterItems = computed<ChapterItem[]>(() =>
    toChapterItems(
      this.workspace.chapters(),
      this.chaptersReady(),
      this.workspace.approvedChapterIds(),
      this.selectedKey(),
    ),
  );
  readonly approvedCountLabel = computed(
    () => `${this.workspace.approvedCount()} di ${this.workspace.chapters().length} approvati`,
  );
  readonly indexCountLabel = computed(() => `${this.workspace.chapters().length} capitoli`);

  // --- Cosa otterrai (data view, revisione indice) ----------------------------
  readonly outcomeStats = computed(() =>
    toOutcomeStats(this.workspace.chapters(), this.project()?.sourceIds.length ?? 0),
  );

  /** Etichette prev/next dal capitolo adiacente (vuoto = bordo lista). */
  readonly prevLabel = computed(() => this.adjacent(-1));
  readonly nextLabel = computed(() => this.adjacent(1));
  private adjacent(delta: number): string {
    const list = this.workspace.chapters();
    const i = list.findIndex((c) => c.id === this.selectedKey());
    const n = list[i + delta];
    return n ? `${n.index} · ${n.title}` : '';
  }

  // --- Chat -------------------------------------------------------------------
  readonly chatDraft = signal('');
  readonly chatBubbles = computed<ChatBubble[]>(() =>
    toChatBubbles(this.workspace.messages(), this.workspace.sending()),
  );
  readonly chatSubtitle = computed(() => {
    const ch = this.selectedChapter();
    return ch ? `Modifica: ${ch.index} · ${ch.title}` : 'Chiedi una modifica al documento';
  });
  readonly quickOps = QUICK_OPS;

  // --- Azioni -----------------------------------------------------------------
  selectChapter(key: string): void {
    this.pickedKey.set(key);
  }
  step(delta: number): void {
    const list = this.workspace.chapters();
    const i = list.findIndex((c) => c.id === this.selectedKey());
    const next = list[i + delta];
    if (next) {
      this.pickedKey.set(next.id);
    }
  }
  sendChat(text: string): void {
    void this.workspace.send(this.id(), text);
    this.chatDraft.set('');
  }
  runQuickOp(key: string): void {
    void this.workspace.send(this.id(), quickOpText(key));
  }
  approveChapter(): void {
    this.workspace.toggleApproved(this.selectedKey());
  }
  /** True mentre i capitoli vengono sviluppati. */
  readonly generating = computed(() => this.workspace.generating());
  /** Dalla revisione indice: sviluppa i capitoli. */
  generateChapters(): void {
    void this.workspace.generateChapters(this.id());
  }

  // --- Pubblica / Conferma (sotto-viste UI dello stato review/published) -------
  /** Mostra la schermata Pubblica (Render) prima di confermare. */
  readonly showPublish = signal(false);
  /** In published: true = lettura documento; false = schermata di conferma. */
  readonly reading = signal(false);
  /** Opzioni di output (mock locale, visuale). */
  readonly includeCover = signal(true);
  /** Formati di output selezionabili nel dialog (modificabili fino alla conferma). */
  readonly allFormats = ['pdf', 'docx', 'epub'];
  readonly pubFormats = signal<string[]>([]);
  isFormatOn(f: string): boolean {
    return this.pubFormats().includes(f);
  }
  toggleFormat(f: string): void {
    this.pubFormats.update((list) =>
      list.includes(f) ? list.filter((x) => x !== f) : [...list, f],
    );
  }
  /** Formati pubblicati (per i download in Conferma), in maiuscolo. */
  readonly publishFormats = computed(() => {
    const fmts = this.pubFormats().length
      ? this.pubFormats()
      : (this.project()?.settings.outputFormats ?? ['pdf']);
    return fmts.map((f) => f.toUpperCase());
  });

  /** Apre il dialog di pubblicazione, inizializzando i formati dai settings. */
  goToPublish(): void {
    this.pubFormats.set([...(this.project()?.settings.outputFormats ?? ['pdf'])]);
    this.showPublish.set(true);
  }
  /** Torna dalla Pubblica ai capitoli. */
  backToChapters(): void {
    this.showPublish.set(false);
  }
  /** Conferma la pubblicazione: attesa (generation-panel) → published (Conferma). */
  confirmPublish(): void {
    this.showPublish.set(false);
    void this.workspace.publish(this.id());
  }
  /** Dalla Conferma: apri il documento in sola lettura (dal capitolo 1, pagina 1). */
  openDocument(): void {
    this.pickedKey.set(this.workspace.chapters()[0]?.id ?? '');
    this.readerPage.set(0);
    this.reading.set(true);
  }
  /** Dialog informativo (costi) prima di creare una nuova versione. */
  readonly showNewVersion = signal(false);
  newVersion(): void {
    this.showNewVersion.set(true);
  }
  /** Conferma: crea una nuova versione (mock: torna in revisione). */
  confirmNewVersion(): void {
    this.showNewVersion.set(false);
    this.reading.set(false);
    void this.store.reopen(this.id());
  }
  /** Genera un derivato: scelta del tipo via dialog, poi crea il progetto figlio. */
  readonly derivedOptions = DERIVED_OPTIONS;
  readonly showDerive = signal(false);
  readonly derivedKind = signal<DerivedKind>('summary');
  /** Scelta lingua (solo per la traduzione). */
  readonly languages = LANGUAGES;
  readonly showLang = signal(false);
  readonly selectedLang = signal('Inglese');
  derive(): void {
    this.derivedKind.set('summary');
    this.showDerive.set(true);
  }
  selectDerived(kind: DerivedKind): void {
    this.derivedKind.set(kind);
  }
  selectLang(lang: string): void {
    this.selectedLang.set(lang);
  }
  /** Conferma tipo: la traduzione apre prima la scelta lingua, gli altri partono. */
  confirmDerive(): void {
    if (this.derivedKind() === 'translation') {
      this.showDerive.set(false);
      this.selectedLang.set('Inglese');
      this.showLang.set(true);
      return;
    }
    this.runDerive();
  }
  /** Conferma lingua → avvia la traduzione. */
  confirmLang(): void {
    this.runDerive(this.selectedLang());
  }
  private runDerive(language?: string): void {
    this.showDerive.set(false);
    this.showLang.set(false);
    void this.store.derive(this.id(), this.derivedKind(), language).then((child) => {
      void this.router.navigate(['/project', child.id]);
    });
  }
  /** Esce dal flusso → galleria modelli. Previsto solo da Setup e Pubblicato. */
  back(): void {
    void this.router.navigate(['/create']);
  }
  generate(): void {
    void this.store.generate(this.id());
  }
  cancel(): void {
    void this.store.cancel(this.id());
  }
  publish(): void {
    void this.store.publish(this.id());
  }
  reopen(): void {
    void this.store.reopen(this.id());
  }
}
