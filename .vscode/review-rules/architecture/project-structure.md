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
- [ ] **Component Separation**: pages/ and components/ folders
- [ ] **Services Organization**: services/ folder with service-specific subdirectories
- [ ] **Service Models**: service-name.service.model.ts for service-private models
- [ ] **Service Utils**: service-name.service.utils.ts for service-private utilities
- [ ] **Shared Service Assets**: services/models/ and services/utils/ for multi-service shared code

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
│   │       ├── pages/                 # SMART components (pages, containers)
│   │       │   └── user-list-page/
│   │       │       ├── user-list-page.component.ts
│   │       │       ├── user-list-page.component.html
│   │       │       ├── user-list-page.component.scss
│   │       │       ├── user-list-page.model.ts
│   │       │       └── user-list-page.utils.ts
│   │       ├── components/            # Presentational components
│   │       │   └── user-card/
│   │       │       ├── user-card.component.ts
│   │       │       ├── user-card.component.html
│   │       │       ├── user-card.component.scss
│   │       │       ├── user-card.model.ts
│   │       │       └── user-card.utils.ts
│   │       ├── services/              # Feature services
│   │       │   ├── models/            # Models shared by multiple services
│   │       │   ├── utils/             # Utils shared by multiple services
│   │       │   └── user/              # Specific service with private assets
│   │       │       ├── user.service.ts
│   │       │       ├── user.service.model.ts    # Service-specific models
│   │       │       └── user.service.utils.ts    # Service-specific utils
│   │       ├── models/                # Feature-wide shared models
│   │       └── utils/                 # Feature-wide shared utils
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
- [ ] **Smart Components**: Folder `pages/component-name-page/`
- [ ] **Presentational Components**: Folder `components/component-name/`
- [ ] **Component Files**: `component-name.component.ts`, `component-name.model.ts`, `component-name.utils.ts`
- [ ] **Service Files**: `service-name.service.ts`, `service-name.service.model.ts`, `service-name.service.utils.ts`
- [ ] **Service Private Assets**: Inside service folder (services/service-name/)
- [ ] **Service Shared Assets**: In services/models/ and services/utils/
- [ ] **Feature Shared**: In feature-level models/ and utils/

---

## 🟡 WARNINGS (Should Fix)

### Feature Organization
- [ ] Each feature has its own directory
- [ ] Features are self-contained with clear folder structure:
  - `pages/` for pages/containers
  - `components/` for presentational
  - `services/` for feature services
  - `models/` for feature-wide shared models
  - `utils/` for feature-wide shared utilities
- [ ] Feature routes lazy loaded
- [ ] Shared code extracted to shared/
- [ ] No interfaces/types directly in component/service files (use .model.ts)
- [ ] No utility functions directly in component/service files (use .utils.ts)
- [ ] Service-specific models/utils inside service folder
- [ ] Multi-service shared models/utils in services/models/ and services/utils/
- [ ] Check sharing scope before creating model/util file (service-only, multi-service, feature-wide)

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
