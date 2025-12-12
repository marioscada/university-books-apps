/**
 * Navigation Item Interface
 *
 * Represents a single navigation menu item with all its properties.
 * Used for both mobile and desktop navigation rendering.
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;

  /** Display label shown in the menu */
  label: string;

  /** Ionic icon name (see https://ionic.io/ionicons) */
  icon: string;

  /** Route path for navigation */
  route: string;

  /** Optional badge count (e.g., notifications, unread items) */
  badge?: number;

  /** Optional nested children items (for future hierarchical navigation) */
  children?: NavigationItem[];
}

/**
 * Default Navigation Items
 *
 * Main navigation menu items for the application.
 * These items are displayed in both mobile menu and desktop sidebar.
 *
 * Navigation structure based on best practices from leading AI content creation platforms:
 * - Dashboard (overview and quick actions)
 * - My Books (main workspace for projects)
 * - AI Studio (dedicated AI content generation workspace)
 * - Templates (pre-built structures for different book types)
 * - Library (reference materials and research)
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    route: '/home'
  },
  {
    id: 'my-books',
    label: 'My Books',
    icon: 'book',
    route: '/my-books'
  },
  {
    id: 'my-activity',
    label: 'My Activity',
    icon: 'time',
    route: '/activity'
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    icon: 'bulb',
    route: '/ai-studio'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'document-text',
    route: '/templates'
  },
  {
    id: 'library',
    label: 'Library',
    icon: 'library',
    route: '/library'
  }
] as const;
