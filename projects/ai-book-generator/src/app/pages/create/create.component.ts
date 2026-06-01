import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';

/**
 * Create — pagina principale dell'area autenticata (default post-login).
 * Futuro wizard di generazione (Sources → Goal → Instructions → Structure).
 * Usa AuthShell (header/nav/search/profilo/footer condivisi). Vedi
 * docs/CREATE-PAGE-DESIGN.md §3.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthShellComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {}
