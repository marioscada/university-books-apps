# Change Detection Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/best-practices/runtime-performance
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### OnPush Strategy
- [ ] Use OnPush change detection for all components (except root)
- [ ] OnPush components work with immutable inputs
- [ ] Don't mutate objects/arrays passed to OnPush components

### Signals (Angular 16+)
- [ ] Prefer signals over traditional change detection
- [ ] Use computed() for derived values (automatic dependency tracking)
- [ ] Signals work automatically with OnPush

### Zone Pollution
- [ ] Avoid unnecessary zone triggers (setTimeout, setInterval, addEventListener outside Angular)
- [ ] Use runOutsideAngular() for non-UI operations
- [ ] Re-enter zone with run() when needed

---

## 🟡 WARNINGS (Should Fix)

### Template Performance
- [ ] Avoid function calls in templates (use pipes or computed)
- [ ] Don't use complex expressions in templates
- [ ] Extract template calculations to component properties

### Detach/Reattach
- [ ] Use ChangeDetectorRef.detach() for manual control
- [ ] Reattach or manually detect changes when needed
- [ ] Consider async pipe instead of manual subscription

### TrackBy Functions
- [ ] ALWAYS use trackBy with *ngFor
- [ ] TrackBy function returns unique identifier
- [ ] Don't create trackBy function inline in template

---

## 🟢 BEST PRACTICES
- [ ] Minimize change detection cycles
- [ ] Use pure pipes (avoid impure pipes)
- [ ] Lazy load heavy components
- [ ] Profile with Angular DevTools
- [ ] Test performance with large datasets

---

## 📋 Auto-Fix Available (--fix flag)
1. Add OnPush to all components
2. Add trackBy to *ngFor
3. Convert template functions to computed signals
4. Replace manual subscriptions with async pipe

---

## 📚 References
- [Angular Performance](https://angular.dev/best-practices/runtime-performance)
- [Change Detection Guide](https://angular.dev/guide/change-detection)
- [Signals for Performance](https://angular.dev/guide/signals)
