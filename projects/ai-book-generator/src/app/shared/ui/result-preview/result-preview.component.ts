import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import type { CoverTheme } from '../../../core/domain';
import type { ModelTone } from '../model-card/model-card.component';
import {
  PageThumbnailComponent,
  type PageThumbnailVariant,
} from '../page-thumbnail/page-thumbnail.component';

/** Dispositivo simulato per l'anteprima (regola la larghezza della superficie). */
export type PreviewDevice = 'desktop' | 'tablet' | 'phone';

/** Voce dell'indice con numero di pagina (leader puntinato). */
export interface TocEntry {
  label: string;
  page: number;
}

/** Statistica sintetica del footer (icona + etichetta + valore). */
export interface PreviewStat {
  icon: string;
  label: string;
  value: string;
}

/** Descrittore (display-only) di una pagina dell'anteprima. */
export interface PagePreview {
  label: string;
  variant: PageThumbnailVariant;
  tone?: ModelTone;
  excluded?: boolean;
}

/**
 * ResultPreviewComponent — anteprima dinamica del risultato generato: toolbar
 * (dispositivo / zoom / adatta / aggiorna), hero con copertina + sintesi +
 * indice (con leader e numeri di pagina), griglia di pagine in miniatura, footer
 * di statistiche. Dumb/presentational al 100%: nessun DI, nessuna logica di
 * dominio, nessun `TranslateModule`; tutti i testi via `input()` (i18n-agnostico).
 *
 * **Self-responsive** via `ScreenTypeDirective`; stile self-contained sui soli
 * token globali; rispetta `prefers-reduced-motion`.
 *
 * @example
 * ```html
 * <app-result-preview
 *   [title]="'Anteprima del risultato'"
 *   [coverTitle]="'Business Report'" coverTheme="ocean"
 *   [tocEntries]="[{ label: 'Introduzione', page: 1 }]"
 *   [pages]="[{ label: 'Copertina', variant: 'cover' }]"
 *   [stats]="[{ icon: 'notes', label: 'Parole', value: '≈ 11.800' }]"
 *   (refresh)="reload()" (deviceChange)="setDevice($event)" />
 * ```
 */
@Component({
  selector: 'app-result-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    PageThumbnailComponent,
  ],
  host: { class: 'result-preview' },
  templateUrl: './result-preview.component.html',
  styleUrl: './result-preview.component.scss',
})
export class ResultPreviewComponent {
  /** Titolo del pannello (già tradotto). */
  readonly title = input<string>('');
  /** Sottotitolo/descrizione breve (già tradotta). */
  readonly subtitle = input<string>('');
  /** Etichetta del pulsante "aggiorna anteprima". */
  readonly refreshLabel = input<string>('');
  /** Etichetta del pulsante "adatta alla pagina". */
  readonly fitLabel = input<string>('');
  /** Livello di zoom mostrato (display-only, es. "100%"). */
  readonly zoomLabel = input<string>('100%');

  /** Titolo grande sulla copertina. */
  readonly coverTitle = input<string>('');
  /** Sopratitolo (kicker) sulla copertina. */
  readonly coverKicker = input<string>('');
  /** Brand mostrato in basso sulla copertina. */
  readonly coverBrand = input<string>('');
  /** Tema cromatico della copertina (riusa `.cover-art--<theme>`). */
  readonly coverTheme = input<CoverTheme>('ocean');

  /** Heading del blocco "sintesi iniziale". */
  readonly summaryTitle = input<string>('');
  /** Testo della sintesi iniziale. */
  readonly summaryText = input<string>('');

  /** Heading del box indice. */
  readonly tocLabel = input<string>('');
  /** Voci dell'indice (label + pagina), numerate in ordine. */
  readonly tocEntries = input<readonly TocEntry[]>([]);

  /** Pagine da renderizzare come thumbnail. */
  readonly pages = input<readonly PagePreview[]>([]);
  /** Etichetta sulle pagine escluse (già tradotta). */
  readonly excludedLabel = input<string>('');

  /** Dispositivo simulato (larghezza superficie). */
  readonly device = input<PreviewDevice>('desktop');

  /** Statistiche del footer. */
  readonly stats = input<readonly PreviewStat[]>([]);

  /** Emesso al cambio dispositivo. */
  readonly deviceChange = output<PreviewDevice>();
  /** Emesso attivando "aggiorna anteprima". */
  readonly refresh = output<void>();
  /** Emesso attivando "adatta alla pagina". */
  readonly fit = output<void>();

  /** Dispositivi della toolbar (icona Material Symbols). */
  protected readonly devices: readonly { value: PreviewDevice; icon: string }[] = [
    { value: 'desktop', icon: 'computer' },
    { value: 'tablet', icon: 'tablet_mac' },
    { value: 'phone', icon: 'smartphone' },
  ];

  protected onDeviceChange(value: PreviewDevice): void {
    this.deviceChange.emit(value);
  }
}
