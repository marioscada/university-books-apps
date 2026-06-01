import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root App Component
 *
 * Minimal root: ogni pagina porta la propria shell (landing pubblica →
 * site-shell minimale; pagine app → AuthShell). Qui resta solo il router-outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  public readonly title = 'AI Book Generator';
  public readonly version = '1.0.0';
}
