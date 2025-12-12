# Standalone Components Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/components/importing
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Standalone Declaration
- [ ] Prefer standalone: true for all new components (Angular 14+)
- [ ] Explicit imports array in component metadata
- [ ] Import dependencies directly (not through modules)
- [ ] Bootstrap with bootstrapApplication()

### Imports
- [ ] Import only what's needed (no unused imports)
- [ ] Import CommonModule if using *ngIf, *ngFor, etc.
- [ ] Import specific Material modules (not MaterialModule)
- [ ] Import other standalone components/directives/pipes

---

## 🟡 WARNINGS (Should Fix)

### Migration
- [ ] Gradually migrate NgModules to standalone
- [ ] Use importProvidersFrom() for legacy module providers
- [ ] Test thoroughly after migration

### Providers
- [ ] Use providedIn: 'root' for services
- [ ] Component-level providers in providers array
- [ ] Environment providers in bootstrapApplication()

---

## 🟢 BEST PRACTICES
- [ ] Smaller bundle sizes with tree-shaking
- [ ] Simpler dependency graph
- [ ] Easier testing (no module setup)
- [ ] Better IDE support

---

## 📚 References
- [Standalone Components Guide](https://angular.dev/guide/components/importing)
- [Migration Guide](https://angular.dev/reference/migrations/standalone)
