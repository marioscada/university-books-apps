import { SiteNavItem } from '../layout/site-header-nav/site-header-nav.types';
import { FooterColumn } from '../layout/site-footer-block/site-footer-block.types';

/**
 * Navigazione del sito — SINGLE SOURCE OF TRUTH condivisa da landing (pubblica)
 * e shell autenticata. Evita la duplicazione delle voci tra le pagine.
 * Le voci `authOnly` nel footer compaiono solo dopo login (vedi
 * `SiteFooterBlockComponent.showAuthOnly`).
 */

export const BRAND = 'AI Book Generator';

/**
 * Route principali dell'area app. `label` = CHIAVE i18n (risolta con `| translate`
 * nei template di header/mobile-menu/footer).
 */
export const APP_NAV_ITEMS: readonly SiteNavItem[] = [
  { id: 'create', label: 'i18n.Header.Nav.create', route: '/create', icon: 'add_circle' },
  { id: 'collection', label: 'i18n.Header.Nav.collection', route: '/collection', icon: 'collections_bookmark' },
  { id: 'library', label: 'i18n.Header.Nav.library', route: '/library', icon: 'local_library' },
  { id: 'pricing', label: 'i18n.Header.Nav.pricing', route: '/pricing', icon: 'sell' },
];

/** Colonne del footer (label/title = chiavi i18n; authOnly filtrate in landing). */
export const APP_FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'i18n.Footer.Product.title',
    items: [
      { label: 'i18n.Header.Nav.create', route: '/create', authOnly: true },
      { label: 'i18n.Header.Nav.collection', route: '/collection', authOnly: true },
      { label: 'i18n.Header.Nav.library', route: '/library', authOnly: true },
      { label: 'i18n.Header.Nav.pricing', route: '/pricing' },
    ],
  },
  {
    title: 'i18n.Footer.Resources.title',
    items: [
      { label: 'i18n.Footer.Resources.about', route: '/about' },
      { label: 'i18n.Footer.Resources.contact', route: '/contact' },
      { label: 'i18n.Footer.Resources.privacy', route: '/privacy' },
    ],
  },
  {
    title: 'i18n.Footer.Legal.title',
    items: [
      { label: 'i18n.Footer.Legal.terms', route: '/terms' },
      { label: 'i18n.Footer.Legal.cookie', route: '/cookie' },
      { label: 'i18n.Footer.Legal.imprint', route: '/imprint' },
    ],
  },
];
