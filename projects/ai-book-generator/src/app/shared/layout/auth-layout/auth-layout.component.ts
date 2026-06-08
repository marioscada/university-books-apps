import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthShellComponent } from '../auth-shell/auth-shell.component';

/**
 * AuthLayout — layout dell'area AUTENTICATA. Monta UNA volta `AuthShell` (header,
 * profilo, mobile menu, footer) e renderizza le pagine figlie nel `<router-outlet>`.
 * Lo shell **persiste** tra le navigazioni: cambia solo il contenuto dell'outlet
 * (niente re-mount dell'header/profilo). Pattern customer-portal (DashboardPage
 * = shell + outlet, pagine come route figlie).
 *
 * `showFooter` arriva dai `data` della rotta figlia attiva (default `true`); le
 * schermate di flusso task-focused (create/new, Studio) impostano `false`.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, RouterOutlet],
  template: `<app-auth-shell [showFooter]="showFooter()"><router-outlet /></app-auth-shell>`,
})
export class AuthLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** `showFooter` dal `data` della rotta figlia più profonda (default true). */
  readonly showFooter = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.childData()['showFooter'] ?? true),
    ),
    { initialValue: true },
  );

  private childData(): Record<string, unknown> {
    let r = this.route;
    while (r.firstChild) r = r.firstChild;
    return r.snapshot.data;
  }
}
