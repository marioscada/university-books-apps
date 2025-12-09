import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import type { RecentActivity } from '../../models';

/**
 * Recent Activity Component
 *
 * Displays a feed of recent book activities (edits, views, creations).
 * Each activity item shows book information and timestamp.
 *
 * Pure presentation component - receives data via inputs, emits events.
 *
 * @example
 * ```html
 * <app-recent-activity
 *   [activities]="recentActivities()"
 *   (activityClick)="onActivityClick($event)"
 * ></app-recent-activity>
 * ```
 */
@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivityComponent {
  /**
   * List of recent activities to display
   */
  readonly activities = input.required<RecentActivity[]>();

  /**
   * Emits when user clicks on an activity item
   */
  readonly activityClick = output<RecentActivity>();

  /**
   * Handle activity item click
   */
  onActivityClick(activity: RecentActivity): void {
    this.activityClick.emit(activity);
  }

  /**
   * Get icon name based on activity type
   */
  getActivityIcon(type: RecentActivity['activityType']): string {
    const iconMap: Record<RecentActivity['activityType'], string> = {
      edited: 'create-outline',
      viewed: 'eye-outline',
      created: 'add-circle-outline',
      deleted: 'trash-outline',
    };
    return iconMap[type];
  }

  /**
   * Get activity type label
   */
  getActivityLabel(type: RecentActivity['activityType']): string {
    const labelMap: Record<RecentActivity['activityType'], string> = {
      edited: 'Edited',
      viewed: 'Viewed',
      created: 'Created',
      deleted: 'Deleted',
    };
    return labelMap[type];
  }
}
