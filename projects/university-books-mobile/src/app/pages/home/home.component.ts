import { ChangeDetectionStrategy, Component, inject, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Layout & Presentation Components
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';

// Services
import { BooksService } from '../../books/services/books.service';

// Models
import type {
  QuickAction,
} from './models';

/**
 * Home Component (Smart Container)
 *
 * Orchestrates the home dashboard by:
 * - Managing data with signals
 * - Handling navigation and user actions
 * - Delegating presentation to child components
 *
 * Follows Component Composition Pattern with Content Projection.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HomeLayoutComponent,
    QuickActionsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly booksService = inject(BooksService);
  private readonly destroyRef = inject(DestroyRef);

  // ========================================================================
  // Lifecycle Hooks
  // ========================================================================

  ngOnInit(): void {
    // Load books count for badge display
    // Using limit=1 since we only need pagination.total, not the actual books
    // ⚠️ Subscribe necessario (non async pipe) perché: side-effect only (populate BooksService state)
    this.booksService
      .listBooks({ page: '1', limit: '1', status: 'PUBLISHED' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error('Failed to load books count:', err)
      });
  }

  // ========================================================================
  // State Management (Signals)
  // ========================================================================


  /**
   * Quick action cards for main navigation
   * Badge for My Books is computed from BooksService
   */
  readonly quickActions = computed<QuickAction[]>(() => {
    return [
      {
        id: 'ai-studio',
        title: 'AI Studio',
        description: 'Generate content with AI assistance',
        icon: 'bulb-outline',
        route: '/ai-studio',
      },
      {
        id: 'my-books',
        title: 'My Books',
        description: 'View and manage your book projects',
        icon: 'book-outline',
        route: '/my-books',
      },
      {
        id: 'templates',
        title: 'Templates',
        description: 'Start from pre-built book templates',
        icon: 'document-text-outline',
        route: '/templates',
      },
      {
        id: 'library',
        title: 'Study Materials',
        description: 'Access reference materials and research',
        icon: 'library-outline',
        route: '/library',
      },
    ];
  });

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle quick action click
   */
  onQuickActionClick(action: QuickAction): void {
    this.router.navigate([action.route]);
  }
}
