import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * SkeletonComponent — blocco "shimmer" riutilizzabile, mirror di
 * `ion-skeleton-text animated` di customer-portal (senza Ionic). Dimensione e
 * raggio via input. Lo shimmer è uno stile GLOBALE (`.skeleton` in styles.scss).
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    role: 'presentation',
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.borderRadius]': 'radius()',
  },
  template: '',
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly radius = input<string>('8px');
}
