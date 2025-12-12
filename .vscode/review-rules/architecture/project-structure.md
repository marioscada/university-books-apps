# Project Structure Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/style-guide
- https://angular.dev/guide/file-structure

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Directory Organization
- [ ] All code in src/ directory
- [ ] Bootstrap in main.ts
- [ ] Group related files in same directory
- [ ] Organize by feature (not by type)
- [ ] Core module/folder for singletons
- [ ] Shared module/folder for reusables

### File Structure
```
src/
├── app/
│   ├── core/           # Singleton services, guards, interceptors
│   ├── shared/         # Reusable components, directives, pipes
│   │   ├── models/     # Shared interfaces/types
│   │   └── utils/      # Shared utility functions
│   ├── features/       # Feature modules/components
│   │   └── users/
│   │       ├── models/           # Feature-specific models
│   │       ├── utils/            # Feature-specific utils
│   │       └── components/
│   │           └── user-card/
│   │               ├── user-card.component.ts
│   │               ├── user-card.component.html
│   │               ├── user-card.component.scss
│   │               ├── user-card.model.ts      # Component models
│   │               └── user-card.utils.ts      # Component utils
│   ├── app.routes.ts
│   └── app.component.ts
├── styles/             # Global styles
│   ├── _variables.scss  # CSS variables, design tokens
│   ├── _utilities.scss  # Utility classes (spacing, typography, etc.)
│   ├── _buttons.scss    # Reusable button styles
│   └── _cards.scss      # Reusable card styles
├── styles.scss         # Main global styles entry point
├── assets/
├── environments/
└── index.html
```

### Naming Conventions
- [ ] Consistent file naming (kebab-case)
- [ ] Suffix indicates file type (.component, .service, .pipe, .model, .utils, etc.)
- [ ] Match file name to export name
- [ ] Component-specific files: `component-name.model.ts`, `component-name.utils.ts`
- [ ] Shared files organized in dedicated directories (shared/models/, shared/utils/)

---

## 🟡 WARNINGS (Should Fix)

### Feature Organization
- [ ] Each feature has its own directory
- [ ] Features are self-contained
- [ ] Feature routes lazy loaded
- [ ] Shared code extracted to shared/
- [ ] No interfaces/types directly in component files (use .model.ts)
- [ ] No utility functions directly in component files (use .utils.ts)
- [ ] Check if model/util should be shared before creating component-specific file

### Module Organization (if using NgModules)
- [ ] CoreModule imported once in AppModule
- [ ] SharedModule imported in feature modules
- [ ] Feature modules lazy loaded

---

## 🟢 BEST PRACTICES
- [ ] Flat structure until it grows
- [ ] Folders for features with 7+ files
- [ ] Clear separation of concerns
- [ ] Consistent patterns across features
- [ ] Global styles organized in src/styles/ directory
- [ ] Reusable CSS classes for consistent design system

---

## 📚 References
- [Angular Style Guide](https://angular.dev/style-guide)
- [File Structure](https://angular.dev/guide/file-structure)
