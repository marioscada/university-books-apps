import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  contentChild,
  effect,
  inject,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';

import { BreakpointHelperService } from '../../services/breakpoint-helper.service';

/**
 * SiteShell — primitiva di layout. Proietta quattro template: header, sidebar
 * (drawer mobile), main, footer. Auth-agnostica: chi la usa decide cosa mettere
 * in ogni slot. Lo scroll è quello naturale di pagina (header sticky), quindi NON
 * usa `mat-sidenav-container` (cambierebbe il modello di scroll ovunque).
 *
 * Il **drawer mobile** è Material-first via **Angular CDK**: focus-trap +
 * auto-capture (`cdkTrapFocus`), scroll-block del body (`ScrollStrategyOptions`),
 * Esc per chiudere e ripristino del focus all'hamburger.
 */
@Component({
  selector: 'app-site-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, A11yModule],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
  host: { '(document:keydown.escape)': 'onEsc()' },
})
export class SiteShellComponent implements OnDestroy {
  private readonly breakpointHelper = inject(BreakpointHelperService);
  readonly screenType = this.breakpointHelper.screenType;

  readonly headerTemplate = contentChild<TemplateRef<unknown>>('header');
  readonly sidebarTemplate = contentChild<TemplateRef<unknown>>('sidebar');
  readonly mainTemplate = contentChild<TemplateRef<unknown>>('main');
  readonly footerTemplate = contentChild<TemplateRef<unknown>>('footer');

  readonly sidebarOpen = signal(false);

  /** Blocco scroll del body (CDK) mentre il drawer è aperto. */
  private readonly scrollBlock = inject(ScrollStrategyOptions).block();
  private lastFocused: HTMLElement | null = null;

  /** Sincronizza scroll-block + focus-restore col drawer (costruttore magro). */
  private readonly syncDrawer = effect(() => {
    if (this.sidebarOpen()) {
      this.lastFocused = document.activeElement as HTMLElement | null;
      this.scrollBlock.enable();
    } else {
      this.scrollBlock.disable();
      this.lastFocused?.focus?.();
      this.lastFocused = null;
    }
  });

  toggleSidebar = (): void => {
    this.sidebarOpen.update((open) => !open);
  };

  closeSidebar = (): void => {
    this.sidebarOpen.set(false);
  };

  protected onEsc(): void {
    if (this.sidebarOpen()) {
      this.sidebarOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.scrollBlock.disable();
  }
}
