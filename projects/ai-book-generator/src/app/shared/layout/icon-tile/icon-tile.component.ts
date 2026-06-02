import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Tinta categoria della tile-icona ('' = accent cyan di base). */
export type TileTint = '' | 'violet' | 'amber' | 'red' | 'green';

/** Tema della copertina astratta (cover-art) — pattern globale delle card. */
export type CoverTheme = 'aurora' | 'ocean' | 'ember' | 'rose' | 'mint' | 'gold';

/** Tono della label di stato sulle card. */
export type StatusTone = 'draft' | 'gen' | 'review' | 'done' | 'muted';

/**
 * IconTile — quadrato arrotondato con icona Material e tinta per categoria.
 * Componente condiviso e accessibile (sempre accompagnato da etichetta nel
 * contesto). Stili globali in theme/_components.scss (.icon-tile + modificatori).
 */
@Component({
  selector: 'app-icon-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `<mat-icon fontSet="material-symbols-outlined">{{ icon() }}</mat-icon>`,
  host: {
    class: 'icon-tile',
    'aria-hidden': 'true',
    '[class.icon-tile--violet]': "tint() === 'violet'",
    '[class.icon-tile--amber]': "tint() === 'amber'",
    '[class.icon-tile--red]': "tint() === 'red'",
    '[class.icon-tile--green]': "tint() === 'green'",
  },
})
export class IconTileComponent {
  readonly icon = input.required<string>();
  readonly tint = input<TileTint>('');
}
