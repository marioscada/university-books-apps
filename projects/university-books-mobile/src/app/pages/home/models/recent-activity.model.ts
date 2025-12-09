/**
 * Recent Activity Item
 *
 * Represents a recent book activity for the user.
 * Used to display recent edits, views, or interactions with books.
 */
export interface RecentActivity {
  /** Unique identifier */
  id: string;

  /** Book title */
  title: string;

  /** Book author */
  author?: string;

  /** Activity type (e.g., 'edited', 'viewed', 'created') */
  activityType: 'edited' | 'viewed' | 'created' | 'deleted';

  /** Timestamp of the activity */
  timestamp: Date;

  /** Optional book cover image URL */
  coverUrl?: string;

  /** Optional preview text or last edited content */
  preview?: string;

  /** Route to navigate to the book */
  route: string;

  /** Optional badge (e.g., 'Draft', 'Published') */
  badge?: string;

  /** Badge color theme */
  badgeColor?: 'success' | 'warning' | 'danger' | 'primary';
}
