import type { SearchItem } from '../../core/models/search-item.model';

/**
 * Mock search items — SINGLE SOURCE per lo sviluppo, condivisa dalla shell
 * autenticata. TODO: sostituire con i risultati reali dall'API di ricerca.
 * Estratti da AppShellComponent per evitare duplicazione (DRY).
 */
export const MOCK_SEARCH_ITEMS: readonly SearchItem[] = [
  {
    id: '1',
    category: 'books',
    title: 'Introduction to Computer Science',
    subtitle: 'Complete guide for beginners',
    metadata: 'Updated 2 days ago',
    icon: 'book',
    badge: 'New',
    badgeColor: 'success',
  },
  {
    id: '2',
    category: 'books',
    title: 'Advanced JavaScript Patterns',
    subtitle: 'Design patterns and best practices',
    metadata: '15 chapters • 250 pages',
    icon: 'book',
  },
  {
    id: '3',
    category: 'chapters',
    title: 'Data Structures',
    subtitle: 'Introduction to Computer Science',
    metadata: 'Chapter 5',
    icon: 'article',
  },
  {
    id: '4',
    category: 'chapters',
    title: 'Async Patterns',
    subtitle: 'Advanced JavaScript Patterns',
    metadata: 'Chapter 12',
    icon: 'article',
    badge: 'Draft',
    badgeColor: 'warning',
  },
  {
    id: '5',
    category: 'documents',
    title: 'Project Requirements',
    subtitle: 'Technical specifications',
    metadata: 'Last modified yesterday',
    icon: 'description',
  },
  {
    id: '6',
    category: 'users',
    title: 'John Doe',
    subtitle: 'john.doe@example.com',
    metadata: 'Collaborator',
    icon: 'person',
  },
];
