import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';

/**
 * Descrittore (display-only) di un file già aggiunto, mostrato nella lista.
 *
 * Tutti i campi sono pre-formattati dal padre: il componente è agnostico al
 * dominio e non deriva nulla (niente mapping MIME → icona, niente formattazione
 * dei byte). Così resta riusabile in qualunque progetto.
 */
export interface FileListItem {
  /** Identificatore stabile, usato per il `track` e per `itemRemove`. */
  id: string;
  /** Nome file da mostrare. */
  name: string;
  /** Nome di un Material Symbol (es. `picture_as_pdf`), scelto dal padre. */
  typeIcon: string;
  /** Dimensione già formattata dal padre (es. "2.4 MB"). */
  sizeLabel: string;
  /** Etichetta di stato opzionale, mostrata come chip (es. "Pronto"). */
  statusLabel?: string;
}

/**
 * FileDropzoneComponent — area drag & drop nativa (HTML5) + input file nascosto
 * + lista dei file aggiunti. Componente **dumb/presentational**, *library-grade*
 * e completamente disaccoppiato dal dominio: nessuna DI, nessuna logica di
 * business, i18n-agnostico (ogni testo arriva già tradotto via input) e
 * **self-responsive** (`ScreenTypeDirective`).
 *
 * Riceve la lista dei file da mostrare via `items` (il padre formatta icona e
 * dimensione) ed emette i `File` scelti via `filesSelected`; il padre li
 * gestisce (upload, validazione, store) e ripassa la lista aggiornata.
 *
 * Drag & drop **nativo** (non CDK DragDrop, pensato per liste ordinabili).
 *
 * @example
 * ```html
 * <app-file-dropzone
 *   [items]="files()"
 *   [title]="'Trascina i file qui oppure clicca per sfogliare' | translate"
 *   [hint]="'Formati supportati: PDF, DOCX, PNG' | translate"
 *   [accept]="'.pdf,.docx,image/*'"
 *   [dropzoneLabel]="'Carica file' | translate"
 *   [removeLabel]="'Rimuovi file' | translate"
 *   (filesSelected)="addFiles($event)"
 *   (itemRemove)="removeFile($event)" />
 * ```
 */
@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './file-dropzone.component.html',
  styleUrl: './file-dropzone.component.scss',
})
export class FileDropzoneComponent {
  /** File già aggiunti (gestiti dal padre) da mostrare in lista. */
  readonly items = input<FileListItem[]>([]);

  /** Testo principale della dropzone (già tradotto dal padre). */
  readonly title = input.required<string>();

  /** Riga di hint sotto al titolo (es. formati supportati). */
  readonly hint = input<string>('');

  /** `aria-label` del bottone di rimozione di ciascun file. */
  readonly removeLabel = input.required<string>();

  /** `aria-label` della dropzone (esposta come `role="button"`). */
  readonly dropzoneLabel = input.required<string>();

  /** Valore dell'attributo `accept` dell'input file (es. `.pdf,image/*`). */
  readonly accept = input<string>('');

  /** Emesso al drop o al cambio input con i `File` scelti (mai vuoto). */
  readonly filesSelected = output<File[]>();

  /** Emesso alla rimozione di un file: porta l'`id` dell'item. */
  readonly itemRemove = output<string>();

  /** Stato visivo mentre un drag è sopra la dropzone. */
  readonly isDragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    this.emit(event.dataTransfer?.files);
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emit(input.files);
    // Reset: permette di riselezionare lo stesso file dopo una rimozione.
    input.value = '';
  }

  private emit(list: FileList | null | undefined): void {
    const files = Array.from(list ?? []);
    if (files.length) {
      this.filesSelected.emit(files);
    }
  }
}
