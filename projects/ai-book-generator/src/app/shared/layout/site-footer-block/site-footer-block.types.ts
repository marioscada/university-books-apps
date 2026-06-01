/**
 * Modello del footer (dark surface). Allineato a mariosite, senza i18n.
 */
export interface FooterColumnItem {
  /** Etichetta del link. */
  label: string;
  /** Route interna (routerLink) oppure URL esterno (href). */
  route?: string;
  href?: string;
  /**
   * Se true, la voce è visibile SOLO in contesto autenticato (es. Create,
   * Projects, Library). In landing pubblica viene nascosta. Vedi
   * `SiteFooterBlockComponent.showAuthOnly`.
   */
  authOnly?: boolean;
}

export interface FooterColumn {
  /** Titolo della colonna. */
  title: string;
  /** Voci della colonna. */
  items: FooterColumnItem[];
}
