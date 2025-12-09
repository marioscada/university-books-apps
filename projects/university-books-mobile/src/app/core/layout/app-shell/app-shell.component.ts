import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TopAppBarComponent } from '../top-app-bar/top-app-bar.component';
import { NavigationDrawerComponent } from '../navigation-drawer/navigation-drawer.component';
import { UserProfileSidebarComponent } from '../../shared/components/user-profile-sidebar/user-profile-sidebar.component';
import { SearchDropdownComponent } from '../../shared/components/search/search-dropdown/search-dropdown.component';

import { AuthService } from '../../../auth/services/auth.service';
import { SearchOverlayService } from '../../services/search-overlay.service';

import type { SearchItem } from '../../models/search-item.model';
import type { NavigationItem } from '../../models/navigation.model';

/**
 * App Shell Component (Layout Orchestrator Pattern)
 *
 * Smart container that composes the main application layout.
 * Follows Microsoft's "App Shell Architecture" pattern.
 *
 * Responsibilities (Smart Container - Orchestration):
 * - Compose TopAppBar + NavigationDrawer + Content
 * - Manage application-wide state (auth, search, profile)
 * - Handle search overlay logic
 * - Handle profile sidebar logic
 * - Coordinate communication between child components
 *
 * Composed Components (Dumb - Presentational):
 * - TopAppBarComponent: Header with search and avatar
 * - NavigationDrawerComponent: Sidebar menu with hamburger
 * - UserProfileSidebarComponent: Profile sidebar
 * - SearchDropdownComponent: Search overlay
 *
 * Design Pattern: Smart/Dumb Component Composition
 * - This is the SMART container (business logic, state management)
 * - Child components are DUMB (pure presentation, emit events)
 *
 * @example
 * ```html
 * <app-shell>
 *   <!-- Content projected via router-outlet -->
 * </app-shell>
 * ```
 *
 * References:
 * - Microsoft App Shell: https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers
 * - Angular Style Guide: https://angular.dev/style-guide
 * - Smart/Dumb Pattern: https://blog.angular-university.io/angular-2-smart-components-vs-presentation-components-whats-the-difference-when-to-use-each-and-why/
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TopAppBarComponent,
    NavigationDrawerComponent,
    UserProfileSidebarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly searchOverlayService = inject(SearchOverlayService);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================================================
  // Application State (Signals)
  // ==========================================================================

  /**
   * Authentication state
   */
  readonly isAuthenticated = computed(() =>
    this.authService.state().isAuthenticated
  );

  /**
   * User email from auth state
   */
  readonly userEmail = computed(() => {
    const user = this.authService.state().user;
    return user?.email || user?.username || 'User';
  });

  /**
   * Profile sidebar open state
   */
  readonly isProfileSidebarOpen = signal(false);

  /**
   * Show layout components (only when authenticated)
   */
  readonly showLayout = computed(() => this.isAuthenticated());

  // ==========================================================================
  // Mock Search Data (TODO: Replace with real API)
  // ==========================================================================

  private readonly searchItems: SearchItem[] = [
    {
      id: '1',
      category: 'books',
      title: 'Introduction to Computer Science',
      subtitle: 'Complete guide for beginners',
      metadata: 'Updated 2 days ago',
      icon: 'book-outline',
      badge: 'New',
      badgeColor: 'success',
    },
    {
      id: '2',
      category: 'books',
      title: 'Advanced JavaScript Patterns',
      subtitle: 'Design patterns and best practices',
      metadata: '15 chapters • 250 pages',
      icon: 'book-outline',
    },
    {
      id: '3',
      category: 'chapters',
      title: 'Data Structures',
      subtitle: 'Introduction to Computer Science',
      metadata: 'Chapter 5',
      icon: 'document-text-outline',
    },
    {
      id: '4',
      category: 'chapters',
      title: 'Async Patterns',
      subtitle: 'Advanced JavaScript Patterns',
      metadata: 'Chapter 12',
      icon: 'document-text-outline',
      badge: 'Draft',
      badgeColor: 'warning',
    },
    {
      id: '5',
      category: 'documents',
      title: 'Project Requirements',
      subtitle: 'Technical specifications',
      metadata: 'Last modified yesterday',
      icon: 'document-outline',
    },
    {
      id: '6',
      category: 'users',
      title: 'John Doe',
      subtitle: 'john.doe@example.com',
      metadata: 'Collaborator',
      icon: 'person-outline',
    },
  ];

  // ==========================================================================
  // Event Handlers (Orchestration Logic)
  // ==========================================================================

  /**
   * Handle search request from TopAppBar
   * Opens search overlay positioned relative to search button
   */
  onSearchRequested(searchButtonRef: ElementRef): void {
    console.log('🔍 AppShell: Search requested');

    const ref = this.searchOverlayService.open<SearchDropdownComponent>(
      searchButtonRef.nativeElement,
      SearchDropdownComponent
    );

    // Bind search dropdown inputs
    ref.instance.items = this.searchItems;
    ref.instance.placeholder = 'Search books, chapters, documents...';
    ref.instance.emptyMessage = 'Type to search across your content';
    ref.instance.noResultsMessage = 'No results found for "{query}"';
    ref.instance.noResultsHint = 'Try using different keywords or check spelling';
    ref.instance.jumpToHint = 'Jump to';

    // ⚠️ Persistent subscription: app-shell manages search lifecycle
    ref.instance.itemSelected
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => {
        this.onSearchItemSelected(item);
      });

    console.log('✅ AppShell: Search overlay initialized');
  }

  /**
   * Handle search item selection
   * TODO: Replace with real navigation logic
   */
  private onSearchItemSelected(item: SearchItem): void {
    console.log('📍 AppShell: Search item selected', item);
    this.searchOverlayService.close();
    // TODO: Navigate to item route
  }

  /**
   * Handle profile request from TopAppBar
   * Opens profile sidebar
   */
  onProfileRequested(): void {
    console.log('👤 AppShell: Profile requested');
    this.isProfileSidebarOpen.set(true);
  }

  /**
   * Handle profile sidebar close
   */
  onProfileSidebarClose(): void {
    console.log('❌ AppShell: Profile sidebar closed');
    this.isProfileSidebarOpen.set(false);
  }

  /**
   * Handle navigation change from NavigationDrawer
   * TODO: Add analytics, logging, etc.
   */
  onNavigationChanged(item: NavigationItem): void {
    console.log('🧭 AppShell: Navigation changed to', item.route);
    // TODO: Analytics event, logging, etc.
  }
}
