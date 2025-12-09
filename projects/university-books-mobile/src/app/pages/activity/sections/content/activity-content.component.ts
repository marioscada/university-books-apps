import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivityComponent } from '../../../home/components/recent-activity/recent-activity.component';
import type { RecentActivity } from '../../../home/models';

/**
 * Activity Content Section Component
 *
 * Section component responsible for displaying the recent activity feed.
 * Pure presentation with clear inputs/outputs.
 *
 * Responsibilities:
 * - Render recent activity list
 * - Emit activity selection events
 * - Handle empty states
 *
 * This is a "Section Component" - designed to be injected into
 * PageLayout's content region.
 */
@Component({
  selector: 'app-activity-content',
  standalone: true,
  imports: [CommonModule, RecentActivityComponent],
  templateUrl: './activity-content.component.html',
  styleUrls: ['./activity-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityContentComponent {
  /**
   * Recent activities to display
   */
  readonly activities = input.required<RecentActivity[]>();

  /**
   * Activity click event
   */
  readonly activityClick = output<RecentActivity>();

  /**
   * Handle activity selection
   */
  onActivityClick(activity: RecentActivity): void {
    this.activityClick.emit(activity);
  }
}
