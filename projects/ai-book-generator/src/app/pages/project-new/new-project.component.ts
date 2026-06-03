import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import type {
  OutputFormat,
  ProcessingMode,
  ProjectKind,
  ProjectSettings,
  StructureConfig,
} from '../../core/domain';

/** Tipi di progetto selezionabili (Step 1) — label via i18n. */
const PROJECT_KINDS: readonly ProjectKind[] = [
  'book',
  'summary',
  'manual',
  'study_guide',
  'research_report',
  'training_course',
  'documentation',
  'custom',
];

/** Modalità di elaborazione (Step 4) — label/desc via i18n. */
const PROCESSING_MODES: readonly ProcessingMode[] = [
  'fast_draft',
  'balanced',
  'deep_research',
  'academic',
  'business',
  'educational',
  'technical',
];

/** Modalità riservate ai piani a pagamento (gating soft in `free`). */
const PRO_MODES: ReadonlySet<ProcessingMode> = new Set<ProcessingMode>([
  'deep_research',
  'academic',
]);

/** Toggle booleani della struttura (Step 5) — label via i18n. */
const STRUCTURE_TOGGLES = [
  'bibliography',
  'glossary',
  'quiz',
  'exercises',
  'tables',
  'images',
] as const;
type StructureToggle = (typeof STRUCTURE_TOGGLES)[number];

/** Formati di output (Step 6). */
const OUTPUT_FORMATS: readonly OutputFormat[] = [
  'pdf',
  'docx',
  'epub',
  'markdown',
  'html',
];

/** Lingue ISO disponibili (Step 6). */
const LANGUAGES: readonly string[] = ['en', 'it', 'de'];

/** Settings di partenza (mirror di `ProjectSettings`) per un nuovo wizard. */
function defaultSettings(): ProjectSettings {
  return {
    instructions: '',
    processingMode: 'balanced',
    structure: {
      length: 'medium',
      tone: 'neutral',
      depth: 'standard',
      bibliography: false,
      glossary: false,
      quiz: false,
      exercises: false,
      tables: false,
      images: false,
    },
    outputFormats: ['pdf'],
    language: 'en',
  };
}

/**
 * NewProjectWizard — wizard a 7 step (F4), **resumable come Draft**, UI **Material**.
 *
 * Stepper = **`mat-stepper`** (Material) lineare; i controlli sono componenti
 * Material (button-toggle, selection-list, radio, slide-toggle, chip, select, list).
 *
 * Resumability = il draft È la persistenza: dopo lo Step 1 (kind+title) si crea la
 * draft via `store.create`; ogni passaggio in avanti fa autosave dei settings via
 * `store.updateSettings`/`updateDraftMeta` (PATCH). "Salva ed esci" lascia la draft
 * nella Create hub; con `?draft=:id` il wizard riapre quella draft prefillando lo stato.
 *
 * Business logic NELLO store: il componente legge signal e chiama metodi (mai il
 * mock direttamente). OnPush, signals-first, nessuna sottoscrizione RxJS.
 */
@Component({
  selector: 'app-new-project-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    PageHeaderComponent,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectWizardComponent {
  private readonly store = inject(ProjectsStore);
  private readonly sourcesStore = inject(SourcesStore);
  private readonly router = inject(Router);

  /** Draft da riprendere (query param `?draft=:id`, opzionale). */
  readonly draft = input<string>();

  // --- Cataloghi statici (per i template) ----------------------------------
  readonly kinds = PROJECT_KINDS;
  readonly modes = PROCESSING_MODES;
  readonly structureToggles = STRUCTURE_TOGGLES;
  readonly outputFormats = OUTPUT_FORMATS;
  readonly languages = LANGUAGES;
  readonly lengths = ['short', 'medium', 'long'] as const;
  readonly tones = ['neutral', 'formal', 'friendly', 'technical', 'academic'] as const;
  readonly depths = ['overview', 'standard', 'deep'] as const;

  /** Fonti disponibili dalla Library (Step 2). */
  readonly availableSources = this.sourcesStore.entities;

  /** Piano corrente (gating soft) dallo store. */
  readonly plan = this.store.plan;

  // --- Stato wizard (signal-driven) ----------------------------------------
  /** Indice dello step Material selezionato (0..6). */
  readonly selectedIndex = signal(0);
  /** Id della draft creata/ripresa (la persistenza). */
  readonly projectId = signal<string | null>(null);

  // Stato in-progress che mirrora ProjectSettings + i campi dello Step 1/2.
  readonly title = signal('');
  readonly kind = signal<ProjectKind>('book');
  readonly sourceIds = signal<string[]>([]);
  readonly settings = signal<ProjectSettings>(defaultSettings());
  /** Nome della nota inline da creare (Step 2). */
  readonly noteName = signal('');

  /** Vero durante operazioni async (crea/patch/genera) → disabilita i CTA. */
  readonly busy = signal(false);

  /** Esiste una draft persistita → "Salva ed esci" disponibile. */
  readonly hasDraft = computed(() => this.projectId() !== null);

  /** Step 1 completo = titolo non vuoto (gating lineare dello stepper). */
  readonly step1Complete = computed(() => this.title().trim().length > 0);

  /** Una modalità è bloccata dal piano corrente. */
  readonly isModeLocked = (mode: ProcessingMode): boolean =>
    this.plan() === 'free' && PRO_MODES.has(mode);

  constructor() {
    // Resume: se arriva `?draft=:id`, prefilla lo stato dalla draft persistita
    // (lo store si auto-inizializza; l'effect reagisce appena l'entità è in store).
    effect(() => {
      const draftId = this.draft();
      if (!draftId || this.projectId() === draftId) {
        return;
      }
      const project = this.store.entities().find((p) => p.id === draftId);
      if (!project) {
        return; // entità non ancora caricata: l'effect riproverà al prossimo tick.
      }
      this.projectId.set(project.id);
      this.title.set(project.title);
      this.kind.set(project.kind);
      this.sourceIds.set([...project.sourceIds]);
      this.settings.set(structuredClone(project.settings));
      // Riapre direttamente sul primo step di configurazione.
      this.selectedIndex.set(1);
    });
  }

  // --- Navigazione mat-stepper ---------------------------------------------

  /** Cambio step: autosave del passo precedente quando si va avanti. */
  onStepChange(event: StepperSelectionEvent): void {
    this.selectedIndex.set(event.selectedIndex);
    if (event.selectedIndex > event.previouslySelectedIndex) {
      void this.autosave(event.previouslySelectedIndex);
    }
  }

  // --- Step 1: kind ---------------------------------------------------------

  selectKind(kind: ProjectKind): void {
    this.kind.set(kind);
  }

  // --- Step 2: sources ------------------------------------------------------

  /** Crea una nota inline e la seleziona subito. */
  async onAddNote(): Promise<void> {
    const name = this.noteName().trim();
    if (!name || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      const note = await this.sourcesStore.createNote(name);
      this.sourceIds.update((ids) => [...ids, note.id]);
      this.noteName.set('');
    } finally {
      this.busy.set(false);
    }
  }

  // --- Step 3: instructions -------------------------------------------------

  setInstructions(value: string): void {
    this.settings.update((s) => ({ ...s, instructions: value }));
  }

  // --- Step 4: processing mode ---------------------------------------------

  selectMode(mode: ProcessingMode): void {
    if (this.isModeLocked(mode)) {
      return;
    }
    this.settings.update((s) => ({ ...s, processingMode: mode }));
  }

  // --- Step 5: structure ----------------------------------------------------

  patchStructure(patch: Partial<StructureConfig>): void {
    this.settings.update((s) => ({ ...s, structure: { ...s.structure, ...patch } }));
  }

  toggleStructureFlag(flag: StructureToggle, value: boolean): void {
    this.patchStructure({ [flag]: value });
  }

  isStructureFlag(flag: StructureToggle): boolean {
    return this.settings().structure[flag];
  }

  /** Numero capitoli dall'input (null/0 = auto). */
  setChapters(value: number | null): void {
    const n = value ?? 0;
    this.patchStructure({ chapters: Number.isFinite(n) && n > 0 ? n : undefined });
  }

  // --- Step 6: output & language -------------------------------------------

  setFormats(formats: OutputFormat[]): void {
    this.settings.update((s) => ({ ...s, outputFormats: [...formats] }));
  }

  setLanguage(language: string): void {
    this.settings.update((s) => ({ ...s, language }));
  }

  // --- Step 7: finish -------------------------------------------------------

  /** Genera ora: persiste i settings, lancia la generazione → Workspace. */
  async onGenerate(): Promise<void> {
    const id = this.projectId();
    if (!id || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await this.persist();
      await this.store.generate(id);
      await this.router.navigate(['/project', id]);
    } finally {
      this.busy.set(false);
    }
  }

  /** Salva come bozza: persiste i settings e va al Workspace della draft. */
  async onSaveDraft(): Promise<void> {
    const id = this.projectId();
    if (!id || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await this.persist();
      await this.router.navigate(['/project', id]);
    } finally {
      this.busy.set(false);
    }
  }

  /** Salva ed esci: autosave e ritorno alla Create hub (draft visibile lì). */
  async onSaveExit(): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      if (this.hasDraft()) {
        await this.persist();
      }
      await this.router.navigate(['/create']);
    } finally {
      this.busy.set(false);
    }
  }

  // --- Persistenza ----------------------------------------------------------

  /** Autosave del passo: crea la draft uscendo dallo Step 1, poi PATCH. */
  private async autosave(previousIndex: number): Promise<void> {
    if (previousIndex === 0) {
      await this.ensureDraft();
    } else {
      await this.persist();
    }
  }

  /** Crea la draft (una sola volta) con title+kind dello Step 1. */
  private async ensureDraft(): Promise<void> {
    if (this.projectId()) {
      await this.persist();
      return;
    }
    const title = this.title().trim();
    if (!title) {
      return;
    }
    const project = await this.store.create(title, this.kind());
    this.projectId.set(project.id);
    await this.persist();
  }

  /** PATCH di settings + metadati (titolo, fonti) della draft corrente. */
  private async persist(): Promise<void> {
    const id = this.projectId();
    if (!id) {
      return;
    }
    await this.store.updateSettings(id, this.settings());
    await this.store.updateDraftMeta(id, {
      title: this.title().trim(),
      sourceIds: this.sourceIds(),
    });
  }
}
