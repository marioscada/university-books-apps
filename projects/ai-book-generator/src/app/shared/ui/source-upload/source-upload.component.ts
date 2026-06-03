import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { ScreenTypeDirective } from '../../directives/screen-type.directive';
import type { SourceType } from '../../../core/domain';

/** Riga della lista upload (display-only). */
export interface UploadItem {
  id: string;
  name: string;
  type: SourceType;
  sizeBytes: number;
}

/**
 * SourceUpload — area drag & drop nativa (HTML5) + input file + lista dei file
 * aggiunti (dumb/riusabile). Emette i `File` scelti; il padre (smart) crea le
 * Source via store e ripassa la lista da mostrare. **Self-responsive**.
 *
 * NB: drag&drop **nativo** (non CDK DragDrop, che è per liste ordinabili). Col
 * backend AWS l'emissione `filesAdded` diventerà un upload presigned su S3.
 */
@Component({
  selector: 'app-source-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ScreenTypeDirective],
  imports: [MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './source-upload.component.html',
  styleUrl: './source-upload.component.scss',
})
export class SourceUploadComponent {
  /** File già aggiunti (gestiti dal padre) da mostrare in lista. */
  readonly items = input<UploadItem[]>([]);

  readonly filesAdded = output<File[]>();
  readonly removed = output<string>();

  /** Stato visivo durante il drag sopra la dropzone. */
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
    input.value = '';
  }

  private emit(list: FileList | null | undefined): void {
    const files = Array.from(list ?? []);
    if (files.length) {
      this.filesAdded.emit(files);
    }
  }

  iconFor(type: SourceType): string {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'docx':
        return 'description';
      case 'pptx':
        return 'slideshow';
      case 'image':
        return 'image';
      case 'audio':
        return 'audiotrack';
      case 'csv':
        return 'table';
      case 'url':
        return 'link';
      default:
        return 'sticky_note_2';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
