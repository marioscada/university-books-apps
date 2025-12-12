# Complete Code Review (All Rules)

**Version**: 2025-01-12
**Review Level**: Comprehensive
**Last Checked**: 2025-01-12

---

## 📋 Complete Review Checklist

This file aggregates ALL review rules from all categories for comprehensive code review.

---

## 🏗️ Framework

### Angular
**Full rules**: See `framework/angular.md`
- [ ] File naming (kebab-case), component structure
- [ ] Dependency injection with inject()
- [ ] Component responsibilities, template-bound members
- [ ] Template formatting (one attribute per line, standard order)
- [ ] Signals usage, standalone components

### Ionic
**Full rules**: See `framework/ionic.md`
- [ ] Ionic components vs native HTML
- [ ] Navigation patterns, platform detection
- [ ] Theming with CSS variables
- [ ] Accessibility labels

### Angular Material
**Full rules**: See `framework/material.md`
- [ ] Component imports (tree-shaking)
- [ ] WCAG AA accessibility compliance
- [ ] Material Design tokens usage
- [ ] Form field patterns

### Styles
**Full rules**: See `framework/styles.md`
- [ ] Global vs component styles
- [ ] CSS custom properties for design tokens
- [ ] No duplicate styles across components
- [ ] Global utility classes

---

## 💻 Language

### TypeScript
**Full rules**: See `language/typescript.md`
- [ ] No `any` type without justification
- [ ] Type safety, strict null checks
- [ ] Meaningful naming conventions
- [ ] Function design (max 2-3 params, single responsibility)
- [ ] Interfaces in .model.ts files
- [ ] Utility functions in .utils.ts files

---

## 🎨 Patterns

### RxJS (STRICT)
**Full rules**: See `patterns/rxjs.md`
- [ ] **CRITICAL**: NO manual subscriptions (use async pipe)
- [ ] Memory leak prevention
- [ ] Correct operator selection (switchMap, mergeMap, concatMap, exhaustMap)
- [ ] Error handling with catchError
- [ ] Subject encapsulation

### Clean Code
**Full rules**: See `patterns/clean-code.md`
- [ ] Meaningful, searchable names
- [ ] Functions do ONE thing
- [ ] DRY principle (no duplication)
- [ ] SOLID principles
- [ ] No commented-out code

---

## 🏛️ Architecture

### Nx Monorepo
**Full rules**: See `architecture/nx-monorepo.md`
- [ ] Library organization (scope/type structure)
- [ ] No circular dependencies
- [ ] Module boundary enforcement
- [ ] Proper tags and constraints

### Project Structure
**Full rules**: See `architecture/project-structure.md`
- [ ] Feature-based organization
- [ ] Proper directory structure (core, shared, features, styles)
- [ ] Companion files (.model.ts, .utils.ts)
- [ ] Global styles in styles/ directory

---

## 🧩 Components

### Smart Components (ONLY)
**Full rules**: See `components/smart-components.md`
- [ ] **CRITICAL**: ONLY smart components inject services
- [ ] Handle ALL business logic and data fetching
- [ ] Inject TranslateService (pass translations to presentational)
- [ ] Handle routing and navigation
- [ ] Manage state (signals, observables)
- [ ] Minimal template (delegate to presentational)

### Presentational Components (DUMB)
**Full rules**: See `components/presentational.md`
- [ ] **CRITICAL**: NO service injection (except UI utilities)
- [ ] **CRITICAL**: NO TranslateService (receive translated strings)
- [ ] Receive ALL data via inputs
- [ ] Emit events via outputs
- [ ] 100% reusable across contexts
- [ ] ALWAYS OnPush change detection

### Standalone Components
**Full rules**: See `components/standalone.md`
- [ ] Prefer standalone: true for new code
- [ ] Explicit imports array
- [ ] Bootstrap with bootstrapApplication()

### Lifecycle
**Full rules**: See `components/lifecycle.md`
- [ ] Implement lifecycle hook interfaces
- [ ] Use ngOnInit() for initialization
- [ ] Clean up in ngOnDestroy()
- [ ] Use takeUntilDestroyed() for subscriptions

---

## 📊 State Management

### Signals
**Full rules**: See `state-management/signals.md`
- [ ] Prefer signals over properties
- [ ] Use computed() for derived state
- [ ] Use .set() or .update() to modify
- [ ] Use effect() ONLY for side effects
- [ ] Signal inputs and outputs

### Services
**Full rules**: See `state-management/services.md`
- [ ] providedIn: 'root' for singletons
- [ ] Use inject() function
- [ ] No business logic in components
- [ ] Expose state as readonly signals

---

## ⚡ Performance

### Change Detection
**Full rules**: See `performance/change-detection.md`
- [ ] OnPush strategy for all components
- [ ] Signals for fine-grained reactivity
- [ ] TrackBy with *ngFor
- [ ] No function calls in templates

### Lazy Loading
**Full rules**: See `performance/lazy-loading.md`
- [ ] Route-level lazy loading
- [ ] Preload strategy configured
- [ ] Bundle sizes monitored

### Bundle Size
**Full rules**: See `performance/bundle-size.md`
- [ ] Performance budgets defined
- [ ] Main bundle < 500KB
- [ ] Tree-shaking enabled

---

## 🧪 Testing

### Unit Tests
**Full rules**: See `testing/unit-tests.md`
- [ ] All components/services have tests
- [ ] Test isolation
- [ ] Mock external dependencies
- [ ] Test from user's perspective

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance
**Full rules**: See `accessibility/a11y.md`
- [ ] Semantic HTML elements
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on icon-only buttons
- [ ] Color not the only visual indicator
- [ ] Sufficient color contrast (4.5:1)
- [ ] Images have alt text

---

## 🎯 Priority Order for Reviews

### 🔴 CRITICAL (Must Fix Immediately)
1. **RxJS**: Manual subscriptions (memory leaks)
2. **Components**: Services in presentational components
3. **Accessibility**: Missing ARIA labels, keyboard navigation
4. **TypeScript**: `any` types without justification
5. **Security**: Exposed sensitive data

### 🟡 HIGH PRIORITY (Should Fix Soon)
1. **Performance**: Missing OnPush, no trackBy
2. **Architecture**: Circular dependencies
3. **Code Quality**: Duplicate code, magic numbers
4. **Testing**: Missing tests for critical logic

### 🟢 MEDIUM PRIORITY (Fix When Possible)
1. **Naming**: Inconsistent conventions
2. **Structure**: Missing .model.ts/.utils.ts files
3. **Styles**: Component-specific duplicates

---

## 📋 Auto-Fix Available (--fix flag)

Most rules support automatic fixes:
1. File naming conventions
2. Add OnPush change detection
3. Add takeUntilDestroyed() to subscriptions
4. Extract duplicate styles to global
5. Format template attributes
6. Add missing ARIA labels
7. Convert constructor injection to inject()
8. Add lifecycle hook interfaces

---

## 📚 All Rule References

- `framework/angular.md`
- `framework/ionic.md`
- `framework/material.md`
- `framework/styles.md`
- `language/typescript.md`
- `patterns/rxjs.md`
- `patterns/clean-code.md`
- `architecture/nx-monorepo.md`
- `architecture/project-structure.md`
- `components/smart-components.md`
- `components/presentational.md`
- `components/standalone.md`
- `components/lifecycle.md`
- `state-management/signals.md`
- `state-management/services.md`
- `performance/change-detection.md`
- `performance/lazy-loading.md`
- `performance/bundle-size.md`
- `testing/unit-tests.md`
- `accessibility/a11y.md`
