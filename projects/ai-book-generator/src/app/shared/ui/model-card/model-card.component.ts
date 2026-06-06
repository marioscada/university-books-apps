import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono cromatico (riquadro icona / badge), agnostico dal dominio: mappa su token
 * globali `--tone-<name>-{bg,fg}`. Esportato per consumo dei genitori.
 */
export type ModelTone =
  | 'info'
  | 'success'
  | 'amber'
  | 'warning'
  | 'rose'
  | 'violet'
  | 'danger'
  | 'neutral';

/** Voce del menu "⋯" (data-driven: il dominio lo decide il padre). */
export interface ModelCardAction {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
}

/**
 * ModelCardComponent — card generica e riutilizzabile (dumb/presentational,
 * nessun DI, nessuna logica di dominio). Tutti i campi sono **opzionali** così il
 * padre compone ciò che serve:
 * - **galleria modelli** (Create): icona a tono, titolo, descrizione, highlight,
 *   stima, freccia; tutta la card è selezionabile (`selectModel`).
 * - **progetti in Collection**: `eyebrow` (tipo) + `badge` di stato (a tono) +
 *   titolo + descrizione (stat) + `lineage` (derivato da…) + footer (ultima
 *   attività) + menu `⋯`; click = apri (`selectModel`).
 *
 * Self-responsive, token-only, a11y (role button + tastiera), reduced-motion.
 */
@Component({
  selector: 'app-model-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatMenuModule],
  host: {
    class: 'model-card',
    role: 'button',
    '[attr.aria-pressed]': 'selected()',
    '[attr.tabindex]': '0',
    '[class.is-selected]': 'selected()',
    '[style.--model-tone-bg]': '"var(--tone-" + iconTone() + "-bg)"',
    '[style.--model-tone-fg]': '"var(--tone-" + iconTone() + "-fg)"',
    '(click)': 'activate()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  templateUrl: './model-card.component.html',
  styleUrl: './model-card.component.scss',
})
export class ModelCardComponent {
  /** Icona Material Symbols (vuoto = nessuna icona). */
  readonly icon = input<string>('');
  /** Tono del riquadro icona. */
  readonly iconTone = input<ModelTone>('neutral');
  /** Etichetta sopra il titolo (es. tipo di lavoro). */
  readonly eyebrow = input<string>('');
  /** Badge di stato in alto a destra (vuoto = nascosto). */
  readonly badge = input<string>('');
  readonly badgeTone = input<ModelTone>('neutral');
  /** Titolo (già tradotto). */
  readonly title = input.required<string>();
  /** Descrizione breve / statistiche (già tradotte). */
  readonly description = input<string>('');
  /** Lignaggio (es. "da: AI & Machine Learning Book"). */
  readonly lineage = input<string>('');
  /** Parti salienti, una per riga con spunta (galleria modelli). */
  readonly highlights = input<readonly string[]>([]);
  /** Avanzamento 0–100 (null = nessuna barra). */
  readonly progress = input<number | null>(null);
  /** Testo del footer (stima o ultima attività). */
  readonly estimateLabel = input<string>('');
  /** Footer in tono tenue (es. "ultima attività") invece di accent. */
  readonly estimateMuted = input(false, { transform: booleanAttribute });
  /** Mostra la freccia nel footer. */
  readonly showArrow = input(true, { transform: booleanAttribute });
  /** Stato selezionato (ring accento). */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Voci del menu "⋯" (vuoto = nessun menu). */
  readonly menuActions = input<readonly ModelCardAction[]>([]);

  /** Emesso attivando la card (mouse/tastiera). */
  readonly selectModel = output<void>();
  /** Emesso scegliendo una voce del menu. */
  readonly menuAction = output<string>();

  protected activate(): void {
    this.selectModel.emit();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.selectModel.emit();
  }
}
