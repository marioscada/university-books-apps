import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import type { UserStats } from '../../models';

/**
 * Stats Widget Component
 *
 * Displays user statistics in a compact card format.
 * Shows metrics like total books, chapters, pages, and activity streaks.
 *
 * Pure presentation component - receives data via inputs.
 *
 * @example
 * ```html
 * <app-stats-widget
 *   [stats]="userStats()"
 * ></app-stats-widget>
 * ```
 */
@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './stats-widget.component.html',
  styleUrls: ['./stats-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsWidgetComponent {
  /**
   * User statistics to display
   */
  readonly stats = input.required<UserStats>();
}
