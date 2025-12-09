import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Layout
import { PageLayoutComponent } from '../../core/layout/page-layout/page-layout.component';

// Section Components
import { ActivityHeaderComponent } from './sections/header/activity-header.component';
import { ActivityContentComponent } from './sections/content/activity-content.component';
import { ActivityRecommendationsComponent } from './sections/recommendations/activity-recommendations.component';

// Models
import type { RecentActivity, Recommendation } from '../home/models';

/**
 * Activity Page Component (Smart Container)
 *
 * Orchestrates the activity page by:
 * - Managing data with signals
 * - Handling navigation and user actions
 * - Composing section components via PageLayout
 *
 * Architecture:
 * - Uses region-based PageLayout for structure
 * - Delegates presentation to Section Components
 * - Zero layout logic (handled by PageLayout)
 * - Clean separation of concerns
 *
 * Following Enterprise Standard:
 * - Google Angular Material Shell pattern
 * - SAP Fiori layout architecture
 * - Salesforce Lightning component model
 */
@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,
    ActivityHeaderComponent,
    ActivityContentComponent,
    ActivityRecommendationsComponent,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent {
  private readonly router = inject(Router);

  // ========================================================================
  // State Management (Signals)
  // ========================================================================

  /**
   * Recent activity feed (would come from API in real app)
   */
  readonly recentActivities = signal<RecentActivity[]>([
    {
      id: 'activity-1',
      title: 'The Art of Software Architecture',
      author: 'John Doe',
      activityType: 'edited',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      preview: 'Added new chapter on microservices patterns...',
      route: '/books/1',
      badge: 'Draft',
      badgeColor: 'warning',
    },
    {
      id: 'activity-2',
      title: 'Modern Web Development',
      activityType: 'viewed',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      route: '/books/2',
      badge: 'Published',
      badgeColor: 'success',
    },
    {
      id: 'activity-3',
      title: 'TypeScript Deep Dive',
      author: 'Jane Smith',
      activityType: 'created',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      route: '/books/3',
    },
    {
      id: 'activity-4',
      title: 'React Design Patterns',
      author: 'John Doe',
      activityType: 'edited',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      preview: 'Updated chapter on hooks and state management...',
      route: '/books/4',
      badge: 'Draft',
      badgeColor: 'warning',
    },
    {
      id: 'activity-5',
      title: 'Node.js Best Practices',
      activityType: 'viewed',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      route: '/books/5',
      badge: 'Published',
      badgeColor: 'success',
    },
  ]);

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
   * Handle activity click
   */
  onActivityClick(activity: RecentActivity): void {
    this.router.navigate([activity.route]);
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
