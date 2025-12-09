import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Activity Header Section Component
 *
 * Pure presentation component for the activity page header.
 * Displays page title and description.
 *
 * Responsibilities:
 * - Render header title
 * - Render header subtitle/description
 * - Maintain consistent header styling
 *
 * This is a "Section Component" - designed to be injected into
 * PageLayout's header region.
 */
@Component({
  selector: 'app-activity-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityHeaderComponent {}
