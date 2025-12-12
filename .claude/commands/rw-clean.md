---
description: Quick clean code review
---

Perform a quick clean code review on: {{glob_pattern}}

Reference rules: .vscode/review-rules/patterns/clean-code.md

Focus on:
- Meaningful names
- Function design (single responsibility, max 2-3 args)
- DRY principle
- SOLID principles
- Comments and code clarity

Generate markdown report in: docs/reviews/clean-code-{{timestamp}}.md

Include:
- 🔴 Critical violations
- 🟡 Code smells
- Refactoring suggestions
