import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/** Step del progress (label già tradotta dal padre — i18n-agnostico). */
export interface SegStep {
  label: string;
}

/**
 * SegmentedProgressComponent — progress di flusso a **barra segmentata**
 * (stile Linear/Vercel): N segmenti che si riempiono avanzando, con i nomi
 * sotto. Dumb/presentational, token-only (un'unica scala accent + track neutro,
 * niente colori a contrasto). Il segmento corrente può riempirsi parzialmente
 * (`currentPercent`) per riflettere l'avanzamento reale durante la generazione.
 * Self-responsive (le label collassano su viewport piccoli, le barre restano).
 */
@Component({
  selector: 'app-segmented-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  host: { class: 'seg', role: 'progressbar' },
  template: `
    <div class="seg__track">
      @for (s of steps(); track $index; let i = $index) {
        <span
          class="seg__seg"
          [class.is-done]="i < activeIndex()"
          [class.is-current]="i === activeIndex()">
          @if (i === activeIndex()) {
            <span class="seg__fill" [style.width.%]="fillPct()"></span>
          }
        </span>
      }
    </div>
    <div class="seg__labels">
      @for (s of steps(); track $index; let i = $index) {
        <span class="seg__label" [class.is-current]="i === activeIndex()">{{ s.label }}</span>
      }
    </div>
  `,
  styleUrl: './segmented-progress.component.scss',
})
export class SegmentedProgressComponent {
  /** Step ordinati (label già tradotte). */
  readonly steps = input.required<SegStep[]>();

  /** Indice 0-based dello step corrente. */
  readonly activeIndex = input.required<number, number>({ transform: numberAttribute });

  /** Riempimento del segmento corrente (0–100). Default 100 = pieno. */
  readonly currentPercent = input(100, { transform: numberAttribute });

  protected readonly fillPct = computed(() =>
    Math.max(0, Math.min(100, this.currentPercent())),
  );
}
