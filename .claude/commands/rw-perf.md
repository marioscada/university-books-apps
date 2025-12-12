---
description: Quick performance review
---

Performance review on: {{glob_pattern}}

Reference rules:
- .vscode/review-rules/performance/change-detection.md
- .vscode/review-rules/performance/lazy-loading.md
- .vscode/review-rules/performance/bundle-size.md

Focus on:
- OnPush usage
- TrackBy with ngFor
- Template performance
- Lazy loading
- Bundle sizes

Generate markdown report in: docs/reviews/performance-{{timestamp}}.md

Include:
- 🔴 Performance killers
- Bundle analysis
- Optimization recommendations
