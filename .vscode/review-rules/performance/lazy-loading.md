# Lazy Loading Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/lazy-loading-ngmodules
- https://angular.dev/guide/routing

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Route-Level Lazy Loading
- [ ] Feature routes use loadComponent() or loadChildren()
- [ ] No eager loading of heavy features
- [ ] Preload strategy configured (PreloadAllModules or custom)
- [ ] Router configured with withPreloading()

### Bundle Size
- [ ] Check bundle sizes with source-map-explorer
- [ ] Main bundle < 500KB
- [ ] Lazy bundles < 200KB each
- [ ] No duplicate dependencies across bundles

---

## 🟡 WARNINGS (Should Fix)

### Component Lazy Loading
- [ ] Heavy components loaded lazily (@defer in Angular 17+)
- [ ] Third-party libraries loaded on-demand
- [ ] Images lazy loaded (loading="lazy")

### Optimization
- [ ] Tree-shaking enabled (production build)
- [ ] Dead code eliminated
- [ ] Unused imports removed

---

## 🟢 BEST PRACTICES
- [ ] Critical path minimal (fast initial load)
- [ ] Defer non-critical features
- [ ] Prefetch likely next routes
- [ ] Monitor bundle sizes in CI

---

## 📚 References
- [Lazy Loading Guide](https://angular.dev/guide/lazy-loading-ngmodules)
- [Route-Level Code Splitting](https://angular.dev/guide/routing/define-routes)
