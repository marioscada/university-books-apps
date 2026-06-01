import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FooterColumn } from './site-footer-block.types';
import { FooterLinkComponent } from '../footer-link/footer-link.component';

/**
 * SiteFooterBlock — footer scuro con colonne di link + copyright.
 * UNICO footer per tutto il sito: con `showAuthOnly = false` (default) nasconde
 * le voci marcate `authOnly` (accessibili solo dopo login) e le colonne che
 * restano vuote → usato così in landing pubblica. Dopo il login si passa
 * `showAuthOnly = true` per mostrarle tutte.
 *
 * Vedi docs/CREATE-PAGE-DESIGN.md.
 */
@Component({
  selector: 'app-site-footer-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FooterLinkComponent],
  templateUrl: './site-footer-block.component.html',
  styleUrl: './site-footer-block.component.scss',
})
export class SiteFooterBlockComponent {
  /** Colonne di link del footer. */
  readonly columns = input<readonly FooterColumn[]>([]);
  /** Etichetta del brand nel copyright. */
  readonly brand = input<string>('AI Book Generator');
  /** Anno del copyright. */
  readonly year = input<number>(new Date().getFullYear());
  /** Mostra anche le voci `authOnly` (contesto autenticato). Default: false. */
  readonly showAuthOnly = input<boolean>(false);

  /**
   * Colonne filtrate in base a `showAuthOnly`: rimuove le voci `authOnly` se
   * non autenticato e scarta le colonne rimaste senza voci.
   */
  readonly visibleColumns = computed<FooterColumn[]>(() => {
    const showAuth = this.showAuthOnly();
    return this.columns()
      .map((col) => ({
        ...col,
        items: col.items.filter((item) => showAuth || !item.authOnly),
      }))
      .filter((col) => col.items.length > 0);
  });
}
