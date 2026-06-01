import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeroSectionData } from './hero-section.types';

/**
 * HeroSection — prima sezione full-width di ogni pagina (immagine + scrim + testo).
 *
 * SCAFFOLD (Fase 1). Template/SCSS definitivi da portare da
 * ~/marianoscada-site/projects/site-web/src/app/shared/sections/hero-section
 * in Fase 2. Vedi docs/MIGRATION-TO-WEBSITE.md.
 */
@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  readonly data = input.required<HeroSectionData>();
}
