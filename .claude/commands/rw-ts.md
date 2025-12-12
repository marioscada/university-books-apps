---
description: Quick TypeScript code review
---

Perform a quick TypeScript code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/language/typescript.md

Focus on:
- Type safety (no any, proper types)
- Naming conventions
- Function design (arguments, single responsibility)
- Interfaces vs types
- Error handling

Generate markdown report in: docs/reviews/typescript-{{timestamp}}.md

Include:
- 🔴 Critical type safety issues
- 🟡 Code quality warnings
- Auto-fixable items
