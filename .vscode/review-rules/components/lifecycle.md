# Component Lifecycle Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/components/lifecycle
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Lifecycle Hooks
- [ ] Implement lifecycle hook interfaces (OnInit, OnDestroy, etc.)
- [ ] Use ngOnInit() for initialization (not constructor)
- [ ] Clean up in ngOnDestroy() (unsubscribe, clear timers, etc.)
- [ ] Don't perform heavy operations in constructor

### Cleanup
- [ ] Unsubscribe from observables in ngOnDestroy()
- [ ] Clear setTimeout/setInterval in ngOnDestroy()
- [ ] Remove event listeners in ngOnDestroy()
- [ ] Complete Subjects in ngOnDestroy()

### Modern Patterns (Angular 16+)
- [ ] Use takeUntilDestroyed() instead of manual ngOnDestroy()
- [ ] Use DestroyRef for cleanup logic
- [ ] Prefer signals over lifecycle hooks where possible

---

## 🟡 WARNINGS (Should Fix)

### Hook Order
- [ ] Understand hook execution order
- [ ] Don't rely on ngAfterViewInit() for critical data
- [ ] Be aware of ngOnChanges() triggering before ngOnInit()

### Best Practices
- [ ] Keep lifecycle methods simple
- [ ] Extract complex logic to private methods
- [ ] Avoid side effects in lifecycle hooks

---

## 🟢 BEST PRACTICES
- [ ] Use async pipe to avoid manual cleanup
- [ ] Use signals to reduce lifecycle dependencies
- [ ] Test components with lifecycle hooks
- [ ] Document why lifecycle hooks are used

---

## 📚 References
- [Lifecycle Hooks Guide](https://angular.dev/guide/components/lifecycle)
- [DestroyRef](https://angular.dev/api/core/DestroyRef)
