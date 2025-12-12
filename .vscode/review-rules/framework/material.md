# Angular Material Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/angular/components
- https://material.angular.dev/
- https://material.angular.dev/guide/getting-started

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Component Imports
- [ ] Import Material components from specific package (e.g., `@angular/material/button`)
- [ ] Never import entire Material library
- [ ] Use individual imports for tree-shaking

### Accessibility (WCAG AA)
- [ ] All form fields have mat-label
- [ ] Icon-only buttons have aria-label
- [ ] Color is not the only visual indicator (use icons + color + text)
- [ ] Support keyboard navigation
- [ ] Sufficient color contrast ratios

### Theming
- [ ] Use Material Design System tokens (--mat-sys-primary, etc.)
- [ ] Never use hardcoded colors
- [ ] Define custom theme with mat.define-palette()
- [ ] Apply theme with mat.all-component-themes()

### Typography
- [ ] Use Material typography classes (mat-headline-1, mat-body-1, etc.)
- [ ] Don't override with custom font sizes

### Forms
- [ ] All inputs wrapped in mat-form-field
- [ ] Use mat-error for validation messages
- [ ] Show specific error messages per validation rule

---

## 🟡 WARNINGS (Should Fix)

### Component Usage
- [ ] Use appropriate button types (mat-button, mat-raised-button, mat-fab) per emphasis
- [ ] Use mat-icon with Material Icons or registered SVG icons
- [ ] Never use Font Awesome inside mat-icon

### Dialogs & Overlays
- [ ] Inject MAT_DIALOG_DATA and MatDialogRef properly
- [ ] Allow ESC and backdrop click to close (disableClose: false)
- [ ] Set autoFocus: true for dialogs

### Tables
- [ ] Use MatTableDataSource (not plain arrays)
- [ ] Enable sorting, filtering, pagination where appropriate

### CDK Usage
- [ ] Use CDK for custom components (Overlay, DragDrop, VirtualScroll, etc.)

---

## 🟢 BEST PRACTICES
- [ ] Use elevation tokens (--mat-sys-level1) instead of custom box-shadow
- [ ] Support density for compact UIs with mat.form-field-density()
- [ ] Test components in both light and dark themes
- [ ] Screen reader tested (NVDA, JAWS, VoiceOver, TalkBack)

---

## 📋 Auto-Fix Available (--fix flag)
1. Add missing mat-label to form fields
2. Add aria-label to icon-only buttons
3. Replace hardcoded colors with CSS variables
4. Import individual Material modules
5. Add mat-error for form validation

---

## 📚 References
- [Angular Material Docs](https://material.angular.dev/)
- [GitHub: angular/components](https://github.com/angular/components)
- [Material Design Guidelines](https://m3.material.io/)
- [Accessibility Guide](https://material.angular.dev/guide/accessibility)
