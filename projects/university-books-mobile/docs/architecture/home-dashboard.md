# Home Dashboard Architecture

## Overview

The Home Dashboard is designed following **Clean Architecture** principles and **Component Composition Pattern** to ensure scalability, maintainability, and testability.

## Architecture Principles

### 1. Separation of Concerns
- **Smart Component** (`HomeComponent`): Manages state, data fetching, business logic
- **Layout Component** (`HomeLayoutComponent`): Defines responsive structure
- **Feature Components**: Pure presentational components for each section

### 2. Component Composition Pattern
```
HomeComponent (Smart/Container)
  └── HomeLayoutComponent (Structural)
      ├── HomeHeroComponent (Presentational)
      ├── QuickActionsComponent (Presentational)
      ├── RecentActivityComponent (Presentational)
      ├── StatsWidgetComponent (Presentational)
      └── RecommendationsComponent (Presentational)
```

### 3. Responsive Design Strategy
- **Desktop (≥1024px)**: 2-column grid (2/3 main + 1/3 sidebar)
- **Tablet (768px-1023px)**: Single column, cards in 2-column grid
- **Mobile (<768px)**: Single column stack

---

## File Structure

```
home/
├── components/
│   ├── home-layout/
│   │   ├── home-layout.component.ts       # Layout structure with ng-content
│   │   ├── home-layout.component.scss     # Responsive grid CSS
│   │   └── home-layout.component.spec.ts
│   ├── home-hero/
│   │   ├── home-hero.component.ts         # Welcome section
│   │   ├── home-hero.component.scss
│   │   └── home-hero.component.spec.ts
│   ├── quick-actions/
│   │   ├── quick-actions.component.ts     # Dashboard action cards
│   │   ├── quick-actions.component.scss
│   │   └── quick-actions.component.spec.ts
│   ├── stats-widget/
│   │   ├── stats-widget.component.ts      # User statistics
│   │   ├── stats-widget.component.scss
│   │   └── stats-widget.component.spec.ts
│   ├── recent-activity/
│   │   ├── recent-activity.component.ts   # Recent books feed
│   │   ├── recent-activity.component.scss
│   │   └── recent-activity.component.spec.ts
│   └── recommendations/
│       ├── recommendations.component.ts    # AI suggestions (sidebar)
│       ├── recommendations.component.scss
│       └── recommendations.component.spec.ts
├── models/
│   ├── quick-action.model.ts              # QuickAction interface
│   ├── user-stats.model.ts                # UserStats interface
│   └── recommendation.model.ts            # Recommendation interface
├── home.component.ts                      # Smart container
├── home.component.scss
└── home.routes.ts
```

---

## Component Details

### 1. HomeComponent (Smart Container)

**Responsibilities:**
- Fetch dashboard data (books, stats, recommendations)
- Manage state with Angular Signals
- Handle user interactions and navigation
- Compose feature components

**Key Features:**
- ✅ Uses `inject()` pattern (no constructor injection)
- ✅ Signals for reactive state management
- ✅ Computed signals for derived state
- ✅ OnPush change detection for performance
- ✅ Parallel data fetching with `Promise.all()`

**Example:**
```typescript
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly booksService = inject(BooksService);

  // State
  readonly userName = computed(() => this.authService.state().user?.username || 'User');
  readonly recentBooks = signal<Book[]>([]);
  readonly isLoading = signal(false);

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    this.isLoading.set(true);
    try {
      const [books, stats] = await Promise.all([
        this.booksService.getRecentBooks(5),
        this.booksService.getUserStats(),
      ]);
      this.recentBooks.set(books);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

### 2. HomeLayoutComponent (Structural)

**Responsibilities:**
- Define responsive grid structure
- Manage content projection with `ng-content`
- Handle desktop/mobile layout switching

**Content Projection Slots:**
- `homeSection="header"` - Hero section
- `homeSection="primary"` - Main content area
- `homeSection="secondary"` - Sidebar (desktop only)

**Example:**
```html
<div class="home-container">
  <!-- Header -->
  <section class="home-header">
    <ng-content select="[homeSection='header']"></ng-content>
  </section>

  <!-- Grid Layout -->
  <div class="home-grid">
    <!-- Primary Area -->
    <section class="home-primary">
      <ng-content select="[homeSection='primary']"></ng-content>
    </section>

    <!-- Secondary Sidebar (Desktop only) -->
    @if (isDesktop()) {
      <aside class="home-secondary">
        <ng-content select="[homeSection='secondary']"></ng-content>
      </aside>
    }
  </div>
</div>
```

**CSS Grid:**
```scss
.home-grid {
  display: grid;
  gap: 2rem;

  // Desktop: 2/3 main + 1/3 sidebar
  @media (min-width: $breakpoint-lg) {
    grid-template-columns: 2fr 1fr;
  }

  // Mobile: single column
  @media (max-width: $breakpoint-lg - 1) {
    grid-template-columns: 1fr;
  }
}
```

---

### 3. Feature Components (Presentational)

All feature components follow the same pattern:
- ✅ **Inputs**: Receive data via `@Input()` signals
- ✅ **Outputs**: Emit events via `@Output()` EventEmitters
- ✅ **Pure**: No dependencies on services (except ResponsiveService for UI)
- ✅ **OnPush**: Change detection strategy
- ✅ **Standalone**: No NgModule required

#### HomeHeroComponent
```typescript
@Input({ required: true }) userName!: string;
```
- Displays welcome message
- Shows current date/time
- Optional quick search bar

#### QuickActionsComponent
```typescript
@Input({ required: true }) actions!: Signal<QuickAction[]>;
@Output() actionClick = new EventEmitter<QuickAction>();
```
- Grid of action cards (My Books, AI Studio, Templates, etc.)
- Responsive grid (4 cols → 2 cols → 1 col)
- Emits click events to parent

#### StatsWidgetComponent
```typescript
@Input({ required: true }) stats!: Signal<UserStats | null>;
```
- User statistics (total books, chapters, pages)
- Loading skeleton state
- Compact card design

#### RecentActivityComponent
```typescript
@Input({ required: true }) books!: Signal<Book[]>;
@Input({ required: true }) loading!: Signal<boolean>;
@Output() bookClick = new EventEmitter<Book>();
```
- List of recent books
- Loading state
- Empty state handling

#### RecommendationsComponent
```typescript
@Input({ required: true }) items!: Signal<Recommendation[]>;
@Output() itemClick = new EventEmitter<Recommendation>();
```
- AI-generated suggestions
- Sidebar widget (desktop only)
- Icon + title + description

---

## Data Models

### QuickAction
```typescript
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'danger';
}
```

### UserStats
```typescript
export interface UserStats {
  totalBooks: number;
  totalChapters: number;
  totalPages: number;
  lastActivity: Date;
}
```

### Recommendation
```typescript
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string; // "View", "Start", "Read"
  metadata?: string;
}
```

---

## Usage Example

```typescript
// home.component.ts
@Component({
  template: `
    <app-home-layout>
      <!-- Header -->
      <div homeSection="header">
        <app-home-hero [userName]="userName()"></app-home-hero>
      </div>

      <!-- Primary Content -->
      <div homeSection="primary">
        <app-quick-actions
          [actions]="quickActions()"
          (actionClick)="onActionClick($event)"
        ></app-quick-actions>

        <app-recent-activity
          [books]="recentBooks()"
          [loading]="isLoading()"
          (bookClick)="onBookClick($event)"
        ></app-recent-activity>
      </div>

      <!-- Secondary Sidebar -->
      <div homeSection="secondary">
        <app-stats-widget [stats]="userStats()"></app-stats-widget>
        <app-recommendations
          [items]="recommendations()"
          (itemClick)="onRecommendationClick($event)"
        ></app-recommendations>
      </div>
    </app-home-layout>
  `
})
export class HomeComponent {
  // Smart component logic
}
```

---

## Benefits

### 1. Maintainability
- Each component has single responsibility
- Bug fixes are isolated
- Easy to locate and modify features

### 2. Scalability
- Adding new section = create new component + inject it
- No impact on existing code
- Type-safe composition

### 3. Testability
- Components can be tested in isolation
- Mock data easily with signals
- Fast unit tests

### 4. Reusability
- Feature components can be used elsewhere
- StatsWidget in profile page
- QuickActions in settings

### 5. Performance
- OnPush change detection
- Signals for fine-grained reactivity
- Bundle splitting per component

### 6. Developer Experience
- Clear component boundaries
- Self-documenting structure
- Easy onboarding for new developers

---

## Migration Path

### Phase 1: Create Structure ✅
- Create folder structure
- Create models
- Create HomeLayoutComponent

### Phase 2: Feature Components ✅
- Implement each presentational component
- Add responsive styles
- Write unit tests

### Phase 3: Smart Container ✅
- Refactor HomeComponent
- Implement data fetching
- Wire up events

### Phase 4: Polish ✅
- Add loading states
- Add error handling
- Add animations
- Optimize performance

---

## Best Practices Applied

1. ✅ **Pure Presentation Components**: No business logic in UI
2. ✅ **Smart/Dumb Component Pattern**: Clear separation
3. ✅ **Content Projection**: Flexible composition
4. ✅ **Signals**: Modern reactive state management
5. ✅ **OnPush Detection**: Performance optimization
6. ✅ **inject() Pattern**: Modern Angular DI
7. ✅ **TypeScript Models**: Type safety
8. ✅ **Responsive Design**: Mobile-first approach
9. ✅ **Standalone Components**: No NgModule complexity
10. ✅ **Async/Await**: Clean async code

---

## Future Enhancements

- [ ] Add widget customization (drag & drop)
- [ ] Add preferences for visible sections
- [ ] Add real-time updates with WebSockets
- [ ] Add animations with Angular Animations
- [ ] Add accessibility features (ARIA, keyboard nav)
- [ ] Add analytics tracking
- [ ] Add A/B testing for layouts
