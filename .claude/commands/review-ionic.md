---
description: Quick Ionic code review
---

Perform a quick Ionic framework code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/framework/ionic.md

Focus on:
- Ionic component usage vs native HTML
- Navigation patterns
- Platform-specific code
- Theming with CSS variables
- Accessibility

Generate markdown report in: docs/reviews/ionic-{{timestamp}}.md

Include:
- 🔴 Critical issues found
- 🟡 Warnings
- Summary with file-by-file breakdown
