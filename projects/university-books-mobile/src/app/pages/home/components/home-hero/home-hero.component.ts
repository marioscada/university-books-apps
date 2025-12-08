import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

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
  imports: [CommonModule, IonIcon],
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroComponent {
  /**
   * User's display name
   */
  @Input({ required: true }) userName!: string;

  /**
   * Current date for display
   */
  readonly currentDate = new Date();

  constructor() {
    addIcons({ personCircleOutline });
  }

  /**
   * Get greeting based on time of day
   */
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  /**
   * Get formatted date string
   */
  get formattedDate(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
