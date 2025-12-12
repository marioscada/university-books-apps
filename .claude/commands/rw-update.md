---
description: Update review rules from GitHub
---

Update all review rules from official GitHub sources.

For each rule file in .vscode/review-rules/:
1. Check "Last Checked" date
2. Fetch latest from official sources
3. Compare with current rules
4. Update if new best practices found
5. Update version and "Last Checked" date

Sources to check:
- https://github.com/angular/angular
- https://github.com/ionic-team/ionic-framework
- https://github.com/angular/components
- https://github.com/microsoft/TypeScript
- https://github.com/ReactiveX/rxjs
- https://github.com/nrwl/nx
- https://github.com/labs42io/clean-code-typescript
- https://github.com/testing-library/angular-testing-library

Generate update report in: docs/reviews/rules-update-{{timestamp}}.md

Include:
- Files updated
- New rules added
- Deprecated rules removed
- Change summary per file
