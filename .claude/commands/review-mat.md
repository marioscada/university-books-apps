---
description: Quick Material code review
---

Perform a quick Angular Material code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/framework/material.md

Focus on:
- Component imports (tree-shaking)
- Accessibility (WCAG AA compliance)
- Theming with design tokens
- Typography classes
- Form patterns

Generate markdown report in: docs/reviews/material-{{timestamp}}.md

Include:
- 🔴 Critical issues (especially accessibility)
- 🟡 Warnings
- Auto-fixable items
