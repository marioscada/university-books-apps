---
description: Review presentational components
---

Review presentational components in: {{glob_pattern}}

Reference rules: .vscode/review-rules/components/presentational.md

Focus on:
- Input/output only (no services)
- OnPush change detection
- Immutability
- Component purity
- Template logic complexity
- Reusability

Generate markdown report in: docs/reviews/presentational-{{timestamp}}.md

Include:
- Components with service injection
- Missing OnPush
- Mutating inputs
- Business logic in presentational components
