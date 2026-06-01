import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  inject,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { BreakpointHelperService } from '../../services/breakpoint-helper.service';

/**
 * SiteShell — primitiva di layout. Proietta quattro template: header, sidebar
 * (drawer mobile), main, footer. Auth-agnostica: chi la usa decide cosa mettere
 * in ogni slot.
 *
 * SCAFFOLD (Fase 1): il drawer è gestito con un signal + CSS, così funziona
 * SENZA Angular Material. In Fase 2 questa shell va sostituita con la versione
 * `<mat-sidenav-container>` di mariosite
 * (~/marianoscada-site/.../site-shell). Vedi docs/MIGRATION-TO-WEBSITE.md §3.
 */
@Component({
  selector: 'app-site-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
})
export class SiteShellComponent {
  private readonly breakpointHelper = inject(BreakpointHelperService);
  readonly screenType = this.breakpointHelper.screenType;

  readonly headerTemplate = contentChild<TemplateRef<unknown>>('header');
  readonly sidebarTemplate = contentChild<TemplateRef<unknown>>('sidebar');
  readonly mainTemplate = contentChild<TemplateRef<unknown>>('main');
  readonly footerTemplate = contentChild<TemplateRef<unknown>>('footer');

  readonly sidebarOpen = signal(false);

  toggleSidebar = (): void => {
    this.sidebarOpen.update((open) => !open);
  };

  closeSidebar = (): void => {
    this.sidebarOpen.set(false);
  };
}
