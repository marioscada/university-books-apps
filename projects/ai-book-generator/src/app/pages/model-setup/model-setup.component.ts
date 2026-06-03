import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { LowerCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import {
  SelectFieldComponent,
  type SelectOption,
} from '../../shared/ui/select-field/select-field.component';
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

/** Stato editabile di una parte di struttura (scostamenti rispetto al modello). */
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

/** Tipografia di fallback (se il modello non la specifica). */
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

/** Costruisce lo stato editabile delle parti dal modello (default inclusi). */
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
 * ModelSetupComponent — pagina "Personalizza il modello" (destinazione dopo aver
 * scelto un modello in Create). Tre colonne: **Struttura** (parti con
 * includi/escludi + "Modifica" per conteggio/parole), **Impostazioni** (titolo,
 * capitoli, parole, tipografia, formato), **Anteprima** in tempo reale.
 *
 * Su "Crea progetto" genera un Project draft con i default del modello + gli
 * scostamenti (il modello resta immutabile). Sostituisce il wizard a step.
 * Vedi docs/MODELLI-PUBBLICAZIONE-DEFINIZIONI.md.
 */
@Component({
  selector: 'app-model-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    LowerCasePipe,
    UpperCasePipe,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatTooltipModule,
    TranslateModule,
    TextFieldComponent,
    SelectFieldComponent,
  ],
  templateUrl: './model-setup.component.html',
  styleUrl: './model-setup.component.scss',
})
export class ModelSetupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly projectsStore = inject(ProjectsStore);

  /** Id modello dalla query (`?template=`), default Personalizzato. */
  private readonly templateId =
    this.route.snapshot.queryParamMap.get('template') ?? 'custom';

  /** Modello scelto (immutabile). */
  readonly template = computed<ProjectTemplate | undefined>(
    () => this.templatesStore.templateById()[this.templateId],
  );

  // --- Stato editabile (linkedSignal: default dal modello, override utente) ---
  readonly title = signal('');
  readonly parts = linkedSignal<PartState[]>(() => buildParts(this.template()));
  readonly typo = linkedSignal<TypographySettings>(() => {
    const t = this.template();
    return t ? { ...t.typography } : { ...DEFAULT_TYPO };
  });
  readonly formats = linkedSignal<OutputFormat[]>(() => {
    const t = this.template();
    return t ? [...t.defaults.outputFormats] : ['pdf'];
  });

  /** Chiave della parte con l'editor "Modifica" aperto. */
  readonly editingKey = signal<string | null>(null);

  // --- Derivati ---------------------------------------------------------------
  /** Parte ripetibile principale (capitoli/moduli/slide), se presente. */
  readonly repeatablePart = computed<PartState | undefined>(() =>
    this.parts().find((p) => p.repeatable),
  );

  /** Numero di unità ripetibili incluse (capitoli/moduli). */
  readonly unitCount = computed<number>(() => {
    const p = this.repeatablePart();
    return p && p.included ? p.count : 0;
  });

  /** Parole totali del manoscritto (somma delle parti incluse). */
  readonly totalWords = computed<number>(() =>
    this.parts()
      .filter((p) => p.included)
      .reduce((sum, p) => sum + (p.repeatable ? p.count * p.wordCount : p.wordCount), 0),
  );

  /** Numero di parti incluse. */
  readonly includedCount = computed<number>(
    () => this.parts().filter((p) => p.included).length,
  );

  // --- Opzioni select (i18n-agnostiche: label già pronte) ---------------------
  readonly fontOptions: SelectOption[] = FONT_OPTIONS.map((f) => ({ value: f, label: f }));
  readonly sizeOptions: SelectOption[] = SIZE_OPTIONS.map((s) => ({
    value: String(s),
    label: `${s} pt`,
  }));
  readonly lineHeightOptions = LINE_HEIGHT_OPTIONS;
  readonly outputFormats = OUTPUT_FORMATS;

  // --- Comandi struttura ------------------------------------------------------
  toggleEditor(key: string): void {
    this.editingKey.update((k) => (k === key ? null : key));
  }

  togglePart(key: string): void {
    this.parts.update((list) =>
      list.map((p) => (p.key === key && p.optional ? { ...p, included: !p.included } : p)),
    );
  }

  setCount(key: string, value: number): void {
    this.parts.update((list) =>
      list.map((p) =>
        p.key === key
          ? { ...p, count: clamp(Math.round(value), p.countMin, p.countMax) }
          : p,
      ),
    );
  }

  bumpCount(key: string, delta: number): void {
    const p = this.parts().find((x) => x.key === key);
    if (p) {
      this.setCount(key, p.count + delta);
    }
  }

  setWordCount(key: string, value: number): void {
    this.parts.update((list) =>
      list.map((p) => (p.key === key ? { ...p, wordCount: Math.max(0, Math.round(value)) } : p)),
    );
  }

  // --- Comandi tipografia / formato ------------------------------------------
  patchTypo(patch: Partial<TypographySettings>): void {
    this.typo.update((t) => ({ ...t, ...patch }));
  }

  isFormat(fmt: OutputFormat): boolean {
    return this.formats().includes(fmt);
  }

  /** Etichetta formati per l'anteprima (es. "PDF · EPUB"). */
  formatsLabel(): string {
    return this.formats()
      .map((f) => f.toUpperCase())
      .join(' · ');
  }

  toggleFormat(fmt: OutputFormat): void {
    this.formats.update((list) =>
      list.includes(fmt) ? list.filter((f) => f !== fmt) : [...list, fmt],
    );
  }

  // --- Numeri parse-safe da input ---------------------------------------------
  num(value: string): number {
    const n = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  /** Formattazione migliaia (es. 80.000) senza dipendere da Date/Math.random. */
  formatNumber(n: number): string {
    return n.toLocaleString('it-IT');
  }

  // --- Crea progetto ----------------------------------------------------------
  async createProject(): Promise<void> {
    const template = this.template();
    if (!template) {
      return;
    }
    const title = this.title().trim() || this.placeholderTitle();
    const settings: ProjectSettings = {
      instructions: '',
      processingMode: template.defaults.processingMode,
      structure: {
        ...template.defaults.structure,
        chapters: this.unitCount() || undefined,
      },
      outputFormats: this.formats().length ? this.formats() : ['pdf'],
      language: template.defaults.language,
      templateId: template.id,
      parts: this.parts().map((p) => ({
        key: p.key,
        included: p.included,
        count: p.repeatable ? p.count : undefined,
        wordCount: p.wordCount || undefined,
      })),
      typography: { ...this.typo() },
      totalWords: this.totalWords(),
    };
    const project = await this.projectsStore.createFromTemplate({
      title,
      kind: template.kind,
      settings,
      coverTheme: template.coverTheme ?? 'ocean',
    });
    void this.router.navigate(['/project', project.id]);
  }

  /** Titolo placeholder se l'utente non ne inserisce uno. */
  placeholderTitle(): string {
    return this.title().trim() || 'Senza titolo';
  }

  back(): void {
    void this.router.navigate(['/create']);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
