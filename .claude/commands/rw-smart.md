---
description: Review smart/container components
---

Review smart components in: {{glob_pattern}}

Reference rules: .vscode/review-rules/components/smart-components.md

Focus on:
- Business logic and data fetching
- Service injection
- State management (signals/observables)
- Routing handling
- Error handling
- Template simplicity

Generate markdown report in: docs/reviews/smart-components-{{timestamp}}.md

Include:
- Components that should be smart but aren't
- Smart components with too much presentation
- Missing error handling
