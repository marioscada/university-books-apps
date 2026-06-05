import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico del riquadro icona. Mappa sui token globali
 * `--tone-<name>-{bg,fg}`: cambiando i token si ri-tematizza il componente
 * senza toccarne il codice. Agnostico dal dominio.
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
 * ChoiceCardComponent — card **dumb/presentational** per presentare un'opzione
 * selezionabile in una galleria di scelte (catalogo, preset, modalità…).
 *
 * Riceve tutti i dati dal padre via `input()` e non conosce il dominio: niente
 * DI, niente servizi/stati, niente logica applicativa, nessuna stringa
 * cablata (i18n-agnostica — ogni testo arriva già tradotto dal genitore). Pensata
 * per essere **iterata dinamicamente** (`@for`) e riusata in qualunque progetto.
 *
 * Struttura: riquadro icona a tono · intestazione · descrizione · elenco di
 * voli salienti ("cosa include") con spunte · un **meter** orizzontale
 * (es. Breve → Lungo) · una nota a piè di card · freccia d'azione. Selezionabile
 * (ring accento) e interamente cliccabile (mouse + tastiera) con **ripple
 * Material**.
 *
 * 100% reattiva: solo `input()`/`computed`/`output()`, `ChangeDetectionStrategy.
 * OnPush`, nessuna sottoscrizione. **Self-responsive** via `ScreenTypeDirective`.
 * Stile dai soli token globali; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * @for (item of items(); track item.id) {
 *   <app-choice-card
 *     [icon]="item.icon"
 *     [tone]="item.tone"
 *     [heading]="item.title"
 *     [description]="item.description"
 *     [featuresLabel]="includesLabel()"
 *     [features]="item.highlights"
 *     [meterValue]="item.length"
 *     [meterMax]="3"
 *     [meterStartLabel]="shortLabel()"
 *     [meterEndLabel]="longLabel()"
 *     [note]="item.note"
 *     [selected]="item.id === selectedId()"
 *     (activate)="choose(item.id)" />
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
  /** Nome dell'icona (Material Symbols). */
  readonly icon = input<string>('');
  /** Tono cromatico del riquadro icona. */
  readonly tone = input<ChoiceTone>('neutral');

  /** Intestazione dell'opzione (obbligatoria, già tradotta). */
  readonly heading = input.required<string>();
  /** Descrizione breve (già tradotta). */
  readonly description = input<string>('');

  /** Etichetta del gruppo voci (es. "Di solito include"). */
  readonly featuresLabel = input<string>('');
  /** Voci salienti dell'opzione (già tradotte), una per riga con spunta. */
  readonly features = input<readonly string[]>([]);

  /** Tacche piene del meter (0 = nessuna). */
  readonly meterValue = input(0, { transform: numberAttribute });
  /** Tacche totali del meter (0 = meter nascosto). */
  readonly meterMax = input(0, { transform: numberAttribute });
  /** Etichetta all'inizio del meter (es. "Breve"). */
  readonly meterStartLabel = input<string>('');
  /** Etichetta alla fine del meter (es. "Lungo"). */
  readonly meterEndLabel = input<string>('');

  /** Nota a piè di card (già tradotta). */
  readonly note = input<string>('');

  /** Stato selezionato (ring accento + `aria-pressed`). */
  readonly selected = input(false, { transform: booleanAttribute });

  /** Emesso attivando la card (mouse o tastiera). */
  readonly activate = output<void>();

  /** Tacche del meter come array di booleani (true = accesa) — derivato puro. */
  protected readonly ticks = computed<readonly boolean[]>(() => {
    const max = Math.max(0, this.meterMax());
    const value = Math.max(0, Math.min(max, this.meterValue()));
    return Array.from({ length: max }, (_, i) => i < value);
  });

  /** Background del riquadro icona dal token del tono (con fallback neutro). */
  protected readonly toneBg = computed(
    () => `var(--tone-${this.tone()}-bg, var(--field-bg))`,
  );
  /** Colore icona dal token del tono (con fallback neutro). */
  protected readonly toneFg = computed(
    () => `var(--tone-${this.tone()}-fg, var(--mat-sys-on-surface-variant))`,
  );

  protected emitActivate(): void {
    this.activate.emit();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.activate.emit();
  }
}
