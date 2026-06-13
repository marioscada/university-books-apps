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
import { ProseComponent } from '../../shared/components-v2/prose/prose.component';
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
  QUICK_OPS_INDEX,
  QUICK_OPS_CHAPTERS,
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
    ProseComponent,
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
   * Generazione del **primo** capitolo → skeleton a 3 pannelli in pagina (passaggio
   * da revisione indice a capitoli). Dal secondo capitolo in poi NON si copre tutta
   * la schermata: resta la vista capitoli e lo skeleton è solo nel lettore (vedi
   * `selectedGenerating`), così i capitoli già fatti restano visibili.
   */
  readonly chaptersLoading = computed(() => {
    const p = this.project();
    return !!p && p.status === 'review' && this.workspace.generating() && !this.chaptersReady();
  });

  /**
   * Pubblicazione in corso → **skeleton in pagina** della schermata "Documento
   * pubblicato" + spinner centrato (stesso pattern di indice e capitoli).
   */
  readonly publishLoading = computed(() => this.publishing());

  // --- Capitoli (revisione) ---------------------------------------------------
  private readonly pickedKey = signal('');
  readonly selectedKey = computed(() => this.pickedKey() || this.workspace.chapters()[0]?.id || '');
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
  readonly readerParagraphs = computed(() => this.readerPages()[this.readerCurrentPage()] ?? []);
  /** Posizione del capitolo (1-based) per il sottotitolo del lettore in dialog. */
  readonly readerChapterLabel = computed(() => {
    const ch = this.selectedChapter();
    if (!ch) {
      return '';
    }
    return `Capitolo ${ch.index + 1} di ${this.workspace.chapters().length}`;
  });
  /** Posizione di pagina (footer del lettore in dialog). */
  readonly readerPosLabel = computed(
    () => `Pagina ${this.readerCurrentPage() + 1} di ${this.readerPageCount()}`,
  );
  private chapterIndexOf(): number {
    return this.workspace.chapters().findIndex((c) => c.id === this.selectedKey());
  }
  readonly canReadPrev = computed(() => this.readerCurrentPage() > 0 || this.chapterIndexOf() > 0);
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

  // --- Navigazione di CAPITOLO nel lettore (salta direttamente al capitolo) -----
  readonly canPrevChapter = computed(() => this.chapterIndexOf() > 0);
  readonly canNextChapter = computed(
    () => this.chapterIndexOf() < this.workspace.chapters().length - 1,
  );
  /** Capitolo precedente (dalla pagina 1). */
  prevChapter(): void {
    const i = this.chapterIndexOf();
    if (i > 0) {
      this.pickedKey.set(this.workspace.chapters()[i - 1].id);
      this.readerPage.set(0);
    }
  }
  /** Capitolo successivo (dalla pagina 1). */
  nextChapter(): void {
    const list = this.workspace.chapters();
    const i = this.chapterIndexOf();
    if (i < list.length - 1) {
      this.pickedKey.set(list[i + 1].id);
      this.readerPage.set(0);
    }
  }

  /** True nella fase Capitoli (corpi sviluppati); false in revisione indice. */
  readonly chaptersReady = computed(() => this.workspace.chaptersReady());

  readonly chapterItems = computed<ChapterItem[]>(() =>
    toChapterItems(this.workspace.chapters(), this.chaptersReady(), this.selectedKey()),
  );
  /** In fase capitoli mostra l'avanzamento (sviluppati/totale); altrimenti il totale. */
  readonly indexCountLabel = computed(() => {
    const cs = this.workspace.chapters();
    if (this.chaptersReady()) {
      const ready = cs.filter((c) => c.status === 'ready').length;
      return `${ready}/${cs.length} sviluppati`;
    }
    return `${cs.length} capitoli`;
  });
  /** Restano capitoli da generare (pending). */
  readonly hasPendingChapters = computed(() =>
    this.workspace.chapters().some((c) => c.status === 'pending'),
  );
  /** Etichetta azione del lettore: "approva+prossimo" finché restano capitoli, poi "pubblica". */
  readonly readerActionLabel = computed(() =>
    this.hasPendingChapters()
      ? this.t('i18n.Workspace.Action.approveNext')
      : this.t('i18n.Workspace.Action.publish'),
  );

  // --- Chat -------------------------------------------------------------------
  readonly chatDraft = signal('');
  readonly chatBubbles = computed<ChatBubble[]>(() =>
    toChatBubbles(this.workspace.messages(), this.workspace.sending()),
  );
  readonly chatSubtitle = computed(() => {
    const ch = this.selectedChapter();
    return ch ? `Modifica: ${ch.index} · ${ch.title}` : 'Chiedi una modifica al documento';
  });
  /** Suggerimenti rapidi contestuali: indice in revisione indice, capitoli dopo. */
  readonly quickOps = computed(() => (this.chaptersReady() ? QUICK_OPS_CHAPTERS : QUICK_OPS_INDEX));

  // --- Azioni -----------------------------------------------------------------
  selectChapter(key: string): void {
    this.pickedKey.set(key);
  }
  sendChat(text: string): void {
    void this.workspace.send(this.id(), text);
    this.chatDraft.set('');
  }
  runQuickOp(key: string): void {
    void this.workspace.send(this.id(), quickOpText(key));
  }
  /** True mentre un capitolo viene sviluppato. */
  readonly generating = computed(() => this.workspace.generating());
  /**
   * Genera il **prossimo** capitolo `pending` (capitolo per capitolo). Salta al
   * capitolo in generazione e, in caso di errore, mostra un toast (lo store fa il
   * revert dello stato ottimistico). Guardia anti-doppio-invio.
   */
  approveAndGenerateNext(): void {
    if (this.workspace.generating()) {
      return;
    }
    const next = this.workspace.chapters().find((c) => c.status === 'pending');
    if (next) {
      this.pickedKey.set(next.id);
    }
    void this.workspace.generateNextChapter(this.id()).catch(() => {
      void this.toast.present(this.t('i18n.Workspace.chapterError'), this.t('i18n.Common.error'), {
        severity: 'error',
      });
    });
  }
  /** Azione del lettore in fase capitoli: approva+prossimo, oppure pubblica se finiti. */
  onReaderAction(): void {
    if (this.hasPendingChapters()) {
      this.approveAndGenerateNext();
    } else {
      this.goToPublish();
    }
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
  /** Copia negli appunti il link al documento pubblicato + toast di conferma. */
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      void this.toast.present(this.t('i18n.Workspace.linkCopied'), this.t('i18n.Common.done'), {
        severity: 'success',
      });
    } catch {
      void this.toast.present(this.t('i18n.Common.error'), this.t('i18n.Common.error'), {
        severity: 'error',
      });
    }
  }
  /** Dal pannello di lettura: stacca il capitolo CORRENTE nel lettore immersivo. */
  openReader(): void {
    this.readerPage.set(0);
    this.reading.set(true);
  }
  generate(): void {
    void this.store.generate(this.id());
  }
}
