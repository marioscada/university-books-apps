import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationsComponent } from '../../../home/components/recommendations/recommendations.component';
import type { Recommendation } from '../../../home/models';

/**
 * Activity Recommendations Section Component
 *
 * Section component responsible for displaying AI-powered recommendations.
 * Pure presentation with clear inputs/outputs.
 *
 * Responsibilities:
 * - Render recommendations list
 * - Emit recommendation selection events
 * - Handle empty states
 *
 * This is a "Section Component" - designed to be injected into
 * PageLayout's footer region.
 */
@Component({
  selector: 'app-activity-recommendations',
  standalone: true,
  imports: [CommonModule, RecommendationsComponent],
  templateUrl: './activity-recommendations.component.html',
  styleUrls: ['./activity-recommendations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityRecommendationsComponent {
  /**
   * Recommendations to display
   */
  readonly recommendations = input.required<Recommendation[]>();

  /**
   * Recommendation click event
   */
  readonly recommendationClick = output<Recommendation>();

  /**
   * Handle recommendation selection
   */
  onRecommendationClick(recommendation: Recommendation): void {
    this.recommendationClick.emit(recommendation);
  }
}
