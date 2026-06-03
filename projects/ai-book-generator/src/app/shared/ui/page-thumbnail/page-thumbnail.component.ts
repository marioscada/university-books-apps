import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  numberAttribute,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import type { ModelTone } from '../model-card/model-card.component';

/** Tipologia di pagina mockata dalla thumbnail (faux-page in pura CSS). */
export type PageThumbnailVariant = 'cover' | 'toc' | 'text' | 'chart' | 'empty';

/**
 * PageThumbnailComponent — anteprima "pagina" in miniatura, dumb/presentational
 * al 100% (nessun DI, nessuna logica di dominio, nessuna `output`): un mini
 * mockup di una pagina renderizzato in **pura CSS** (nessuna immagine).
 *
 * Mostra una pagina con aspect-ratio 3/4 e un contenuto fittizio dipendente da
 * `variant` (copertina, indice, testo, grafico, vuota), con sotto una didascalia
 * (`label`) e il numero pagina (`index`). Gli accenti usano il tono `tone` via
 * token globali `--tone-<tone>-{bg,fg}`.
 *
 * **Self-responsive** via `ScreenTypeDirective` (host `isSmall/…`). Stile
 * self-contained sui soli token globali; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-page-thumbnail
 *   [label]="'Introduzione'"
 *   [index]="3"
 *   variant="text"
 *   tone="info"
 * />
 * ```
 */
@Component({
  selector: 'app-page-thumbnail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule],
  host: {
    class: 'page-thumbnail',
    '[class.is-excluded]': 'excluded()',
    '[style.--page-tone-bg]': '"var(--tone-" + tone() + "-bg, var(--field-bg))"',
    '[style.--page-tone-fg]':
      '"var(--tone-" + tone() + "-fg, var(--mat-sys-on-surface-variant))"',
  },
  template: `
    <span class="page-thumbnail__page" [attr.data-variant]="excluded() ? 'excluded' : variant()" aria-hidden="true">
      @if (excluded()) {
        <span class="page-thumbnail__excluded">
          <mat-icon fontSet="material-symbols-outlined">person_off</mat-icon>
          @if (excludedLabel()) {
            <span class="page-thumbnail__excluded-label">{{ excludedLabel() }}</span>
          }
        </span>
      } @else {
      @switch (variant()) {
        @case ('cover') {
          <span class="page-thumbnail__cover">
            <span class="page-thumbnail__cover-bar page-thumbnail__cover-bar--wide"></span>
            <span class="page-thumbnail__cover-bar"></span>
          </span>
        }
        @case ('toc') {
          <span class="page-thumbnail__heading"></span>
          <span class="page-thumbnail__toc">
            @for (row of rows5; track $index) {
              <span class="page-thumbnail__toc-row">
                <span class="page-thumbnail__line"></span>
                <span class="page-thumbnail__toc-num"></span>
              </span>
            }
          </span>
        }
        @case ('text') {
          <span class="page-thumbnail__heading"></span>
          <span class="page-thumbnail__text">
            @for (line of rows6; track $index) {
              <span
                class="page-thumbnail__line"
                [class.page-thumbnail__line--last]="$last"
              ></span>
            }
          </span>
        }
        @case ('chart') {
          <span class="page-thumbnail__heading"></span>
          <span class="page-thumbnail__chart">
            @for (bar of barHeights; track $index) {
              <span class="page-thumbnail__chart-bar" [style.height.%]="bar"></span>
            }
          </span>
        }
        @case ('empty') {
          <span class="page-thumbnail__empty">
            <mat-icon fontSet="material-symbols-outlined">insert_page_break</mat-icon>
          </span>
        }
      }
      }
    </span>

    <span class="page-thumbnail__caption">
      <span class="page-thumbnail__label">{{ label() }}</span>
      <span class="page-thumbnail__index">{{ index() }}</span>
    </span>
  `,
  styleUrl: './page-thumbnail.component.scss',
})
export class PageThumbnailComponent {
  /** Didascalia sotto la pagina (già tradotta). */
  readonly label = input<string>('');
  /** Numero pagina mostrato nella didascalia. */
  readonly index = input(0, { transform: numberAttribute });
  /** Tipologia di contenuto fittizio della pagina. */
  readonly variant = input<PageThumbnailVariant>('text');
  /** Tono cromatico degli accenti (mappa su token globali `--tone-<tone>-*`). */
  readonly tone = input<ModelTone>('neutral');
  /** Pagina esclusa: render attenuato con icona + etichetta "Esclusa". */
  readonly excluded = input(false, { transform: booleanAttribute });
  /** Etichetta mostrata sulla pagina esclusa (già tradotta). */
  readonly excludedLabel = input<string>('');

  /** Righe statiche per i mock (lunghezze fisse → render deterministico). */
  protected readonly rows5 = [0, 1, 2, 3, 4];
  protected readonly rows6 = [0, 1, 2, 3, 4, 5];
  /** Altezze (in %) delle barre del faux bar-chart. */
  protected readonly barHeights = [55, 80, 40, 95, 65];
}
