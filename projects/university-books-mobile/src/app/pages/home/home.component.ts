import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Layout & Presentation Components
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';
import { HomeHeroComponent } from './components/home-hero/home-hero.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { StatsWidgetComponent } from './components/stats-widget/stats-widget.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';

// Services
import { BooksService } from '../../books/services/books.service';

// Models
import type {
  QuickAction,
  UserStats,
  Recommendation,
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
    HomeHeroComponent,
    QuickActionsComponent,
    StatsWidgetComponent,
    RecommendationsComponent,
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
   * User name (would come from auth service in real app)
   */
  readonly userName = signal('User');

  /**
   * Quick action cards for main navigation
   * Badge for My Books is computed from BooksService
   */
  readonly quickActions = computed<QuickAction[]>(() => {
    const totalBooks = this.booksService.totalBooksCount();
    const badge = totalBooks > 0 ? String(totalBooks) : undefined;

    return [
      {
        id: 'my-books',
        title: 'My Books',
        description: 'View and manage your book projects',
        icon: 'book-outline',
        route: '/my-books',
        badge,
        badgeColor: 'primary',
      },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      description: 'Generate content with AI assistance',
      icon: 'bulb-outline',
      route: '/ai-studio',
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
        title: 'Library',
        description: 'Access reference materials and research',
        icon: 'library-outline',
        route: '/library',
      },
    ];
  });

  /**
   * User statistics (would come from API in real app)
   */
  readonly userStats = signal<UserStats>({
    totalBooks: 3,
    totalChapters: 24,
    totalPages: 156,
    lastActivity: new Date(),
    wordsThisWeek: 8420,
    writingStreak: 7,
  });

  /**
   * AI recommendations (would come from AI service in real app)
   */
  readonly recommendations = signal<Recommendation[]>([
    {
      id: 'rec-1',
      title: 'Complete Chapter 3',
      description: 'You\'re 80% done with this chapter. Finish it to maintain your streak!',
      icon: 'create-outline',
      action: 'Continue writing',
      metadata: '~20 min remaining',
      route: '/books/1/chapter/3',
      priority: 'high',
    },
    {
      id: 'rec-2',
      title: 'Review AI Suggestions',
      description: 'We generated 5 new content ideas based on your writing style.',
      icon: 'sparkles-outline',
      action: 'View suggestions',
      route: '/ai-studio',
      priority: 'medium',
    },
    {
      id: 'rec-3',
      title: 'Try a New Template',
      description: 'Check out the "Technical Manual" template for structured documentation.',
      icon: 'document-outline',
      action: 'Browse templates',
      route: '/templates',
      priority: 'low',
    },
  ]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle quick action click
   */
  onQuickActionClick(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  /**
   * Handle recommendation click
   */
  onRecommendationClick(recommendation: Recommendation): void {
    if (recommendation.route) {
      this.router.navigate([recommendation.route]);
    }
  }
}
