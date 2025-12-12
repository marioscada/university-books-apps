---
description: Quick Angular code review
---

Perform a quick Angular code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/framework/angular.md

Focus on:
- Naming & file structure
- Dependency injection (inject() vs constructor)
- Component responsibilities
- Signals usage
- Standalone components

Generate markdown report in: docs/reviews/angular-{{timestamp}}.md

Include:
- 🔴 Critical issues found
- 🟡 Warnings
- 📋 Auto-fixable items
- Summary statistics
