# Code Review Rules

Official coding standards and best practices for this project.

## Structure

```
review-rules/
├── framework/          # Angular, Ionic, Material
├── language/           # TypeScript
├── patterns/           # RxJS, Clean Code
├── architecture/       # Nx Monorepo, Project Structure
├── components/         # Smart, Presentational, Standalone, Lifecycle
├── state-management/   # Signals, Services
├── performance/        # Change Detection, Lazy Loading, Bundle Size
├── testing/            # Unit Tests
└── accessibility/      # WCAG AA Compliance
```

## Rule Format

Each rule file contains:
- **Version**: Last update date
- **Official Sources**: GitHub repos and official docs
- **Last Checked**: Date of last verification with sources
- **🔴 Critical Issues**: Must fix
- **🟡 Warnings**: Should fix
- **🟢 Best Practices**: Recommended
- **📋 Auto-Fix**: Items fixable with --fix flag
- **📚 References**: Links to official documentation

## Using Rules

Rules are referenced automatically by slash commands:
- `/review-ng` → `framework/angular.md`
- `/review-ts` → `language/typescript.md`
- `/review-rxjs` → `patterns/rxjs.md`
- etc.

## Updating Rules

Run `/review-update` to fetch latest best practices from official GitHub sources and update all rule files.

## Sources

All rules based on official sources:
- Angular: github.com/angular/angular
- Ionic: github.com/ionic-team/ionic-framework
- Material: github.com/angular/components
- TypeScript: github.com/microsoft/TypeScript
- RxJS: github.com/ReactiveX/rxjs
- Nx: github.com/nrwl/nx
- Clean Code: github.com/labs42io/clean-code-typescript
- Testing Library: github.com/testing-library/angular-testing-library
