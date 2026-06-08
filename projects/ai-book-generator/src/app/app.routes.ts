import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';

/**
 * Routing dell'app.
 * Pubblico: /landing (vetrina) + /auth.
 * Autenticato (area app): /create (home post-login: lavori in corso + nuovi) +
 * /collection + /pricing — protette da `authGuard` (login obbligatorio).
 * NB: i Templates non sono una pagina ma un componente usato dentro /create.
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
    // Home post-login: lavori in corso da continuare + avvio di nuovi.
    path: 'create',
    loadComponent: () => import('./pages/create/create.component').then((m) => m.CreateComponent),
    canActivate: [authGuard],
    title: 'Create - AI Book Generator',
  },
  {
    // Personalizza il modello — struttura + impostazioni + anteprima (?template=:id).
    path: 'create/new',
    loadComponent: () =>
      import('./pages/model-setup/model-setup.component').then(
        (m) => m.ModelSetupComponent,
      ),
    canActivate: [authGuard],
    title: 'New project - AI Book Generator',
  },
  {
    // Project Workspace — shell dinamica per stato (state machine §2).
    path: 'project/:id',
    loadComponent: () =>
      import('./pages/project/project-workspace.component').then(
        (m) => m.ProjectWorkspaceComponent,
      ),
    canActivate: [authGuard],
    title: 'Project - AI Book Generator',
  },
  {
    // Collezione: archivio storico (solo completati) per categoria.
    path: 'collection',
    loadComponent: () => import('./pages/collection/collection.component').then((m) => m.CollectionComponent),
    canActivate: [authGuard],
    title: 'Collection - AI Book Generator',
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
    canActivate: [authGuard],
    title: 'Pricing - AI Book Generator',
  },
  {
    // Catch-all: ogni path sconosciuto torna alla landing.
    path: '**',
    redirectTo: '/landing',
  },
];
