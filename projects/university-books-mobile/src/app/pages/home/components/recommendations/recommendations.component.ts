import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import type { Recommendation } from '../../models';

/**
 * Recommendations Component
 *
 * Displays AI-powered recommendations and suggestions for the user.
 * Shows contextual actions, tips, and personalized content.
 *
 * Pure presentation component - receives data via inputs, emits events.
 *
 * @example
 * ```html
 * <app-recommendations
 *   [recommendations]="aiRecommendations()"
 *   (recommendationClick)="onRecommendationClick($event)"
 * ></app-recommendations>
 * ```
 */
@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsComponent {
  /**
   * List of AI recommendations to display
   */
  readonly recommendations = input.required<Recommendation[]>();

  /**
   * Emits when user clicks on a recommendation
   */
  readonly recommendationClick = output<Recommendation>();

  /**
   * Handle recommendation click
   */
  onRecommendationClick(recommendation: Recommendation): void {
    this.recommendationClick.emit(recommendation);
  }
}
