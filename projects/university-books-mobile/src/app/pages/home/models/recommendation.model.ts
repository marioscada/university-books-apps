/**
 * Recommendation Model
 *
 * Represents an AI-generated suggestion or recommended action.
 * Used in RecommendationsComponent for sidebar suggestions.
 *
 * @example
 * ```typescript
 * const recommendation: Recommendation = {
 *   id: 'rec-1',
 *   title: 'Complete Chapter 5',
 *   description: 'You left off at section 3 of Chapter 5',
 *   icon: 'document-text-outline',
 *   action: 'Continue',
 *   metadata: 'Last edited 2 hours ago',
 *   route: '/books/my-book/chapters/5'
 * };
 * ```
 */
export interface Recommendation {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Recommendation title
   */
  title: string;

  /**
   * Detailed description
   */
  description: string;

  /**
   * Ionicons icon name
   */
  icon: string;

  /**
   * Call-to-action text
   */
  action: string;

  /**
   * Optional metadata (e.g. "2 hours ago")
   */
  metadata?: string;

  /**
   * Optional navigation route
   */
  route?: string;

  /**
   * Optional priority level (for sorting)
   */
  priority?: 'high' | 'medium' | 'low';
}
