import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly responsive = inject(ResponsiveService);

  // Responsive signals
  public readonly isMobile = this.responsive.isMobile;
}
