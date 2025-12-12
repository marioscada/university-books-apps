import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingHeaderComponent } from './components/landing-header/landing-header.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesShowcaseComponent } from './components/features-showcase/features-showcase.component';
import { LandingFooterComponent } from './components/landing-footer/landing-footer.component';

/**
 * Landing Page Component
 *
 * Public-facing marketing page visible without authentication.
 * Features full-viewport sections with smooth scroll inspired by Proof.io.
 *
 * Sections:
 * - Hero (100vh)
 * - Features Showcase (4x100vh on desktop, 4x50vh on mobile)
 * - Footer with CTA (100vh on desktop, 50vh on mobile)
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    LandingHeaderComponent,
    HeroSectionComponent,
    FeaturesShowcaseComponent,
    LandingFooterComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
