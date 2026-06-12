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
// Ogni modello ha un pastello DISTINTO (nessun tono ripetuto): il colore
// distingue il modello in galleria e nella pagina di setup.
const MODEL_PRESENTATION: Record<string, { img: string; icon: string; tone: ChoiceTone }> = {
  book: { img: 'book', icon: 'menu_book', tone: 'violet' },
  summary: { img: 'summary', icon: 'short_text', tone: 'success' },
  thesis: { img: 'thesis', icon: 'school', tone: 'amber' },
  course: { img: 'course', icon: 'history_edu', tone: 'indigo' },
  manual: { img: 'manual', icon: 'menu_book', tone: 'teal' },
  presentation: { img: 'presentation', icon: 'slideshow', tone: 'warning' },
};

const FALLBACK = { img: '', icon: 'description', tone: 'neutral' as ChoiceTone };

/** Presentazione del modello (immagine 3D, icona di fallback, tono cromatico). */
export interface ModelPresentation {
  /** Path dell'immagine 3D (vuoto = nessuna immagine, usa `icon`). */
  imageSrc: string;
  /** Icona Material di fallback. */
  icon: string;
  /** Tono cromatico (dai token globali `--tone-*`). */
  tone: ChoiceTone;
}

/**
 * Sorgente UNICA della presentazione di un modello (immagine + icona + tono):
 * la usano sia la galleria (`toModelChoices`) sia la pagina di setup, così
 * immagine e colori del modello si aggiornano da un solo punto.
 */
export function modelPresentation(id: string): ModelPresentation {
  const v = MODEL_PRESENTATION[id] ?? FALLBACK;
  return { imageSrc: v.img ? `images/models/${v.img}.png` : '', icon: v.icon, tone: v.tone };
}

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
    const v = modelPresentation(tpl.id);
    const tags = t(`i18n.Models.${tpl.id}.tags`)
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      id: tpl.id,
      icon: v.icon,
      imageSrc: v.imageSrc,
      tone: v.tone,
      heading: t(tpl.nameKey),
      description: t(tpl.descKey),
      tags,
    };
  });
}
