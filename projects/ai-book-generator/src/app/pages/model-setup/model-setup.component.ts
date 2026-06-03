import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import { CounterFieldComponent } from '../../shared/ui/counter-field/counter-field.component';
import type { ModelTone } from '../../shared/ui/model-card/model-card.component';
import { TemplatesStore } from '../../core/state/templates.store';
import type { ProjectTemplate, StructureGroup } from '../../core/domain';

/** Voce "incluso in questo modello" mostrata nella card informativa. */
interface IncludeChip {
  label: string;
  icon: string;
  tone: ModelTone;
}

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

const GROUP_TONE: Record<StructureGroup, ModelTone> = {
  front: 'info', body: 'violet', back: 'amber', section: 'info',
};

/** Genere grammaticale del nome modello (per gli articoli IT). */
const MODEL_GENDER: Record<string, 'm' | 'f'> = {
  book: 'm', summary: 'm', study_guide: 'f', manual: 'm', report: 'm',
  presentation: 'f', course: 'm', thesis: 'f', custom: 'm',
};

const TITLE_MAX = 80;
const DESC_MAX = 500;
const MAX_CHIPS = 4;

/**
 * ModelSetupComponent — pagina "Crea / Personalizza" (`/create/new`), a **sezioni
 * distinte con sfondo alternato** (bande globali `.band`/`.band--alt`), senza tab.
 *
 * **Sezione 1 — "Definisci il tuo {modello}"**: titolo (obbligatorio) e
 * descrizione (facoltativa) del progetto, con card informativa "Cos'è un
 * {modello}" che elenca cosa il modello può includere. Le sezioni successive
 * (struttura, anteprima, ecc.) verranno aggiunte in seguito.
 *
 * Dinamica sul modello scelto (`?template=`); il modello resta immutabile.
 */
@Component({
  selector: 'app-model-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, CounterFieldComponent, MatIconModule, TranslateModule],
  templateUrl: './model-setup.component.html',
  styleUrl: './model-setup.component.scss',
})
export class ModelSetupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
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

  // --- Stato (Sezione 1) ------------------------------------------------------
  readonly title = signal('');
  readonly description = signal('');
  readonly titleMax = TITLE_MAX;
  readonly descMax = DESC_MAX;

  // --- Nome modello + grammatica ---------------------------------------------
  readonly modelName = computed(() =>
    this.t(this.template()?.nameKey ?? 'i18n.Models.custom.name'),
  );
  private readonly nameLower = computed(() => this.modelName().toLowerCase());
  private readonly gender = computed<'m' | 'f'>(() => MODEL_GENDER[this.templateId] ?? 'm');
  /** "il tuo" / "la tua" (EN/DE invarianti). */
  private readonly possessive = computed(() =>
    this.t(this.gender() === 'f' ? 'i18n.Setup.S1.possF' : 'i18n.Setup.S1.possM'),
  );
  /** "un" / "una" (EN/DE invarianti). */
  private readonly article = computed(() =>
    this.t(this.gender() === 'f' ? 'i18n.Setup.S1.artF' : 'i18n.Setup.S1.artM'),
  );
  /** "del" / "della" (EN/DE invarianti/vuoti). */
  private readonly genitive = computed(() =>
    this.t(this.gender() === 'f' ? 'i18n.Setup.S1.genF' : 'i18n.Setup.S1.genM'),
  );

  private params(): Record<string, string> {
    return {
      name: this.modelName(),
      nameLower: this.nameLower(),
      poss: this.possessive(),
      art: this.article(),
      gen: this.genitive(),
    };
  }

  // --- Testi Sezione 1 (i18n con parametri grammaticali) ---------------------
  readonly s1Title = computed(() => this.t('i18n.Setup.S1.title', this.params()));
  readonly s1Subtitle = computed(() => this.t('i18n.Setup.S1.subtitle', this.params()));
  readonly s1TitleLabel = computed(() => this.t('i18n.Setup.S1.titleLabel', this.params()));
  readonly s1DescLabel = computed(() => this.t('i18n.Setup.S1.descLabel', this.params()));
  readonly s1DescPlaceholder = computed(() => this.t('i18n.Setup.S1.descPlaceholder', this.params()));
  readonly s1AboutTitle = computed(() => this.t('i18n.Setup.S1.aboutTitle', this.params()));
  readonly s1IncludesTitle = computed(() => this.t('i18n.Setup.S1.includesTitle', this.params()));
  readonly aboutText = computed(() => this.t(`i18n.Models.${this.templateId}.about`));

  /** Cosa il modello può includere (parti corpo/sezione, fino a 4 + "e molto altro"). */
  readonly includes = computed<IncludeChip[]>(() => {
    const tpl = this.template();
    if (!tpl) {
      return [];
    }
    return tpl.parts
      .filter((p) => (p.group === 'body' || p.group === 'section') && p.includedByDefault)
      .slice(0, MAX_CHIPS)
      .map((p) => ({
        label: this.t(p.labelKey),
        icon: PART_ICON[p.key] ?? 'article',
        tone: GROUP_TONE[p.group],
      }));
  });

  back(): void {
    void this.router.navigate(['/create']);
  }
}
