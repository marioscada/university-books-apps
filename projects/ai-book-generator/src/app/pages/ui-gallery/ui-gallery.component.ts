import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';

import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { SelectFieldComponent } from '../../shared/ui/select-field/select-field.component';
import { SelectionCardComponent } from '../../shared/ui/selection-card/selection-card.component';
import { StepIndicatorComponent, type StepItem } from '../../shared/ui/step-indicator/step-indicator.component';
import { FileDropzoneComponent, type FileListItem } from '../../shared/ui/file-dropzone/file-dropzone.component';
import { SummaryPanelComponent, type SummaryRow } from '../../shared/ui/summary-panel/summary-panel.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { PlanCardComponent } from '../../shared/ui/plan-card/plan-card.component';
import { FolderCardComponent } from '../../shared/ui/folder-card/folder-card.component';
import { EntityCardComponent } from '../../shared/ui/entity-card/entity-card.component';

/**
 * UiGallery — pagina dimostrativa (dev) per VEDERE e PROVARE i componenti dumb
 * library-grade prima di usarli nelle pagine. Tutti i testi sono passati come
 * stringhe (i componenti sono i18n-agnostici). Route: `/ui-gallery`.
 */
@Component({
  selector: 'app-ui-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TextFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatChipsModule,
    TextFieldComponent,
    SelectFieldComponent,
    SelectionCardComponent,
    StepIndicatorComponent,
    FileDropzoneComponent,
    SummaryPanelComponent,
    StatCardComponent,
    PlanCardComponent,
    FolderCardComponent,
    EntityCardComponent,
  ],
  templateUrl: './ui-gallery.component.html',
  styleUrl: './ui-gallery.component.scss',
})
export class UiGalleryComponent {
  // --- selection-card ---
  readonly kinds = [
    { id: 'book', icon: 'menu_book', title: 'Libro', desc: 'Crea un libro strutturato a capitoli.' },
    { id: 'summary', icon: 'short_text', title: 'Riassunto', desc: 'Sintetizza contenuti complessi.' },
    { id: 'manual', icon: 'build', title: 'Manuale', desc: 'Genera manuali tecnici e pratici.' },
    { id: 'guide', icon: 'school', title: 'Guida', desc: 'Crea guide di studio.' },
  ];
  readonly selectedKind = signal('book');

  // --- step-indicator ---
  readonly steps: StepItem[] = [
    { label: 'Obiettivo' }, { label: 'Fonti' }, { label: 'Istruzioni' }, { label: 'Genera' },
  ];
  readonly stepIdx = signal(2);
  readonly stepCompleted = computed(() => this.steps.map((_, i) => i < this.stepIdx()));

  // --- file-dropzone ---
  readonly uploads = signal<FileListItem[]>([
    { id: 'f1', name: 'Appunti_IA.pdf', typeIcon: 'picture_as_pdf', sizeLabel: '12.4 MB', statusLabel: 'Pronto' },
    { id: 'f2', name: 'Slides.pptx', typeIcon: 'slideshow', sizeLabel: '8.1 MB', statusLabel: 'Pronto' },
  ]);
  private uid = 2;
  onFiles(files: File[]): void {
    for (const f of files) {
      this.uid += 1;
      this.uploads.update((u) => [...u, { id: 'u' + this.uid, name: f.name, typeIcon: 'description', sizeLabel: Math.max(1, Math.round(f.size / 1024)) + ' KB', statusLabel: 'Pronto' }]);
    }
  }
  removeUpload(id: string): void {
    this.uploads.update((u) => u.filter((x) => x.id !== id));
  }

  // --- summary-panel ---
  readonly summaryRows: SummaryRow[] = [
    { label: 'Fonti', value: '3' },
    { label: 'Capitoli stimati', value: '8–12' },
    { label: 'Modalità AI', value: 'Balanced' },
    { label: 'Output', value: 'PDF' },
    { label: 'Lingua', value: 'Italiano' },
  ];

  // --- stat-card ---
  readonly stats = [
    { label: 'Tutti i progetti', value: '24', icon: 'auto_stories', tone: 'accent' as const },
    { label: 'Bozze', value: '7', icon: 'edit_note', tone: 'warning' as const },
    { label: 'In corso', value: '5', icon: 'sync', tone: 'info' as const },
    { label: 'Completati', value: '12', icon: 'check_circle', tone: 'success' as const },
  ];
  readonly selectedStat = signal('Tutti i progetti');

  // --- plan-card ---
  readonly plans = [
    { name: 'Singolo Progetto', tagline: 'Paga solo quando ti serve.', icon: 'description', price: '€39', period: 'per progetto', features: ['1 progetto', 'Tutte le funzionalità AI', 'PDF, DOCX, EPUB'], highlighted: false, badge: '', cta: 'Genera progetto', ctaTone: 'outline' as const },
    { name: 'Monthly', tagline: 'Per chi lavora regolarmente.', icon: 'calendar_month', price: '€59', period: 'al mese', features: ['4 progetti al mese', 'Libreria completa', 'Revisioni illimitate', 'Export completo'], highlighted: true, badge: 'PIÙ POPOLARE', cta: 'Inizia ora', ctaTone: 'primary' as const },
    { name: 'Annual', tagline: 'Per professionisti.', icon: 'workspace_premium', price: '€49', period: 'al mese', features: ['48 progetti all’anno', 'Priorità di elaborazione', 'Export completo'], highlighted: false, badge: '', cta: 'Scegli Annuale', ctaTone: 'success' as const },
  ];

  // --- folder-card ---
  readonly folders = [
    { name: 'Libri Pubblicati', count: '8 progetti', meta: 'Aggiornata oggi', tone: 'accent' as const },
    { name: 'Lavoro', count: '6 progetti', meta: 'Aggiornata ieri', tone: 'success' as const },
    { name: 'Formazione', count: '4 progetti', meta: '3 giorni fa', tone: 'violet' as const },
    { name: 'Marketing', count: '3 progetti', meta: '1 settimana fa', tone: 'amber' as const },
  ];

  // --- entity-card ---
  readonly entities = [
    { title: 'L’Intelligenza Artificiale Spiegata Semplice', cover: 'aurora', status: 'Completato', statusTone: 'success' as const, type: 'Libro', meta: 'Aggiornato oggi', footer: '12 capitoli', progress: null as number | null, published: true },
    { title: 'Manuale di Machine Learning', cover: 'ocean', status: 'In corso', statusTone: 'accent' as const, type: 'Manuale', meta: 'Aggiornato oggi', footer: '8 sezioni', progress: 65 as number | null, published: false },
    { title: 'Cybersecurity per aziende', cover: 'ember', status: 'Bozza', statusTone: 'warning' as const, type: 'Guida', meta: 'Aggiornato ieri', footer: '5 capitoli', progress: null as number | null, published: false },
  ];

  // --- Form controls ---
  readonly textValue = signal('');
  readonly nameValue = signal('');
  readonly areaValue = signal('');
  readonly selectValue = signal('balanced');
  readonly toggleRefs = signal(true);
  readonly toggleLang = signal(false);
  readonly checkBiblio = signal(true);
  readonly checkGlossary = signal(false);
  readonly radioMode = signal('balanced');
  readonly chipFormats = signal<string[]>(['pdf']);
  readonly modeOptions = [
    { value: 'fast_draft', label: 'Fast Draft' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'deep_research', label: 'Deep Research' },
    { value: 'academic', label: 'Academic' },
  ];
  readonly formatOptions = ['pdf', 'docx', 'epub', 'markdown', 'html'];

  log(event: string): void {
    // eslint-disable-next-line no-console
    console.log('[ui-gallery]', event);
  }
}
