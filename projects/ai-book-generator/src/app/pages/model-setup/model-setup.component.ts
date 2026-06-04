import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, map } from 'rxjs';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { CounterFieldComponent } from '../../shared/ui/counter-field/counter-field.component';
import { BackLinkComponent } from '../../shared/components-v2/back-link/back-link.component';
import { TagReadoutComponent } from '../../shared/components-v2/tag-readout/tag-readout.component';
import { FormSectionComponent } from '../../shared/components-v2/form-section/form-section.component';
import { OptionCardComponent } from '../../shared/components-v2/option-card/option-card.component';
import {
  FieldSelectComponent,
  type FieldOption,
} from '../../shared/components-v2/field-select/field-select.component';
import {
  SourceDropzoneComponent,
  type SourceItem,
} from '../../shared/components-v2/source-dropzone/source-dropzone.component';
import { ActionBarComponent } from '../../shared/components-v2/action-bar/action-bar.component';
import { ModalShellComponent } from '../../shared/components-v2/modal-shell/modal-shell.component';
import type { Tone } from '../../shared/components-v2/tone';
import { ProjectsStore } from '../../core/state/projects.store';
import { TemplatesStore } from '../../core/state/templates.store';
import type { OutputFormat, ProjectSettings, ProjectTemplate } from '../../core/domain';

/** Genere grammaticale del nome modello (per gli articoli IT). */
const MODEL_GENDER: Record<string, 'm' | 'f'> = {
  book: 'm', summary: 'm', study_guide: 'f', manual: 'm', report: 'm',
  presentation: 'f', course: 'm', thesis: 'f', custom: 'm',
};

/** Tono per modello (allineato alla galleria Create) — pilota chip + colore libro. */
const MODEL_TONE: Record<string, Tone> = {
  book: 'info', summary: 'success', study_guide: 'amber', manual: 'violet',
  report: 'violet', presentation: 'warning', course: 'rose', thesis: 'success',
  custom: 'neutral',
};

/** Scostamenti rispetto ai default del modello, accumulati dagli editor. */
interface Modifications {
  length?: { unit: 'pages' | 'words'; value: number; preset: string };
  structure?: { excluded: string[] };
  style?: { font: string; size: number; color: string; lineHeight: number; alignment: string };
}

/** Confronto insiemistico (ordine-insensibile) di due liste di chiavi. */
function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

const TITLE_MAX = 80;
const DESC_MAX = 300;
const NOTES_MAX = 500;
const OUTPUT_FORMATS: readonly OutputFormat[] = ['pdf', 'docx', 'epub'];

/**
 * ModelSetupComponent — pagina "Crea / Personalizza" (`/create/new`) ricomposta
 * con i componenti dumb di `components-v2`. Sezioni: top bar (back + modello
 * scelto), **Definisci** (titolo + descrizione + copertina live), **Ritocca il
 * modello** (3 `OptionCard`), **Briefing per l'AI** (`FieldSelect` + formato +
 * note), **Fonti** (`SourceDropzone`), e una `ActionBar` (Indietro / Genera
 * indice). Dinamica sul modello scelto (`?template=`); il modello resta immutabile.
 */
@Component({
  selector: 'app-model-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShellComponent,
    UpperCasePipe,
    CounterFieldComponent,
    BackLinkComponent,
    TagReadoutComponent,
    FormSectionComponent,
    OptionCardComponent,
    FieldSelectComponent,
    SourceDropzoneComponent,
    ActionBarComponent,
    ModalShellComponent,
    MatIconModule,
    MatButtonModule,
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
  private readonly translate = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);

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

  // --- Stato modulo -----------------------------------------------------------
  readonly title = signal('');
  readonly description = signal('');
  readonly notes = signal('');
  readonly titleMax = TITLE_MAX;
  readonly descMax = DESC_MAX;
  readonly notesMax = NOTES_MAX;

  readonly goal = signal('analyze');
  readonly audience = signal('professionals');
  readonly tone = signal('professional');
  readonly language = signal('it');
  readonly formats = signal<OutputFormat[]>(['pdf', 'docx']);
  readonly outputFormats = OUTPUT_FORMATS;
  readonly sources = signal<SourceItem[]>([]);
  readonly noteFiles = signal<SourceItem[]>([]);

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
  readonly defSubtitle = computed(() => this.t('i18n.Setup.S1.subtitle', this.params()));
  readonly titleLabel = computed(() => this.t('i18n.Setup.S1.titleLabel', this.params()));
  readonly descLabel = computed(() => this.t('i18n.Setup.S1.descLabel', this.params()));
  readonly descPlaceholder = computed(() => this.t('i18n.Setup.S1.descPlaceholder', this.params()));

  /** Tono del modello (chip "modello scelto"). */
  readonly modelTone = computed<Tone>(() => MODEL_TONE[this.templateId] ?? 'accent');

  /** Colore solido del libro, dinamico per modello (token globale del tono). */
  readonly bookBg = computed<string>(() => {
    const tone = MODEL_TONE[this.templateId] ?? 'neutral';
    return tone === 'neutral' ? 'var(--accent-500)' : `var(--tone-${tone}-fg)`;
  });

  /** Titolo mostrato sulla copertina (titolo digitato o placeholder). */
  readonly coverTitle = computed(() => this.title().trim() || this.t('i18n.Setup.untitled'));

  // --- Opzioni Briefing -------------------------------------------------------
  readonly goalOptions = computed<FieldOption[]>(() => this.opts('i18n.Setup.Goal.', ['analyze', 'inform', 'instruct', 'persuade', 'summarize', 'document']));
  readonly audienceOptions = computed<FieldOption[]>(() => this.opts('i18n.Setup.Audience.', ['general', 'beginners', 'intermediate', 'experts', 'professionals', 'executives']));
  readonly toneOptions = computed<FieldOption[]>(() => this.opts('i18n.Setup.ToneOpt.', ['neutral', 'professional', 'formal', 'popular', 'technical', 'academic']));
  readonly languageOptions: FieldOption[] = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
  ];

  private opts(prefix: string, keys: readonly string[]): FieldOption[] {
    return keys.map((k) => ({ value: k, label: this.t(prefix + k) }));
  }

  isFormat(fmt: OutputFormat): boolean {
    return this.formats().includes(fmt);
  }
  toggleFormat(fmt: OutputFormat): void {
    this.formats.update((list) => (list.includes(fmt) ? list.filter((f) => f !== fmt) : [...list, fmt]));
  }

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

  /** Dialog "Allega un file" alle note: chiuso finché non lo si apre dal link. */
  readonly attachOpen = signal(false);
  openAttach(): void {
    this.attachOpen.set(true);
  }
  closeAttach(): void {
    this.attachOpen.set(false);
  }

  addNoteFiles(files: File[]): void {
    this.simulateUpload(this.noteFiles, files);
  }
  removeNoteFile(id: string): void {
    this.noteFiles.update((list) => list.filter((s) => s.id !== id));
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

  // --- Editor (dialog) --------------------------------------------------------
  readonly activeEditor = signal<'length' | 'structure' | 'style' | null>(null);
  readonly editorTitle = computed(() => {
    switch (this.activeEditor()) {
      case 'length': return this.t('i18n.Setup.tweak.length.title');
      case 'structure': return this.t('i18n.Setup.tweak.structure.title');
      case 'style': return this.t('i18n.Setup.tweak.style.title');
      default: return '';
    }
  });
  readonly editorSubtitle = computed(() => {
    switch (this.activeEditor()) {
      case 'length': return this.t('i18n.Setup.lengthSub');
      case 'structure': return this.t('i18n.Setup.structureSub');
      case 'style': return this.t('i18n.Setup.styleSub');
      default: return '';
    }
  });

  /**
   * Sorgente di verità del padre: gli scostamenti rispetto al modello, accumulati
   * man mano che gli editor *emettono* (Applica). Le card di personalizzazione non
   * decidono nulla: ricevono `modified` derivato da qui. Alla generazione l'intero
   * pacchetto va al server; la conferma chiude il ciclo.
   */
  readonly modifications = signal<Modifications>({});
  readonly lengthModified = computed(() => this.modifications().length !== undefined);
  readonly structureModified = computed(() => this.modifications().structure !== undefined);
  readonly styleModified = computed(() => this.modifications().style !== undefined);

  // Stato UI degli editor (transitorio finché non si Applica → emit nel modello).
  readonly lengthPreset = signal('standard');
  readonly lengthPresets = ['concise', 'short', 'standard', 'medium', 'long'];
  readonly lengthUnit = signal<'pages' | 'words'>('pages');
  readonly lengthValue = signal(20);

  readonly parts = signal<{ key: string; label: string; included: boolean; optional: boolean }[]>([]);

  readonly font = signal('Times New Roman');
  readonly fontSize = signal('12');
  readonly textColor = signal('#1a1d21');
  readonly lineHeight = signal(1.5);
  readonly alignment = signal<'left' | 'center' | 'right' | 'justify'>('justify');

  readonly fontOptions: FieldOption[] = ['Inter', 'Times New Roman', 'Georgia', 'Garamond', 'Arial'].map((f) => ({ value: f, label: f }));
  readonly sizeOptions: FieldOption[] = ['10', '11', '12', '13', '14', '16'].map((s) => ({ value: s, label: `${s} pt` }));
  readonly lineHeightOptions = [
    { value: 1, key: 'i18n.Setup.LineHeight.single' },
    { value: 1.15, key: 'i18n.Setup.LineHeight.relaxed' },
    { value: 1.5, key: 'i18n.Setup.LineHeight.onehalf' },
    { value: 2, key: 'i18n.Setup.LineHeight.double' },
  ];

  /** Dettaglio mostrato sulla OptionCard Lunghezza (dal modello di modifiche). */
  readonly lengthDetail = computed(() => {
    const m = this.modifications().length;
    if (!m) {
      return '';
    }
    const unit = this.t(m.unit === 'pages' ? 'i18n.Setup.unitPages' : 'i18n.Setup.unitWords').toLowerCase();
    return `≈ ${m.value} ${unit}`;
  });

  /** Pagine "di default" del modello (base del confronto lunghezza). */
  private defaultPages(): number {
    return this.template()?.estimatedPages ?? 20;
  }

  openLength(): void {
    // L'editor riceve i valori correnti: dalla modifica se presente, altrimenti
    // dai default del modello (preset standard · pagine · stima del modello).
    const mod = this.modifications().length;
    if (mod) {
      this.lengthPreset.set(mod.preset);
      this.lengthUnit.set(mod.unit);
      this.lengthValue.set(mod.value);
    } else {
      this.lengthPreset.set('standard');
      this.lengthUnit.set('pages');
      this.lengthValue.set(this.defaultPages());
    }
    this.activeEditor.set('length');
  }
  openStructure(): void {
    this.seedParts();
    this.activeEditor.set('structure');
  }
  openStyle(): void {
    const tpl = this.template();
    const mod = this.modifications().style;
    if (mod) {
      this.font.set(mod.font);
      this.fontSize.set(String(mod.size));
      this.textColor.set(mod.color);
      this.lineHeight.set(mod.lineHeight);
      this.alignment.set(mod.alignment as 'left' | 'center' | 'right' | 'justify');
    } else if (tpl) {
      this.font.set(tpl.typography.fontFamily);
      this.fontSize.set(String(tpl.typography.fontSizePt));
      this.textColor.set(tpl.typography.textColor);
      this.lineHeight.set(tpl.typography.lineHeight);
      this.alignment.set(tpl.typography.alignment === 'justify' ? 'justify' : 'left');
    }
    this.activeEditor.set('style');
  }
  closeEditor(): void {
    this.activeEditor.set(null);
  }

  /**
   * Applica: l'editor *emette* i suoi valori; il **padre decide** se è davvero una
   * modifica confrontando con i default del modello — se coincide col default
   * l'area torna pulita (niente "modificato"), già prima di inviare al server.
   */
  applyEditor(): void {
    const area = this.activeEditor();
    const tpl = this.template();
    if (area === 'length') {
      const isDefault =
        this.lengthPreset() === 'standard' &&
        this.lengthUnit() === 'pages' &&
        this.lengthValue() === this.defaultPages();
      this.setModification('length', isDefault ? undefined : {
        unit: this.lengthUnit(), value: this.lengthValue(), preset: this.lengthPreset(),
      });
    } else if (area === 'structure') {
      const excluded = this.parts().filter((p) => !p.included).map((p) => p.key);
      const defaultExcluded = (tpl?.parts ?? []).filter((p) => !p.includedByDefault).map((p) => p.key);
      const isDefault = sameSet(excluded, defaultExcluded);
      this.setModification('structure', isDefault ? undefined : { excluded });
    } else if (area === 'style') {
      const ty = tpl?.typography;
      const cur = {
        font: this.font(), size: Number(this.fontSize()), color: this.textColor(),
        lineHeight: this.lineHeight(), alignment: this.alignment(),
      };
      const isDefault = !!ty &&
        cur.font === ty.fontFamily && cur.size === ty.fontSizePt && cur.color === ty.textColor &&
        cur.lineHeight === ty.lineHeight && cur.alignment === (ty.alignment === 'justify' ? 'justify' : 'left');
      this.setModification('style', isDefault ? undefined : cur);
    }
    this.closeEditor();
  }

  /** Scrive (o azzera) lo scostamento di un'area nel modello di modifiche. */
  private setModification<K extends keyof Modifications>(area: K, value: Modifications[K] | undefined): void {
    this.modifications.update((m) => {
      const next = { ...m };
      if (value === undefined) {
        delete next[area];
      } else {
        next[area] = value;
      }
      return next;
    });
  }

  resetEditor(): void {
    this.resetArea(this.activeEditor());
    this.closeEditor();
  }

  /** Rimuove lo scostamento di un'area (torna al default del modello). */
  resetArea(area: 'length' | 'structure' | 'style' | null): void {
    if (!area) {
      return;
    }
    this.modifications.update((m) => {
      const next = { ...m };
      delete next[area];
      return next;
    });
  }

  resetTemplate(): void {
    this.modifications.set({});
  }

  private seedParts(): void {
    const tpl = this.template();
    if (!tpl) {
      this.parts.set([]);
      return;
    }
    // Riflette la modifica corrente se presente, altrimenti i default del modello.
    const excluded = this.modifications().structure?.excluded;
    this.parts.set(tpl.parts.map((p) => ({
      key: p.key,
      label: this.t(p.labelKey),
      included: excluded ? !excluded.includes(p.key) : p.includedByDefault,
      optional: p.optional,
    })));
  }

  togglePart(key: string): void {
    this.parts.update((list) => list.map((p) => (p.key === key && p.optional ? { ...p, included: !p.included } : p)));
  }
  bumpLength(delta: number): void {
    this.lengthValue.update((v) => Math.max(1, v + delta));
  }
  setLengthNum(raw: string): void {
    const n = Number(raw.replace(/[^\d]/g, ''));
    this.lengthValue.set(Number.isFinite(n) && n > 0 ? n : 1);
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
    if (!tpl || this.submitting()) {
      return;
    }
    const mods = this.modifications();
    const settings: ProjectSettings = {
      instructions: this.notes().trim(),
      processingMode: tpl.defaults.processingMode,
      structure: { ...tpl.defaults.structure },
      outputFormats: this.formats().length ? this.formats() : ['pdf'],
      language: this.language(),
      templateId: tpl.id,
      // Scostamenti rispetto al modello (parti escluse + tipografia).
      parts: mods.structure
        ? this.parts().map((p) => ({ key: p.key, included: p.included }))
        : undefined,
      typography: mods.style
        ? { fontFamily: mods.style.font, fontSizePt: mods.style.size, textColor: mods.style.color, lineHeight: mods.style.lineHeight, marginMm: tpl.typography.marginMm, alignment: mods.style.alignment === 'justify' ? 'justify' : 'left' }
        : undefined,
      totalWords: mods.length?.unit === 'words' ? mods.length.value : undefined,
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
      // Confermato: si prosegue allo studio del progetto.
      void this.router.navigate(['/project', project.id]);
    } finally {
      this.submitting.set(false);
    }
  }
}
