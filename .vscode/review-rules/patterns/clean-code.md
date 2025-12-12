# Clean Code Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/labs42io/clean-code-typescript
- Clean Code by Robert C. Martin

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Meaningful Names
- [ ] Variables have meaningful, pronounceable names
- [ ] Use searchable names (no magic values - use named constants)
- [ ] Don't add unnecessary context to names
- [ ] Boolean variables use is/has/should prefix

### Functions
- [ ] Functions do ONE thing only
- [ ] Function names describe what they do (intent-revealing)
- [ ] Functions have 2 or fewer arguments (use object parameter for more)
- [ ] No flag arguments (boolean parameters)
- [ ] Avoid side effects in functions
- [ ] **Function Length**: Keep functions short - break long functions into smaller, specific ones
- [ ] Each small function has a single, clear responsibility
- [ ] Compose complex operations from multiple simple functions

### DRY (Don't Repeat Yourself)
- [ ] No duplicate code
- [ ] Extract common logic into reusable functions
- [ ] Use abstraction to eliminate duplication

### SOLID Principles
- [ ] Single Responsibility: One reason to change
- [ ] Open/Closed: Open for extension, closed for modification
- [ ] Liskov Substitution: Subtypes substitutable for base types
- [ ] Interface Segregation: Many specific interfaces > one general
- [ ] Dependency Inversion: Depend on abstractions

---

## 🟡 WARNINGS (Should Fix)

### Comments
- [ ] Code should be self-explanatory (minimize comments)
- [ ] No commented-out code (use version control)
- [ ] Comments explain "why", not "what"
- [ ] Update comments when code changes

### Error Handling
- [ ] Don't ignore caught errors (log or handle appropriately)
- [ ] Don't ignore rejected promises
- [ ] Provide user feedback on errors

### Conditionals
- [ ] Use positive conditionals (avoid double negatives)
- [ ] Encapsulate conditionals in named functions
- [ ] Avoid deeply nested conditionals (early returns)

### Classes
- [ ] Classes are small and focused (not "God classes")
- [ ] Follow Single Responsibility Principle
- [ ] Prefer composition over inheritance

---

## 🟢 BEST PRACTICES
- [ ] Group related code together
- [ ] Consistent formatting and style
- [ ] Avoid premature optimization (clear code first)
- [ ] Write code for humans, not machines
- [ ] Boy Scout Rule: Leave code cleaner than you found it

---

## 📋 Auto-Fix Available (--fix flag)
1. Remove commented-out code
2. Extract magic numbers to constants
3. Split functions with multiple responsibilities
4. Add error handling to promises
5. Rename unclear variables

---

## 📚 References
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
