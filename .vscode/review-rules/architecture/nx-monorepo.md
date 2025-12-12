# Nx Monorepo Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/nrwl/nx
- https://nx.dev/docs

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Library Organization
- [ ] Libraries follow grouping scope convention (libs/scope/type)
- [ ] Libraries have defined types: feature, ui, data-access, util
- [ ] Feature libs depend on data-access, ui, util only
- [ ] UI libs depend on util only (no data-access)
- [ ] Util libs have no dependencies

### Dependency Rules
- [ ] No circular dependencies between libraries
- [ ] Enforce module boundaries with @nx/enforce-module-boundaries ESLint rule
- [ ] Libraries use tags for scope and type
- [ ] Dependency constraints defined in .eslintrc.json

### Project Configuration
- [ ] Each library has project.json with proper configuration
- [ ] Libraries have appropriate tags (scope:*, type:*, platform:*)
- [ ] Public API exposed through index.ts

---

## 🟡 WARNINGS (Should Fix)

### Buildable Libraries
- [ ] Large libraries are buildable for incremental builds
- [ ] Build target configured in project.json for buildable libs

### Path Mappings
- [ ] Use TypeScript path mappings (@myapp/scope/lib)
- [ ] Never use relative paths across libraries

### Workspace Generators
- [ ] Use workspace generators for consistency
- [ ] Don't manually create libraries

---

## 🟢 BEST PRACTICES
- [ ] Use nx affected commands in CI (affected:test, affected:build)
- [ ] Enable computation caching in nx.json
- [ ] Declare implicit dependencies where needed
- [ ] Follow recommended library structure
- [ ] Use Nx Console for visualizing project graph

---

## 📋 Auto-Fix Available (--fix flag)
1. Add missing project.json tags
2. Fix import paths to use path mappings
3. Add missing public API exports
4. Update .eslintrc with module boundaries

---

## 📚 References
- [Nx Documentation](https://nx.dev/docs)
- [GitHub: nrwl/nx](https://github.com/nrwl/nx)
- [Module Boundaries](https://nx.dev/core-features/enforce-module-boundaries)
- [Library Types](https://nx.dev/more-concepts/library-types)
