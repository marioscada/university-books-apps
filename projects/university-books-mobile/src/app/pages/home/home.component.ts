import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly router = inject(Router);

  /**
   * Dashboard cards matching navigation menu items
   */
  public readonly dashboardCards: DashboardCard[] = [
    {
      id: 'my-books',
      title: 'My Books',
      description: 'View and manage your book projects',
      icon: 'book',
      route: '/books',
      badge: 3
    },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      description: 'Generate content with AI assistance',
      icon: 'bulb',
      route: '/ai-studio'
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Start from pre-built book templates',
      icon: 'document-text',
      route: '/templates'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Access reference materials and research',
      icon: 'library',
      route: '/library'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account and preferences',
      icon: 'settings',
      route: '/settings'
    }
  ];

  /**
   * Navigate to a specific route
   */
  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
