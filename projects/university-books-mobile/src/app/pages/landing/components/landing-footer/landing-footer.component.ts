import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Landing Footer Component
 *
 * Footer section for landing page with:
 * - Primary CTA (Get Started)
 * - Secondary navigation links
 * - Copyright information
 * - Full viewport height (100vh desktop, 50vh mobile)
 *
 * Design Pattern: Presentational component
 *
 * UX Principles:
 * - Clear final call-to-action
 * - Essential navigation in footer
 * - Professional, minimal design
 * - Accessible link structure
 */
@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {
  /** Current year for copyright */
  readonly currentYear = new Date().getFullYear();
}
