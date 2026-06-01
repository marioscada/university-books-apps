import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  /** Piano evidenziato (consigliato). */
  featured?: boolean;
}

/**
 * Pricing — abbonamenti. Usa AuthShell. Dati mock. Vedi
 * docs/CREATE-PAGE-DESIGN.md.
 */
@Component({
  selector: 'app-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, RouterLink, MatIconModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  readonly plans: readonly PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '€0',
      period: '/mese',
      description: 'Per provare la generazione AI.',
      features: ['1 progetto', '20 MB di storage'],
      cta: 'Inizia gratis',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '€19',
      period: '/mese',
      description: 'Per uso regolare e professionale.',
      features: ['Generazioni illimitate', 'PDF Export', 'Advanced AI'],
      cta: 'Passa a Pro',
      featured: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '€49',
      period: '/mese',
      description: 'Per team e aziende.',
      features: ['Tutto di Pro', 'Collaborazione', 'Workspace condivisi'],
      cta: 'Contattaci',
    },
  ];
}
