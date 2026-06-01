import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Tipo di output che il template precompila. */
  kindLabel: string;
}

/**
 * Templates — strutture pre-pronte che precompilano Goal + Structure del
 * wizard Create (l'utente parte da un template invece che da zero). Usa
 * AuthShell. Dati mock. Vedi docs/CREATE-PAGE-DESIGN.md §4 (template-first).
 */
@Component({
  selector: 'app-templates',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, RouterLink, MatIconModule],
  templateUrl: './templates.component.html',
  styleUrl: '../collection/collection.component.scss',
})
export class TemplatesComponent {
  // Mock: sostituire con i template reali (config Goal+Structure) dall'API.
  readonly templates: readonly Template[] = [
    { id: 't1', name: 'Libro universitario', description: 'Capitoli, indice, bibliografia. ~120 pagine.', icon: 'menu_book', kindLabel: 'Book' },
    { id: 't2', name: 'Manuale tecnico', description: 'Procedure, sezioni numerate, glossario.', icon: 'build', kindLabel: 'Technical Manual' },
    { id: 't3', name: 'Riassunto per studio', description: 'Concetti chiave e schemi sintetici.', icon: 'summarize', kindLabel: 'Summary' },
    { id: 't4', name: 'Corso di formazione', description: 'Moduli, lezioni ed esercizi.', icon: 'cast_for_education', kindLabel: 'Training Course' },
    { id: 't5', name: 'Appunti illustrati', description: 'Note con immagini e mappe concettuali.', icon: 'school', kindLabel: 'Study Notes' },
    { id: 't6', name: 'Report di ricerca', description: 'Abstract, metodologia, risultati, fonti.', icon: 'science', kindLabel: 'Research Report' },
  ];
}
