import { Directive, ElementRef, Renderer2, effect, inject } from '@angular/core';

import { BreakpointHelperService, ScreenType } from '../services/breakpoint-helper.service';

/**
 * `[appScreenType]` — aggiunge sull'host `isSmall|isMedium|isLarge|isXLarge`,
 * scambiandole al variare del viewport, così gli SCSS dei componenti possono
 * reagire con `&.isSmall { ... }`. Copia 1:1 da mariosite.
 */
@Directive({
  selector: '[appScreenType]',
  standalone: true,
})
export class ScreenTypeDirective {
  // === DI ===
  private readonly breakpointHelperService = inject(BreakpointHelperService);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  // === Constructor (setup) ===
  constructor() {
    // Reattività signals-first: l'effect ricalcola le classi dell'host a ogni
    // variazione del viewport e si auto-distrugge col destroy della direttiva.
    // Nessuna subscription da gestire.
    effect(() => this.updateClass(this.breakpointHelperService.screenType()));
  }

  // === Private methods ===

  private updateClass(screenType: ScreenType): void {
    const element = this.el.nativeElement;
    this.renderer.removeClass(element, 'isSmall');
    this.renderer.removeClass(element, 'isMedium');
    this.renderer.removeClass(element, 'isLarge');
    this.renderer.removeClass(element, 'isXLarge');

    switch (screenType) {
      case 'small':
        this.renderer.addClass(element, 'isSmall');
        break;
      case 'medium':
        this.renderer.addClass(element, 'isMedium');
        break;
      case 'large':
        this.renderer.addClass(element, 'isLarge');
        break;
      case 'extra-large':
        this.renderer.addClass(element, 'isXLarge');
        break;
      default:
        this.renderer.addClass(element, 'isMedium');
        break;
    }
  }
}
