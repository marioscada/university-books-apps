import { Routes } from '@angular/router';
// import { authGuard } from './auth/guards/auth.guard'; // TEMPORANEO (dev): vedi sotto
import { guestGuard } from './auth/guards/guest.guard';

/**
 * Routing dell'app.
 * Pubblico: /landing (vetrina) + /auth.
 * Autenticato (area app): /home (dashboard) + /create + /projects + /library +
 * /templates + /pricing.
 *
 * ⚠️ TEMPORANEO (dev): authGuard staccato sulle route autenticate per navigare
 * senza login mentre si recuperano le credenziali Cognito. RIPRISTINARE
 * `canActivate: [authGuard]` (e l'import) prima del rilascio.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full',
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    title: 'AI Book Generator - Trasforma il tuo materiale in un libro',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
    canActivate: [guestGuard],
  },
  {
    // Dashboard privata: prima pagina dopo il login.
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Dashboard - AI Book Generator',
  },
  {
    // Il cuore del prodotto: wizard di generazione.
    path: 'create',
    loadComponent: () => import('./pages/create/create.component').then((m) => m.CreateComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Create - AI Book Generator',
  },
  {
    // Collezione: archivio storico (solo completati) per categoria.
    path: 'collection',
    loadComponent: () => import('./pages/collection/collection.component').then((m) => m.CollectionComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Collection - AI Book Generator',
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library.component').then((m) => m.LibraryComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Library - AI Book Generator',
  },
  {
    path: 'templates',
    loadComponent: () => import('./pages/templates/templates.component').then((m) => m.TemplatesComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Templates - AI Book Generator',
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
    // canActivate: [authGuard], // TODO ripristinare
    title: 'Pricing - AI Book Generator',
  },
  {
    // Catch-all: ogni path sconosciuto torna alla landing.
    path: '**',
    redirectTo: '/landing',
  },
];
