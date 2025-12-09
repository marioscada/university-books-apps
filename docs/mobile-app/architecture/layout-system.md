# Layout System Architecture

## Overview

The application uses a **Two-Level Layout Architecture** following enterprise-standard patterns from Google Angular Material Shell, SAP Fiori, Salesforce Lightning, and Microsoft App Shell.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ AppShell (GLOBAL LAYER)                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TopAppBar (Logo, Search, Avatar)                    │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌────┐ ┌──────────────────────────────────────────┐   │
│ │    │ │ <router-outlet>                          │   │
│ │ N  │ │  ┌────────────────────────────────────┐  │   │
│ │ a  │ │  │ PageLayout (PAGE LAYER)            │  │   │
│ │ v  │ │  │ ┌────────────────────────────────┐ │  │   │
│ │    │ │  │ │ Header (section="header")      │ │  │   │
│ │ D  │ │  │ ├────────────────────────────────┤ │  │   │
│ │ r  │ │  │ │ Content (section="content")    │ │  │   │
│ │ a  │ │  │ ├────────────────────────────────┤ │  │   │
│ │ w  │ │  │ │ Footer (section="footer")      │ │  │   │
│ │ e  │ │  │ └────────────────────────────────┘ │  │   │
│ │ r  │ │  └────────────────────────────────────┘  │   │
│ └────┘ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: AppShell (Global Layout)

### Purpose
Application-wide layout wrapper that provides consistent chrome across all authenticated pages.

### Location
`/core/layout/app-shell/`

### Responsibilities
- **Smart Container** with business logic
- Manage authentication state
- Handle global search overlay
- Handle profile sidebar
- Compose TopAppBar + NavigationDrawer + Content
- Coordinate communication between global components

### Key Features
- Only renders when user is authenticated
- Wraps `<router-outlet>` at root level
- Persistent across navigation
- Single instance per application

### Components
1. **TopAppBar** - Fixed header
   - Logo/branding
   - Global search button
   - User avatar with profile menu
   - Responsive behavior

2. **NavigationDrawer** - Sidebar menu
   - Hamburger icon toggle
   - Main navigation items
   - Collapsible/expandable
   - Auto-closes on mobile after navigation

3. **UserProfileSidebar** - Profile overlay
   - User info display
   - Settings shortcuts
   - Logout action
   - Slides in from right

### Usage
```typescript
// app.routes.ts
{
  path: '',
  component: AppShellComponent,  // ← Global wrapper
  children: [
    { path: 'home', component: HomeComponent },
    { path: 'activity', component: ActivityComponent },
    // ... other routes
  ]
}
```

### Template Pattern
```html
<app-top-app-bar
  [userEmail]="userEmail()"
  (searchRequested)="onSearchRequested($event)"
  (profileRequested)="onProfileRequested()"
></app-top-app-bar>

<app-navigation-drawer
  (navigationChanged)="onNavigationChanged($event)"
></app-navigation-drawer>

<main class="app-content">
  <router-outlet></router-outlet>  ← Pages rendered here
</main>

@if (isProfileSidebarOpen()) {
  <app-user-profile-sidebar
    (closeSidebar)="onProfileSidebarClose()"
  ></app-user-profile-sidebar>
}
```

---

## Layer 2: PageLayout (Page Skeleton)

### Purpose
Reusable region-based layout skeleton for individual pages, providing consistent internal structure.

### Location
`/core/layout/page-layout/`

### Responsibilities
- **Dumb Component** - pure presentation
- Define responsive grid structure
- Provide named regions for content projection
- Handle mobile-first responsive behavior
- Zero business logic

### Key Features
- Reusable across all pages
- Content projection with attribute selectors
- CSS Grid responsive system
- Auto-hides empty regions
- Mobile-first design

### Regions

| Region | Selector | Purpose | Responsive |
|--------|----------|---------|------------|
| **header** | `section="header"` | Page title, breadcrumbs, actions | Always visible |
| **content** | `section="content"` | Main page content | Always visible |
| **footer** | `section="footer"` | Bottom actions, pagination | Always visible |
| **sidebar** | `section="sidebar"` | Right sidebar (optional) | Desktop only (≥992px) |

### Usage Pattern

```html
<!-- Any page component -->
<app-page-layout>
  <!-- Header Region -->
  <app-activity-header section="header"></app-activity-header>

  <!-- Content Region -->
  <app-activity-content
    section="content"
    [data]="data()"
    (action)="onAction($event)"
  ></app-activity-content>

  <!-- Footer Region -->
  <app-activity-footer section="footer"></app-activity-footer>

  <!-- Sidebar Region (optional, desktop only) -->
  <app-activity-sidebar section="sidebar"></app-activity-sidebar>
</app-page-layout>
```

### Responsive Behavior

**Desktop (≥992px):**
```
┌─────────────────────────────────────┐
│ Header (full width)                 │
├──────────────────────┬──────────────┤
│ Content              │ Sidebar      │
│ (main area)          │ (320px)      │
├──────────────────────┴──────────────┤
│ Footer (full width)                 │
└─────────────────────────────────────┘
```

**Mobile (<992px):**
```
┌─────────────────────────────────────┐
│ Header (full width)                 │
├─────────────────────────────────────┤
│ Content (full width)                │
├─────────────────────────────────────┤
│ Footer (full width)                 │
└─────────────────────────────────────┘
```
*Sidebar is hidden on mobile*

### CSS Architecture

```scss
.page-layout {
  max-width: $breakpoint-xl;  // 1200px
  margin: 0 auto;

  &__header {
    width: 100%;
    margin-bottom: 2rem;
    &:empty { display: none; }  // Auto-hide if empty
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr;  // Mobile: single column
    gap: 2rem;

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: 1fr 320px;  // Desktop: content + sidebar
    }
  }

  &__content {
    grid-column: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__sidebar {
    grid-column: 2;

    @media (max-width: calc($breakpoint-lg - 1px)) {
      display: none;  // Hide on mobile
    }

    &:empty { display: none; }
  }

  &__footer {
    width: 100%;
    margin-top: auto;
    &:empty { display: none; }
  }
}
```

---

## Section Components Pattern

### What are Section Components?

Section Components are **focused, single-purpose components** designed to be injected into PageLayout regions.

### Characteristics

✅ **Pure Presentation** - No business logic
✅ **Single Responsibility** - One section, one component
✅ **Reusable** - Can be used in multiple pages
✅ **Type-safe** - Strong TypeScript interfaces
✅ **Event-driven** - Emit events for parent handling

### Example: Activity Page Sections

```
activity/
├── activity.component.ts          # Smart Container (orchestrator)
├── activity.component.html        # Uses PageLayout
└── sections/
    ├── header/
    │   ├── activity-header.component.ts      # Title + subtitle
    │   ├── activity-header.component.html
    │   └── activity-header.component.scss
    ├── content/
    │   ├── activity-content.component.ts     # Main content area
    │   ├── activity-content.component.html
    │   └── activity-content.component.scss
    └── recommendations/
        ├── activity-recommendations.component.ts  # Footer recommendations
        ├── activity-recommendations.component.html
        └── activity-recommendations.component.scss
```

### Activity Page Implementation

**Smart Container** (`activity.component.ts`):
```typescript
@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    PageLayoutComponent,
    ActivityHeaderComponent,
    ActivityContentComponent,
    ActivityRecommendationsComponent,
  ],
  templateUrl: './activity.component.html',
})
export class ActivityComponent {
  private readonly router = inject(Router);

  // State management with signals
  readonly recentActivities = signal<RecentActivity[]>([...]);
  readonly recommendations = signal<Recommendation[]>([...]);

  // Event handlers
  onActivityClick(activity: RecentActivity): void {
    this.router.navigate([activity.route]);
  }

  onRecommendationClick(recommendation: Recommendation): void {
    if (recommendation.route) {
      this.router.navigate([recommendation.route]);
    }
  }
}
```

**Template** (`activity.component.html`):
```html
<app-page-layout>
  <!-- Header Section -->
  <app-activity-header section="header"></app-activity-header>

  <!-- Content Section (Recent Activity) -->
  <app-activity-content
    section="content"
    [activities]="recentActivities()"
    (activityClick)="onActivityClick($event)"
  ></app-activity-content>

  <!-- Footer Section (Recommendations) -->
  <app-activity-recommendations
    section="footer"
    [recommendations]="recommendations()"
    (recommendationClick)="onRecommendationClick($event)"
  ></app-activity-recommendations>
</app-page-layout>
```

**Section Component** (`activity-header.component.ts`):
```typescript
@Component({
  selector: 'app-activity-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityHeaderComponent {
  // Pure presentation - no inputs/outputs needed for this simple case
}
```

**Section Template** (`activity-header.component.html`):
```html
<div class="activity-header">
  <h1 class="activity-header__title">My Activity</h1>
  <p class="activity-header__subtitle">
    Track your recent books and get personalized recommendations
  </p>
</div>
```

---

## Benefits

### 1. Separation of Concerns
- **AppShell**: Global layout + authentication + navigation
- **PageLayout**: Page structure + responsive grid
- **Section Components**: Content presentation
- **Page Component**: Data orchestration

### 2. Reusability
- PageLayout used by all pages
- Section components can be reused across pages
- Consistent structure everywhere

### 3. Maintainability
- Changes to global layout → edit AppShell
- Changes to page structure → edit PageLayout
- Changes to section content → edit Section Component
- Clear boundaries, easy debugging

### 4. Scalability
- Add new page = use PageLayout + create sections
- Add new section = create component + inject into region
- No impact on existing code

### 5. Testability
- Each component tested in isolation
- Mock data via signals
- Fast unit tests

### 6. Mobile-First Responsive
- Single codebase for mobile → tablet → desktop
- CSS Grid handles layout
- Auto-hides optional regions

---

## Design Patterns Applied

### 1. **App Shell Architecture** (Microsoft Pattern)
- Persistent application frame
- Fast initial load
- Progressive enhancement

### 2. **Region-Based Layout** (Google Angular Material Shell)
- Named content projection regions
- Attribute selectors for injection
- Plug-and-play sections

### 3. **Smart/Dumb Component Pattern**
- Smart: AppShell, Page Components (orchestration)
- Dumb: PageLayout, Section Components (presentation)

### 4. **Component Composition Pattern**
- Build complex UIs from simple components
- Content projection for flexibility
- Type-safe composition

### 5. **Responsive Design Pattern**
- Mobile-first approach
- CSS Grid for layout
- Progressive enhancement

---

## Enterprise References

### Google Angular Material Shell
- Region-based layout system
- Content projection with selectors
- Mobile-first responsive

### SAP Fiori
- Shell bar + content area separation
- Flexible page structure
- Responsive adaptation

### Salesforce Lightning
- Application container pattern
- Component composition
- Plug-and-play architecture

### Microsoft App Shell
- Persistent application chrome
- Fast initial render
- Progressive loading

---

## Migration Guide

### Converting Existing Page to PageLayout

**Before:**
```html
<!-- old-page.component.html -->
<div class="page-wrapper">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>
```

**After:**
```html
<!-- new-page.component.html -->
<app-page-layout>
  <app-page-header section="header"></app-page-header>
  <app-page-content section="content"></app-page-content>
  <app-page-footer section="footer"></app-page-footer>
</app-page-layout>
```

### Steps:
1. Create `sections/` folder in page directory
2. Extract header → `header/page-header.component.ts`
3. Extract content → `content/page-content.component.ts`
4. Extract footer → `footer/page-footer.component.ts`
5. Update page component to use PageLayout
6. Remove old layout SCSS

---

## Best Practices

### ✅ DO
- Use PageLayout for all pages
- Create focused Section Components
- Keep Section Components dumb (presentation only)
- Use signals for reactive state
- Use OnPush change detection
- Auto-hide empty regions with `:empty`

### ❌ DON'T
- Put business logic in Section Components
- Nest PageLayout inside PageLayout
- Use PageLayout outside AppShell
- Skip responsive considerations
- Hardcode layout in page components

---

## Future Enhancements

- [ ] Add animation transitions between sections
- [ ] Add skeleton loading states to PageLayout
- [ ] Add theme customization support
- [ ] Add print-friendly layout variant
- [ ] Add accessibility enhancements (ARIA landmarks)
- [ ] Add layout preferences (user customization)

---

**Updated**: December 2025
**Pattern**: Enterprise-Standard Region-Based Layout
**References**: Google Material Shell, SAP Fiori, Salesforce Lightning, Microsoft App Shell
