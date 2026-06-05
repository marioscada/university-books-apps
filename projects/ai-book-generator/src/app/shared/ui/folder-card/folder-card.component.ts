import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico del folder: colora l'icona e il suo tint di sfondo.
 * Domain-agnostic, riusabile in qualsiasi griglia di "collections/folders".
 */
export type FolderTone = 'neutral' | 'accent' | 'success' | 'violet' | 'amber' | 'rose';

/**
 * FolderCardComponent — card per una cartella/raccolta: icona folder colorata
 * (per `tone`) + nome + conteggio + riga meta, **cliccabile**.
 *
 * Componente **dumb / puramente presentazionale**: nessuna DI, nessuna logica di
 * dominio — solo `input()`/`output()`. Riusabile in qualunque progetto per griglie
 * di collezioni/cartelle. **Self-responsive** via `ScreenTypeDirective` (host
 * `isSmall/…`) e compatto su small. Tutto il testo arriva già tradotto via input.
 *
 * L'host è un `role="button"` focusabile e operabile da tastiera (Enter/Space).
 *
 * @example
 * ```html
 * <app-folder-card
 *   name="Romanzi"
 *   countLabel="8 progetti"
 *   metaLabel="Aggiornata oggi"
 *   tone="violet"
 *   (open)="openFolder(folder)"
 * />
 * ```
 */
@Component({
  selector: 'app-folder-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: {
    class: 'folder-card',
    role: 'button',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.tabindex]': '0',
    '[attr.data-tone]': 'tone()',
    '(click)': 'activate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  template: `
    <span class="folder-card__icon-wrap" aria-hidden="true">
      <mat-icon class="folder-card__icon" fontSet="material-symbols-outlined">{{ icon() }}</mat-icon>
    </span>

    <span class="folder-card__body">
      <span class="folder-card__name">{{ name() }}</span>

      @if (countLabel()) {
        <span class="folder-card__count">{{ countLabel() }}</span>
      }

      @if (metaLabel()) {
        <span class="folder-card__meta">{{ metaLabel() }}</span>
      }
    </span>
  `,
  styleUrl: './folder-card.component.scss',
})
export class FolderCardComponent {
  /** Nome della cartella/raccolta (già tradotto). */
  readonly name = input.required<string>();

  /** Riga di conteggio, es. "8 progetti" (già tradotta). */
  readonly countLabel = input<string>('');

  /** Riga meta, es. "Aggiornata oggi" (già tradotta). */
  readonly metaLabel = input<string>('');

  /** Icona Material Symbols (default: `folder`). */
  readonly icon = input<string>('folder');

  /** Tono cromatico dell'icona/tint. */
  readonly tone = input<FolderTone>('neutral');

  /** Emesso al click / Enter / Space sull'host. */
  readonly open = output<void>();

  /** Etichetta accessibile combinata per lo screen reader. */
  protected readonly ariaLabel = computed(() =>
    [this.name(), this.countLabel(), this.metaLabel()].filter(Boolean).join(', '),
  );

  protected activate(): void {
    this.open.emit();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.activate();
  }
}
