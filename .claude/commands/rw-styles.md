---
description: Review CSS/SCSS styles
---

Review styles (CSS/SCSS) in: {{glob_pattern}}

Reference rules: .vscode/review-rules/framework/styles.md

Focus on:
- Global vs component styles
- Duplicate styles across components
- CSS custom properties usage
- Global utility classes
- Style encapsulation

Generate markdown report in: docs/reviews/styles-{{timestamp}}.md

Include:
- 🔴 Duplicate styles that should be global
- Global classes that should be created
- CSS variables recommendations
- Style organization suggestions
