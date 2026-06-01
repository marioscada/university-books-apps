import { SiteNavItem } from '../layout/site-header-nav/site-header-nav.types';
import { FooterColumn } from '../layout/site-footer-block/site-footer-block.types';

/**
 * Navigazione del sito — SINGLE SOURCE OF TRUTH condivisa da landing (pubblica)
 * e shell autenticata. Evita la duplicazione delle voci tra le pagine.
 * Le voci `authOnly` nel footer compaiono solo dopo login (vedi
 * `SiteFooterBlockComponent.showAuthOnly`).
 */

export const BRAND = 'AI Book Generator';

/** Route principali dell'area app (Home = dashboard, prima voce). */
export const APP_NAV_ITEMS: readonly SiteNavItem[] = [
  { id: 'home', label: 'Home', route: '/home', icon: 'home' },
  { id: 'create', label: 'Create', route: '/create', icon: 'add_circle' },
  { id: 'collection', label: 'Collection', route: '/collection', icon: 'collections_bookmark' },
  { id: 'library', label: 'Library', route: '/library', icon: 'local_library' },
  { id: 'templates', label: 'Templates', route: '/templates', icon: 'dashboard_customize' },
  { id: 'pricing', label: 'Pricing', route: '/pricing', icon: 'sell' },
];

/** Colonne del footer (uniche per tutto il sito; authOnly filtrate in landing). */
export const APP_FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Product',
    items: [
      { label: 'Home', route: '/home', authOnly: true },
      { label: 'Create', route: '/create', authOnly: true },
      { label: 'Collection', route: '/collection', authOnly: true },
      { label: 'Library', route: '/library', authOnly: true },
      { label: 'Templates', route: '/templates', authOnly: true },
      { label: 'Pricing', route: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'About', route: '/about' },
      { label: 'Contact', route: '/contact' },
      { label: 'Privacy', route: '/privacy' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Terms', route: '/terms' },
      { label: 'Cookie Policy', route: '/cookie' },
      { label: 'Imprint', route: '/imprint' },
    ],
  },
];
