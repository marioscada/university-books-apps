import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, map } from 'rxjs';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import {
  ChoiceCardComponent,
  type ChoiceTone,
} from '../../shared/components-v2/choice-card/choice-card.component';
import { TemplatesStore } from '../../core/state/templates.store';
import type { ProjectTemplate } from '../../core/domain';

/** Dati pronti per una card della galleria (i18n già risolto dal padre). */
interface ModelChoice {
  id: string;
  icon: string;
  tone: ChoiceTone;
  heading: string;
  description: string;
  meter: number;
  note: string;
}

/** Presentazione per modello: icona, tono, intensità del meter (0–3). */
const MODEL_PRESENTATION: Record<string, { icon: string; tone: ChoiceTone; meter: number }> = {
  book: { icon: 'menu_book', tone: 'info', meter: 3 },
  summary: { icon: 'short_text', tone: 'success', meter: 1 },
  study_guide: { icon: 'school', tone: 'amber', meter: 2 },
  manual: { icon: 'build', tone: 'violet', meter: 3 },
  report: { icon: 'analytics', tone: 'violet', meter: 2 },
  presentation: { icon: 'slideshow', tone: 'warning', meter: 2 },
  course: { icon: 'cast_for_education', tone: 'rose', meter: 3 },
  thesis: { icon: 'history_edu', tone: 'success', meter: 2 },
  custom: { icon: 'tune', tone: 'neutral', meter: 3 },
};

const FALLBACK = { icon: 'description', tone: 'neutral' as ChoiceTone, meter: 0 };
const METER_MAX = 3;

/**
 * Create — pagina "Crea un nuovo progetto": intestazione + callout informativo +
 * **galleria di modelli** resa iterando il componente dumb `ChoiceCard` dai dati
 * del `TemplatesStore`. Scegliere un modello apre la personalizzazione
 * (`/create/new?template=<id>`). Tutta la presentazione è preparata qui (i18n
 * risolto), il componente card resta agnostico dal dominio.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, ChoiceCardComponent, MatIconModule, TranslateModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly translate = inject(TranslateService);

  /** Tick i18n: ricalcola le card al cambio lingua / caricamento traduzioni. */
  private readonly i18nTick = toSignal(
    merge(
      this.translate.onLangChange,
      this.translate.onTranslationChange,
      this.translate.onDefaultLangChange,
    ).pipe(map(() => Symbol())),
    { initialValue: Symbol() },
  );

  private t(key: string): string {
    this.i18nTick();
    return this.translate.instant(key);
  }

  readonly meterMax = METER_MAX;
  readonly shortLabel = computed(() => this.t('i18n.Create.short'));
  readonly longLabel = computed(() => this.t('i18n.Create.long'));

  /** Card della galleria, una per modello, con l'i18n già risolto. */
  readonly cards = computed<ModelChoice[]>(() =>
    this.templatesStore.templates().map((tpl: ProjectTemplate) => {
      const v = MODEL_PRESENTATION[tpl.id] ?? FALLBACK;
      return {
        id: tpl.id,
        icon: v.icon,
        tone: v.tone,
        meter: v.meter,
        heading: this.t(tpl.nameKey),
        description: this.t(tpl.descKey),
        note: this.t(`i18n.Models.${tpl.id}.note`),
      };
    }),
  );

  /** Scelto un modello → pagina di personalizzazione. */
  chooseModel(id: string): void {
    void this.router.navigate(['/create/new'], { queryParams: { template: id } });
  }
}
