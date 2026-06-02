import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterColumnItem } from '../site-footer-block/site-footer-block.types';

/**
 * FooterLink — singola voce del footer: routerLink se interna, href se esterna.
 * SCAFFOLD (Fase 1).
 */
@Component({
  selector: 'app-footer-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  templateUrl: './footer-link.component.html',
  styleUrl: './footer-link.component.scss',
})
export class FooterLinkComponent {
  readonly item = input.required<FooterColumnItem>();
}
