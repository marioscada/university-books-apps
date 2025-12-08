import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  trigger,
  style,
  transition,
  animate,
} from '@angular/animations';

import { ResponsiveService } from '../../services/responsive.service';
import { NAVIGATION_ITEMS, NavigationItem } from './navigation.model';
import { AuthService } from '../../../auth/services/auth.service';
import { UserProfileSidebarComponent } from '../user-profile-sidebar/user-profile-sidebar.component';
import { SearchOverlayService } from '../../services/search-overlay.service';
import { SearchDropdownComponent } from '../search/search-dropdown/search-dropdown.component';
import type { SearchItem } from '../../models/search-item.model';

/**
 * Hamburger Navigation Component (GitHub Style)
 *
 * Navigation with hamburger menu on all screen sizes.
 * The sidebar slides in from the left when the hamburger is clicked.
 *
 * Features:
 * - Hamburger menu always visible (all breakpoints)
 * - Slide-out drawer navigation
 * - Active route highlighting
 * - Badge support for notifications
 * - Smooth animations and transitions
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```html
 * <app-navigation></app-navigation>
 * ```
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, UserProfileSidebarComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
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
export class NavigationComponent {
  // Services
  private readonly responsive = inject(ResponsiveService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly searchOverlayService = inject(SearchOverlayService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('searchButton', { read: ElementRef }) searchButton?: ElementRef;

  // Navigation items from model
  public readonly navigationItems = NAVIGATION_ITEMS;

  /**
   * Mock search items for demonstration
   */
  private readonly searchItems: SearchItem[] = [
    {
      id: '1',
      category: 'books',
      title: 'Introduction to Computer Science',
      subtitle: 'Complete guide for beginners',
      metadata: 'Updated 2 days ago',
      icon: 'book-outline',
      badge: 'New',
      badgeColor: 'success'
    },
    {
      id: '2',
      category: 'books',
      title: 'Advanced JavaScript Patterns',
      subtitle: 'Design patterns and best practices',
      metadata: '15 chapters • 250 pages',
      icon: 'book-outline'
    },
    {
      id: '3',
      category: 'chapters',
      title: 'Data Structures',
      subtitle: 'Introduction to Computer Science',
      metadata: 'Chapter 5',
      icon: 'document-text-outline'
    },
    {
      id: '4',
      category: 'chapters',
      title: 'Async Patterns',
      subtitle: 'Advanced JavaScript Patterns',
      metadata: 'Chapter 12',
      icon: 'document-text-outline',
      badge: 'Draft',
      badgeColor: 'warning'
    },
    {
      id: '5',
      category: 'documents',
      title: 'Project Requirements',
      subtitle: 'Technical specifications',
      metadata: 'Last modified yesterday',
      icon: 'document-outline'
    },
    {
      id: '6',
      category: 'users',
      title: 'John Doe',
      subtitle: 'john.doe@example.com',
      metadata: 'Collaborator',
      icon: 'person-outline'
    }
  ];

  // Responsive state (signals from ResponsiveService)
  public readonly isMobile = this.responsive.isMobile;
  public readonly isTablet = this.responsive.isTablet;
  public readonly isDesktop = this.responsive.isDesktop;
  public readonly currentBreakpoint = this.responsive.currentBreakpoint;

  // Mobile menu state
  public readonly isMobileMenuOpen = signal(false);

  // Profile sidebar state
  public readonly isProfileSidebarOpen = signal(false);

  // Current active route as Observable stream
  private readonly activeRoute$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.router.url)
  );

  // Current active route as signal
  public readonly activeRoute = toSignal(
    this.activeRoute$,
    { initialValue: this.router.url }
  );

  // Authentication state
  public readonly isAuthenticated = computed(() => this.authService.state().isAuthenticated);

  /**
   * User email from auth state
   */
  public readonly userEmail = computed(() => {
    const user = this.authService.state().user;
    return user?.email || user?.username || 'User';
  });

  /**
   * Show navigation (only if authenticated)
   */
  public readonly showNavigation = computed(() => {
    return this.isAuthenticated();
  });

  /**
   * Show sidebar based on menu state
   * - Always only when hamburger menu is open (GitHub style)
   */
  public readonly showSidebar = computed(() => {
    if (!this.showNavigation()) {
      return false; // Never show if not authenticated
    }
    return this.isMobileMenuOpen(); // Only show when menu is open
  });

  /**
   * Toggle mobile menu
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  /**
   * Close mobile menu
   */
  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Check if a navigation item is active
   */
  public isActive(item: NavigationItem): boolean {
    const currentRoute = this.activeRoute();
    return currentRoute === item.route || currentRoute?.startsWith(item.route + '/');
  }

  /**
   * Navigate to route and close menu (always)
   */
  public navigateTo(item: NavigationItem): void {
    this.router.navigate([item.route]);
    this.closeMobileMenu(); // Always close menu after navigation
  }

  /**
   * Open profile sidebar
   */
  public openProfileSidebar(): void {
    this.isProfileSidebarOpen.set(true);
  }

  /**
   * Close profile sidebar
   */
  public closeProfileSidebar(): void {
    this.isProfileSidebarOpen.set(false);
  }

  /**
   * Handle avatar click
   * - Always open profile sidebar (GitHub style)
   */
  public onAvatarClick(): void {
    this.openProfileSidebar();
  }

  /**
   * Open search dropdown overlay
   */
  public openSearch(): void {
    console.log('🔍 openSearch called');
    console.log('searchButton:', this.searchButton);

    if (!this.searchButton) {
      console.error('❌ searchButton is not defined');
      return;
    }

    console.log('📦 Opening search overlay...');
    const ref = this.searchOverlayService.open<SearchDropdownComponent>(
      this.searchButton.nativeElement,
      SearchDropdownComponent
    );

    console.log('✅ Overlay opened, binding inputs...');

    // Bind all required inputs
    ref.instance.items = this.searchItems;
    ref.instance.placeholder = 'Search books, chapters, documents...';
    ref.instance.emptyMessage = 'Type to search across your content';
    ref.instance.noResultsMessage = 'No results found for "{query}"';
    ref.instance.noResultsHint = 'Try using different keywords or check spelling';
    ref.instance.jumpToHint = 'Jump to';

    console.log('🎯 Subscribing to itemSelected...');
    // ⚠️ Persistent subscription: parent component manages dropdown lifecycle
    ref.instance.itemSelected.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((item) => {
      this.onSearchItemSelected(item);
    });

    console.log('✨ Search dropdown fully initialized');
  }

  /**
   * Handle search item selection
   */
  private onSearchItemSelected(item: SearchItem): void {
    this.searchOverlayService.close();

    // Navigate based on category
    switch (item.category) {
      case 'books':
        this.router.navigate(['/books', item.id]);
        break;
      case 'chapters':
        this.router.navigate(['/books', item.data]);
        break;
      case 'documents':
        this.router.navigate(['/documents', item.id]);
        break;
      case 'users':
        this.router.navigate(['/users', item.id]);
        break;
    }
  }
}
