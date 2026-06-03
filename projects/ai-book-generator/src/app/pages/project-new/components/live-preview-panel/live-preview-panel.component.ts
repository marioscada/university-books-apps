import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { ScreenTypeDirective } from '../../../../shared/directives/screen-type.directive';
import type { CoverTheme } from '../../../../core/domain';

/** View-model dell'anteprima live (calcolato dal container dai signal). */
export interface PreviewVm {
  title: string;
  kindLabel: string;
  sourcesCount: number;
  estChapters: string;
  modeLabel: string;
  formats: string[];
  languageLabel: string;
  coverTheme: CoverTheme;
}

/**
 * LivePreviewPanel — anteprima viva del progetto in configurazione (pattern
 * Vercel): cover + riepilogo che si aggiorna in tempo reale mentre l'utente
 * configura. Dumb/presentational: riceve un `PreviewVm` (computed dal container).
 * **Self-responsive**; il container decide se è colonna sticky o barra in alto.
 */
@Component({
  selector: 'app-live-preview-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, TranslateModule],
  templateUrl: './live-preview-panel.component.html',
  styleUrl: './live-preview-panel.component.scss',
})
export class LivePreviewPanelComponent {
  readonly vm = input.required<PreviewVm>();
}
