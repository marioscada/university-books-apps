import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsiveService } from '../../../../core/services/responsive.service';

/**
 * Home Layout Component
 *
 * Structural component that defines the responsive grid layout for the dashboard.
 * Uses content projection (ng-content) to allow parent component to inject sections.
 *
 * Layout Strategy:
 * - Desktop (≥1024px): 2-column grid (2/3 main + 1/3 sidebar)
 * - Tablet/Mobile (<1024px): Single column stack
 *
 * Content Projection Slots:
 * - [homeSection="header"] - Hero/welcome section (full width)
 * - [homeSection="primary"] - Main content area (left column on desktop)
 * - [homeSection="secondary"] - Sidebar widgets (right column on desktop only)
 *
 * @example
 * ```html
 * <app-home-layout>
 *   <div homeSection="header">
 *     <app-home-hero></app-home-hero>
 *   </div>
 *
 *   <div homeSection="primary">
 *     <app-quick-actions></app-quick-actions>
 *     <app-recent-activity></app-recent-activity>
 *   </div>
 *
 *   <div homeSection="secondary">
 *     <app-stats-widget></app-stats-widget>
 *     <app-recommendations></app-recommendations>
 *   </div>
 * </app-home-layout>
 * ```
 */
@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayoutComponent {
  /**
   * Responsive service for breakpoint detection
   */
  private readonly responsive = inject(ResponsiveService);

  /**
   * Desktop breakpoint signal (≥1024px)
   */
  readonly isDesktop = this.responsive.isDesktop;
}
