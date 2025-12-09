import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/**
 * Page Layout Component - Enterprise Standard
 *
 * Region-based layout system following:
 * - Google Angular Material Shell pattern
 * - SAP Fiori layout architecture
 * - Salesforce Lightning component model
 *
 * Architecture:
 * - Pure presentation component (dumb)
 * - Content projection with attribute selectors
 * - Responsive grid system
 * - Zero business logic
 * - Plug-and-play sections
 *
 * Usage:
 * ```html
 * <app-page-layout>
 *   <app-page-header section="header"></app-page-header>
 *   <app-page-content section="content">
 *     <!-- Your content here -->
 *   </app-page-content>
 *   <app-page-footer section="footer"></app-page-footer>
 * </app-page-layout>
 * ```
 *
 * Benefits:
 * ✓ Separation of concerns
 * ✓ Maximum reusability
 * ✓ Replaceable sections
 * ✓ Plugin-based UI
 * ✓ Low coupling
 * ✓ Mobile-first responsive
 */
@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {}
