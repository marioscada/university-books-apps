# Styles (CSS/SCSS) Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/component-styles
- https://github.com/angular/angular

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Global vs Component Styles

- [ ] Global styles for reusable patterns shared across components
- [ ] Component styles for component-specific styling
- [ ] Use global CSS classes for consistent design tokens
- [ ] Never duplicate styles across multiple components (extract to global)
- [ ] **File Organization**: See `architecture/project-structure.md` for styles/ directory structure
- [ ] **Material Theming**: See `framework/material.md` for Material Design tokens
- [ ] **Ionic Theming**: See `framework/ionic.md` for Ionic CSS variables

### Global Styles Organization

- [ ] Global styles in `src/styles.scss` or `src/styles/` directory
- [ ] Create utility classes for common patterns (spacing, typography, colors)
- [ ] Use CSS custom properties (variables) for theme values
- [ ] Name global classes with clear, semantic names (`.btn-primary`, `.card-elevated`, etc.)

### Style Encapsulation

- [ ] Understand ViewEncapsulation modes (Emulated, None, ShadowDom)
- [ ] Default Emulated encapsulation for most components
- [ ] Use `::ng-deep` sparingly and with scoping
- [ ] Global classes don't need `::ng-deep`

---

## 🟡 WARNINGS (Should Fix)

### CSS Architecture

- [ ] Follow naming convention (BEM, utility-first, or consistent custom)
- [ ] Group related styles in separate files (`_buttons.scss`, `_cards.scss`, `_utilities.scss`)
- [ ] Use SCSS variables/mixins for repeated values
- [ ] Avoid magic numbers (use variables)

### Component Styles

- [ ] Keep component styles minimal
- [ ] Use global classes for common patterns
- [ ] Component-specific styles only for unique behavior
- [ ] No inline styles in templates (use class bindings)

### Performance

- [ ] Minimize CSS bundle size
- [ ] Remove unused styles
- [ ] Use critical CSS for above-the-fold content
- [ ] Lazy load component styles with lazy routes

---

## 🟢 BEST PRACTICES

### Global Utility Classes

```scss
// src/styles/_utilities.scss
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
```

### Design Tokens (CSS Variables)

```scss
// src/styles/_variables.scss
:root {
  --color-primary: #3f51b5;
  --color-accent: #ff4081;
  --spacing-unit: 8px;
  --border-radius: 4px;
}
```

### Reusable Component Classes

- [ ] Create global classes for reusable components
- [ ] Document global class usage
- [ ] Version global classes (breaking changes)
- [ ] Test global class changes across all components

---

## 📋 Auto-Fix Available (--fix flag)

1. Extract duplicate styles to global classes
2. Replace hardcoded values with CSS variables
3. Remove unused styles
4. Add proper class naming

---

## 📚 References

- [Angular Component Styles](https://angular.dev/guide/component-styles)
- [CSS Architecture](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Organizing)
