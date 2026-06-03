import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { merge, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import {
  SelectFieldComponent,
  type SelectOption,
} from '../../shared/ui/select-field/select-field.component';
import {
  DocStructureListComponent,
  type DocPartView,
} from '../../shared/ui/doc-structure-list/doc-structure-list.component';
import {
  ResultPreviewComponent,
  type PagePreview,
  type PreviewDevice,
  type PreviewStat,
  type TocEntry,
} from '../../shared/ui/result-preview/result-preview.component';
import {
  ProjectSummaryComponent,
  type ChangeRow,
  type SummaryRow,
} from '../../shared/ui/project-summary/project-summary.component';
import type { ModelTone } from '../../shared/ui/model-card/model-card.component';
import { ProjectsStore } from '../../core/state/projects.store';
import { TemplatesStore } from '../../core/state/templates.store';
import type {
  OutputFormat,
  ProjectSettings,
  ProjectTemplate,
  StructureGroup,
  StructurePart,
  TypographySettings,
} from '../../core/domain';

/** Tab della pagina di personalizzazione. */
type SetupTab = 'preview' | 'settings' | 'sources' | 'review';

/** Stato editabile di una parte (scostamenti rispetto al modello). */
interface PartState {
  key: string;
  labelKey: string;
  group: StructureGroup;
  optional: boolean;
  repeatable: boolean;
  countMin: number;
  countMax: number;
  included: boolean;
  count: number;
  wordCount: number;
}

const DEFAULT_TYPO: TypographySettings = {
  fontFamily: 'Inter',
  fontSizePt: 11,
  textColor: '#1a1d21',
  lineHeight: 1.5,
  marginMm: 20,
  alignment: 'left',
};

const FONT_OPTIONS: readonly string[] = [
  'Inter', 'Times New Roman', 'Georgia', 'Garamond', 'Merriweather', 'Arial', 'Helvetica',
];
const SIZE_OPTIONS: readonly number[] = [10, 11, 12, 13, 14, 16];
const LINE_HEIGHT_OPTIONS: readonly { value: number; labelKey: string }[] = [
  { value: 1, labelKey: 'i18n.Setup.LineHeight.single' },
  { value: 1.15, labelKey: 'i18n.Setup.LineHeight.relaxed' },
  { value: 1.5, labelKey: 'i18n.Setup.LineHeight.onehalf' },
  { value: 2, labelKey: 'i18n.Setup.LineHeight.double' },
];
const OUTPUT_FORMATS: readonly OutputFormat[] = ['pdf', 'docx', 'epub'];

/** Preset di lunghezza: fattore applicato alle parole-default delle parti. */
const LENGTH_PRESETS: readonly { id: string; factor: number }[] = [
  { id: 'concise', factor: 0.45 },
  { id: 'short', factor: 0.7 },
  { id: 'standard', factor: 1 },
  { id: 'medium', factor: 1.4 },
  { id: 'long', factor: 2 },
];

/** Icona Material per parte (fallback `article`). */
const PART_ICON: Record<string, string> = {
  cover: 'image', preface: 'menu_book', toc: 'toc', introduction: 'flag',
  chapters: 'menu_book', conclusion: 'check_circle', glossary: 'spellcheck',
  bibliography: 'local_library', index: 'list', appendix: 'attach_file',
  purpose: 'target', keypoints: 'key', conclusions: 'check_circle', conceptmap: 'hub',
  topics: 'category', objectives: 'target', keyconcepts: 'lightbulb', visuals: 'image',
  examples: 'lightbulb', quiz: 'quiz', exercises: 'fitness_center', selfassessment: 'fact_check',
  overview: 'visibility', safety: 'health_and_safety', procedures: 'checklist',
  reference: 'menu_book', troubleshooting: 'build', titlepage: 'description',
  executivesummary: 'summarize', methodology: 'science', findings: 'analytics',
  analysis: 'insights', recommendations: 'recommend', modules: 'view_module',
  finalassessment: 'task_alt', abstract: 'short_text', methods: 'science',
  results: 'analytics', discussion: 'forum', acknowledgments: 'favorite',
  agenda: 'list', slides: 'slideshow', speakernotes: 'sticky_note_2',
};

/** Tono per gruppo strutturale. */
const GROUP_TONE: Record<StructureGroup, ModelTone> = {
  front: 'info',
  body: 'violet',
  back: 'amber',
  section: 'info',
};

/** Parti il cui contenuto è meglio reso come grafico/dati nell'anteprima. */
const CHART_PARTS = new Set([
  'findings', 'results', 'analysis', 'methodology', 'recommendations',
]);
const TOC_PARTS = new Set(['toc', 'index']);

/** Endonimi lingua (non traducibili). */
const LANGUAGE_LABEL: Record<string, string> = {
  it: 'Italiano', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español',
};

const WORDS_PER_PAGE = 380;

function buildParts(template: ProjectTemplate | undefined): PartState[] {
  if (!template) {
    return [];
  }
  return template.parts.map((p: StructurePart) => ({
    key: p.key,
    labelKey: p.labelKey,
    group: p.group,
    optional: p.optional,
    repeatable: Boolean(p.repeatable),
    countMin: p.countRange?.[0] ?? 1,
    countMax: p.countRange?.[1] ?? 1,
    included: p.includedByDefault,
    count: p.defaultCount ?? 1,
    wordCount: p.defaultWordCount ?? 0,
  }));
}

/**
 * ModelSetupComponent — pagina "Personalizza il modello" (`/create/new`).
 * Toolbar con tab (Anteprima · Impostazioni · Fonti · Verifica e crea) + azioni
 * (Salva bozza / Crea progetto). La tab **Anteprima** mostra l'anteprima dinamica
 * del risultato a tutta larghezza; **Impostazioni** la struttura + tipografia;
 * **Verifica e crea** il riepilogo con le modifiche rispetto al modello.
 *
 * Stato editabile via `linkedSignal` (default dal modello → override utente).
 * Su "Crea progetto" genera un draft con default + scostamenti; il modello resta
 * immutabile. Vedi docs/UI-SPEC-MODEL-SETUP.md.
 */
@Component({
  selector: 'app-model-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    UpperCasePipe,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    TranslateModule,
    TextFieldComponent,
    SelectFieldComponent,
    DocStructureListComponent,
    ResultPreviewComponent,
    ProjectSummaryComponent,
  ],
  templateUrl: './model-setup.component.html',
  styleUrl: './model-setup.component.scss',
})
export class ModelSetupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly projectsStore = inject(ProjectsStore);
  private readonly translate = inject(TranslateService);

  /** Tick i18n: ricomputa i view-model al cambio lingua / caricamento traduzioni. */
  private readonly i18nTick = toSignal(
    merge(
      this.translate.onLangChange,
      this.translate.onTranslationChange,
      this.translate.onDefaultLangChange,
    ).pipe(map(() => Symbol())),
    { initialValue: Symbol() },
  );

  private t(key: string, params?: Record<string, unknown>): string {
    this.i18nTick();
    return this.translate.instant(key, params);
  }

  private readonly templateId =
    this.route.snapshot.queryParamMap.get('template') ?? 'custom';

  readonly template = computed<ProjectTemplate | undefined>(
    () => this.templatesStore.templateById()[this.templateId],
  );

  // --- Stato editabile --------------------------------------------------------
  readonly activeTab = signal<SetupTab>('preview');
  readonly editingTitle = signal(false);
  readonly title = signal('');
  readonly device = signal<PreviewDevice>('desktop');
  readonly lengthPreset = signal<string | null>(null);

  readonly parts = linkedSignal<PartState[]>(() => buildParts(this.template()));
  readonly typo = linkedSignal<TypographySettings>(() => {
    const tpl = this.template();
    return tpl ? { ...tpl.typography } : { ...DEFAULT_TYPO };
  });
  readonly formats = linkedSignal<OutputFormat[]>(() => {
    const tpl = this.template();
    return tpl ? [...tpl.defaults.outputFormats] : ['pdf'];
  });

  // --- Tab e chrome -----------------------------------------------------------
  readonly tabs: readonly { id: SetupTab; labelKey: string; icon: string }[] = [
    { id: 'preview', labelKey: 'i18n.Setup.Tab.preview', icon: 'visibility' },
    { id: 'settings', labelKey: 'i18n.Setup.Tab.settings', icon: 'tune' },
    { id: 'sources', labelKey: 'i18n.Setup.Tab.sources', icon: 'folder_open' },
    { id: 'review', labelKey: 'i18n.Setup.Tab.review', icon: 'task_alt' },
  ];

  readonly modelName = computed(() =>
    this.t(this.template()?.nameKey ?? 'i18n.Models.custom.name'),
  );
  readonly displayTitle = computed(() => this.title().trim() || this.modelName());

  // --- Derivati strutturali ---------------------------------------------------
  readonly repeatablePart = computed<PartState | undefined>(() =>
    this.parts().find((p) => p.repeatable),
  );
  readonly includedParts = computed(() => this.parts().filter((p) => p.included));
  readonly includedCount = computed(() => this.includedParts().length);
  readonly unitCount = computed(() => {
    const p = this.repeatablePart();
    return p && p.included ? p.count : 0;
  });
  readonly totalWords = computed(() =>
    this.includedParts().reduce(
      (sum, p) => sum + (p.repeatable ? p.count * p.wordCount : p.wordCount),
      0,
    ),
  );
  readonly totalPages = computed(() => Math.max(1, Math.round(this.totalWords() / WORDS_PER_PAGE)));

  // --- View-model per i componenti dumb --------------------------------------
  readonly docParts = computed<DocPartView[]>(() =>
    this.parts().map((p) => ({
      key: p.key,
      label: this.t(p.labelKey),
      sublabel: this.partSublabel(p),
      icon: PART_ICON[p.key] ?? 'article',
      iconTone: GROUP_TONE[p.group],
      included: p.included,
      optional: p.optional,
      repeatable: p.repeatable,
      count: p.count,
      countMin: p.countMin,
      countMax: p.countMax,
      wordCount: p.wordCount,
    })),
  );

  /** Voci indice (parti incluse di corpo/sezione) con numero di pagina cumulato. */
  readonly tocEntries = computed<TocEntry[]>(() => {
    const out: TocEntry[] = [];
    let page = 1;
    for (const p of this.includedParts()) {
      const span = p.repeatable ? p.count * p.wordCount : p.wordCount;
      if (p.group === 'body' || p.group === 'section') {
        out.push({ label: this.t(p.labelKey), page });
      }
      page += Math.max(1, Math.round(span / WORDS_PER_PAGE));
    }
    return out;
  });

  /** Miniature pagine (incluse + escluse, queste ultime attenuate). */
  readonly pagePreviews = computed<PagePreview[]>(() =>
    this.parts().map((p) => ({
      label: this.t(p.labelKey),
      variant: this.partVariant(p.key),
      tone: GROUP_TONE[p.group],
      excluded: !p.included,
    })),
  );

  readonly previewStats = computed<PreviewStat[]>(() => [
    { icon: 'notes', label: this.t('i18n.Setup.stat.length'), value: `≈ ${this.formatNumber(this.totalWords())} ${this.t('i18n.Setup.pagesWords')}` },
    { icon: 'description', label: this.t('i18n.Setup.stat.pagesEst'), value: `≈ ${this.totalPages() - 5}–${this.totalPages() + 5} ${this.t('i18n.Setup.pages')}` },
    { icon: 'layers', label: this.t('i18n.Setup.stat.sectionsIncl'), value: `${this.includedCount()} ${this.t('i18n.Setup.of')} ${this.parts().length}` },
    { icon: 'picture_as_pdf', label: this.t('i18n.Setup.stat.outputFormat'), value: this.formatsLabel() },
    { icon: 'schedule', label: this.t('i18n.Setup.stat.timeEst'), value: this.timeEstimate() },
  ]);

  // --- Riepilogo (tab Verifica) ----------------------------------------------
  readonly summaryRows = computed<SummaryRow[]>(() => {
    const rows: SummaryRow[] = [
      { label: this.t('i18n.Setup.stat.type'), value: this.modelName(), icon: 'category' },
      { label: this.t('i18n.Setup.stat.length'), value: `≈ ${this.formatNumber(this.totalWords())} ${this.t('i18n.Setup.pagesWords')}`, icon: 'notes' },
      { label: this.t('i18n.Setup.stat.sectionsIncl'), value: `${this.includedCount()}`, icon: 'layers' },
      { label: this.t('i18n.Setup.stat.outputFormat'), value: this.formatsLabel(), icon: 'picture_as_pdf' },
      { label: this.t('i18n.Setup.language'), value: this.languageLabel(), icon: 'translate' },
      { label: this.t('i18n.Setup.contentStyle'), value: this.styleLabel(), icon: 'auto_awesome' },
    ];
    return rows;
  });

  readonly changes = computed<ChangeRow[]>(() => {
    const tpl = this.template();
    if (!tpl) {
      return [];
    }
    const out: ChangeRow[] = [];
    for (const p of this.parts()) {
      const base = tpl.parts.find((x) => x.key === p.key);
      if (!base) {
        out.push({ label: this.t(p.labelKey), detail: this.t('i18n.Setup.change.added'), tone: 'success' });
        continue;
      }
      if (!p.included) {
        continue; // gestito in "Escluso"
      }
      if (p.repeatable && p.count !== (base.defaultCount ?? p.count)) {
        out.push({ label: this.t(p.labelKey), detail: `${p.count}`, tone: 'info' });
      }
      if (p.wordCount !== (base.defaultWordCount ?? p.wordCount)) {
        out.push({
          label: this.t(p.labelKey),
          detail: `${this.lengthBucketLabel(p.wordCount)} (${this.formatNumber(p.wordCount)} ${this.t('i18n.Setup.pagesWords')})`,
          tone: 'amber',
        });
      }
    }
    return out;
  });

  readonly excluded = computed<string[]>(() =>
    this.parts().filter((p) => !p.included).map((p) => this.t(p.labelKey)),
  );
  readonly changesMore = computed(() =>
    this.t('i18n.Setup.summary.changesMore', { count: this.changes().length }),
  );

  // --- Opzioni select ---------------------------------------------------------
  readonly fontOptions: SelectOption[] = FONT_OPTIONS.map((f) => ({ value: f, label: f }));
  readonly sizeOptions: SelectOption[] = SIZE_OPTIONS.map((s) => ({ value: String(s), label: `${s} pt` }));
  readonly lineHeightOptions = LINE_HEIGHT_OPTIONS;
  readonly outputFormats = OUTPUT_FORMATS;
  readonly lengthPresets = LENGTH_PRESETS;

  // --- Helpers di formattazione ----------------------------------------------
  private partSublabel(p: PartState): string {
    if (p.wordCount === 0) {
      return this.t('i18n.Setup.autoGenerated');
    }
    const words = p.repeatable ? p.count * p.wordCount : p.wordCount;
    return `${this.lengthBucketLabel(p.wordCount)} (~${this.formatNumber(words)} ${this.t('i18n.Setup.pagesWords')})`;
  }

  private lengthBucketLabel(words: number): string {
    let id = 'standard';
    if (words <= 400) id = 'concise';
    else if (words <= 1000) id = 'short';
    else if (words <= 1800) id = 'standard';
    else if (words <= 2600) id = 'medium';
    else id = 'long';
    return this.t(`i18n.Setup.Length.${id}`);
  }

  private partVariant(key: string): PagePreview['variant'] {
    if (key === 'cover' || key === 'titlepage') return 'cover';
    if (TOC_PARTS.has(key)) return 'toc';
    if (CHART_PARTS.has(key)) return 'chart';
    return 'text';
  }

  private timeEstimate(): string {
    const minutes = Math.max(1, Math.round(this.totalWords() / 9000));
    return `${minutes}–${minutes + 1} ${this.t('i18n.Setup.minutes')}`;
  }

  private languageLabel(): string {
    const code = this.template()?.defaults.language ?? 'it';
    return LANGUAGE_LABEL[code] ?? code.toUpperCase();
  }

  private styleLabel(): string {
    const mode = this.template()?.defaults.processingMode ?? 'balanced';
    return this.t(`i18n.Setup.Style.${mode}`);
  }

  formatsLabel(): string {
    return this.formats().map((f) => f.toUpperCase()).join(', ');
  }

  formatNumber(n: number): string {
    return n.toLocaleString('it-IT');
  }

  // --- Comandi struttura (dal DocStructureList) ------------------------------
  togglePart(key: string): void {
    this.parts.update((list) =>
      list.map((p) => (p.key === key && p.optional ? { ...p, included: !p.included } : p)),
    );
  }
  changeCount(e: { key: string; count: number }): void {
    this.parts.update((list) =>
      list.map((p) =>
        p.key === e.key ? { ...p, count: Math.min(p.countMax, Math.max(p.countMin, e.count)) } : p,
      ),
    );
  }
  changeWord(e: { key: string; words: number }): void {
    this.parts.update((list) =>
      list.map((p) => (p.key === e.key ? { ...p, wordCount: Math.max(0, e.words) } : p)),
    );
    this.lengthPreset.set(null);
  }
  reorderParts(orderedKeys: string[]): void {
    this.parts.update((list) => {
      const byKey = new Map(list.map((p) => [p.key, p]));
      return orderedKeys.map((k) => byKey.get(k)!).filter(Boolean);
    });
  }
  addSection(): void {
    this.parts.update((list) => [
      ...list,
      {
        key: `custom-${list.length + 1}`,
        labelKey: 'i18n.Setup.newSection',
        group: 'section' as StructureGroup,
        optional: true,
        repeatable: false,
        countMin: 1,
        countMax: 1,
        included: true,
        count: 1,
        wordCount: 800,
      },
    ]);
  }

  applyPreset(id: string): void {
    const tpl = this.template();
    const factor = LENGTH_PRESETS.find((p) => p.id === id)?.factor ?? 1;
    this.lengthPreset.set(id);
    this.parts.update((list) =>
      list.map((p) => {
        const base = tpl?.parts.find((x) => x.key === p.key)?.defaultWordCount ?? p.wordCount;
        return base ? { ...p, wordCount: Math.round(base * factor) } : p;
      }),
    );
  }

  // --- Comandi tipografia / formato ------------------------------------------
  patchTypo(patch: Partial<TypographySettings>): void {
    this.typo.update((s) => ({ ...s, ...patch }));
  }
  isFormat(fmt: OutputFormat): boolean {
    return this.formats().includes(fmt);
  }
  toggleFormat(fmt: OutputFormat): void {
    this.formats.update((list) =>
      list.includes(fmt) ? list.filter((f) => f !== fmt) : [...list, fmt],
    );
  }
  num(value: string): number {
    const n = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  setDevice(d: PreviewDevice): void {
    this.device.set(d);
  }

  // --- Azioni -----------------------------------------------------------------
  private buildSettings(): ProjectSettings | null {
    const tpl = this.template();
    if (!tpl) {
      return null;
    }
    return {
      instructions: '',
      processingMode: tpl.defaults.processingMode,
      structure: { ...tpl.defaults.structure, chapters: this.unitCount() || undefined },
      outputFormats: this.formats().length ? this.formats() : ['pdf'],
      language: tpl.defaults.language,
      templateId: tpl.id,
      parts: this.parts().map((p) => ({
        key: p.key,
        included: p.included,
        count: p.repeatable ? p.count : undefined,
        wordCount: p.wordCount || undefined,
      })),
      typography: { ...this.typo() },
      totalWords: this.totalWords(),
    };
  }

  async createProject(): Promise<void> {
    const tpl = this.template();
    const settings = this.buildSettings();
    if (!tpl || !settings) {
      return;
    }
    const project = await this.projectsStore.createFromTemplate({
      title: this.displayTitle(),
      kind: tpl.kind,
      settings,
      coverTheme: tpl.coverTheme ?? 'ocean',
    });
    void this.router.navigate(['/project', project.id]);
  }

  async saveDraft(): Promise<void> {
    const tpl = this.template();
    const settings = this.buildSettings();
    if (!tpl || !settings) {
      return;
    }
    await this.projectsStore.createFromTemplate({
      title: this.displayTitle(),
      kind: tpl.kind,
      settings,
      coverTheme: tpl.coverTheme ?? 'ocean',
    });
    void this.router.navigate(['/create']);
  }

  refreshPreview(): void {
    // Anteprima già reattiva; placeholder per future rigenerazioni server-side.
  }

  back(): void {
    void this.router.navigate(['/create']);
  }
}
