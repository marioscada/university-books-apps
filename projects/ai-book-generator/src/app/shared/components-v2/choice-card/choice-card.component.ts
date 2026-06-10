import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico della card. Mappa sui token globali `--tone-<name>-{bg,fg}`:
 * cambiando i token si ri-tematizza il componente senza toccarne il codice.
 * Cerchio icona e tag usano gli STESSI token → colori dagli stili globali.
 */
export type ChoiceTone =
  | 'info'
  | 'success'
  | 'amber'
  | 'warning'
  | 'rose'
  | 'violet'
  | 'danger'
  | 'neutral';

/**
 * ChoiceCardComponent — card **dumb/presentational** di una galleria di scelte
 * (catalogo modelli, preset…): icona (immagine 3D o Material) in un **cerchio a
 * tono**, intestazione, descrizione e **tag** (chip a tono) iterati, con freccia
 * d'azione. Tutti i colori arrivano dai token globali del tono — nessun literal.
 *
 * i18n-agnostica (ogni testo arriva già tradotto dal genitore), `OnPush` +
 * signals, **self-responsive** (`ScreenTypeDirective`), interamente cliccabile
 * (mouse + tastiera) con **ripple Material**. Pensata per `@for` dinamico.
 *
 * @example
 * ```html
 * @for (item of items(); track item.id) {
 *   <app-choice-card
 *     [imageSrc]="item.imageSrc" [icon]="item.icon" [tone]="item.tone"
 *     [heading]="item.title" [description]="item.description" [tags]="item.tags"
 *     [selected]="item.id === selectedId()" (activate)="choose(item.id)" />
 * }
 * ```
 */
@Component({
  selector: 'app-choice-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective, MatRipple],
  imports: [MatIconModule],
  host: {
    class: 'choice-card',
    role: 'button',
    '[attr.tabindex]': '0',
    '[attr.aria-pressed]': 'selected()',
    '[class.is-selected]': 'selected()',
    '[style.--choice-tone-bg]': 'toneBg()',
    '[style.--choice-tone-fg]': 'toneFg()',
    '(click)': 'emitActivate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  templateUrl: './choice-card.component.html',
  styleUrl: './choice-card.component.scss',
})
export class ChoiceCardComponent {
  /** Immagine dell'icona (3D, opzionale). Se assente si usa l'icona Material. */
  readonly imageSrc = input<string>('');
  /** Nome dell'icona Material (fallback quando manca `imageSrc`). */
  readonly icon = input<string>('');
  /** Tono cromatico (cerchio icona + tag) dai token globali. */
  readonly tone = input<ChoiceTone>('neutral');

  /** Intestazione (obbligatoria, già tradotta). */
  readonly heading = input.required<string>();
  /** Descrizione breve (già tradotta). */
  readonly description = input<string>('');
  /** Tag della card (già tradotti), iterati come chip a tono. */
  readonly tags = input<readonly string[]>([]);

  /** Stato selezionato (ring accento + `aria-pressed`). */
  readonly selected = input(false, { transform: booleanAttribute });

  /** Emesso attivando la card (mouse o tastiera). */
  readonly activate = output<void>();

  /** Background di cerchio/tag dal token del tono (con fallback neutro). */
  protected readonly toneBg = computed(() => `var(--tone-${this.tone()}-bg, var(--field-bg))`);
  /** Colore di icona/testo-tag dal token del tono (con fallback neutro). */
  protected readonly toneFg = computed(
    () => `var(--tone-${this.tone()}-fg, var(--mat-sys-on-surface-variant))`,
  );

  protected emitActivate(): void {
    this.activate.emit();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.emitActivate();
  }
}
