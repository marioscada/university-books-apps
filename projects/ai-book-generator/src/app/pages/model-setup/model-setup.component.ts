import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { CounterFieldComponent } from '../../shared/ui/counter-field/counter-field.component';
import { BackLinkComponent } from '../../shared/components-v2/back-link/back-link.component';
import {
  SourceDropzoneComponent,
  type SourceItem,
} from '../../shared/components-v2/source-dropzone/source-dropzone.component';
import { ActionBarComponent } from '../../shared/components-v2/action-bar/action-bar.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { TemplatesStore } from '../../core/state/templates.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import type { OutputFormat, ProjectSettings, ProjectTemplate } from '../../core/domain';

/** Genere grammaticale del nome modello (per gli articoli IT). */
const MODEL_GENDER: Record<string, 'm' | 'f'> = {
  book: 'm', summary: 'm', study_guide: 'f', manual: 'm', report: 'm',
  presentation: 'f', course: 'm', thesis: 'f', custom: 'm',
};

const TITLE_MAX = 80;
const DESC_MAX = 300;
const NOTES_MAX = 500;

/**
 * ModelSetupComponent — pagina "Crea / Personalizza" (`/create/new`) ricomposta
 * con i componenti dumb di `components-v2`. Sezioni: top bar (back + modello
 * scelto), **Definisci** (titolo + descrizione), **Istruzioni** (note a mano o
 * da file) e **Fonti** (upload via dialog `SourceDropzone`), con una `ActionBar`
 * (Indietro / Genera indice). Dinamica sul modello scelto (`?template=`); il
 * modello resta immutabile.
 */
@Component({
  selector: 'app-model-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CounterFieldComponent,
    BackLinkComponent,
    SourceDropzoneComponent,
    ActionBarComponent,
    ModalShellComponent,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './model-setup.component.html',
  styleUrl: './model-setup.component.scss',
})
export class ModelSetupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly projectsStore = inject(ProjectsStore);
  private readonly snackBar = inject(MatSnackBar);

  /** Risolutore i18n reattivo (ricomputa i view-model al cambio lingua). */
  private readonly t = injectI18nText();

  private readonly templateId =
    this.route.snapshot.queryParamMap.get('template') ?? 'custom';

  readonly template = computed<ProjectTemplate | undefined>(
    () => this.templatesStore.templateById()[this.templateId],
  );

  // --- Stato modulo -----------------------------------------------------------
  readonly title = signal('');
  readonly description = signal('');
  readonly notes = signal('');
  readonly titleMax = TITLE_MAX;
  readonly descMax = DESC_MAX;
  readonly notesMax = NOTES_MAX;

  /** Validazione titolo (obbligatorio): errore solo dopo il primo blur. */
  readonly titleTouched = signal(false);
  readonly titleError = computed(() =>
    this.titleTouched() && !this.title().trim() ? 'Il titolo è obbligatorio' : '',
  );
  /** Si può generare solo con un titolo valido. */
  readonly canGenerate = computed(() => !!this.title().trim());

  readonly language = signal('it');
  readonly formats = signal<OutputFormat[]>(['pdf', 'docx']);
  readonly sources = signal<SourceItem[]>([]);

  // --- Nome modello + grammatica ---------------------------------------------
  readonly modelName = computed(() =>
    this.t(this.template()?.nameKey ?? 'i18n.Models.custom.name'),
  );
  private readonly nameLower = computed(() => this.modelName().toLowerCase());
  private readonly gender = computed<'m' | 'f'>(() => MODEL_GENDER[this.templateId] ?? 'm');
  private readonly possessive = computed(() =>
    this.t(this.gender() === 'f' ? 'i18n.Setup.S1.possF' : 'i18n.Setup.S1.possM'),
  );
  private readonly genitive = computed(() =>
    this.t(this.gender() === 'f' ? 'i18n.Setup.S1.genF' : 'i18n.Setup.S1.genM'),
  );
  private params(): Record<string, string> {
    return { name: this.modelName(), nameLower: this.nameLower(), poss: this.possessive(), gen: this.genitive() };
  }

  // --- Testi sezione Definisci -----------------------------------------------
  readonly defTitle = computed(() => this.t('i18n.Setup.S1.title', this.params()));
  readonly descPlaceholder = computed(() => this.t('i18n.Setup.S1.descPlaceholder', this.params()));
  /** Label brevi dei campi (richiesta UX). */
  readonly titleFieldLabel = computed(() => `Scegli un nome per ${this.possessive()} ${this.nameLower()}`);
  readonly descFieldLabel = 'Descrivi brevemente cosa conterrà.';

  // --- Fonti & allegati alle note --------------------------------------------
  // In v1 NON c'è ancora il server: il padre SIMULA l'upload (uploading→ready)
  // così i componenti dumb mostrano lo stato in azione. In produzione qui andrà
  // la presigned PUT su S3 (vedi docs/ARCHITECTURE-CREATE-NEW.md §2).
  private uploadSeq = 0;

  addSources(files: File[]): void {
    this.simulateUpload(this.sources, files);
  }
  removeSource(id: string): void {
    this.sources.update((list) => list.filter((s) => s.id !== id));
  }

  // --- Sidebar: File (upload da dispositivo / contenuto testuale, catalogati) --
  /** Dialog "Carica dal dispositivo" (dropzone). */
  readonly attachOpen = signal(false);
  /** Bersaglio dell'upload: fonti (File) o istruzioni (Istruzioni). */
  readonly attachTarget = signal<'files' | 'instr'>('files');
  openAttach(target: 'files' | 'instr' = 'files'): void {
    this.attachTarget.set(target);
    this.attachOpen.set(true);
  }
  closeAttach(): void {
    this.attachOpen.set(false);
  }
  /** Lista mostrata nel dialog di upload, in base al bersaglio. */
  readonly attachItems = computed(() =>
    this.attachTarget() === 'instr' ? this.instrFiles() : this.sources(),
  );
  addAttach(files: File[]): void {
    this.simulateUpload(this.attachTarget() === 'instr' ? this.instrFiles : this.sources, files);
  }
  removeAttach(id: string): void {
    const list = this.attachTarget() === 'instr' ? this.instrFiles : this.sources;
    list.update((l) => l.filter((s) => s.id !== id));
  }

  /** Dialog "Aggiungi contenuto testuale". */
  readonly textOpen = signal(false);
  readonly textContent = signal('');
  openText(): void {
    this.textContent.set('');
    this.textOpen.set(true);
  }
  closeText(): void {
    this.textOpen.set(false);
  }
  addTextSource(): void {
    const text = this.textContent().trim();
    if (!text) {
      return;
    }
    const name = `${text.split(/\s+/).slice(0, 5).join(' ').slice(0, 40)}.txt`;
    this.sources.update((l) => [...l, { id: `${++this.uploadSeq}-${name}`, name, status: 'ready' as const }]);
    this.textOpen.set(false);
  }

  /** Capacità progetto usata (mock): cresce coi file caricati. */
  readonly capacityUsed = computed(() => Math.min(100, this.sources().length * 12));
  /** Categoria del file per icona/colore riconoscibili (PDF, Word, immagine…). */
  fileKind(name: string): 'pdf' | 'doc' | 'img' | 'sheet' | 'text' | 'file' {
    const ext = (name.split('.').pop() ?? '').toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'doc';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)) return 'img';
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'sheet';
    if (['txt', 'md', 'markdown'].includes(ext)) return 'text';
    return 'file';
  }
  /** Icona Material per la categoria del file. */
  fileIcon(name: string): string {
    return {
      pdf: 'picture_as_pdf',
      doc: 'description',
      img: 'image',
      sheet: 'table_chart',
      text: 'article',
      file: 'draft',
    }[this.fileKind(name)];
  }

  // --- Istruzioni: a mano (note) oppure da file (PC) --------------------------
  readonly instrOpen = signal(false);
  /** File di istruzioni caricati dal dispositivo (catalogati "Istruzione"). */
  readonly instrFiles = signal<SourceItem[]>([]);
  openInstr(): void {
    this.instrOpen.set(true);
  }
  closeInstr(): void {
    this.instrOpen.set(false);
  }
  /** Elimina le istruzioni scritte a mano. */
  clearInstr(): void {
    this.notes.set('');
  }
  removeInstrFile(id: string): void {
    this.instrFiles.update((l) => l.filter((s) => s.id !== id));
  }

  /**
   * Simula l'upload su staging. Il componente dump emette TUTTI i file scelti; è
   * il **padre** che confronta col già presente, **scarta i duplicati** (stesso
   * nome) e **avvisa l'utente** (snackbar). Solo i nuovi avanzano in upload.
   */
  private simulateUpload(target: WritableSignal<SourceItem[]>, files: File[]): void {
    const existing = new Set(target().map((s) => s.name));
    const fresh: File[] = [];
    const duplicates: string[] = [];
    for (const file of files) {
      if (existing.has(file.name)) {
        duplicates.push(file.name);
      } else {
        existing.add(file.name);
        fresh.push(file);
      }
    }
    if (duplicates.length) {
      const message =
        duplicates.length === 1
          ? this.t('i18n.Setup.sources.duplicate', { name: duplicates[0] })
          : this.t('i18n.Setup.sources.duplicateMany', { count: duplicates.length });
      this.snackBar.open(message, this.t('i18n.Setup.sources.duplicateOk'), { duration: 4000 });
    }
    for (const file of fresh) {
      const id = `${++this.uploadSeq}-${file.name}`;
      target.update((list) => [...list, { id, name: file.name, status: 'uploading' as const, progress: 0 }]);
      const patch = (changes: Partial<SourceItem>) =>
        target.update((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
      let pct = 0;
      const timer = setInterval(() => {
        pct = Math.min(100, pct + 20);
        patch({ progress: pct });
        if (pct >= 100) {
          clearInterval(timer);
          patch({ status: 'ready' });
        }
      }, 180);
    }
  }

  // --- Azioni -----------------------------------------------------------------
  back(): void {
    void this.router.navigate(['/create']);
  }

  /** In invio al server (disabilita la CTA, evita doppi click). */
  readonly submitting = signal(false);

  /**
   * Genera indice: impacchetta titolo + brief + **modifiche** + fonti e li manda
   * al server (in v1 lo store mock). Si **attende la conferma** (la creazione che
   * risolve) prima di navigare: è il server a confermare gli aggiornamenti.
   */
  async generate(): Promise<void> {
    const tpl = this.template();
    if (!this.canGenerate()) {
      this.titleTouched.set(true);
      return;
    }
    if (!tpl || this.submitting()) {
      return;
    }
    const settings: ProjectSettings = {
      instructions: this.notes().trim(),
      processingMode: tpl.defaults.processingMode,
      structure: { ...tpl.defaults.structure },
      outputFormats: this.formats().length ? this.formats() : ['pdf'],
      language: this.language(),
      templateId: tpl.id,
    };

    this.submitting.set(true);
    try {
      // Invio + ATTESA della conferma del server (lo store risolve a buon fine).
      const project = await this.projectsStore.createFromTemplate({
        title: this.title().trim() || this.modelName(),
        kind: tpl.kind,
        settings,
        coverTheme: tpl.coverTheme ?? 'ocean',
      });
      // Avvia SUBITO la generazione dell'indice (niente schermata "bozza"
      // intermedia): l'utente ha già confermato qui → si va dritto all'Analisi.
      await this.projectsStore.generate(project.id);
      void this.router.navigate(['/project', project.id]);
    } finally {
      this.submitting.set(false);
    }
  }
}
