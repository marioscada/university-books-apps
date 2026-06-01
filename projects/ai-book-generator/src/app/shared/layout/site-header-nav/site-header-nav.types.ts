/**
 * Voce di navigazione dell'header / menu mobile.
 * Compatibile con NavigationItem (core/models/navigation.model.ts): in Fase 2
 * si può mappare NAVIGATION_ITEMS → SiteNavItem (rinominando le icone in
 * Material Symbols). Vedi docs/MIGRATION-TO-WEBSITE.md §6.
 */
export interface SiteNavItem {
  /** Id univoco. */
  id: string;
  /** Etichetta visibile. */
  label: string;
  /** Route Angular (routerLink). */
  route: string;
  /** Nome icona Material Symbols (opzionale). */
  icon?: string;
}
