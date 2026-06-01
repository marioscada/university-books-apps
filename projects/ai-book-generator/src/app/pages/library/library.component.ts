import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';

/** Cartella di organizzazione delle fonti ('all' = tutte). */
type Folder = 'all' | 'university' | 'research' | 'business' | 'personal';

interface FolderTab {
  value: Folder;
  label: string;
  icon: string;
}

interface SourceFile {
  id: string;
  name: string;
  type: string;
  icon: string;
  sizeLabel: string;
  addedLabel: string;
  folder: Exclude<Folder, 'all'>;
  tags: string[];
}

/**
 * Library (INPUT) — materiale sorgente caricato (NON i risultati). Le fonti
 * (PDF/DOCX/PPTX/immagini/note/URL) organizzate in cartelle, con upload, tag,
 * ricerca. Library = Input · Projects = Output. Usa AuthShell. Dati mock.
 * Vedi docs/CREATE-PAGE-DESIGN.md.
 */
@Component({
  selector: 'app-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, MatIconModule],
  templateUrl: './library.component.html',
  styleUrl: '../collection/collection.component.scss',
})
export class LibraryComponent {
  readonly folders: readonly FolderTab[] = [
    { value: 'all', label: 'Tutte', icon: 'folder_open' },
    { value: 'university', label: 'University', icon: 'school' },
    { value: 'research', label: 'Research', icon: 'science' },
    { value: 'business', label: 'Business', icon: 'business_center' },
    { value: 'personal', label: 'Personal', icon: 'person' },
  ];

  readonly activeFolder = signal<Folder>('all');

  // Mock: sostituire con le fonti reali dall'API/storage.
  private readonly files = signal<readonly SourceFile[]>([
    { id: 'f1', name: 'Appunti_Algoritmi.pdf', type: 'PDF', icon: 'picture_as_pdf', sizeLabel: '2.4 MB', addedLabel: '2 giorni fa', folder: 'university', tags: ['esame', 'cs'] },
    { id: 'f2', name: 'Slide_Corso_AI.pptx', type: 'PPTX', icon: 'slideshow', sizeLabel: '8.1 MB', addedLabel: 'ieri', folder: 'university', tags: ['ai'] },
    { id: 'f3', name: 'Dispensa_Reti.docx', type: 'DOCX', icon: 'description', sizeLabel: '1.2 MB', addedLabel: '5 giorni fa', folder: 'research', tags: ['networking'] },
    { id: 'f4', name: 'Grafico_dati.png', type: 'Image', icon: 'image', sizeLabel: '640 KB', addedLabel: '1 settimana fa', folder: 'research', tags: ['dati'] },
    { id: 'f5', name: 'articolo-ricerca.url', type: 'URL', icon: 'link', sizeLabel: '—', addedLabel: 'oggi', folder: 'business', tags: ['fonte'] },
    { id: 'f6', name: 'Idee_libro.txt', type: 'Note', icon: 'sticky_note_2', sizeLabel: '12 KB', addedLabel: '3 giorni fa', folder: 'personal', tags: ['bozza'] },
  ]);

  /** Fonti filtrate per cartella attiva. */
  readonly visibleFiles = computed(() => {
    const folder = this.activeFolder();
    const all = this.files();
    return folder === 'all' ? all : all.filter((f) => f.folder === folder);
  });

  setFolder(folder: Folder): void {
    this.activeFolder.set(folder);
  }

  onUpload(): void {
    // TODO: aprire il dialog/area di upload (PDF/DOCX/PPTX/immagini/note/URL).
  }
}
