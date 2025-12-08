import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  trigger,
  style,
  transition,
  animate,
} from '@angular/animations';

import { ResponsiveService } from '../../services/responsive.service';
import { NAVIGATION_ITEMS, NavigationItem } from '../../components/navigation/navigation.model';

/**
 * Navigation Drawer Component (Material Design Pattern)
 *
 * Side navigation drawer with hamburger toggle button.
 * Follows Material Design "Navigation Drawer" specification.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Display hamburger menu button
 * - Toggle sidebar drawer open/close
 * - Display navigation menu items
 * - Highlight active route
 * - Handle navigation clicks
 *
 * Does NOT handle:
 * - Search logic (separate TopAppBar component)
 * - Profile logic (separate TopAppBar component)
 * - Content layout (delegated to parent AppShell)
 *
 * Design Pattern: Presentational Component with Local State
 * - Manages drawer open/close state (UI state only)
 * - Emits navigation events to parent
 * - Pure navigation logic, no business logic
 *
 * @example
 * ```html
 * <app-navigation-drawer
 *   (navigationChanged)="handleNavigation($event)"
 * ></app-navigation-drawer>
 * ```
 *
 * References:
 * - Material Design: https://m3.material.io/components/navigation-drawer
 * - Angular Style Guide: https://angular.dev/style-guide
 */
@Component({
  selector: 'app-navigation-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './navigation-drawer.component.html',
  styleUrls: ['./navigation-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Backdrop fade-in animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    // Sidebar slide-in animation
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class NavigationDrawerComponent {
  private readonly responsive = inject(ResponsiveService);
  private readonly router = inject(Router);

  // Navigation items from model
  readonly navigationItems = NAVIGATION_ITEMS;

  // Responsive breakpoints
  readonly isMobile = this.responsive.isMobile;
  readonly isTablet = this.responsive.isTablet;
  readonly isDesktop = this.responsive.isDesktop;

  // Drawer state (UI state - managed locally)
  readonly isDrawerOpen = signal(false);

  // Current active route
  private readonly activeRoute$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.router.url)
  );

  readonly activeRoute = toSignal(
    this.activeRoute$,
    { initialValue: this.router.url }
  );

  /**
   * Show backdrop overlay when drawer is open
   */
  readonly showBackdrop = computed(() => this.isDrawerOpen());

  /**
   * Show drawer sidebar when open
   */
  readonly showDrawer = computed(() => this.isDrawerOpen());

  /**
   * Emitted when user navigates to a route
   */
  readonly navigationChanged = output<NavigationItem>();

  /**
   * Toggle drawer open/close
   */
  toggleDrawer(): void {
    this.isDrawerOpen.update((isOpen) => !isOpen);
  }

  /**
   * Open drawer
   */
  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  /**
   * Close drawer
   */
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  /**
   * Check if navigation item is active
   */
  isActive(item: NavigationItem): boolean {
    const currentRoute = this.activeRoute();
    return currentRoute === item.route || currentRoute?.startsWith(item.route + '/');
  }

  /**
   * Handle navigation item click
   */
  onNavigate(item: NavigationItem): void {
    this.router.navigate([item.route]);
    this.closeDrawer();
    this.navigationChanged.emit(item);
  }

  /**
   * Handle backdrop click (close drawer)
   */
  onBackdropClick(): void {
    this.closeDrawer();
  }
}
