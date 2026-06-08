import type { ChoiceTone } from '../../shared/components-v2/choice-card/choice-card.component';
import type { ProjectTemplate } from '../../core/domain';

/** Dati pronti per una card della galleria (i18n già risolto dal chiamante). */
export interface ModelChoice {
  id: string;
  icon: string;
  tone: ChoiceTone;
  heading: string;
  description: string;
  meter: number;
  note: string;
}

/** Intensità massima del meter (0–3). */
export const METER_MAX = 3;

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

/**
 * Mappa i modelli (template immutabili) nelle card della galleria, risolvendo
 * l'i18n tramite il resolver `t` passato dal componente. Funzione pura:
 * nessuna dipendenza da Angular, testabile in isolamento.
 */
export function toModelChoices(
  templates: readonly ProjectTemplate[],
  t: (key: string) => string,
): ModelChoice[] {
  return templates.map((tpl) => {
    const v = MODEL_PRESENTATION[tpl.id] ?? FALLBACK;
    return {
      id: tpl.id,
      icon: v.icon,
      tone: v.tone,
      meter: v.meter,
      heading: t(tpl.nameKey),
      description: t(tpl.descKey),
      note: t(`i18n.Models.${tpl.id}.note`),
    };
  });
}
