/**
 * Dati di una sezione di contenuto (blocco sotto l'hero).
 * Shape allineata a ContentSectionData di mariosite (semplificata: niente i18n).
 */
export type ContentSectionLayout = 'text-left' | 'text-right' | 'centered' | 'text-only';

export interface ContentSectionMedia {
  /** Sorgente immagine (path in /public o URL assoluto). */
  src: string;
  /** Testo alternativo per accessibilità. */
  alt: string;
  /** Applica grayscale all'immagine. */
  grayscale?: boolean;
}

export interface ContentSectionCta {
  /** Etichetta del bottone. */
  label: string;
  /** Route Angular (routerLink) di destinazione. */
  route: string;
}

export interface ContentSectionData {
  /** Id usato come anchor di scroll (`section[id]`). */
  id: string;
  /** Eyebrow opzionale sopra il titolo. */
  eyebrow?: string;
  /** Titolo della sezione. */
  title: string;
  /** Sottotitolo opzionale. */
  subtitle?: string;
  /** Corpo testo. */
  body?: string;
  /** Layout: testo sx/dx, centrato, o solo testo. Default 'text-left'. */
  layout?: ContentSectionLayout;
  /** Media opzionale (immagine). */
  media?: ContentSectionMedia;
  /** CTA opzionale. */
  cta?: ContentSectionCta;
}
