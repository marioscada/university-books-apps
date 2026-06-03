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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
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

/** Numero totale di step del wizard. */
const TOTAL_STEPS = 7;

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
 * NewProjectWizard — wizard a 7 step (F4), **resumable come Draft**.
 *
 * Resumability = il draft È la persistenza: dopo lo Step 1 (kind+title) si crea
 * la draft via `store.create`; ogni "Avanti" successivo fa autosave dei settings
 * via `store.updateSettings` (PATCH). "Salva ed esci" lascia la draft nella Create
 * hub; con `?draft=:id` il wizard riapre quella draft prefillando lo stato.
 *
 * Stepper custom signal-driven (`currentStep` + `@switch`), non `mat-stepper`. I
 * controlli di input sono Material. Gating soft su piano `free` (deep_research/
 * academic disabilitati). Le fonti si SELEZIONANO dalla Library + nota mock inline.
 *
 * Business logic NELLO store: il componente legge signal e chiama metodi (mai il
 * mock direttamente).
 */
@Component({
  selector: 'app-new-project-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    PageHeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatChipsModule,
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
  readonly totalSteps = TOTAL_STEPS;
  readonly steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
  readonly lengths = ['short', 'medium', 'long'] as const;
  readonly tones = ['neutral', 'formal', 'friendly', 'technical', 'academic'] as const;
  readonly depths = ['overview', 'standard', 'deep'] as const;

  /** Prefisso i18n dello step (1..7) → `i18n.Wizard.Step.<name>`. */
  readonly stepKey = (step: number): string => {
    const names = [
      'goal',
      'sources',
      'instructions',
      'mode',
      'structure',
      'output',
      'review',
    ];
    return `i18n.Wizard.Step.${names[step - 1] ?? 'goal'}`;
  };

  /** Fonti disponibili dalla Library (Step 2). */
  readonly availableSources = this.sourcesStore.entities;

  /** Piano corrente (gating soft) dallo store. */
  readonly plan = this.store.plan;

  // --- Stato wizard (signal-driven) ----------------------------------------
  /** Step corrente (1..7). */
  readonly currentStep = signal(1);
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

  /** Esiste una draft persistita → "Salva ed esci" disponibile (step ≥ 1 dopo create). */
  readonly hasDraft = computed(() => this.projectId() !== null);

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
      this.currentStep.set(2);
    });
  }

  // --- Navigazione ----------------------------------------------------------

  /** Step 1 valido = titolo non vuoto. */
  readonly canAdvance = computed(() => {
    if (this.currentStep() === 1) {
      return this.title().trim().length > 0;
    }
    return true;
  });

  /** Avanti: autosave (crea la draft allo Step 1, poi PATCH dei settings). */
  async onNext(): Promise<void> {
    if (this.busy() || !this.canAdvance()) {
      return;
    }
    this.busy.set(true);
    try {
      if (this.currentStep() === 1) {
        await this.ensureDraft();
      } else {
        await this.persist();
      }
      this.currentStep.update((s) => Math.min(TOTAL_STEPS, s + 1));
    } finally {
      this.busy.set(false);
    }
  }

  /** Indietro: nessuna scrittura (lo stato in-progress resta in memoria). */
  onBack(): void {
    this.currentStep.update((s) => Math.max(1, s - 1));
  }

  // --- Step 1: kind grid ----------------------------------------------------

  selectKind(kind: ProjectKind): void {
    this.kind.set(kind);
  }

  // --- Step 2: sources ------------------------------------------------------

  isSourceSelected(id: string): boolean {
    return this.sourceIds().includes(id);
  }

  toggleSource(id: string): void {
    this.sourceIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

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

  /** Crea la draft (una sola volta) con title+kind dello Step 1. */
  private async ensureDraft(): Promise<void> {
    if (this.projectId()) {
      await this.persist();
      return;
    }
    const project = await this.store.create(this.title().trim(), this.kind());
    this.projectId.set(project.id);
    // Allinea anche title/kind/sources già scelti (PATCH iniziale).
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
