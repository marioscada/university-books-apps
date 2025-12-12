# Angular Services Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/di
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Service Definition
- [ ] Use @Injectable({ providedIn: 'root' }) for singletons
- [ ] Use inject() over constructor injection (Angular 14+)
- [ ] Services are stateless or manage state explicitly
- [ ] No business logic in components (delegate to services)

### State Management
- [ ] Use signals for reactive service state
- [ ] Expose state as readonly signals
- [ ] Provide methods to update state (don't expose writable signals)
- [ ] Use BehaviorSubject for observable-based state

### Dependency Injection
- [ ] Inject dependencies (don't instantiate with new)
- [ ] Use interfaces for service contracts
- [ ] Prefer composition over inheritance

---

## 🟡 WARNINGS (Should Fix)

### Service Organization
- [ ] One service per file
- [ ] Service names end with Service
- [ ] Group related services by feature
- [ ] Keep services focused (Single Responsibility)

### HTTP Services
- [ ] Centralize HTTP calls in services
- [ ] Use HttpClient (not XMLHttpRequest)
- [ ] Handle errors in service layer
- [ ] Use interceptors for cross-cutting concerns

---

## 🟢 BEST PRACTICES
- [ ] Document service public API
- [ ] Unit test services independently
- [ ] Use facade pattern for complex state
- [ ] Avoid circular dependencies

---

## 📚 References
- [Dependency Injection Guide](https://angular.dev/guide/di)
- [Services and DI](https://angular.dev/guide/di/creating-injectable-service)
