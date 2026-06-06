import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import type { ModelTone, ModelCardAction } from '../../ui/model-card/model-card.component';

/**
 * ListRowComponent — riga di lista generica (dumb): icona-tipo (tono o copertina
 * piena) · titolo + meta · badge di stato · azioni. Le **azioni** sono rese
 * responsive: su **desktop** come icone inline, su **mobile** come menu "⋯"
 * (stesso set). Tutta la riga è cliccabile (`open`). i18n-agnostica, token-only,
 * a11y (role button + tastiera). Riusabile (progetti, fonti, allegati…).
 *
 * Props: `emphasis` (riga progetto: più grande) · `indent` (annidata) · `cover`
 * (tile a colore pieno + icona bianca). Riusa `ModelTone`/`ModelCardAction`.
 */
@Component({
  selector: 'app-list-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'list-row',
    role: 'button',
    '[attr.tabindex]': '0',
    '[class.is-emphasis]': 'emphasis()',
    '[class.is-indent]': 'indent()',
    '(click)': 'open.emit()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  imports: [MatIconModule, MatMenuModule],
  templateUrl: './list-row.component.html',
  styleUrl: './list-row.component.scss',
})
export class ListRowComponent {
  readonly icon = input<string>('');
  readonly iconTone = input<ModelTone>('neutral');
  readonly title = input.required<string>();
  readonly meta = input<string>('');
  readonly badge = input<string>('');
  readonly badgeTone = input<ModelTone>('neutral');
  /** Azioni: icone inline su desktop, menu "⋯" su mobile (stesso set). */
  readonly actions = input<readonly ModelCardAction[]>([]);
  /** Copertina a colore pieno (CSS color/var) + icona bianca, invece del tono. */
  readonly cover = input<string>('');
  /** Riga in evidenza (es. progetto): icona/titolo più grandi. */
  readonly emphasis = input(false, { transform: booleanAttribute });
  /** Riga annidata (es. fonte sotto il progetto): rientro a sinistra. */
  readonly indent = input(false, { transform: booleanAttribute });

  readonly open = output<void>();
  readonly action = output<string>();

  protected onKey(event: Event): void {
    event.preventDefault();
    this.open.emit();
  }
}
