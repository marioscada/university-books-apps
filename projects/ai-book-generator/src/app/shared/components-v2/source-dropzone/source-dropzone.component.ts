import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Elemento (file/nota) già allegato, mostrato come chip. */
export interface SourceItem {
  id: string;
  name: string;
}

/**
 * SourceDropzoneComponent — area dumb/presentational per caricare file via
 * **drag&drop** o sfoglia, con sotto la lista dei file allegati come chip
 * rimovibili.
 *
 * Nessuna logica di rete/dominio: emette i `File` selezionati (`filesAdded`) e le
 * richieste di rimozione (`itemRemove`); il padre gestisce upload e stato.
 * Etichette via input (i18n-agnostico). `OnPush` + signals; stile dai soli token
 * globali; a11y (area attivabile da tastiera).
 *
 * @example
 * ```html
 * <app-source-dropzone
 *   [promptLabel]="'Trascina i file qui, o sfoglia'"
 *   [hintLabel]="'PDF · DOCX · immagini — facoltativo'"
 *   [items]="files()"
 *   (filesAdded)="upload($event)" (itemRemove)="remove($event)" />
 * ```
 */
@Component({
  selector: 'app-source-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'source-dropzone' },
  templateUrl: './source-dropzone.component.html',
  styleUrl: './source-dropzone.component.scss',
})
export class SourceDropzoneComponent {
  /** Testo principale dell'area (già tradotto). */
  readonly promptLabel = input<string>('');
  /** Riga di aiuto (formati ammessi, già tradotta). */
  readonly hintLabel = input<string>('');
  /** Allegati correnti (chip). */
  readonly items = input<readonly SourceItem[]>([]);
  /** Permetti la rimozione delle chip. */
  readonly removable = input(true, { transform: booleanAttribute });
  /** `accept` dell'input file (es. ".pdf,.docx"). */
  readonly accept = input<string>('');

  /** Emesso con i file aggiunti (drop o sfoglia). */
  readonly filesAdded = output<File[]>();
  /** Emesso con l'id dell'allegato da rimuovere. */
  readonly itemRemove = output<string>();

  /** Stato "drag sopra l'area" (feedback visivo). */
  protected readonly dragging = signal(false);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected browse(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.browse();
  }

  protected onSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emit(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.emit(event.dataTransfer?.files ?? null);
  }

  private emit(list: FileList | null): void {
    if (list && list.length) {
      this.filesAdded.emit(Array.from(list));
    }
  }
}
