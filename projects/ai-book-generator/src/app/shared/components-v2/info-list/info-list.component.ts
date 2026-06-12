import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type { ChoiceTone } from '../choice-card/choice-card.component';

/** Voce di una lista informativa: badge (icona o numero) + heading + testo. */
export interface InfoListItem {
  /** Icona Material (solo per `variant="icon"`). */
  icon?: string;
  heading: string;
  text: string;
}

/**
 * InfoListComponent — lista informativa **dumb/presentational**: un titolo e una
 * serie di voci, ognuna con un badge (icona Material per `variant="icon"`, oppure
 * il numero d'ordine per `variant="numbered"`) tinto col `tone` (token globali),
 * heading e testo. i18n-agnostica (testi via input), themeable, a11y, OnPush.
 * Riusabile per box "Suggerimenti", "Cosa succede dopo?", checklist, ecc.
 */
@Component({
  selector: 'app-info-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'info-list',
    '[style.--il-bg]': 'badgeBg()',
    '[style.--il-fg]': 'badgeFg()',
  },
  imports: [MatIconModule],
  templateUrl: './info-list.component.html',
  styleUrl: './info-list.component.scss',
})
export class InfoListComponent {
  /** Titolo opzionale: se vuoto, la lista è senza intestazione. */
  readonly title = input<string>('');
  readonly items = input.required<readonly InfoListItem[]>();
  /** Badge: icona Material (`icon`) o numero d'ordine (`numbered`). */
  readonly variant = input<'icon' | 'numbered'>('icon');
  /** Tono cromatico del badge (token globali `--tone-*`). */
  readonly tone = input<ChoiceTone>('info');

  protected readonly badgeBg = computed(() => `var(--tone-${this.tone()}-bg, var(--surface-soft))`);
  protected readonly badgeFg = computed(() => `var(--tone-${this.tone()}-fg, var(--accent-700))`);
}
