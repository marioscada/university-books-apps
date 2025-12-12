# Unit Testing Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/guide/testing
- https://github.com/testing-library/angular-testing-library

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Test Coverage
- [ ] All components have unit tests
- [ ] All services have unit tests
- [ ] All pipes have unit tests
- [ ] Critical business logic is tested
- [ ] Edge cases are covered

### Test Isolation
- [ ] Tests don't depend on other tests
- [ ] Each test can run independently
- [ ] Tests clean up after themselves
- [ ] No shared mutable state between tests

### Mocking
- [ ] External dependencies are mocked
- [ ] HTTP calls use HttpTestingController
- [ ] Don't test implementation details
- [ ] Mock at service boundaries

---

## 🟡 WARNINGS (Should Fix)

### Test Organization
- [ ] One describe block per component/service
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test names describe what they test
- [ ] Group related tests in nested describe blocks

### Testing Library Principles
- [ ] Test from user's perspective (not implementation)
- [ ] Query by role, label, or text (not by CSS class or ID)
- [ ] Interact like a user would (click, type, etc.)
- [ ] Assert on visible outcomes

### Async Testing
- [ ] Use fakeAsync/tick for async operations
- [ ] Use waitFor from Testing Library
- [ ] All async operations complete before test ends
- [ ] No setTimeout in tests (use tick())

---

## 🟢 BEST PRACTICES
- [ ] Write tests before fixing bugs (TDD)
- [ ] Keep tests simple and readable
- [ ] One assertion per test (when possible)
- [ ] Test behavior, not implementation
- [ ] Use Testing Library utilities
- [ ] High-value tests over 100% coverage

---

## 📋 Auto-Fix Available (--fix flag)
1. Generate missing test files
2. Add missing test setup boilerplate
3. Fix async test patterns
4. Add proper cleanup in afterEach

---

## 📚 References
- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Angular Testing Library](https://github.com/testing-library/angular-testing-library)
- [Testing Best Practices](https://angular.dev/guide/testing-components-basics)
