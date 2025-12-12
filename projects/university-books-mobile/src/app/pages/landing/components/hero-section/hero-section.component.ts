import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Hero Section Component
 *
 * Full-viewport hero section for landing page.
 * Features:
 * - 100vh height on all devices
 * - Centered content with bold headline and subtitle
 * - Primary CTA button → /auth/register
 * - Minimal gradient background for visual hierarchy
 *
 * UX Principles:
 * - Clear value proposition above the fold
 * - Single prominent call-to-action
 * - Sufficient contrast for accessibility (WCAG AA)
 */
@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {}
