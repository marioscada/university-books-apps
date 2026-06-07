import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';

/**
 * ModalShellComponent — guscio dumb/presentational per un dialog modale: backdrop
 * + pannello centrato con header (titolo + sottotitolo + chiusura), corpo
 * proiettato e footer proiettato (`[footer]`).
 *
 * Generico e riusabile: non conosce il contenuto (content projection) né il
 * dominio. Aperto/chiuso in modo controllato (`open` input → `closed` output):
 * backdrop, Esc e "×" emettono `closed`; il padre decide.
 *
 * **Material-first via Angular CDK** (le primitive su cui poggia `MatDialog`):
 * - focus-trap + auto-capture (`A11yModule` / `cdkTrapFocus`),
 * - scroll-block del body (`ScrollStrategyOptions.block()`),
 * - ripristino del focus all'elemento che aveva aperto il dialog.
 * `OnPush` + signals; a11y (`role="dialog"`, `aria-modal`); stile dai token.
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, A11yModule],
  host: {
    class: 'modal-shell',
    '[class.is-open]': 'open()',
    '(document:keydown.escape)': 'onEsc()',
  },
  template: `
    @if (open()) {
      <button class="modal-shell__backdrop" type="button" [attr.aria-label]="closeLabel()" (click)="closed.emit()"></button>
      <div
        class="modal-shell__panel"
        [class.modal-shell__panel--lg]="size() === 'lg'"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
      >
        <header class="modal-shell__head">
          <div class="modal-shell__heading">
            <h2 class="modal-shell__title">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="modal-shell__subtitle">{{ subtitle() }}</p>
            }
          </div>
          <button class="modal-shell__close" type="button" [attr.aria-label]="closeLabel()" (click)="closed.emit()">
            <mat-icon fontSet="material-symbols-outlined">close</mat-icon>
          </button>
        </header>

        <div class="modal-shell__body">
          <ng-content />
        </div>

        <footer class="modal-shell__footer">
          <ng-content select="[footer]" />
        </footer>
      </div>
    }
  `,
  styleUrl: './modal-shell.component.scss',
})
export class ModalShellComponent implements OnDestroy {
  /** Visibilità del dialog (controllata dal padre). */
  readonly open = input(false, { transform: booleanAttribute });
  /** Titolo del dialog (già tradotto). */
  readonly title = input<string>('');
  /** Sottotitolo opzionale (già tradotto). */
  readonly subtitle = input<string>('');
  /** Etichetta accessibile del bottone di chiusura. */
  readonly closeLabel = input<string>('');
  /** Larghezza del pannello: `md` (default, form) o `lg` (lettura/contenuti ampi). */
  readonly size = input<'md' | 'lg'>('md');

  /** Emesso quando si richiede la chiusura (backdrop / Esc / "×"). */
  readonly closed = output<void>();

  /** Blocco scroll del body (CDK Overlay) mentre il dialog è aperto. */
  private readonly scrollBlock = inject(ScrollStrategyOptions).block();
  /** Elemento da rifocalizzare alla chiusura. */
  private lastFocused: HTMLElement | null = null;

  /** Sincronizza scroll-block + focus-restore col signal `open` (no costruttore). */
  private readonly syncOverlay = effect(() => {
    if (this.open()) {
      this.lastFocused = document.activeElement as HTMLElement | null;
      this.scrollBlock.enable();
    } else {
      this.scrollBlock.disable();
      this.lastFocused?.focus?.();
      this.lastFocused = null;
    }
  });

  ngOnDestroy(): void {
    // Evita di lasciare lo scroll bloccato se il dialog viene distrutto da aperto.
    this.scrollBlock.disable();
  }

  protected onEsc(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
