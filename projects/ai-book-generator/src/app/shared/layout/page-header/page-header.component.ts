import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * PageHeader — intestazione condivisa delle pagine interne (dashboard):
 * titolo (+ eyebrow/sottotitolo opzionali) a sinistra, azione primaria a destra
 * proiettata via `<ng-content>`. Single source per la coerenza tra le pagine.
 * Vedi docs/CREATE-PAGE-DESIGN.md §0.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header" [class.page-header--center]="center()">
      <div class="page-header__text">
        @if (eyebrow()) {
          <p class="page-header__eyebrow">{{ eyebrow() }}</p>
        }
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly eyebrow = input<string>();
  /** Layout centrato (pagine marketing tipo Pricing). Usabile come bare attribute. */
  readonly center = input(false, { transform: booleanAttribute });
}
