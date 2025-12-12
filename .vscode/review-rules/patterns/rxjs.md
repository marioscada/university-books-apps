# RxJS Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/ReactiveX/rxjs
- https://rxjs.dev/

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Memory Leaks
- [ ] ALWAYS unsubscribe from subscriptions (use takeUntilDestroyed, async pipe, or manual cleanup)
- [ ] No nested subscriptions (use switchMap, mergeMap, concatMap instead)
- [ ] Complete Subjects in ngOnDestroy

### Subscription Policy (STRICT)
- [ ] NO manual subscriptions in component .ts files (use async pipe in template)
- [ ] Manual subscribe() only allowed for justified/mandatory cases (must be documented)
- [ ] Exceptions must have explicit comment explaining why async pipe cannot be used
- [ ] All exceptions must use takeUntilDestroyed() for cleanup

### Operator Selection
- [ ] Use switchMap for cancellable operations (search, autocomplete)
- [ ] Use mergeMap for parallel independent requests
- [ ] Use concatMap for sequential operations that must complete (saves, updates)
- [ ] Use exhaustMap to ignore new while processing (button clicks, form submits)
- [ ] Use shareReplay for expensive operations shared across subscribers

### Error Handling
- [ ] All observables have error handling (catchError)
- [ ] Use retry/retryWhen for failed HTTP requests
- [ ] Don't let errors break the stream unhandled

### Subject Usage
- [ ] Don't expose Subjects directly (expose as Observable with asObservable())
- [ ] Use appropriate Subject type (Subject, BehaviorSubject, ReplaySubject, AsyncSubject)
- [ ] Complete Subjects when done

---

## 🟡 WARNINGS (Should Fix)

### Subscription Management
- [ ] MANDATORY: Use async pipe in templates (not manual subscribe in .ts)
- [ ] If subscribe() is absolutely necessary: add comment justifying why
- [ ] Use takeUntilDestroyed() for any manual subscriptions (Angular 16+)
- [ ] Store subscriptions in Subscription container for cleanup (legacy code only)

### Hot vs Cold Observables
- [ ] Understand difference between hot and cold observables
- [ ] Use share() for multiple subscribers to same source
- [ ] HTTP calls are cold (create new execution per subscriber)

### Operator Combinations
- [ ] Use debounceTime for search/input (wait for user to stop typing)
- [ ] Use throttleTime for scroll/resize (limit execution rate)
- [ ] Use distinctUntilChanged to prevent duplicate emissions
- [ ] Use filter before map for efficiency

---

## 🟢 BEST PRACTICES
- [ ] Suffix observable variables with $
- [ ] Type observables explicitly (Observable<T>)
- [ ] Use multicasting operators (share, shareReplay) when appropriate
- [ ] Avoid imperative subscribe when declarative operators work
- [ ] Keep subscription chains readable (one operator per line)
- [ ] **Observable Composition**: Create multiple small, specific observables for single responsibilities
- [ ] Combine small observables using RxJS operators (combineLatest, merge, concat, forkJoin, etc.)
- [ ] Avoid long observable chains - break into smaller, named observables

---

## 📋 Auto-Fix Available (--fix flag)
1. Add takeUntilDestroyed() to subscriptions
2. Convert nested subscriptions to switchMap/mergeMap
3. Add catchError to HTTP calls
4. Expose Subjects as Observables
5. Add $ suffix to observable variables

---

## 📚 References
- [RxJS Documentation](https://rxjs.dev/)
- [GitHub: ReactiveX/rxjs](https://github.com/ReactiveX/rxjs)
- [RxJS Operators](https://rxjs.dev/guide/operators)
