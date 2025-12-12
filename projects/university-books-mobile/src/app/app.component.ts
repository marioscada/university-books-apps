import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

/**
 * Root App Component
 *
 * Minimal root component that delegates layout to AppShellComponent.
 * Follows Single Responsibility Principle - only bootstraps the app.
 *
 * Layout orchestration is handled by AppShellComponent (Smart Container).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public readonly title = 'University Books';
  public readonly version = '1.0.0';
}
