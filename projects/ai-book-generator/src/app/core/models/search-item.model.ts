/**
 * Search Item Category
 * GitHub-style categorization for search results
 */
export type SearchCategory = 'books' | 'chapters' | 'documents' | 'users';

/**
 * Search Item Model
 *
 * Generic, reusable model for search results.
 * Inspired by GitHub's search UX patterns.
 *
 * @example
 * ```typescript
 * const bookItem: SearchItem = {
 *   id: '123',
 *   category: 'books',
 *   title: 'Introduction to Computer Science',
 *   subtitle: 'Chapter 5: Data Structures',
 *   metadata: 'Updated 2 days ago',
 *   icon: 'book-outline',
 *   badge: 'New',
 *   badgeColor: 'success',
 *   data: { bookId: '123', chapterId: '456' }
 * };
 * ```
 */
export interface SearchItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Category for grouping results (GitHub-style)
   */
  category: SearchCategory;

  /**
   * Primary title/name
   */
  title: string;

  /**
   * Optional subtitle (e.g., chapter name, author)
   */
  subtitle?: string;

  /**
   * Optional metadata (e.g., "Updated 2 days ago", "5 chapters")
   */
  metadata?: string;

  /**
   * Icon name (Ionicons)
   */
  icon: string;

  /**
   * Optional badge text
   */
  badge?: string;

  /**
   * Optional badge color
   */
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'medium';

  /**
   * Optional data payload (domain-specific)
   * Can contain any additional data needed for navigation/actions
   */
  data?: unknown;
}

/**
 * Search Category Config
 * Configuration for rendering category sections
 */
export interface SearchCategoryConfig {
  key: SearchCategory;
  label: string;
  icon: string;
  emptyMessage: string;
}

/**
 * Default category configurations
 */
export const SEARCH_CATEGORY_CONFIGS: Record<SearchCategory, SearchCategoryConfig> = {
  books: {
    key: 'books',
    label: 'Books',
    icon: 'book-outline',
    emptyMessage: 'No books found',
  },
  chapters: {
    key: 'chapters',
    label: 'Chapters',
    icon: 'document-text-outline',
    emptyMessage: 'No chapters found',
  },
  documents: {
    key: 'documents',
    label: 'Documents',
    icon: 'document-outline',
    emptyMessage: 'No documents found',
  },
  users: {
    key: 'users',
    label: 'Users',
    icon: 'person-outline',
    emptyMessage: 'No users found',
  },
};
