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

import { ActionBarComponent } from '../../shared/components-v2/action-bar/action-bar.component';
import { ReviewShellComponent } from '../../shared/components-v2/review-shell/review-shell.component';
import {
  ChapterIndexComponent,
  type ChapterItem,
} from '../../shared/components-v2/chapter-index/chapter-index.component';
import { ChapterReaderComponent } from '../../shared/components-v2/chapter-reader/chapter-reader.component';
import { SkeletonComponent } from '../../shared/components-v2/skeleton/skeleton.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import {
  AiChatPanelComponent,
  type ChatBubble,
} from '../../shared/components-v2/ai-chat-panel/ai-chat-panel.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { WorkspaceStore } from '../../core/state/workspace.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import { ToastFacade } from '../../shared/services/toast/toast.facade';
import type { Chapter } from '../../core/domain';
import {
  HAS_OUTPUT,
  READER_PAGE_SIZE,
  QUICK_OPS,
  paginate,
  quickOpText,
  toChapterItems,
  toChatBubbles,
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
    ActionBarComponent,
    ReviewShellComponent,
    ChapterIndexComponent,
    ChapterReaderComponent,
    SkeletonComponent,
    SpinnerComponent,
    AiChatPanelComponent,
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
  private readonly toast = inject(ToastFacade);
  /** Id già notificati come falliti (un solo toast per fallimento). */
  private readonly notifiedFailed = new Set<string>();

  /** Id del progetto dalla route (`withComponentInputBinding`). */
  readonly id = input.required<string>();

  /** Risolutore i18n reattivo (ricomputa al cambio lingua/traduzioni). */
  private readonly t = injectI18nText();

  readonly loading = this.store.loading;
  /** Larghezze (variate) delle righe-capitolo dello skeleton indice. */
  protected readonly skeletonChapters = ['55%', '46%', '60%', '42%', '52%'];
  /** Larghezze (variate) delle righe-paragrafo dello skeleton lettura capitoli. */
  protected readonly skeletonParas = ['100%', '96%', '92%', '98%', '88%', '100%', '94%', '90%'];
  readonly project = computed(() => this.store.entities().find((p) => p.id === this.id()));

  constructor() {
    // Apre lo Studio quando il progetto ha un output. Guard: una sola apertura
    // per id (evita restart quando lo store ricarica le entità).
    effect(() => {
      const p = this.project();
      if (!p || this.workspace.projectId() === p.id) {
        return;
      }
      if (HAS_OUTPUT.has(p.status)) {
        void this.workspace.open(p.id);
      }
    });

    // Generazione fallita → toast d'errore (una volta per progetto). Lo stato di
    // errore + "Riprova" sono in pagina (standard: recupero nel contesto, niente
    // rimbalzo al form). Riazzero alla ripartenza per ri-notificare un nuovo KO.
    effect(() => {
      const p = this.project();
      if (!p) {
        return;
      }
      if (p.status === 'failed') {
        if (!this.notifiedFailed.has(p.id)) {
          this.notifiedFailed.add(p.id);
          void this.toast.present(
            untracked(() => this.t('i18n.Setup.generateError')),
            untracked(() => this.t('i18n.Common.error')),
            { severity: 'error' },
          );
        }
      } else {
        this.notifiedFailed.delete(p.id);
      }
    });
  }

  readonly publishing = computed(() => this.workspace.publishing());

  /**
   * Generazione INDICE in corso → **skeleton in pagina** (navigazione ottimistica
   * dallo step "Genera indice"): `queued`/`processing`, oppure `review` mentre si
   * carica la versione appena pronta.
   */
  readonly indexLoading = computed(() => {
    const p = this.project();
    if (!p) {
      return false;
    }
    return (
      p.status === 'queued' ||
      p.status === 'processing' ||
      (p.status === 'review' && this.workspace.loading())
    );
  });

  /**
   * Generazione CAPITOLI in corso → **skeleton in pagina** + spinner centrato
   * (stesso pattern dell'indice): navigazione ottimistica dallo step "Genera
   * capitoli". Niente overlay.
   */
  readonly chaptersLoading = computed(() => {
    const p = this.project();
    return !!p && p.status === 'review' && this.workspace.generating();
  });

  /**
   * Pubblicazione in corso → **skeleton in pagina** della schermata "Documento
   * pubblicato" + spinner centrato (stesso pattern di indice e capitoli).
   */
  readonly publishLoading = computed(() => this.publishing());

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
    toChapterItems(this.workspace.chapters(), this.chaptersReady(), this.selectedKey()),
  );
  readonly indexCountLabel = computed(() => `${this.workspace.chapters().length} capitoli`);

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
  /** Formati pubblicati (per i download in Conferma), dai settings di creazione. */
  readonly publishFormats = computed(() =>
    (this.project()?.generationOptions.outputFormats ?? ['pdf']).map((f) => f.toUpperCase()),
  );

  /** Apre il dialog di conferma pubblicazione. */
  goToPublish(): void {
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
