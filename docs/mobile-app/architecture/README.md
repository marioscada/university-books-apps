# Mobile App Architecture Documentation

Complete architecture documentation for the University Books Mobile application.

---

## 📚 Documentation Index

### Layout System
- **[Layout System Architecture](./layout-system.md)** ⭐ **START HERE**
  - Two-level layout system (AppShell + PageLayout)
  - Enterprise-standard region-based architecture
  - Google Material Shell, SAP Fiori, Salesforce Lightning patterns
  - Component composition with content projection
  - Mobile-first responsive design

### Page Implementations
- **[Activity Page Architecture](./activity-page.md)**
  - First implementation of PageLayout pattern
  - Section components (header/content/footer)
  - Smart/Dumb component pattern
  - Best practices demonstration

- **[Home Dashboard Architecture](./home-dashboard.md)**
  - Component composition pattern
  - HomeLayout with content projection
  - Feature components (Hero, QuickActions, Stats, Recommendations)
  - Responsive 2-column grid

---

## 🎯 Quick Reference

### When to Use What

| Scenario | Use | Example |
|----------|-----|---------|
| **Creating a new page** | `PageLayout` + Section Components | Activity page |
| **Adding global UI** | Modify `AppShell` | TopAppBar, NavDrawer |
| **Reusable widget** | Shared component in `core/shared/` | StatsWidget |
| **Page-specific section** | Section component in `pages/xxx/sections/` | ActivityHeader |

### Architecture Patterns

| Pattern | Used In | Purpose |
|---------|---------|---------|
| **App Shell** | `core/layout/app-shell/` | Global application wrapper |
| **Region-Based Layout** | `core/layout/page-layout/` | Reusable page skeleton |
| **Smart/Dumb Components** | All pages | Separation of concerns |
| **Component Composition** | HomeComponent, ActivityComponent | Build complex UIs from simple parts |
| **Content Projection** | PageLayout, HomeLayout | Flexible composition with `ng-content` |

---

## 🏗️ Architecture Principles

### 1. Two-Level Layout System

```
AppShell (GLOBAL)
  └─ TopAppBar + NavigationDrawer
      └─ <router-outlet>
          └─ PageComponent (PAGE)
              └─ PageLayout (SKELETON)
                  └─ Section Components (CONTENT)
```

### 2. Component Types

**Smart Components** (Orchestrators)
- Manage state with signals
- Handle data fetching
- Handle navigation and events
- Examples: `HomeComponent`, `ActivityComponent`

**Dumb Components** (Presentation)
- Pure presentation logic
- Receive data via inputs
- Emit events via outputs
- Examples: `PageLayout`, Section Components

### 3. Separation of Concerns

| Concern | Responsibility | Location |
|---------|---------------|----------|
| **Global Layout** | AppShell | `core/layout/app-shell/` |
| **Page Structure** | PageLayout | `core/layout/page-layout/` |
| **Page Orchestration** | Page Component | `pages/xxx/xxx.component.ts` |
| **Section Presentation** | Section Components | `pages/xxx/sections/` |
| **Business Logic** | Services | `core/services/` |
| **Data Models** | Interfaces/Classes | `core/models/` |

---

## 📁 File Organization

```
src/app/
├── core/
│   ├── layout/                      # Layout architecture
│   │   ├── app-shell/               # Global app layout
│   │   ├── page-layout/             # Reusable page skeleton
│   │   ├── top-app-bar/             # Fixed header
│   │   └── navigation-drawer/       # Hamburger menu
│   ├── shared/                      # Reusable components
│   ├── services/                    # Business services
│   └── models/                      # Domain models
│
└── pages/                           # Application pages
    ├── home/                        # Home dashboard
    │   ├── components/              # Home-specific components
    │   │   ├── home-layout/         # Custom layout
    │   │   ├── home-hero/           # Hero section
    │   │   ├── quick-actions/       # Action cards
    │   │   └── ...
    │   ├── models/                  # Home data models
    │   └── home.component.ts        # Smart container
    │
    └── activity/                    # Activity page ⭐ NEW PATTERN
        ├── sections/                # Section components
        │   ├── header/              # Page header
        │   ├── content/             # Main content
        │   └── recommendations/     # Footer
        └── activity.component.ts    # Smart container
```

---

## 🚀 Creating a New Page

### Step-by-Step Guide

1. **Create page folder**
   ```bash
   mkdir -p src/app/pages/my-page/sections/{header,content,footer}
   ```

2. **Create page component** (Smart Container)
   ```typescript
   @Component({
     selector: 'app-my-page',
     imports: [PageLayoutComponent, /* section components */],
     template: `
       <app-page-layout>
         <app-my-header section="header"></app-my-header>
         <app-my-content section="content"></app-my-content>
         <app-my-footer section="footer"></app-my-footer>
       </app-page-layout>
     `
   })
   export class MyPageComponent {
     // State management with signals
     readonly data = signal<MyData[]>([]);

     // Event handlers
     onAction(item: MyData): void { ... }
   }
   ```

3. **Create section components** (Dumb Components)
   ```typescript
   @Component({
     selector: 'app-my-header',
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   export class MyHeaderComponent {}
   ```

4. **Keep page styles minimal**
   ```scss
   // my-page.component.scss
   // Layout handled by PageLayout
   // Only page-specific overrides here if needed
   ```

5. **Add route**
   ```typescript
   {
     path: 'my-page',
     loadComponent: () => import('./pages/my-page/my-page.component')
       .then(m => m.MyPageComponent)
   }
   ```

---

## ✅ Best Practices

### DO ✅
- Use `PageLayout` for all new pages
- Create focused Section Components
- Keep page components as Smart Containers (data + events only)
- Use signals for reactive state
- Use `OnPush` change detection
- Write minimal page SCSS (layout handled by PageLayout)
- Document component responsibilities

### DON'T ❌
- Put layout logic in page components
- Nest `PageLayout` inside `PageLayout`
- Skip responsive considerations
- Put business logic in Section Components
- Duplicate layout code across pages
- Use deprecated Angular patterns

---

## 🎨 Design Patterns Applied

1. **App Shell Architecture** (Microsoft)
   - Persistent application frame
   - Fast initial load
   - Progressive enhancement

2. **Region-Based Layout** (Google Material Shell)
   - Named content projection regions
   - Attribute selectors for injection
   - Plug-and-play sections

3. **Smart/Dumb Component Pattern**
   - Smart: Orchestration and state
   - Dumb: Presentation only
   - Clear separation of concerns

4. **Component Composition**
   - Build complex from simple
   - Reusable building blocks
   - Type-safe composition

5. **Mobile-First Responsive**
   - CSS Grid for layouts
   - Breakpoint-based adaptation
   - Progressive enhancement

---

## 📊 Performance

### Bundle Optimization
- Lazy loading for pages
- Tree shaking enabled
- OnPush change detection
- Standalone components (no NgModules)

### Current Bundle Sizes
- Home page: 52.83 kB
- Activity page: 53.65 kB
- PageLayout: ~8 kB (reused)

### Optimization Techniques
- Code splitting per page
- Shared component reuse
- Signal-based reactivity
- Minimal re-renders with OnPush

---

## 🧪 Testing Strategy

### Unit Tests
- Test components in isolation
- Mock dependencies with signals
- Test event emissions
- Test computed values

### Integration Tests
- Test full page rendering
- Test section composition
- Test responsive behavior
- Test navigation flows

### Example
```typescript
describe('ActivityComponent', () => {
  it('should navigate on activity click', () => {
    const activity = { route: '/books/1', ... };
    component.onActivityClick(activity);
    expect(router.navigate).toHaveBeenCalledWith(['/books/1']);
  });
});
```

---

## 📖 Related Documentation

### Root Documentation
- [Project Structure](../PROJECT-STRUCTURE.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Where is What](../WHERE-IS-WHAT.md)

### Implementation Guides
- [AWS Backend Integration](../../AWS-BACKEND-INTEGRATION-GUIDE.md)
- [Angular Implementation](../../ANGULAR-IMPLEMENTATION-GUIDE.md)

### Other Documentation
- [Responsive Strategy](../../RESPONSIVE-STRATEGY.md)
- [Implementation Roadmap](../../IMPLEMENTATION-ROADMAP.md)

---

## 🔄 Change Log

### December 2025
- ✅ Created enterprise-standard Layout System
- ✅ Implemented PageLayout component
- ✅ Refactored Activity page with region-based architecture
- ✅ Documented patterns and best practices
- ✅ Established pattern for future pages

---

## 🎯 Future Enhancements

### Layout System
- [ ] Add animation transitions between sections
- [ ] Add skeleton loading states
- [ ] Add theme customization support
- [ ] Add print-friendly layouts
- [ ] Add accessibility enhancements

### Documentation
- [ ] Add video walkthrough
- [ ] Add interactive examples
- [ ] Add migration guides for existing pages
- [ ] Add troubleshooting section

---

**Last Updated**: December 2025
**Maintainer**: Mariano Scada
**Status**: ✅ Production Ready
