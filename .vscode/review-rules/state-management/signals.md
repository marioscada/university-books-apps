# Angular Signals Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/signals
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Signal Usage
- [ ] Use signals for reactive state instead of properties
- [ ] Use computed() for derived state (not getters)
- [ ] Use .set() or .update() to modify signals (never mutate directly)
- [ ] Signal equality uses identity check by default (provide custom equality if needed)

### Signal Writing
- [ ] Update arrays/objects immutably with update()
- [ ] Don't mutate signal content directly (e.g., signal().push())

---

## 🟡 WARNINGS (Should Fix)

### Effects
- [ ] Use effect() ONLY for side effects (localStorage, analytics, logging)
- [ ] Use computed() for deriving state (not effect())
- [ ] Prevent infinite loops in effects
- [ ] Don't create circular dependencies in effects

### Signal Inputs/Outputs
- [ ] Use signal inputs: input() and input.required() (Angular 17.1+)
- [ ] Use signal outputs: output() (Angular 17.3+)
- [ ] Use model() for two-way binding (Angular 17.2+)

### toSignal() for Observables
- [ ] Convert observables to signals with toSignal()
- [ ] Provide initialValue or use requireSync option
- [ ] Automatic subscription management with toSignal()

---

## 🟢 BEST PRACTICES
- [ ] Expose signals as readonly (asReadonly())
- [ ] Signal names don't need $ suffix (observables do)
- [ ] Compose signals with computed()
- [ ] Use signals in templates for fine-grained reactivity
- [ ] Combine signals and RxJS with toSignal()/toObservable()

---

## 📋 Auto-Fix Available (--fix flag)
1. Convert properties to signals
2. Convert getters to computed signals
3. Replace @Input with signal inputs
4. Replace @Output with signal outputs
5. Convert observables to toSignal()

---

## 📚 References
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [GitHub: angular/angular](https://github.com/angular/angular)
- [RxJS Interop](https://angular.dev/guide/signals/rxjs-interop)
