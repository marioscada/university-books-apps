---
description: Quick RxJS code review
---

Perform a quick RxJS code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/patterns/rxjs.md

Focus on:
- Memory leaks (unsubscribe, takeUntilDestroyed)
- Operator selection (switchMap vs mergeMap vs concatMap)
- Error handling
- Subject usage and exposure
- Hot vs cold observables

Generate markdown report in: docs/reviews/rxjs-{{timestamp}}.md

Include:
- 🔴 Critical issues (memory leaks!)
- 🟡 Warnings
- Operator recommendations
