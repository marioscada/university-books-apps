import {
  Component,
  ChangeDetectionStrategy,
  output,
  input,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import { ResponsiveService } from '../../services/responsive.service';

/**
 * Top App Bar Component (Material Design Pattern)
 *
 * Fixed header bar displayed at the top of the application.
 * Follows Material Design "Top App Bar" specification.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Display search action button (responsive variants)
 * - Display user avatar/profile button
 * - Emit user interaction events (search, profile)
 *
 * Does NOT handle:
 * - Search overlay logic (delegated to parent)
 * - Profile sidebar logic (delegated to parent)
 * - Navigation menu logic (separate NavigationDrawer component)
 *
 * Design Pattern: Presentational Component (Dumb)
 * - Pure presentation logic
 * - No business logic
 * - Emits events to parent (Smart Container)
 *
 * @example
 * ```html
 * <app-top-app-bar
 *   [userEmail]="user().email"
 *   (searchRequested)="handleSearch($event)"
 *   (profileRequested)="handleProfile()"
 * ></app-top-app-bar>
 * ```
 *
 * References:
 * - Material Design: https://m3.material.io/components/top-app-bar
 * - Angular Style Guide: https://angular.dev/style-guide
 */
@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './top-app-bar.component.html',
  styleUrls: ['./top-app-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopAppBarComponent {
  private readonly responsive = inject(ResponsiveService);

  // Responsive breakpoints (from ResponsiveService)
  readonly isMobile = this.responsive.isMobile;
  readonly isTablet = this.responsive.isTablet;
  readonly isDesktop = this.responsive.isDesktop;

  /**
   * User email for avatar display
   */
  readonly userEmail = input<string>('User');

  /**
   * ViewChild reference to search button element
   * Used by parent to position search overlay
   */
  @ViewChild('searchButton', { read: ElementRef }) searchButton?: ElementRef;

  /**
   * Emitted when user clicks search button
   * Parent receives button ElementRef for overlay positioning
   */
  readonly searchRequested = output<ElementRef>();

  /**
   * Emitted when user clicks profile/avatar button
   */
  readonly profileRequested = output<void>();

  /**
   * Handle search button click
   * Emits searchButton ElementRef to parent
   */
  onSearchClick(): void {
    if (this.searchButton) {
      this.searchRequested.emit(this.searchButton);
    }
  }

  /**
   * Handle profile/avatar button click
   */
  onProfileClick(): void {
    this.profileRequested.emit();
  }
}
