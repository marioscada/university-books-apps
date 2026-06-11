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
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Stato di un allegato (deciso dal padre): `uploading` (PUT su S3, con %),
 * `ready` (caricato), `error`.
 */
export type SourceStatus = 'uploading' | 'ready' | 'error';

/** Allegato mostrato come chip. `status`/`progress` arrivano dal padre. */
export interface SourceItem {
  id: string;
  name: string;
  status?: SourceStatus;
  /** Avanzamento 0–100 (solo se `status === 'uploading'`). */
  progress?: number;
}

/**
 * SourceDropzoneComponent — area dumb/presentational per **selezionare** file via
 * drag&drop o sfoglia, con sotto la lista degli allegati come chip che ne
 * **mostrano lo stato** (in caricamento → pronto → errore) e si possono rimuovere.
 *
 * **100% dumb**: conosce solo la selezione locale. **Emette** `filesSelected`
 * (i `File` grezzi) e `itemRemove(id)`; **riceve** `items` (con stato e progress)
 * e li **renderizza**. Non carica nulla, non decide lo stato: lo upload e lo stato
 * sono responsabilità del padre. i18n-agnostico, token-only, a11y, `OnPush`.
 *
 * @example
 * ```html
 * <app-source-dropzone
 *   [promptLabel]="'Trascina i file qui, o sfoglia'"
 *   [hintLabel]="'PDF · DOCX · immagini · max 50 MB — facoltativo'"
 *   [items]="stagedSources()"
 *   (filesSelected)="upload($event)" (itemRemove)="remove($event)" />
 * ```
 */
@Component({
  selector: 'app-source-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  host: { class: 'source-dropzone' },
  templateUrl: './source-dropzone.component.html',
  styleUrl: './source-dropzone.component.scss',
})
export class SourceDropzoneComponent {
  /** Testo principale dell'area (già tradotto). */
  readonly promptLabel = input<string>('');
  /** Riga di aiuto (formati ammessi + dimensione max, già tradotta). */
  readonly hintLabel = input<string>('');
  /** Allegati correnti (chip con stato). */
  readonly items = input<readonly SourceItem[]>([]);
  /** Permetti la rimozione delle chip. */
  readonly removable = input(true, { transform: booleanAttribute });
  /** `accept` dell'input file (hint UX; l'autorità resta lato server). */
  readonly accept = input<string>('');

  /** Emesso con i file **selezionati** localmente (drop o sfoglia). */
  readonly filesSelected = output<File[]>();
  /** Emesso con l'id dell'allegato da rimuovere. */
  readonly itemRemove = output<string>();

  /** Stato "drag sopra l'area" (feedback visivo locale). */
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
    this.select(input.files);
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
    this.select(event.dataTransfer?.files ?? null);
  }

  private select(list: FileList | null): void {
    if (list && list.length) {
      this.filesSelected.emit(Array.from(list));
    }
  }
}
