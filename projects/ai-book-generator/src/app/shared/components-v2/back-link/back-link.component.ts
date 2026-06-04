import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

/**
 * BackLinkComponent — affordance "torna indietro" dumb/presentational: icona +
 * etichetta, interamente cliccabile (mouse + tastiera) con ripple Material.
 *
 * Generico e riusabile ovunque serva un ritorno: non conosce il dominio né le
 * rotte (emette solo `navigate`, il padre decide dove andare). i18n-agnostico
 * (etichetta via input). Stile dai soli token globali; `OnPush` + signals.
 *
 * @example
 * ```html
 * <app-back-link [label]="'Torna ai modelli'" (navigate)="goBack()" />
 * ```
 */
@Component({
  selector: 'app-back-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [MatRipple],
  imports: [MatIconModule],
  host: {
    class: 'back-link',
    role: 'button',
    '[attr.tabindex]': '0',
    '(click)': 'navigate.emit()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  template: `
    <mat-icon class="back-link__icon" fontSet="material-symbols-outlined" aria-hidden="true">{{ icon() }}</mat-icon>
    <span class="back-link__label">{{ label() }}</span>
  `,
  styleUrl: './back-link.component.scss',
})
export class BackLinkComponent {
  /** Etichetta del link (già tradotta). */
  readonly label = input<string>('');
  /** Icona Material Symbols (default freccia indietro). */
  readonly icon = input<string>('arrow_back');

  /** Emesso attivando il link (mouse/tastiera). */
  readonly navigate = output<void>();

  protected onKey(event: Event): void {
    event.preventDefault();
    this.navigate.emit();
  }
}
