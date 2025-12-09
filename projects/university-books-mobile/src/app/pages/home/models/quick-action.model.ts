/**
 * Quick Action Model
 *
 * Represents a clickable action card in the dashboard.
 * Used in QuickActionsComponent for navigation shortcuts.
 *
 * @example
 * ```typescript
 * const action: QuickAction = {
 *   id: 'books',
 *   title: 'My Books',
 *   description: 'View and manage your book projects',
 *   icon: 'book-outline',
 *   route: '/books',
 *   badge: '3',
 *   badgeColor: 'success'
 * };
 * ```
 */
export interface QuickAction {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display title
   */
  title: string;

  /**
   * Short description
   */
  description: string;

  /**
   * Ionicons icon name
   */
  icon: string;

  /**
   * Navigation route
   */
  route: string;

  /**
   * Optional badge text (e.g. notification count)
   */
  badge?: string;

  /**
   * Badge color variant
   */
  badgeColor?: 'success' | 'warning' | 'danger' | 'primary';
}
