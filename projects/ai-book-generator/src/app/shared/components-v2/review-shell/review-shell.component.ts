import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * ReviewShellComponent — layout UNICO di revisione/risultato (dumb, solo content
 * projection). Tre colonne: **indice** (opzionale) · **corpo** centrale ·
 * **AI** (opzionale). Il padre decide cosa mostrare (`showIndex`, `showAi`) e
 * proietta i contenuti reali (chapter-index, chapter-reader, ai-chat-panel). I
 * bottoni vivono nell'`action-bar`, anch'essa decisa dal padre.
 *
 * Riusabile per i capitoli del libro: si attiva/disattiva ciò che serve.
 *
 * @example
 * ```html
 * <app-review-shell showIndex>
 *   <app-chapter-index index … />
 *   <app-chapter-reader … />        <!-- corpo (slot di default) -->
 *   <app-ai-chat-panel ai … />
 * </app-review-shell>
 * ```
 */
@Component({
  selector: 'app-review-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'review-shell',
    '[class.has-index]': 'showIndex()',
    '[class.has-ai]': 'showAi()',
  },
  template: `
    @if (showIndex()) {
      <aside class="review-shell__index"><ng-content select="[index]" /></aside>
    }
    <section class="review-shell__body"><ng-content /></section>
    @if (showAi()) {
      <aside class="review-shell__ai"><ng-content select="[ai]" /></aside>
    }
  `,
  styleUrl: './review-shell.component.scss',
})
export class ReviewShellComponent {
  /** Mostra la colonna indice (sinistra). */
  readonly showIndex = input(false, { transform: booleanAttribute });
  /** Mostra la colonna assistente AI (destra). */
  readonly showAi = input(true, { transform: booleanAttribute });
}
