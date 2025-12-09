import { Injectable, ComponentRef, inject, Type } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

/**
 * Search Overlay Service
 *
 * Manages search dropdown overlay using Angular CDK Overlay + Portal pattern.
 * Inspired by Angular Material Autocomplete implementation.
 *
 * Features:
 * - FlexibleConnectedPositionStrategy for smart positioning
 * - Reposition scroll strategy
 * - Backdrop handling (click + ESC)
 * - Width synchronization with origin element
 *
 * @example
 * ```typescript
 * // Parent component provides all translated texts
 * const ref = this.searchOverlayService.open(
 *   elementRef.nativeElement,
 *   SearchDropdownComponent
 * );
 * ref.instance.items = searchItems;
 * ref.instance.placeholder = this.translateService.instant('search.placeholder');
 * ref.instance.emptyMessage = this.translateService.instant('search.empty');
 * ref.instance.noResultsMessage = this.translateService.instant('search.noResults');
 * ref.instance.noResultsHint = this.translateService.instant('search.noResultsHint');
 * ref.instance.jumpToHint = this.translateService.instant('search.jumpTo');
 *
 * // ⚠️ Persistent subscription: parent component manages dropdown lifecycle
 * ref.instance.itemSelected.pipe(takeUntilDestroyed()).subscribe(item => {
 *   this.router.navigate(['/books', item.id]);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class SearchOverlayService {
  /** Current active overlay reference */
  private overlayRef: OverlayRef | null = null;

  /** Current component reference */
  private componentRef: ComponentRef<unknown> | null = null;

  /** Overlay open state */
  public isOpen = false;

  private readonly overlay = inject(Overlay);

  /**
   * Open search dropdown overlay
   *
   * @param origin Element to position dropdown relative to
   * @param component Component to render in overlay
   * @returns Component reference for data binding
   */
  public open<T>(origin: HTMLElement, component: Type<T>): ComponentRef<T> {
    console.log('🎪 SearchOverlayService.open() called');
    console.log('  origin:', origin);
    console.log('  component:', component);

    // Close existing overlay if open
    if (this.overlayRef) {
      console.log('  ♻️ Closing existing overlay');
      this.close();
    }

    // Create position strategy (GitHub-style: below origin, fallback above)
    console.log('  🎯 Creating position strategy...');
    const positionStrategy = this.createPositionStrategy(origin);

    // Create overlay with configuration
    console.log('  🏗️ Creating overlay...');
    const isMobile = window.innerWidth < 768;
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width: isMobile ? '90vw' : this.getOverlayWidth(origin),
      minWidth: isMobile ? 280 : 320,
      maxWidth: isMobile ? '90vw' : 600,
      maxHeight: '70vh',
    });
    console.log('  ✅ Overlay created:', this.overlayRef);

    // Create portal and attach component
    console.log('  📌 Creating portal and attaching component...');
    const portal = new ComponentPortal(component);
    this.componentRef = this.overlayRef.attach(portal);
    console.log('  ✅ Component attached:', this.componentRef);

    // Setup event listeners
    console.log('  🎧 Setting up event listeners...');
    this.setupOverlayListeners();

    // Update state
    this.isOpen = true;
    console.log('  ✨ Overlay is now open!');

    return this.componentRef as ComponentRef<T>;
  }

  /**
   * Close dropdown overlay
   */
  public close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.componentRef = null;
      this.isOpen = false;
    }
  }

  /**
   * Setup overlay event listeners
   */
  private setupOverlayListeners(): void {
    if (!this.overlayRef) return;

    // ⚠️ Persistent subscription: overlay lifecycle managed by service, cleaned up on overlay dispose
    this.overlayRef.backdropClick().subscribe(() => this.close());

    // ⚠️ Persistent subscription: overlay lifecycle managed by service, cleaned up on overlay dispose
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Create connected position strategy
   * GitHub-style positioning: below origin with fallbacks
   */
  private createPositionStrategy(
    origin: HTMLElement
  ): FlexibleConnectedPositionStrategy {
    // Define preferred positions (inspired by Angular Material)
    const positions: ConnectedPosition[] = [
      // Primary: below, aligned start
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 8,
      },
      // Fallback 1: above, aligned start
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: -8,
      },
      // Fallback 2: below, aligned end
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: 8,
      },
      // Fallback 3: above, aligned end
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -8,
      },
    ];

    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions)
      .withPush(true)
      .withFlexibleDimensions(true)
      .withViewportMargin(16)
      .withGrowAfterOpen(true);
  }

  /**
   * Calculate overlay width based on origin element
   * Ensures dropdown matches search input width (min 320px)
   */
  private getOverlayWidth(origin: HTMLElement): number {
    const originWidth = origin.offsetWidth;
    return Math.max(originWidth, 320);
  }
}
