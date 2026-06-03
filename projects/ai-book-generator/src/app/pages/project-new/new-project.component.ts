import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { ProjectsStore } from '../../core/state/projects.store';
import type { ProjectKind } from '../../core/domain';

/** Tipi di progetto selezionabili (label via i18n nei template). */
const PROJECT_KINDS: readonly ProjectKind[] = [
  'book',
  'summary',
  'manual',
  'study_guide',
  'research_report',
  'training_course',
  'documentation',
  'custom',
];

/**
 * NewProject — stub funzionale di creazione progetto (il wizard a 7 step è F4).
 *
 * Campo titolo + select `kind` + Create → `store.create(title, kind)` → naviga
 * al Workspace del nuovo draft. La business logic resta nello store: il
 * componente legge i suoi signal e chiama solo i suoi metodi.
 */
@Component({
  selector: 'app-new-project',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    PageHeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectComponent {
  private readonly store = inject(ProjectsStore);
  private readonly router = inject(Router);

  readonly kinds = PROJECT_KINDS;

  readonly title = signal('');
  readonly kind = signal<ProjectKind>('book');
  /** Vero mentre la creazione è in corso → disabilita il submit (no doppioni). */
  readonly creating = signal(false);

  /** Crea la draft e naviga al suo Workspace. */
  async onCreate(): Promise<void> {
    const title = this.title().trim();
    if (!title || this.creating()) {
      return;
    }
    this.creating.set(true);
    try {
      const project = await this.store.create(title, this.kind());
      await this.router.navigate(['/project', project.id]);
    } finally {
      this.creating.set(false);
    }
  }
}
