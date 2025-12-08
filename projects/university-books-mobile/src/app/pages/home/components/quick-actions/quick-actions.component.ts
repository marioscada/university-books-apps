import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import type { QuickAction } from '../../models';

/**
 * Quick Actions Component
 *
 * Displays a responsive grid of action cards for quick navigation.
 * Each card represents a major feature or section of the application.
 *
 * Pure presentation component - receives data via inputs, emits events.
 *
 * @example
 * ```html
 * <app-quick-actions
 *   [actions]="quickActions()"
 *   (actionClick)="onActionClick($event)"
 * ></app-quick-actions>
 * ```
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionsComponent {
  /**
   * List of quick actions to display
   */
  readonly actions = input.required<QuickAction[]>();

  /**
   * Emits when user clicks on an action card
   */
  readonly actionClick = output<QuickAction>();

  /**
   * Handle action card click
   */
  onActionClick(action: QuickAction): void {
    this.actionClick.emit(action);
  }
}
