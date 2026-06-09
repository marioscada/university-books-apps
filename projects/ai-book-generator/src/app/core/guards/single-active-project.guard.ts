import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { ProjectsStore } from '../state/projects.store';

/**
 * Single-active-project guard — vincolo "**un progetto alla volta fino alla
 * pubblicazione**". Se esiste un progetto NON pubblicato (ACTIVE_STATUSES:
 * draft/queued/processing/review/failed), la galleria `/create` è preclusa e si
 * viene reindirizzati allo Studio di quel progetto (al punto in cui è). Solo
 * quando non c'è alcun progetto attivo si può iniziare una nuova creazione.
 *
 * Applicato centralmente sulla rotta `/create`: vale per ogni accesso (header,
 * menu mobile, logo, URL diretto). Attende `ensureLoaded()` così la decisione
 * non parte mai su dati non ancora caricati.
 */
export const singleActiveProjectGuard: CanActivateFn = async () => {
  const store = inject(ProjectsStore);
  const router = inject(Router);

  await store.ensureLoaded();

  const active = store.activeProjects()[0];
  return active ? router.createUrlTree(['/project', active.id]) : true;
};
