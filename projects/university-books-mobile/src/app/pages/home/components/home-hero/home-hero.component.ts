import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Home Hero Component
 *
 * Welcome section displayed at the top of the dashboard.
 * Shows personalized greeting and current date.
 *
 * Pure presentation component - receives all data via inputs.
 *
 * @example
 * ```html
 * <app-home-hero [userName]="userName()"></app-home-hero>
 * ```
 */
@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroComponent {
  /**
   * User's display name
   */
  readonly userName = input.required<string>();

  /**
   * Current date for display
   */
  private readonly currentDate = signal(new Date());

  /**
   * Get greeting based on time of day
   */
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  /**
   * Get formatted date string
   */
  readonly formattedDate = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}
