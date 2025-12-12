import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Landing Header Component
 *
 * Public header for landing page with transparent-to-sticky behavior:
 * - Initially transparent over hero section
 * - Becomes solid background (#252525) and sticky on scroll
 * - Minimal navigation: Logo | Login | Sign Up
 */
@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent {
  /** Track scroll position to trigger sticky behavior */
  readonly isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Consider scrolled if page scrolled more than 50px
    this.isScrolled.set(window.scrollY > 50);
  }
}
