# Bundle Size Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://angular.dev/tools/cli/build
- https://web.dev/performance-budgets/

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Bundle Budgets
- [ ] Performance budgets defined in angular.json
- [ ] Initial bundle < 500KB
- [ ] Total bundles < 2MB
- [ ] Build fails if budgets exceeded

### Import Optimization
- [ ] Import from specific paths (not barrel imports for large libs)
- [ ] No entire library imports (e.g., import * from 'lodash')
- [ ] Use tree-shakeable libraries

### Production Build
- [ ] AOT compilation enabled
- [ ] Build optimizer enabled
- [ ] Source maps disabled in production
- [ ] Minification enabled

---

## 🟡 WARNINGS (Should Fix)

### Dependencies
- [ ] Analyze dependencies with webpack-bundle-analyzer
- [ ] Remove unused dependencies
- [ ] Use lighter alternatives where possible
- [ ] Check for duplicate dependencies

### Code Splitting
- [ ] Vendor bundle separate from app code
- [ ] Common code extracted to shared chunks
- [ ] Dynamic imports for large features

---

## 🟢 BEST PRACTICES
- [ ] Monitor bundle size in CI
- [ ] Regular dependency audits
- [ ] Use CDN for common libraries
- [ ] Compress assets (gzip/brotli)

---

## 📚 References
- [Angular Build Optimization](https://angular.dev/tools/cli/build)
- [Performance Budgets](https://web.dev/performance-budgets/)
