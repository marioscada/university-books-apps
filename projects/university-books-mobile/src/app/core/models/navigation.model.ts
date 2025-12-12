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
 * Navigation structure:
 * - Home (dashboard and quick actions)
 * - My Books (main workspace for projects)
 * - AI Studio (dedicated AI content generation workspace)
 * - Templates (pre-built structures for different book types)
 * - Study Materials (reference materials and research)
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline',
    route: '/home'
  },
  {
    id: 'my-books',
    label: 'My Books',
    icon: 'book-outline',
    route: '/my-books'
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    icon: 'bulb-outline',
    route: '/ai-studio'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'document-text-outline',
    route: '/templates'
  },
  {
    id: 'library',
    label: 'Study Materials',
    icon: 'library-outline',
    route: '/library'
  }
] as const;
