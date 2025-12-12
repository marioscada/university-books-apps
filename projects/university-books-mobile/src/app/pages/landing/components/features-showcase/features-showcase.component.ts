import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Feature Interface
 *
 * Represents a single feature section in the showcase.
 */
export interface Feature {
  /** Unique identifier */
  id: string;

  /** Feature title */
  title: string;

  /** Feature description */
  description: string;

  /** Background image URL */
  image: string;
}

/**
 * Features Showcase Component
 *
 * Presentational component displaying 4 feature sections.
 * Each section is full-viewport (100vh desktop, 50vh mobile) with:
 * - Full-width background image
 * - Centered content (max-width 1200px)
 * - Title + description
 *
 * Design Pattern: Presentational component with signal-based state
 *
 * UX Principles:
 * - Visual storytelling through images
 * - Clear, benefit-driven messaging
 * - Consistent layout pattern
 * - Smooth scroll between sections
 */
@Component({
  selector: 'app-features-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-showcase.component.html',
  styleUrls: ['./features-showcase.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesShowcaseComponent {
  /**
   * Features to display
   * Signal-based for reactive updates
   */
  readonly features = signal<Feature[]>([
    {
      id: 'my-books',
      title: 'My Books',
      description:
        'Create and manage your book projects with powerful editing tools. ' +
        'Organize chapters, track progress, and collaborate with ease.',
      image:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000',
    },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      description:
        'Generate content with AI assistance. Write faster, smarter. ' +
        'Let AI help you overcome writer\'s block and refine your ideas.',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000',
    },
    {
      id: 'templates',
      title: 'Templates',
      description:
        'Start from pre-built book templates. Save time, maintain consistency. ' +
        'Choose from academic, technical, and creative formats.',
      image:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2000',
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      description:
        'Access reference materials and research resources in one place. ' +
        'Build your library of knowledge and citations.',
      image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000',
    },
  ]);
}
