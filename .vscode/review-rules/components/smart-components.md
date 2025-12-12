# Smart Components (Container) Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/style-guide
- Container/Presentational Pattern

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Component Responsibility (ONLY Smart Components)
- [ ] Smart components handle ALL business logic and data fetching
- [ ] Smart components inject ALL services (domain, translation, routing, etc.)
- [ ] Smart components handle translations (TranslateService)
- [ ] Smart components don't contain presentation markup (delegate to presentational components)
- [ ] Smart components handle routing and navigation
- [ ] **State Management**: See `state-management/signals.md` and `state-management/services.md`
- [ ] **Contrast with Presentational**: See `components/presentational.md` for DUMB component rules

### Dependency Injection (Services Knowledge)
- [ ] Inject domain services (UserService, ApiClient, etc.)
- [ ] Inject TranslateService for i18n (pass translated strings to presentational)
- [ ] Inject Angular services (Router, ActivatedRoute, etc.)
- [ ] Inject any business-related service
- [ ] Presentational components NEVER inject domain/business/translation services

### Data Flow (Smart → Presentational)
- [ ] Pass ALL data to presentational components via inputs (including translated strings)
- [ ] Handle events from presentational components via outputs
- [ ] Fetch data in smart components (not in presentational)
- [ ] Translate strings in smart component, pass translated to presentational
- [ ] Presentational components are 100% dumb and reusable

---

## 🟡 WARNINGS (Should Fix)

### State Management
- [ ] Use signals or observables for reactive state
- [ ] Use computed() for derived state
- [ ] Use toSignal() to convert observables to signals

### Error Handling
- [ ] Smart components handle errors from services
- [ ] Provide user feedback on errors
- [ ] Pass error state to presentational components

### Template Simplicity
- [ ] Minimal template (mostly property bindings and event handlers)
- [ ] No complex HTML markup in smart component template
- [ ] Template should be < 50 lines

---

## 🟢 BEST PRACTICES
- [ ] Name with -page or -container suffix
- [ ] Use OnPush change detection with signals
- [ ] Manage form submission logic
- [ ] Handle route parameter changes
- [ ] Coordinate multiple presentational components
- [ ] Extract models to separate .model.ts file
- [ ] Extract utility functions to separate .utils.ts file

---

## 📋 Auto-Fix Available (--fix flag)
1. Add ChangeDetectionStrategy.OnPush
2. Convert observables to signals with toSignal()
3. Add takeUntilDestroyed() to subscriptions
4. Extract complex templates to presentational components
5. Add -page or -container suffix

---

## 📚 References
- [Angular Style Guide](https://angular.dev/style-guide)
- [Container/Presentational Pattern](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
