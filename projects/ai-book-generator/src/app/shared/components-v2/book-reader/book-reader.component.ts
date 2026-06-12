import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ModalShellComponent } from '../modal-shell/modal-shell.component';
import type { Chapter } from '../../../core/domain';

/** Paragrafi per pagina nel lettore. */
const PAGE_SIZE = 3;

/** Spezza una lista in pagine da `size` (almeno una pagina, anche vuota). */
function paginate<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length ? pages : [[]];
}

/**
 * BookReaderComponent — lettore **read-only** del libro in dialog (riusabile).
 *
 * Dumb/self-contained: riceve `title` + `chapters` e gestisce internamente la
 * paginazione (capitoli × pagine) con navigazione Precedente/Successivo. Usato
 * sia nello Studio ("Apri documento") sia in Collezione (click sul progetto).
 * Niente dati propri: i capitoli arrivano dal padre; le label sono override-abili
 * (i18n a carico del chiamante).
 */
@Component({
  selector: 'app-book-reader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalShellComponent, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './book-reader.component.html',
  styleUrl: './book-reader.component.scss',
})
export class BookReaderComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly chapters = input<readonly Chapter[]>([]);
  /** True mentre i capitoli si caricano (apertura ottimistica → spinner). */
  readonly loading = input(false);
  readonly subtitle = input('Sola lettura');
  readonly closeLabel = input('Chiudi');
  readonly prevLabel = input('Precedente');
  readonly nextLabel = input('Successivo');

  readonly closed = output<void>();

  private readonly pickedKey = signal('');
  private readonly page = signal(0);

  constructor() {
    // All'apertura riparti dall'inizio (primo capitolo, prima pagina).
    effect(() => {
      if (this.open()) {
        this.pickedKey.set(untracked(() => this.chapters())[0]?.id ?? '');
        this.page.set(0);
      }
    });
  }

  private readonly selectedKey = computed(() => this.pickedKey() || this.chapters()[0]?.id || '');
  readonly selectedChapter = computed<Chapter | undefined>(() =>
    this.chapters().find((c) => c.id === this.selectedKey()),
  );
  private readonly paragraphs = computed(() =>
    (this.selectedChapter()?.body ?? '').split('\n\n').filter((p) => p.trim()),
  );
  private readonly pages = computed(() => paginate(this.paragraphs(), PAGE_SIZE));
  private readonly pageCount = computed(() => this.pages().length);
  private readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly pageParagraphs = computed(() => this.pages()[this.currentPage()] ?? []);
  private readonly chapterIndex = computed(() =>
    this.chapters().findIndex((c) => c.id === this.selectedKey()),
  );

  readonly posLabel = computed(() => {
    const ch = this.selectedChapter();
    if (!ch) return '';
    return `Capitolo ${ch.index} di ${this.chapters().length} · pagina ${this.currentPage() + 1} di ${this.pageCount()}`;
  });
  readonly canPrev = computed(() => this.currentPage() > 0 || this.chapterIndex() > 0);
  readonly canNext = computed(
    () =>
      this.currentPage() < this.pageCount() - 1 || this.chapterIndex() < this.chapters().length - 1,
  );

  next(): void {
    if (this.currentPage() < this.pageCount() - 1) {
      this.page.set(this.currentPage() + 1);
      return;
    }
    const list = this.chapters();
    const i = this.chapterIndex();
    if (i < list.length - 1) {
      this.pickedKey.set(list[i + 1].id);
      this.page.set(0);
    }
  }

  prev(): void {
    if (this.currentPage() > 0) {
      this.page.set(this.currentPage() - 1);
      return;
    }
    const list = this.chapters();
    const i = this.chapterIndex();
    if (i > 0) {
      this.pickedKey.set(list[i - 1].id);
      this.page.set(this.pages().length - 1); // ultima pagina del capitolo precedente
    }
  }
}
