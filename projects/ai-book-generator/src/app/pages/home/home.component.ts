import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';

/** Card sintetica di un progetto recente nella dashboard. */
interface DashboardProject {
  id: string;
  title: string;
  kindLabel: string;
  icon: string;
  route: string;
}

/** Card sintetica di una fonte recente nella dashboard. */
interface DashboardSource {
  id: string;
  name: string;
  typeLabel: string;
  icon: string;
}

/**
 * Dashboard privata (route `/home`) — prima pagina dopo il login.
 * "Welcome back" + Recent Projects + Recent Sources + Create New.
 * Pattern Notion AI / Claude Projects / Gamma. Usa AuthShell. Dati mock.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, RouterLink, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly userName = signal<string>('Mario');

  readonly recentProjects = signal<DashboardProject[]>([
    { id: 'p1', title: 'AI & Machine Learning Book', kindLabel: 'Book', icon: 'menu_book', route: '/collection' },
    { id: 'p2', title: 'Physics Summary', kindLabel: 'Summary', icon: 'summarize', route: '/collection' },
    { id: 'p3', title: 'Technical Manual', kindLabel: 'Manual', icon: 'build', route: '/collection' },
  ]);

  readonly recentSources = signal<DashboardSource[]>([
    { id: 's1', name: 'Appunti_Algoritmi.pdf', typeLabel: 'PDF', icon: 'picture_as_pdf' },
    { id: 's2', name: 'Grafico_dati.png', typeLabel: 'Image', icon: 'image' },
    { id: 's3', name: 'Idee_libro.txt', typeLabel: 'Note', icon: 'sticky_note_2' },
  ]);
}
