import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import type { ModelTone, ModelCardAction } from '../../ui/model-card/model-card.component';

/**
 * ListRowComponent — riga di lista generica (dumb): icona-tipo a tono · titolo +
 * meta · badge di stato a tono · menu "⋯". Tutta la riga è cliccabile (`open`).
 * i18n-agnostica, token-only, a11y (role button + tastiera). Riusabile per
 * qualunque elenco con icona/stato (es. progetti, fonti, allegati).
 *
 * Props reattive `emphasis` (riga progetto: più grande) / `indent` (riga
 * annidata: rientro). Riusa i tipi `ModelTone`/`ModelCardAction` (single source).
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
  readonly menuActions = input<readonly ModelCardAction[]>([]);
  /** Riga in evidenza (es. progetto): icona/titolo più grandi. */
  readonly emphasis = input(false, { transform: booleanAttribute });
  /** Riga annidata (es. fonte sotto il progetto): rientro a sinistra. */
  readonly indent = input(false, { transform: booleanAttribute });

  readonly open = output<void>();
  readonly menuAction = output<string>();

  protected onKey(event: Event): void {
    event.preventDefault();
    this.open.emit();
  }
}
