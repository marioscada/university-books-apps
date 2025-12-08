/**
 * User Statistics Model
 *
 * Represents aggregated user activity statistics.
 * Used in StatsWidgetComponent for dashboard metrics.
 *
 * @example
 * ```typescript
 * const stats: UserStats = {
 *   totalBooks: 12,
 *   totalChapters: 147,
 *   totalPages: 2894,
 *   lastActivity: new Date('2025-12-08')
 * };
 * ```
 */
export interface UserStats {
  /**
   * Total number of books created
   */
  totalBooks: number;

  /**
   * Total number of chapters across all books
   */
  totalChapters: number;

  /**
   * Total number of pages written
   */
  totalPages: number;

  /**
   * Timestamp of last user activity
   */
  lastActivity: Date;

  /**
   * Optional: Words written this week
   */
  wordsThisWeek?: number;

  /**
   * Optional: Writing streak (consecutive days)
   */
  writingStreak?: number;
}
