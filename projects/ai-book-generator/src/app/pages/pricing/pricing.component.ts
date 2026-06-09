import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { PlanCardComponent, type CtaTone } from '../../shared/ui/plan-card/plan-card.component';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  secondaryNote?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaTone: CtaTone;
  highlighted?: boolean;
  badge?: string;
}

/**
 * Pricing — piani prezzi (Singolo / Mensile / Annuale). Usa AuthShell + il dumb
 * `plan-card` (riuso). Dati mock; il CTA avvia il checkout (mock → auth).
 */
@Component({
  selector: 'app-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, PlanCardComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private readonly router = inject(Router);

  readonly plans: readonly PricingPlan[] = [
    {
      id: 'single',
      name: 'Singolo',
      price: '€39',
      period: '/ progetto',
      tagline: 'Un libro completo, quando ti serve. Nessun impegno.',
      features: [
        '1 libro completo',
        'Tutti i formati: PDF · DOCX · EPUB',
        'Fonti illimitate per progetto',
        'Indice e capitoli rigenerabili in revisione',
        'Download del file per sempre',
      ],
      cta: 'Acquista un progetto',
      ctaTone: 'outline',
    },
    {
      id: 'monthly',
      name: 'Mensile',
      price: '€139',
      period: '/ mese',
      tagline: '4 progetti ogni mese. Per chi pubblica con costanza.',
      features: [
        '4 progetti al mese',
        'Tutto del piano Singolo',
        '≈ 11% di risparmio per progetto',
        'Coda di generazione prioritaria',
        'Disdici quando vuoi',
      ],
      cta: 'Abbonati',
      ctaTone: 'primary',
      highlighted: true,
      badge: 'Più scelto',
    },
    {
      id: 'annual',
      name: 'Annuale',
      price: '€1.390',
      period: '/ anno',
      originalPrice: '€1.668',
      secondaryNote: '≈ 2 mesi in omaggio',
      tagline: '48 progetti l’anno. Il massimo risparmio.',
      features: [
        '48 progetti l’anno',
        'Tutto del piano Mensile',
        '≈ 2 mesi in omaggio',
        'Prezzo per progetto più basso',
        'Fatturazione annuale',
      ],
      cta: 'Abbonati e risparmia',
      ctaTone: 'outline',
    },
  ];

  choose(_id: string): void {
    // Mock: il checkout reale richiede auth/billing (backend).
    void this.router.navigate(['/auth/login']);
  }
}
