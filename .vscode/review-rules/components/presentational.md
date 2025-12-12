# Presentational Components Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/style-guide
- Container/Presentational Pattern

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Component Responsibility (DUMB Components)
- [ ] Receive ALL data via @Input or input()
- [ ] NO service injection (domain services, TranslateService, etc.)
- [ ] Exception: Only utility UI services allowed (BreakpointObserver, Dialog for UI-only)
- [ ] NO HTTP calls or business logic
- [ ] NO translations (TranslateService) - receive translated strings as inputs
- [ ] Emit events via @Output or output() for all user interactions
- [ ] Component doesn't know what happens to emitted data
- [ ] 100% reusable across different contexts
- [ ] **Contrast with Smart**: See `components/smart-components.md` for what ONLY smart components do

### Data Flow
- [ ] Don't mutate input data
- [ ] Unidirectional data flow (inputs down, events up)
- [ ] No direct parent/sibling component access

---

## 🟡 WARNINGS (Should Fix)

### Change Detection
- [ ] ALWAYS use ChangeDetectionStrategy.OnPush
- [ ] Works correctly with immutable inputs

### Template Logic
- [ ] Minimal logic in template
- [ ] Use computed() for complex derived state
- [ ] Extract template logic to component methods

### Component Purity
- [ ] Pure component (same inputs = same output)
- [ ] No external state dependencies
- [ ] No side effects in component logic

---

## 🟢 BEST PRACTICES
- [ ] Use signal inputs: input() and input.required()
- [ ] Use signal outputs: output()
- [ ] Standalone components preferred
- [ ] Keep component small (< 200 lines template)
- [ ] Use interfaces for input/output data types in separate .model.ts file
- [ ] Extract utility functions to separate .utils.ts file
- [ ] Use global CSS classes for common styles (avoid component-specific duplicates)
- [ ] All interactive elements have aria-labels
- [ ] Reusable across different contexts

---

## 📋 Auto-Fix Available (--fix flag)
1. Add ChangeDetectionStrategy.OnPush
2. Convert @Input/@Output to signal inputs/outputs
3. Remove service injections (flagged for review)
4. Extract template logic to computed signals
5. Add aria-labels to interactive elements

---

## 📚 References
- [Angular Style Guide](https://angular.dev/style-guide)
- [Container/Presentational Pattern](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [Angular Signals Guide](https://angular.dev/guide/signals)
