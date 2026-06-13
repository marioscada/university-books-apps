import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  type WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { CounterFieldComponent } from '../../shared/ui/counter-field/counter-field.component';
import { BackLinkComponent } from '../../shared/components-v2/back-link/back-link.component';
import {
  SourceDropzoneComponent,
  type SourceItem,
} from '../../shared/components-v2/source-dropzone/source-dropzone.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import { TemplatesStore } from '../../core/state/templates.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import { UiPromiseService } from '../../shared/services/ui-promise.service';
import { modelPresentation } from '../create/create.util';
import type { OutputFormat, GenerationOptions, ProjectTemplate } from '../../core/domain';
import type { CreateProjectInput } from '../../core/data/api-port';

/** Genere grammaticale del nome modello (per gli articoli IT). */
const MODEL_GENDER: Record<string, 'm' | 'f'> = {
  book: 'm', summary: 'm', manual: 'm', presentation: 'f', course: 'm', thesis: 'f',
};

const TITLE_MAX = 80;
const DESC_MAX = 300;
const NOTES_MAX = 500;

/**
 * Quota di capacità del progetto per le fonti (File + Istruzioni). PUNTO UNICO:
 * cambia qui il limite riflesso dalla barra di capacità.
 */
const PROJECT_CAPACITY_MB = 50;
const BYTES_PER_MB = 1024 * 1024;

/**
 * ModelSetupComponent — step "Personalizza" del flusso `/create` (componente di
 * servizio, non più una rotta: riceve `templateId` dal flusso, emette `back`)
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
  // Colori del modello scelto iniettati una volta sull'host: badge, icone e box
  // li ereditano via `var(--model-*)`. Cambi modello → cambia tutto da qui.
  host: {
    '[style.--model-bg]': 'modelBg()',
    '[style.--model-fg]': 'modelFg()',
  },
  imports: [
    NgTemplateOutlet,
    CounterFieldComponent,
    BackLinkComponent,
    SourceDropzoneComponent,
    ModalShellComponent,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './model-setup.component.html',
  styleUrl: './model-setup.component.scss',
})
export class ModelSetupComponent {
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly projectsStore = inject(ProjectsStore);
  private readonly sourcesStore = inject(SourcesStore);

  private readonly snackBar = inject(MatSnackBar);
  private readonly uiPromise = inject(UiPromiseService);

  /** Risolutore i18n reattivo (ricomputa i view-model al cambio lingua). */
  private readonly t = injectI18nText();

  /** Modello scelto (id) — passato dal flusso `/create` (step di servizio). */
  readonly templateId = input<string>('book');
  /** Richiesta di tornare alla galleria (gestita dal flusso padre). */
  readonly back = output<void>();

  readonly template = computed<ProjectTemplate | undefined>(
    () => this.templatesStore.templateById()[this.templateId()],
  );

  // --- Presentazione del modello scelto (immagine 3D + colori) ----------------
  private readonly presentation = computed(() => modelPresentation(this.templateId()));
  /** Immagine 3D del modello (vuota → si usa l'icona di fallback). */
  readonly modelImage = computed(() => this.presentation().imageSrc);
  /** Icona Material di fallback del modello. */
  readonly modelIcon = computed(() => this.presentation().icon);
  /** Sfondo/foreground del tono del modello (token globali, con fallback neutro). */
  protected readonly modelBg = computed(
    () => `var(--tone-${this.presentation().tone}-bg, var(--surface-soft))`,
  );
  protected readonly modelFg = computed(
    () => `var(--tone-${this.presentation().tone}-fg, var(--accent-700))`,
  );

  // --- Stato modulo -----------------------------------------------------------
  readonly documentTitle = signal('');
  readonly documentDescription = signal('');
  readonly instructionsText = signal('');
  readonly titleMax = TITLE_MAX;
  readonly descMax = DESC_MAX;
  readonly notesMax = NOTES_MAX;

  /** Validazione titolo (obbligatorio): errore solo dopo il primo blur. */
  readonly titleTouched = signal(false);
  readonly titleError = computed(() =>
    this.titleTouched() && !this.documentTitle().trim() ? 'Il titolo è obbligatorio' : '',
  );
  /** Si può generare solo con un titolo valido. */
  readonly canGenerate = computed(() => !!this.documentTitle().trim());

  /** True se almeno un file è ancora in upload (non finito di salire su S3). */
  readonly sourcesPending = computed(() =>
    this.materialFiles().some((s) => s.status === 'uploading'),
  );

  readonly language = signal('it');
  readonly formats = signal<OutputFormat[]>(['pdf', 'docx']);
  readonly materialFiles = signal<SourceItem[]>([]);

  // --- Nome modello + grammatica ---------------------------------------------
  readonly modelName = computed(() =>
    this.t(this.template()?.nameKey ?? 'i18n.Models.book.name'),
  );
  private readonly nameLower = computed(() => this.modelName().toLowerCase());
  private readonly gender = computed<'m' | 'f'>(() => MODEL_GENDER[this.templateId()] ?? 'm');
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

  /** Sottotitolo della card Istruzioni (model-aware). */
  readonly instrSubtitle = computed(
    () =>
      `Fornisci indicazioni, domande o obiettivi specifici per ${this.possessive()} ${this.nameLower()}.`,
  );

  // --- Fonti & allegati: UPLOAD REALE su AWS S3 ------------------------------
  // I byte vanno davvero su S3 via presigned PUT (progress reale), poi l'ingest
  // backend porta la fonte a `ready` (disponibile all'AI). Vedi
  // docs/AWS-S3-UPLOAD.md per il contratto presigned + i prerequisiti CORS.
  private uploadSeq = 0;

  addSources(files: File[]): void {
    this.realUpload(this.materialFiles, files);
  }
  removeSource(id: string): void {
    this.materialFiles.update((list) => list.filter((s) => s.id !== id));
  }

  // --- Dropzone File: clic apre l'upload, trascinamento carica direttamente ----
  /** True mentre si trascina un file sulla dropzone File (evidenziazione). */
  readonly dragOver = signal(false);
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }
  onDragLeave(): void {
    this.dragOver.set(false);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      this.realUpload(this.materialFiles, files);
    }
  }

  // --- File: upload da dispositivo (dialog dropzone) --------------------------
  readonly attachOpen = signal(false);
  openAttach(): void {
    this.attachOpen.set(true);
  }
  closeAttach(): void {
    this.attachOpen.set(false);
  }
  readonly attachItems = computed(() => this.materialFiles());
  addAttach(files: File[]): void {
    this.realUpload(this.materialFiles, files);
  }
  removeAttach(id: string): void {
    this.materialFiles.update((l) => l.filter((s) => s.id !== id));
  }

  /** Byte totali dei file caricati (dimensione reale). */
  private readonly usedBytes = computed(() =>
    this.materialFiles().reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0),
  );
  /** Capacità del progetto usata (%) sulla quota globale `PROJECT_CAPACITY_MB`. */
  readonly capacityUsed = computed(() =>
    Math.min(100, Math.round((this.usedBytes() / (PROJECT_CAPACITY_MB * BYTES_PER_MB)) * 100)),
  );
  /** Etichetta capacità reale: "X,X di YY MB". */
  readonly capacityLabel = computed(() => {
    const usedMb = this.usedBytes() / BYTES_PER_MB;
    const used = usedMb > 0 && usedMb < 10 ? usedMb.toFixed(1) : Math.round(usedMb).toString();
    return `${used} di ${PROJECT_CAPACITY_MB} MB`;
  });

  /** Anteprima file in card: oltre il tetto si mostra "+N" che apre il modale. */
  private readonly FILE_PREVIEW_MAX = 4;
  /** File mostrati come anteprima nella card (la lista completa è nel modale). */
  readonly filePreview = computed(() => {
    const all = this.materialFiles();
    return all.length > this.FILE_PREVIEW_MAX ? all.slice(0, this.FILE_PREVIEW_MAX - 1) : all;
  });
  /** Quanti file restano oltre l'anteprima (0 = nessun chip "+N"). */
  readonly extraFiles = computed(() => {
    const n = this.materialFiles().length;
    return n > this.FILE_PREVIEW_MAX ? n - (this.FILE_PREVIEW_MAX - 1) : 0;
  });
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

  // --- Istruzioni: testo scritto a mano (modale) ------------------------------
  readonly instrOpen = signal(false);
  openInstr(): void {
    this.instrOpen.set(true);
  }
  closeInstr(): void {
    this.instrOpen.set(false);
  }

  /**
   * Upload REALE su S3. Il componente dumb emette TUTTI i file scelti; è il
   * **padre** che confronta col già presente, **scarta i duplicati** (stesso
   * nome) e **avvisa** (snackbar). Solo i nuovi avanzano nell'upload reale.
   */
  private realUpload(target: WritableSignal<SourceItem[]>, files: File[]): void {
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
      void this.uploadOne(target, file);
    }
  }

  /**
   * Ciclo di vita di una fonte: `uploading` (PUT su S3, % REALE) → `processing`
   * (ingest backend) → `ready` (id reale = `documentId`, disponibile all'AI) o
   * `error`. L'id passa da temporaneo al `documentId` reale appena il PUT finisce.
   */
  private async uploadOne(target: WritableSignal<SourceItem[]>, file: File): Promise<void> {
    const currentId = `tmp-${++this.uploadSeq}`;
    target.update((list) => [
      ...list,
      { id: currentId, name: file.name, status: 'uploading' as const, progress: 0, sizeBytes: file.size },
    ]);
    const patch = (changes: Partial<SourceItem>) =>
      target.update((list) => list.map((s) => (s.id === currentId ? { ...s, ...changes } : s)));
    try {
      const source = await this.sourcesStore.createUpload(
        { name: file.name, sizeBytes: file.size, mime: file.type || undefined },
        file,
        (fraction) => patch({ progress: Math.round(fraction * 100) }),
      );
      // Presigned + PUT su S3 completati (response ricevute) → fonte PRONTA: lo
      // spinner finisce qui. L'estrazione testo (ingest) prosegue in background
      // lato backend (evento S3), senza bloccare l'utente.
      patch({ id: source.id, status: 'ready', progress: 100 });
    } catch {
      patch({ status: 'error' });
    }
  }

  // --- Azioni -----------------------------------------------------------------

  /** In invio al server (disabilita la CTA, evita doppi click). */
  readonly submitting = signal(false);

  /** Dialog di conferma prima di avviare la generazione (modello non più cambiabile). */
  readonly showConfirm = signal(false);

  /** "Genera indice" → valida e apre la conferma (l'avvio vero è in `generate`). */
  askGenerate(): void {
    if (!this.canGenerate()) {
      this.titleTouched.set(true);
      return;
    }
    // Niente generazione mentre una fonte è ancora in upload/ingest: andrebbe
    // persa (solo le fonti `ready` finiscono all'AI). Avvisa e blocca.
    if (this.sourcesPending()) {
      this.snackBar.open(
        this.t('i18n.Setup.sources.pendingWarn'),
        this.t('i18n.Setup.sources.duplicateOk'),
        { duration: 4000 },
      );
      return;
    }
    this.showConfirm.set(true);
  }

  /**
   * Genera indice: impacchetta titolo + brief + **modifiche** + fonti e li manda
   * al server (in v1 lo store mock). Si **attende la conferma** (la creazione che
   * risolve) prima di navigare: è il server a confermare gli aggiornamenti.
   */
  async generate(): Promise<void> {
    this.showConfirm.set(false);
    const tpl = this.template();
    if (!this.canGenerate()) {
      this.titleTouched.set(true);
      return;
    }
    if (!tpl || this.submitting()) {
      return;
    }
    const generationOptions: GenerationOptions = {
      aiInstructions: this.instructionsText().trim() || undefined,
      processingMode: tpl.defaults.processingMode,
      documentStructure: { ...tpl.defaults.structure },
      outputFormats: this.formats().length ? this.formats() : ['pdf'],
      outputLanguage: this.language(),
    };

    const payload: CreateProjectInput = {
      title: this.documentTitle().trim() || this.modelName(),
      description: this.documentDescription().trim() || undefined,
      documentType: tpl.documentType,
      templateId: tpl.id,
      coverTheme: tpl.coverTheme ?? 'ocean',
      // Solo fonti `ready` (id reali su S3/backend): le pending non vanno all'AI.
      materialFileIds: this.materialFiles().filter((f) => f.status === 'ready').map((f) => f.id),
      instructionFileIds: [],
      generationOptions,
    };

    this.submitting.set(true);
    // Attesa della create (per l'id) con OVERLAY bloccante (backdrop non
    // cliccabile + scroll bloccato): l'utente non può ri-cliccare, modificare i
    // campi o lasciare la pagina durante l'attesa. Poi avvio la generate in
    // background (ottimistico → skeleton) e navigo allo Studio. Errore della
    // create → toast e resto sul form (dati preservati).
    const { success: projectId } = await this.uiPromise.run(
      () => this.projectsStore.createFromTemplate(payload).then((p) => p.id),
      {
        loading: true,
        loadingMessage: this.t('i18n.Setup.creating'),
        error: {
          title: this.t('i18n.Common.error'),
          message: this.t('i18n.Setup.generateError'),
        },
      },
    );
    this.submitting.set(false);
    if (projectId) {
      void this.projectsStore.generate(projectId); // background (ottimistico → skeleton)
      await this.router.navigate(['/project', projectId]);
    }
  }
}
