---
description: Complete comprehensive code review (all rules)
---

Perform COMPLETE comprehensive code review on: {{glob_pattern}}

**Default scope**: Current directory if no pattern specified
**Usage examples**:
- /rw-all (current directory - comprehensive)
- /rw-all src/app/features/books/** (specific feature)
- /rw-all **/* (entire project - LONG execution time)

Reference rules: .vscode/review-rules/complete-review.md

Apply ALL review categories:
- Framework: Angular, Ionic, Material, Styles
- Language: TypeScript
- Patterns: RxJS (STRICT), Clean Code
- Architecture: Nx Monorepo, Project Structure
- Components: Smart (ONLY services), Presentational (DUMB)
- State: Signals, Services
- Performance: Change Detection, Lazy Loading, Bundle Size
- Testing: Unit Tests
- Accessibility: WCAG 2.1 AA

Priority checks:
1. 🔴 CRITICAL: Memory leaks, services in presentational, security
2. 🟡 HIGH: Performance, architecture, missing tests
3. 🟢 MEDIUM: Naming, structure, style duplicates

Generate comprehensive markdown report in: docs/reviews/complete-{{timestamp}}.md

Report structure:
- Executive Summary (critical issues count)
- 🔴 Critical Issues (must fix immediately)
- 🟡 High Priority (should fix soon)
- 🟢 Medium Priority (fix when possible)
- 📋 Auto-fixable items (with --fix flag)
- Statistics (files reviewed, issues by category)
- Detailed findings per file
- Recommendations and next steps

This is the most thorough review - expect longer execution time.
