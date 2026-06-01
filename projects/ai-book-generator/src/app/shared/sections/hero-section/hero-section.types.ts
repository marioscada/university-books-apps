/**
 * Dati dell'hero di pagina (prima sezione, full-width con immagine + scrim).
 * Shape allineata a mariosite, semplificata (niente i18n).
 */
export interface HeroCta {
  /** Etichetta del bottone. */
  label: string;
  /** Route Angular (routerLink). */
  route: string;
}

export interface HeroSectionData {
  /** Id anchor di scroll. */
  sectionId?: string;
  /** Aria-label della sezione. */
  ariaLabel?: string;
  /** Immagine di sfondo (path /public o URL). */
  imageSrc?: string;
  /** Alt dell'immagine. */
  imageAlt?: string;
  /** Eyebrow sopra il titolo. */
  eyebrow?: string;
  /** Titolo principale. */
  title: string;
  /** Sottotitolo opzionale. */
  subtitle?: string;
  /** CTA opzionale. */
  cta?: HeroCta;
}
