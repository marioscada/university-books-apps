# TypeScript Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/microsoft/TypeScript
- https://www.typescriptlang.org/docs/
- https://github.com/labs42io/clean-code-typescript

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Type Safety
- [ ] No `any` type without explicit justification
- [ ] Use `unknown` instead of `any` when type is truly unknown
- [ ] No unsafe type assertions (use type guards instead)
- [ ] Strict null checks enabled in tsconfig.json
- [ ] Return types explicitly declared on functions

### Naming Conventions
- [ ] Use meaningful and pronounceable names
- [ ] Use consistent vocabulary (not getUserInfo(), getClientData(), getCustomerRecord())
- [ ] Use searchable names (no magic numbers/strings - use named constants)
- [ ] Avoid unnecessary context in names

### Functions
- [ ] Function arguments: max 2-3 parameters (use object parameter for more)
- [ ] Functions do one thing only
- [ ] Function names clearly describe what they do
- [ ] Use default arguments instead of conditionals
- [ ] No flag arguments (boolean parameters that change function behavior)
- [ ] Extract utility functions to separate .utils.ts files
- [ ] Shared utilities in shared/utils/ directory
- [ ] Component-specific utilities in component-name.utils.ts

### Interfaces & Types
- [ ] Prefer interfaces for object shapes
- [ ] Use type for unions, tuples, primitives
- [ ] Use readonly for immutable properties
- [ ] Prefer const assertions for literal types
- [ ] Define interfaces/types in separate .model.ts files (not in component/service files)
- [ ] Shared types in shared/models/ directory
- [ ] Component-specific types in component-name.model.ts

### Enums
- [ ] Use enums to document intent
- [ ] Prefer string enums over numeric enums
- [ ] Enum values are UPPER_SNAKE_CASE or 'string-literal'

---

## 🟡 WARNINGS (Should Fix)

### Error Handling
- [ ] Throw Error objects (not strings or plain objects)
- [ ] Use custom error classes for specific error types
- [ ] Always handle promise rejections

### Classes
- [ ] Use readonly for properties that don't change
- [ ] Prefer composition over inheritance
- [ ] Avoid deep inheritance hierarchies

### Async/Await
- [ ] Prefer async/await over Promise chains
- [ ] Use try/catch for async error handling

### Utility Types
- [ ] Use built-in utility types (Partial, Required, Pick, Omit, Readonly, etc.)
- [ ] Create type guards for runtime checks with `is` predicate

---

## 🟢 BEST PRACTICES
- [ ] Use generics for reusable type-safe code
- [ ] Use const for values that don't change
- [ ] Enable all strict compiler options
- [ ] No unused variables or imports
- [ ] Consistent code formatting

---

## 📋 Auto-Fix Available (--fix flag)
1. Replace `any` with `unknown` + type guards
2. Add missing return types
3. Add readonly to immutable properties
4. Replace magic numbers with named constants
5. Remove unused imports/variables

---

## 📚 References
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [GitHub: microsoft/TypeScript](https://github.com/microsoft/TypeScript)
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
