import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Tono della call-to-action della {@link PlanCardComponent}.
 * - `primary`  → `mat-flat-button` con accento (default);
 * - `outline`  → `mat-stroked-button` (azione secondaria);
 * - `success`  → `mat-flat-button` in verde (es. piano consigliato/attivo).
 */
export type CtaTone = 'primary' | 'outline' | 'success';

/**
 * PlanCardComponent — card di un piano tariffario (pricing), **dumb /
 * presentational** e completamente **riusabile** in qualsiasi progetto.
 *
 * Mostra (opzionalmente) un highlight "più popolare", un'icona, nome + tagline,
 * prezzo + periodo (con prezzo originale barrato e nota secondaria opzionali),
 * una checklist di feature e una CTA.
 *
 * Componente puramente presentazionale: nessuna DI, nessuna logica di dominio.
 * Tutti i testi arrivano già tradotti via input; emette solo `ctaClick`, il
 * padre decide cosa fare. **Self-responsive** via {@link ScreenTypeDirective}
 * (classi host `isSmall/…`); stile self-contained sui token globali.
 *
 * @example
 * ```html
 * <app-plan-card
 *   icon="rocket_launch"
 *   name="Pro"
 *   tagline="Per chi pubblica sul serio"
 *   price="€59"
 *   period="al mese"
 *   originalPrice="€79"
 *   secondaryNote="Fatturato annualmente €588"
 *   [features]="['Libri illimitati', 'Export EPUB e PDF', 'Supporto prioritario']"
 *   highlighted
 *   badgeLabel="PIÙ POPOLARE"
 *   ctaLabel="Inizia ora"
 *   ctaTone="primary"
 *   (ctaClick)="choosePlan('pro')"
 * />
 * ```
 */
@Component({
  selector: 'app-plan-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatButtonModule],
  host: {
    class: 'plan-card',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.is-highlighted]': 'highlighted()',
  },
  templateUrl: './plan-card.component.html',
  styleUrl: './plan-card.component.scss',
})
export class PlanCardComponent {
  /** Nome del piano (es. "Pro"). */
  readonly name = input.required<string>();
  /** Sottotitolo / claim breve sotto il nome. */
  readonly tagline = input<string>('');
  /** Icona Material Symbols decorativa (es. "rocket_launch"). */
  readonly icon = input<string>('');

  /** Prezzo principale già formattato (es. "€59"). */
  readonly price = input.required<string>();
  /** Periodo di fatturazione (es. "al mese"). */
  readonly period = input<string>('');
  /** Prezzo originale, mostrato barrato (opzionale). */
  readonly originalPrice = input<string>('');
  /** Nota secondaria sotto il prezzo (es. "Fatturato annualmente €588"). */
  readonly secondaryNote = input<string>('');

  /** Elenco feature: ognuna resa con un'icona di spunta ✓. */
  readonly features = input.required<string[]>();

  /** Evidenzia la card (ring accento + badge in alto). */
  readonly highlighted = input(false, { transform: booleanAttribute });
  /** Testo del badge (es. "PIÙ POPOLARE"); mostrato solo se valorizzato. */
  readonly badgeLabel = input<string>('');

  /** Etichetta della call-to-action. */
  readonly ctaLabel = input.required<string>();
  /** Tono della CTA: `primary` | `outline` | `success`. */
  readonly ctaTone = input<CtaTone>('primary');

  /** Emesso al click sulla CTA. Il padre decide l'azione. */
  readonly ctaClick = output<void>();

  /** Il badge è visibile solo se la card è evidenziata e l'etichetta è valorizzata. */
  protected readonly showBadge = computed(() => this.highlighted() && !!this.badgeLabel());

  /** True se la CTA deve usare `mat-stroked-button`. */
  protected readonly isOutline = computed(() => this.ctaTone() === 'outline');

  /** Etichetta accessibile per l'host group. */
  protected readonly ariaLabel = computed(() => {
    const tagline = this.tagline();
    return tagline ? `${this.name()} — ${tagline}` : this.name();
  });
}
