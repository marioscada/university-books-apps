import { Injectable, inject, computed } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/**
 * Breakpoint type definition aligned with Ionic breakpoints
 */
export type BreakpointType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Ionic Breakpoints Configuration
 *
 * Aligned with Ionic's responsive breakpoint system:
 * - xs: 0-575px (Extra Small - Mobile Portrait)
 * - sm: 576-767px (Small - Mobile Landscape)
 * - md: 768-991px (Medium - Tablet Portrait)
 * - lg: 992-1199px (Large - Tablet Landscape)
 * - xl: 1200px+ (Extra Large - Desktop)
 */
export const IONIC_BREAKPOINTS = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px)',
} as const;

/**
 * Responsive Service
 *
 * Provides reactive breakpoint detection using Angular CDK BreakpointObserver
 * and Angular Signals for optimal performance and reactivity.
 *
 * @example
 * ```typescript
 * // In your component
 * private readonly responsive = inject(ResponsiveService);
 *
 * // Use signals for synchronous access
 * readonly isMobile = this.responsive.isMobile;
 * readonly isDesktop = this.responsive.isDesktop;
 *
 * // Or use computed signals
 * readonly showSidebar = computed(() => !this.responsive.isMobile());
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Current breakpoint type as a signal
   */
  public readonly currentBreakpoint = toSignal(
    this.breakpointObserver.observe([
      IONIC_BREAKPOINTS.xs,
      IONIC_BREAKPOINTS.sm,
      IONIC_BREAKPOINTS.md,
      IONIC_BREAKPOINTS.lg,
      IONIC_BREAKPOINTS.xl,
    ]).pipe(
      map(result => {
        if (result.breakpoints[IONIC_BREAKPOINTS.xl]) return 'xl';
        if (result.breakpoints[IONIC_BREAKPOINTS.lg]) return 'lg';
        if (result.breakpoints[IONIC_BREAKPOINTS.md]) return 'md';
        if (result.breakpoints[IONIC_BREAKPOINTS.sm]) return 'sm';
        return 'xs';
      })
    ),
    { initialValue: 'xs' as BreakpointType }
  );

  /**
   * Is mobile device (xs or sm breakpoint)
   */
  public readonly isMobile = computed(() => {
    const bp = this.currentBreakpoint();
    return bp === 'xs' || bp === 'sm';
  });

  /**
   * Is tablet device (md or lg breakpoint)
   */
  public readonly isTablet = computed(() => {
    const bp = this.currentBreakpoint();
    return bp === 'md' || bp === 'lg';
  });

  /**
   * Is desktop device (xl breakpoint)
   */
  public readonly isDesktop = computed(() => {
    return this.currentBreakpoint() === 'xl';
  });

  /**
   * Is mobile or tablet (not desktop)
   */
  public readonly isMobileOrTablet = computed(() => {
    return this.isMobile() || this.isTablet();
  });

  /**
   * Is tablet or desktop (not mobile)
   */
  public readonly isTabletOrDesktop = computed(() => {
    return this.isTablet() || this.isDesktop();
  });
}
