# Angular Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/angular/angular
- https://angular.dev/style-guide
- https://angular.dev/guide

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Naming & File Structure
- [ ] File names use kebab-case with hyphens
- [ ] Component files follow pattern: `name.component.ts`, `name.component.html`, `name.component.scss`, `name.component.spec.ts`
- [ ] Each component has companion files: `name.model.ts` (interfaces/types), `name.utils.ts` (utility functions)
- [ ] Shared models in `shared/models/` or feature-level `models/` directory
- [ ] Shared utilities in `shared/utils/` or feature-level `utils/` directory
- [ ] One concept per file (max 400 lines)
- [ ] All code in `src/` directory
- [ ] Group related files in same directory
- [ ] Organize by feature areas

### Dependency Injection
- [ ] Use `inject()` function over constructor injection (Angular 14+)
- [ ] Services use `providedIn: 'root'` for singletons

### Components
- [ ] Components focus on presentation only (no HTTP calls, no complex business logic)
- [ ] Template-bound members are `protected` or `public` (not `private`)
- [ ] Avoid complex logic in templates
- [ ] No function calls in template bindings (except event handlers like (click))
- [ ] Use pipes, computed signals, or component properties instead of functions
- [ ] Prefer `[class]`/`[style]` bindings over `ngClass`/`ngStyle`
- [ ] **Styles**: See `framework/styles.md` for global vs component styles
- [ ] Event handler names describe action, not event (e.g., `onSave()` not `onClick()`)
- [ ] **Lifecycle**: See `components/lifecycle.md` for lifecycle hooks details
- [ ] **Smart vs Presentational**: See `components/smart-components.md` and `components/presentational.md`

### Signals (Angular 16+)
- [ ] Prefer signals over traditional properties for reactive state
- [ ] Use `computed()` for derived values
- [ ] Use signal inputs: `input()` and `input.required()`

### Standalone Components (Angular 14+)
- [ ] Prefer standalone components for new code
- [ ] Explicit imports in component metadata

### Template Formatting
- [ ] One attribute per line in templates
- [ ] Attributes follow standard order:
  1. Structural directives (*ngIf, *ngFor, *ngSwitch)
  2. Animation bindings (@trigger)
  3. Static attributes (id, name, type, role, aria-*)
  4. Property bindings ([property], [attr.], [class.], [style.])
  5. Two-way bindings ([(ngModel)])
  6. Event bindings ((click), (change), etc.)
  7. Template references (#ref)
  8. Directives (matTooltip, appCustom, etc.)
- [ ] Consistent indentation in multi-line templates
- [ ] Close self-closing tags properly

---

## 🟡 WARNINGS (Should Fix)
- [ ] Keep lifecycle methods simple and focused
- [ ] Services are stateless where possible
- [ ] Use OnPush change detection with signals

---

## 📋 Auto-Fix Available (--fix flag)
1. File naming conventions
2. Convert constructor injection to `inject()`
3. Add `protected`/`public` to template-bound members
4. Replace `ngClass`/`ngStyle` with bindings
5. Add lifecycle hook interfaces
6. Format template attributes (one per line, correct order)

---

## 📚 References
- [Angular Style Guide](https://angular.dev/style-guide)
- [GitHub: angular/angular](https://github.com/angular/angular)
- [Angular Documentation](https://angular.dev/)
