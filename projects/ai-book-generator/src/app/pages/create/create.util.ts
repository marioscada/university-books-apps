import type { ChoiceTone } from '../../shared/components-v2/choice-card/choice-card.component';
import type { ProjectTemplate } from '../../core/domain';

/** Dati pronti per una card della galleria (i18n già risolto dal chiamante). */
export interface ModelChoice {
  id: string;
  /** Icona Material di fallback (se manca l'immagine). */
  icon: string;
  /** Immagine 3D dell'icona (vuoto = usa `icon`). */
  imageSrc: string;
  tone: ChoiceTone;
  heading: string;
  description: string;
  /** Tag (già tradotti) mostrati come chip a tono. */
  tags: string[];
}

/**
 * Presentazione per modello: immagine icona (in `public/images/models/<img>.png`),
 * icona Material di fallback e tono cromatico (dai token globali). I testi e i tag
 * sono i18n (`i18n.Models.<id>.{name,desc,tags}`), risolti in `toModelChoices`.
 */
const MODEL_PRESENTATION: Record<string, { img: string; icon: string; tone: ChoiceTone }> = {
  book: { img: 'book', icon: 'menu_book', tone: 'violet' },
  summary: { img: 'summary', icon: 'short_text', tone: 'success' },
  thesis: { img: 'thesis', icon: 'school', tone: 'amber' },
  manual: { img: 'manual', icon: 'menu_book', tone: 'neutral' },
  report: { img: 'report', icon: 'analytics', tone: 'violet' },
  presentation: { img: 'presentation', icon: 'slideshow', tone: 'warning' },
  study_guide: { img: 'study_guide', icon: 'science', tone: 'rose' },
  course: { img: 'course', icon: 'history_edu', tone: 'amber' },
  custom: { img: 'custom', icon: 'translate', tone: 'info' },
};

const FALLBACK = { img: '', icon: 'description', tone: 'neutral' as ChoiceTone };

/**
 * Mappa i modelli (template immutabili) nelle card della galleria, risolvendo
 * l'i18n tramite il resolver `t`. I tag sono una stringa i18n separata da `|`
 * (numero variabile, traducibile). Funzione pura, testabile in isolamento.
 */
export function toModelChoices(
  templates: readonly ProjectTemplate[],
  t: (key: string) => string,
): ModelChoice[] {
  return templates.map((tpl) => {
    const v = MODEL_PRESENTATION[tpl.id] ?? FALLBACK;
    const tags = t(`i18n.Models.${tpl.id}.tags`)
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      id: tpl.id,
      icon: v.icon,
      imageSrc: v.img ? `images/models/${v.img}.png` : '',
      tone: v.tone,
      heading: t(tpl.nameKey),
      description: t(tpl.descKey),
      tags,
    };
  });
}
