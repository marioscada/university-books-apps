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
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, debounceTime, tap } from 'rxjs';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { SelectionCardComponent } from '../../shared/ui/selection-card/selection-card.component';
import { WizardProgressComponent } from '../../shared/ui/wizard-progress/wizard-progress.component';
import {
  SourceUploadComponent,
  type UploadItem,
} from '../../shared/ui/source-upload/source-upload.component';
import {
  LivePreviewPanelComponent,
  type PreviewVm,
} from './components/live-preview-panel/live-preview-panel.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { SourcesStore } from '../../core/state/sources.store';
import { BreakpointHelperService } from '../../shared/services/breakpoint-helper.service';
import { LocaleService } from '../../shared/services/locale.service';
import type {
  CoverTheme,
  OutputFormat,
  ProcessingMode,
  ProjectKind,
  ProjectSettings,
  StructureConfig,
} from '../../core/domain';

/** Numero di step core (Obiettivo · Fonti · Istruzioni · Genera). */
const TOTAL_STEPS = 4;

const PROJECT_KINDS: readonly ProjectKind[] = [
  'book', 'summary', 'manual', 'study_guide',
  'research_report', 'training_course', 'documentation', 'custom',
];

/** Modalità mostrate come Selection Card (le 6 del brief). */
const MODES: readonly ProcessingMode[] = [
  'fast_draft', 'balanced', 'deep_research', 'academic', 'business', 'technical',
];

const PRO_MODES: ReadonlySet<ProcessingMode> = new Set<ProcessingMode>(['deep_research', 'academic']);

/** Toggle "contenuti" e "layout" della struttura. */
const CONTENT_FLAGS = ['bibliography', 'glossary', 'quiz', 'exercises', 'appendices'] as const;
const LAYOUT_FLAGS = ['tables', 'images'] as const;
type StructureFlag = (typeof CONTENT_FLAGS)[number] | (typeof LAYOUT_FLAGS)[number];

const OUTPUT_FORMATS: readonly OutputFormat[] = ['pdf', 'docx', 'epub', 'markdown', 'html'];
const LANGUAGES: readonly string[] = ['it', 'en', 'fr', 'de', 'es'];

/** Icona Material per ogni tipo di pubblicazione. */
const KIND_ICON: Record<ProjectKind, string> = {
  book: 'menu_book',
  summary: 'short_text',
  manual: 'build',
  study_guide: 'school',
  research_report: 'science',
  training_course: 'cast_for_education',
  documentation: 'description',
  custom: 'tune',
};

/** Icona Material per ogni modalità AI. */
const MODE_ICON: Record<ProcessingMode, string> = {
  fast_draft: 'bolt',
  balanced: 'balance',
  deep_research: 'travel_explore',
  academic: 'school',
  business: 'business_center',
  educational: 'cast_for_education',
  technical: 'engineering',
};

const FORMAT_ICON: Record<OutputFormat, string> = {
  pdf: 'picture_as_pdf',
  docx: 'description',
  epub: 'auto_stories',
  markdown: 'code',
  html: 'language',
};

/** Tema cover per tipo (anteprima). */
const KIND_COVER: Record<ProjectKind, CoverTheme> = {
  book: 'aurora', summary: 'mint', manual: 'ocean', study_guide: 'gold',
  research_report: 'ember', training_course: 'rose', documentation: 'ocean', custom: 'aurora',
};

/** Smart defaults per tipo (modalità, capitoli, bibliografia, formati). */
interface KindDefaults {
  mode: ProcessingMode;
  chapters: number;
  bibliography: boolean;
  formats: OutputFormat[];
}
const KIND_DEFAULTS: Record<ProjectKind, KindDefaults> = {
  book: { mode: 'balanced', chapters: 10, bibliography: true, formats: ['pdf', 'epub'] },
  summary: { mode: 'fast_draft', chapters: 2, bibliography: false, formats: ['pdf'] },
  manual: { mode: 'technical', chapters: 8, bibliography: true, formats: ['pdf', 'docx'] },
  study_guide: { mode: 'balanced', chapters: 6, bibliography: false, formats: ['pdf'] },
  research_report: { mode: 'academic', chapters: 6, bibliography: true, formats: ['pdf', 'docx'] },
  training_course: { mode: 'balanced', chapters: 8, bibliography: false, formats: ['pdf'] },
  documentation: { mode: 'technical', chapters: 6, bibliography: false, formats: ['pdf', 'html'] },
  custom: { mode: 'balanced', chapters: 0, bibliography: false, formats: ['pdf'] },
};

function defaultSettings(): ProjectSettings {
  return {
    instructions: '',
    processingMode: 'balanced',
    structure: {
      length: 'medium', tone: 'neutral', depth: 'standard',
      bibliography: false, glossary: false, quiz: false, exercises: false,
      appendices: false, tables: false, images: false,
    },
    outputFormats: ['pdf'],
    language: 'it',
  };
}

/**
 * NewProjectWizard — container *smart* del redesign "Nuovo Progetto".
 *
 * 4 step (Obiettivo · Fonti · Istruzioni · Genera) + pannello "Opzioni avanzate"
 * (Modalità/Struttura/Output a smart-default per tipo). Layout 2 colonne con
 * **Live Preview** reattiva (pattern Vercel). Stato in **signal locali**;
 * persistenza/dominio via `ProjectsStore`. Componenti dumb riusabili per le parti
 * (SelectionCard, WizardProgress, SourceUpload, LivePreviewPanel), ognuno
 * self-responsive; il container orchestra. Resumable via `?draft=:id`.
 */
@Component({
  selector: 'app-new-project-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    FormsModule,
    TextFieldModule,
    MatStepperModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    SelectionCardComponent,
    WizardProgressComponent,
    SourceUploadComponent,
    LivePreviewPanelComponent,
  ],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectWizardComponent {
  private readonly store = inject(ProjectsStore);
  private readonly sourcesStore = inject(SourcesStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LocaleService);
  private readonly breakpoint = inject(BreakpointHelperService);

  /** Draft da riprendere (`?draft=:id`). */
  readonly draft = input<string>();

  // --- Cataloghi (template) -------------------------------------------------
  readonly kinds = PROJECT_KINDS;
  readonly modes = MODES;
  readonly contentFlags = CONTENT_FLAGS;
  readonly layoutFlags = LAYOUT_FLAGS;
  readonly formats = OUTPUT_FORMATS;
  readonly languages = LANGUAGES;
  readonly lengths = ['short', 'medium', 'long'] as const;
  readonly depths = ['overview', 'standard', 'deep'] as const;
  readonly kindIcon = KIND_ICON;
  readonly modeIcon = MODE_ICON;
  readonly formatIcon = FORMAT_ICON;

  // --- Stato wizard (signal locali) ----------------------------------------
  readonly selectedIndex = signal(0);
  readonly projectId = signal<string | null>(null);
  readonly title = signal('');
  readonly kind = signal<ProjectKind>('book');
  readonly sourceIds = signal<string[]>([]);
  readonly uploads = signal<UploadItem[]>([]);
  readonly settings = signal<ProjectSettings>(defaultSettings());
  /** Una volta che l'utente tocca "Avanzate", gli smart-default non sovrascrivono. */
  readonly advancedDirty = signal(false);
  readonly busy = signal(false);

  // --- Derivati -------------------------------------------------------------
  readonly availableSources = this.sourcesStore.entities;
  readonly plan = this.store.plan;
  readonly isHandset = computed(() => {
    const s = this.breakpoint.screenType();
    return s === 'small' || s === 'medium';
  });

  readonly hasDraft = computed(() => this.projectId() !== null);
  readonly isLastStep = computed(() => this.selectedIndex() === TOTAL_STEPS - 1);
  readonly step1Complete = computed(() => this.title().trim().length > 0);
  readonly canAdvance = computed(() => this.selectedIndex() !== 0 || this.step1Complete());

  /** Step etichette (tradotte) per WizardProgress. */
  readonly stepLabels = computed(() => {
    this.locale.currentLocale();
    return ['goal', 'sources', 'instructions', 'generate'].map((k) =>
      this.translate.instant(`i18n.Wizard.Step.${k}.title`),
    );
  });
  readonly completedSteps = computed(() =>
    Array.from({ length: TOTAL_STEPS }, (_, i) => i < this.selectedIndex()),
  );

  /** Fonti di libreria (escludendo gli upload di sessione, mostrati a parte). */
  readonly librarySources = computed(() => {
    const uploadedIds = new Set(this.uploads().map((u) => u.id));
    return this.availableSources().filter((s) => !uploadedIds.has(s.id));
  });

  /** View-model dell'anteprima live (reattivo a stato + lingua). */
  readonly preview = computed<PreviewVm>(() => {
    this.locale.currentLocale();
    const s = this.settings();
    const chapters = s.structure.chapters;
    return {
      title: this.title().trim(),
      kindLabel: this.translate.instant(`i18n.Project.Kind.${this.kind()}`),
      sourcesCount: this.sourceIds().length,
      estChapters: chapters && chapters > 0 ? String(chapters) : this.translate.instant('i18n.Wizard.Preview.auto'),
      modeLabel: this.translate.instant(`i18n.Wizard.Mode.${s.processingMode}.label`),
      formats: s.outputFormats.map((f) => this.translate.instant(`i18n.Wizard.Output.Format.${f}`)),
      languageLabel: this.translate.instant(`i18n.Common.LanguageSwitcher.Language.${s.language}`),
      coverTheme: KIND_COVER[this.kind()],
    };
  });

  /** Autosave in background (debounce) sui cambi di stato. */
  private readonly persistKey = computed(() =>
    JSON.stringify({ t: this.title(), k: this.kind(), src: this.sourceIds(), s: this.settings() }),
  );
  private readonly autosave = rxMethod<string>(
    pipe(
      debounceTime(800),
      tap(() => void this.persist()),
    ),
  );

  constructor() {
    // Resume da `?draft=:id`: prefilla quando l'entità è nello store.
    effect(() => {
      const draftId = this.draft();
      if (!draftId || this.projectId() === draftId) {
        return;
      }
      const project = this.store.entities().find((p) => p.id === draftId);
      if (!project) {
        return;
      }
      this.projectId.set(project.id);
      this.title.set(project.title);
      this.kind.set(project.kind);
      this.sourceIds.set([...project.sourceIds]);
      this.settings.set(structuredClone(project.settings));
      this.advancedDirty.set(true);
      this.selectedIndex.set(1);
    });
    // Autosave reattivo (parte solo dopo che esiste una draft).
    this.autosave(this.persistKey);
  }

  // --- Navigazione ----------------------------------------------------------
  onStepChange(event: StepperSelectionEvent): void {
    this.selectedIndex.set(event.selectedIndex);
    if (event.selectedIndex > event.previouslySelectedIndex) {
      void this.autosaveStep(event.previouslySelectedIndex);
    }
  }

  goTo(index: number): void {
    this.selectedIndex.set(Math.max(0, Math.min(TOTAL_STEPS - 1, index)));
  }

  async next(): Promise<void> {
    if (this.busy() || !this.canAdvance() || this.isLastStep()) {
      return;
    }
    await this.autosaveStep(this.selectedIndex());
    this.selectedIndex.update((i) => Math.min(TOTAL_STEPS - 1, i + 1));
  }

  back(): void {
    this.selectedIndex.update((i) => Math.max(0, i - 1));
  }

  // --- Step 1: kind + title -------------------------------------------------
  selectKind(kind: ProjectKind): void {
    this.kind.set(kind);
    if (!this.advancedDirty()) {
      this.applyDefaults(kind);
    }
  }

  private applyDefaults(kind: ProjectKind): void {
    const d = KIND_DEFAULTS[kind];
    this.settings.update((s) => ({
      ...s,
      processingMode: d.mode,
      outputFormats: [...d.formats],
      structure: { ...s.structure, chapters: d.chapters > 0 ? d.chapters : undefined, bibliography: d.bibliography },
    }));
  }

  // --- Step 2: sources ------------------------------------------------------
  isSourceSelected(id: string): boolean {
    return this.sourceIds().includes(id);
  }
  toggleSource(id: string): void {
    this.sourceIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }
  async onFilesAdded(files: File[]): Promise<void> {
    for (const file of files) {
      const source = await this.sourcesStore.createUpload({ name: file.name, sizeBytes: file.size, mime: file.type });
      this.uploads.update((u) => [...u, { id: source.id, name: source.name, type: source.type, sizeBytes: source.sizeBytes }]);
      this.sourceIds.update((ids) => [...ids, source.id]);
    }
  }
  onUploadRemoved(id: string): void {
    this.uploads.update((u) => u.filter((x) => x.id !== id));
    this.sourceIds.update((ids) => ids.filter((x) => x !== id));
  }

  // --- Step 3: instructions + advanced --------------------------------------
  setInstructions(value: string): void {
    this.settings.update((s) => ({ ...s, instructions: value }));
  }
  applyPrompt(text: string): void {
    this.settings.update((s) => ({ ...s, instructions: s.instructions ? `${s.instructions}\n${text}` : text }));
  }
  readonly suggestedPrompts = computed(() => {
    this.locale.currentLocale();
    return ['examples', 'glossary', 'simple', 'exercises'].map((k) => ({
      key: k,
      text: this.translate.instant(`i18n.Wizard.Prompt.${k}`),
    }));
  });

  onAdvancedToggle(): void {
    this.advancedDirty.set(true);
  }
  selectMode(mode: ProcessingMode): void {
    if (this.plan() === 'free' && PRO_MODES.has(mode)) {
      return;
    }
    this.advancedDirty.set(true);
    this.settings.update((s) => ({ ...s, processingMode: mode }));
  }
  isModeLocked(mode: ProcessingMode): boolean {
    return this.plan() === 'free' && PRO_MODES.has(mode);
  }
  patchStructure(patch: Partial<StructureConfig>): void {
    this.advancedDirty.set(true);
    this.settings.update((s) => ({ ...s, structure: { ...s.structure, ...patch } }));
  }
  toggleFlag(flag: StructureFlag, value: boolean): void {
    this.patchStructure({ [flag]: value } as Partial<StructureConfig>);
  }
  isFlag(flag: StructureFlag): boolean {
    return this.settings().structure[flag];
  }
  setChapters(value: number | null): void {
    const n = value ?? 0;
    this.patchStructure({ chapters: Number.isFinite(n) && n > 0 ? n : undefined });
  }
  toggleFormat(format: OutputFormat): void {
    this.advancedDirty.set(true);
    this.settings.update((s) => ({
      ...s,
      outputFormats: s.outputFormats.includes(format)
        ? s.outputFormats.filter((f) => f !== format)
        : [...s.outputFormats, format],
    }));
  }
  isFormat(format: OutputFormat): boolean {
    return this.settings().outputFormats.includes(format);
  }
  setLanguage(language: string): void {
    this.advancedDirty.set(true);
    this.settings.update((s) => ({ ...s, language }));
  }

  // --- Step 4: finish -------------------------------------------------------
  async onGenerate(): Promise<void> {
    const id = await this.ensureDraft();
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

  async onSaveDraft(): Promise<void> {
    const id = await this.ensureDraft();
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

  // --- Persistenza ----------------------------------------------------------
  private async autosaveStep(previousIndex: number): Promise<void> {
    if (previousIndex === 0) {
      await this.ensureDraft();
    } else {
      await this.persist();
    }
  }

  private async ensureDraft(): Promise<string | null> {
    const existing = this.projectId();
    if (existing) {
      return existing;
    }
    const title = this.title().trim();
    if (!title) {
      return null;
    }
    const project = await this.store.create(title, this.kind());
    this.projectId.set(project.id);
    await this.persist();
    return project.id;
  }

  private async persist(): Promise<void> {
    const id = this.projectId();
    if (!id) {
      return;
    }
    await this.store.updateSettings(id, this.settings());
    await this.store.updateDraftMeta(id, { title: this.title().trim(), sourceIds: this.sourceIds() });
  }
}
