import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Layout & Presentation Components
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';
import { HomeHeroComponent } from './components/home-hero/home-hero.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { StatsWidgetComponent } from './components/stats-widget/stats-widget.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';

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
export class HomeComponent {
  private readonly router = inject(Router);

  // ========================================================================
  // State Management (Signals)
  // ========================================================================

  /**
   * User name (would come from auth service in real app)
   */
  readonly userName = signal('User');

  /**
   * Quick action cards for main navigation
   */
  readonly quickActions = signal<QuickAction[]>([
    {
      id: 'my-books',
      title: 'My Books',
      description: 'View and manage your book projects',
      icon: 'book-outline',
      route: '/books',
      badge: '3',
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
  ]);

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
