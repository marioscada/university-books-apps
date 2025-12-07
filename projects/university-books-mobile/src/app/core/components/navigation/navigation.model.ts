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
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: 'home',
    route: '/home'
  },
  {
    id: 'books',
    label: 'My Books',
    icon: 'book',
    route: '/books',
    badge: 3
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'search',
    route: '/search'
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: 'heart',
    route: '/favorites'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person',
    route: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/settings'
  }
] as const;
