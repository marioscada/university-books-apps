import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { CoverTheme, StatusTone } from '../../shared/layout/icon-tile/icon-tile.component';

/** Lavoro in corso mostrato nell'hub Create ("Continue creating"). */
interface WorkInProgress {
  id: string;
  title: string;
  status: string;
  statusTone: StatusTone;
  cover: CoverTheme;
  /** Avanzamento 0–100. */
  progress: number;
  updatedLabel: string;
}

/** Voce della timeline "Recent activity". */
interface ActivityEntry {
  id: string;
  text: string;
  timeLabel: string;
  icon: string;
}

/**
 * Create — hub post-login: lavori in corso da continuare + avvio di nuovi.
 * Hero (testo + immagine), card con copertine astratte. Dati mock finché non
 * si collega l'API. Vedi docs/CREATE-PAGE-DESIGN.md §0.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    RouterLink,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatProgressBarModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  readonly inProgress = signal<WorkInProgress[]>([
    { id: 'w1', title: 'AI & Machine Learning Book', status: 'In revisione', statusTone: 'review', cover: 'aurora', progress: 72, updatedLabel: '2 ore fa' },
    { id: 'w2', title: 'Physics Summary', status: 'Generazione', statusTone: 'gen', cover: 'ocean', progress: 45, updatedLabel: 'ieri' },
    { id: 'w3', title: 'Technical Manual', status: 'Bozza', statusTone: 'draft', cover: 'ember', progress: 18, updatedLabel: '3 giorni fa' },
  ]);

  readonly recentActivity = signal<ActivityEntry[]>([
    { id: 'a1', icon: 'auto_stories', text: 'Generato il capitolo 5 di "AI & Machine Learning Book"', timeLabel: '2 ore fa' },
    { id: 'a2', icon: 'upload_file', text: 'Caricato "Appunti_Algoritmi.pdf"', timeLabel: 'ieri' },
    { id: 'a3', icon: 'edit_note', text: 'Modificato l’outline di "Physics Summary"', timeLabel: '2 giorni fa' },
  ]);
}
