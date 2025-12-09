# Activity Page Architecture

## Overview

The Activity Page is the **first implementation** of the new enterprise-standard **Region-Based Layout Architecture** using `PageLayout` component.

It demonstrates the pattern that all future pages should follow.

---

## Purpose

Display user's recent book activities (edits, views, creations) and AI-powered recommendations in a clean, organized layout.

---

## Architecture Pattern

### Region-Based Layout

Following enterprise standards from:
- ✅ Google Angular Material Shell
- ✅ SAP Fiori Layout Architecture
- ✅ Salesforce Lightning Component Model

```
┌─────────────────────────────────────────┐
│ ActivityComponent (Smart Container)     │
│ ┌─────────────────────────────────────┐ │
│ │ PageLayout (Skeleton)               │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ ActivityHeaderComponent         │ │ │ ← section="header"
│ │ ├─────────────────────────────────┤ │ │
│ │ │ ActivityContentComponent        │ │ │ ← section="content"
│ │ │ (wraps RecentActivityComponent) │ │ │
│ │ ├─────────────────────────────────┤ │ │
│ │ │ ActivityRecommendationsComp     │ │ │ ← section="footer"
│ │ │ (wraps RecommendationsComponent)│ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## File Structure

```
activity/
├── activity.component.ts             # Smart Container (orchestrator)
├── activity.component.html           # Uses PageLayout
├── activity.component.scss           # Minimal (layout handled by PageLayout)
└── sections/                         # Section Components
    ├── header/
    │   ├── activity-header.component.ts
    │   ├── activity-header.component.html
    │   └── activity-header.component.scss
    ├── content/
    │   ├── activity-content.component.ts
    │   ├── activity-content.component.html
    │   └── activity-content.component.scss
    └── recommendations/
        ├── activity-recommendations.component.ts
        ├── activity-recommendations.component.html
        └── activity-recommendations.component.scss
```

---

## Component Details

### 1. ActivityComponent (Smart Container)

**Type**: Smart Container (Orchestrator)

**Responsibilities**:
- Manage data with signals (`recentActivities`, `recommendations`)
- Handle navigation and user actions
- Compose Section Components via PageLayout
- **Zero layout logic** (delegated to PageLayout)

**Key Code**:
```typescript
@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,              // ← Layout skeleton
    ActivityHeaderComponent,          // ← Section components
    ActivityContentComponent,
    ActivityRecommendationsComponent,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent {
  private readonly router = inject(Router);

  // ========================================================================
  // State Management (Signals)
  // ========================================================================

  readonly recentActivities = signal<RecentActivity[]>([
    {
      id: 'activity-1',
      title: 'The Art of Software Architecture',
      author: 'John Doe',
      activityType: 'edited',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      preview: 'Added new chapter on microservices patterns...',
      route: '/books/1',
      badge: 'Draft',
      badgeColor: 'warning',
    },
    // ... more activities
  ]);

  readonly recommendations = signal<Recommendation[]>([
    {
      id: 'rec-1',
      title: 'Complete Chapter 3',
      description: 'You\'re 80% done with this chapter. Finish it!',
      icon: 'create-outline',
      action: 'Continue writing',
      metadata: '~20 min remaining',
      route: '/books/1/chapter/3',
      priority: 'high',
    },
    // ... more recommendations
  ]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

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

**Template**:
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

**Styles** (`activity.component.scss`):
```scss
// =============================================================================
// Activity Page Styles
// =============================================================================
//
// This page uses region-based PageLayout.
// All layout logic is handled by PageLayout component.
// Section-specific styles are in their respective section components.
//
// This file is intentionally minimal - layout is not the page's concern.
// =============================================================================

// Page-specific overrides can go here if needed
// For now, everything is handled by the layout and section components
```

---

### 2. ActivityHeaderComponent (Section)

**Type**: Dumb Component (Presentation)

**Purpose**: Display page title and subtitle

**Code**:
```typescript
@Component({
  selector: 'app-activity-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityHeaderComponent {}
```

**Template**:
```html
<div class="activity-header">
  <h1 class="activity-header__title">My Activity</h1>
  <p class="activity-header__subtitle">
    Track your recent books and get personalized recommendations
  </p>
</div>
```

---

### 3. ActivityContentComponent (Section)

**Type**: Dumb Component (Wrapper)

**Purpose**: Wrap `RecentActivityComponent` for the content region

**Code**:
```typescript
@Component({
  selector: 'app-activity-content',
  standalone: true,
  imports: [CommonModule, RecentActivityComponent],
  templateUrl: './activity-content.component.html',
  styleUrls: ['./activity-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityContentComponent {
  // Modern Angular signals API
  readonly activities = input.required<RecentActivity[]>();
  readonly activityClick = output<RecentActivity>();

  onActivityClick(activity: RecentActivity): void {
    this.activityClick.emit(activity);
  }
}
```

**Template**:
```html
<div class="activity-content">
  <app-recent-activity
    [activities]="activities()"
    (activityClick)="onActivityClick($event)"
  ></app-recent-activity>
</div>
```

---

### 4. ActivityRecommendationsComponent (Section)

**Type**: Dumb Component (Wrapper)

**Purpose**: Wrap `RecommendationsComponent` for the footer region

**Code**:
```typescript
@Component({
  selector: 'app-activity-recommendations',
  standalone: true,
  imports: [CommonModule, RecommendationsComponent],
  templateUrl: './activity-recommendations.component.html',
  styleUrls: ['./activity-recommendations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityRecommendationsComponent {
  readonly recommendations = input.required<Recommendation[]>();
  readonly recommendationClick = output<Recommendation>();

  onRecommendationClick(recommendation: Recommendation): void {
    this.recommendationClick.emit(recommendation);
  }
}
```

**Template**:
```html
<div class="activity-recommendations">
  <app-recommendations
    [recommendations]="recommendations()"
    (recommendationClick)="onRecommendationClick($event)"
  ></app-recommendations>
</div>
```

---

## Data Models

### RecentActivity

```typescript
export interface RecentActivity {
  id: string;
  title: string;
  author?: string;
  activityType: 'edited' | 'viewed' | 'created' | 'deleted';
  timestamp: Date;
  preview?: string;
  route: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'danger' | 'primary';
}
```

### Recommendation

```typescript
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  metadata?: string;
  route?: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## Benefits

### ✅ Zero Layout Logic
- Page component focuses on **data and events only**
- Layout handled entirely by `PageLayout`
- Clean separation of concerns

### ✅ Plug-and-Play Sections
- Replace any section by swapping one line
- Add new section = create component + add to template
- Remove section = delete one line

### ✅ Reusable Components
- `RecentActivityComponent` reused from home
- `RecommendationsComponent` reused from home
- Section wrappers provide clean interface

### ✅ Type Safety
- TypeScript interfaces for all data
- Strong typing throughout
- Compile-time checks

### ✅ Responsive
- Mobile-first design
- Single column mobile → Two column desktop
- Handled automatically by `PageLayout`

### ✅ Maintainable
- Each section has single responsibility
- Easy to locate bugs
- Clear component boundaries

---

## Comparison: Old vs New

### ❌ Old Approach (Before PageLayout)

```html
<!-- BAD: Layout mixed with content -->
<div class="page-wrapper">
  <div class="page-header">
    <h1>My Activity</h1>
  </div>
  <div class="page-content">
    <div class="activity-feed">...</div>
  </div>
  <div class="page-footer">
    <div class="recommendations">...</div>
  </div>
</div>
```

**Problems**:
- Layout logic in page component
- SCSS for grid/responsive in page
- Hard to reuse
- Mixed concerns

### ✅ New Approach (With PageLayout)

```html
<!-- GOOD: Clean separation -->
<app-page-layout>
  <app-activity-header section="header"></app-activity-header>
  <app-activity-content section="content"></app-activity-content>
  <app-activity-recommendations section="footer"></app-activity-recommendations>
</app-page-layout>
```

**Benefits**:
- Zero layout logic
- Reusable skeleton
- Clear boundaries
- Plug-and-play sections

---

## Pattern for Future Pages

**Every new page should follow this pattern:**

1. **Create page component** (Smart Container)
   - Manage state with signals
   - Handle events and navigation
   - Import `PageLayoutComponent`

2. **Create `sections/` folder**
   - One component per region
   - header, content, footer, sidebar

3. **Use PageLayout in template**
   ```html
   <app-page-layout>
     <app-xxx-header section="header"></app-xxx-header>
     <app-xxx-content section="content"></app-xxx-content>
     <app-xxx-footer section="footer"></app-xxx-footer>
   </app-page-layout>
   ```

4. **Keep page styles minimal**
   - Layout handled by `PageLayout`
   - Only page-specific overrides if needed

---

## Bundle Size

**Build Output:**
```
chunk-QOTP5GAH.js   | activity-component |  53.65 kB
```

**Breakdown:**
- Activity page component: ~5 KB
- Section components: ~15 KB
- PageLayout: ~8 KB
- RecentActivity (reused): ~12 KB
- Recommendations (reused): ~10 KB

**Optimization:**
- Lazy loaded (not in initial bundle)
- Tree shaking enabled
- OnPush change detection

---

## Testing Strategy

### Unit Tests

**Smart Container** (`activity.component.spec.ts`):
```typescript
it('should navigate on activity click', () => {
  const activity = { id: '1', route: '/books/1', ... };
  component.onActivityClick(activity);
  expect(router.navigate).toHaveBeenCalledWith(['/books/1']);
});
```

**Section Components** (`activity-header.component.spec.ts`):
```typescript
it('should render title', () => {
  const compiled = fixture.nativeElement;
  expect(compiled.querySelector('h1').textContent).toContain('My Activity');
});
```

### Integration Tests

Test full page rendering with mock data:
```typescript
it('should render all sections', () => {
  const activities = [...];
  const recommendations = [...];

  component.recentActivities.set(activities);
  component.recommendations.set(recommendations);
  fixture.detectChanges();

  expect(compiled.querySelector('app-activity-header')).toBeTruthy();
  expect(compiled.querySelector('app-activity-content')).toBeTruthy();
  expect(compiled.querySelector('app-activity-recommendations')).toBeTruthy();
});
```

---

## Future Enhancements

- [ ] Add filters (by activity type, date range)
- [ ] Add sorting options
- [ ] Add infinite scroll for activities
- [ ] Add search within activities
- [ ] Add activity details modal
- [ ] Add bulk actions (archive, delete)
- [ ] Add export functionality (PDF, CSV)
- [ ] Add activity analytics
- [ ] Add real-time updates (WebSocket)

---

## Related Documentation

- [Layout System Architecture](./layout-system.md) - Full PageLayout documentation
- [Home Dashboard Architecture](./home-dashboard.md) - Home page pattern

---

**Created**: December 2025
**Pattern**: Enterprise-Standard Region-Based Layout
**Status**: ✅ Production Ready
**First Implementation**: Activity Page
