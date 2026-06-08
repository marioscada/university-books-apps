import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';
import { AuthLayoutComponent } from './shared/layout/auth-layout/auth-layout.component';

/**
 * Routing dell'app.
 * Pubblico: `/landing` (vetrina) + `/auth`.
 * Autenticato: gruppo di rotte FIGLIE sotto `AuthLayout`, che monta lo shell
 * (header/profilo/mobile menu/footer) UNA volta con `<router-outlet>` dentro;
 * `authGuard` applicato una sola volta sul layout. Le schermate di flusso
 * task-focused (create/new, Studio) impostano `data.showFooter:false`.
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
  // Area autenticata: AuthLayout = shell + <router-outlet>; guard una volta sola.
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        // Home post-login: lavori in corso da continuare + avvio di nuovi.
        path: 'create',
        loadComponent: () =>
          import('./pages/create/create.component').then((m) => m.CreateComponent),
        title: 'Create - AI Book Generator',
      },
      {
        // Personalizza il modello — struttura + impostazioni + anteprima (?template=:id).
        path: 'create/new',
        loadComponent: () =>
          import('./pages/model-setup/model-setup.component').then((m) => m.ModelSetupComponent),
        title: 'New project - AI Book Generator',
        data: { showFooter: false },
      },
      {
        // Project Workspace — shell dinamica per stato (state machine §2).
        path: 'project/:id',
        loadComponent: () =>
          import('./pages/project/project-workspace.component').then(
            (m) => m.ProjectWorkspaceComponent,
          ),
        title: 'Project - AI Book Generator',
        data: { showFooter: false },
      },
      {
        // Collezione: archivio storico (solo completati) per categoria.
        path: 'collection',
        loadComponent: () =>
          import('./pages/collection/collection.component').then((m) => m.CollectionComponent),
        title: 'Collection - AI Book Generator',
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
        title: 'Pricing - AI Book Generator',
      },
    ],
  },
  {
    // Catch-all: ogni path sconosciuto torna alla landing.
    path: '**',
    redirectTo: '/landing',
  },
];
