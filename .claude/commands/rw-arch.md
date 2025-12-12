---
description: Quick architecture review
---

Perform architecture review on: {{glob_pattern}}

Reference rules:
- .vscode/review-rules/architecture/nx-monorepo.md
- .vscode/review-rules/architecture/project-structure.md

Focus on:
- Nx library organization and types
- Module boundaries and dependencies
- Circular dependencies
- Project structure and feature organization
- Tags and constraints

Generate markdown report in: docs/reviews/architecture-{{timestamp}}.md

Include:
- 🔴 Critical architectural violations
- Dependency graph analysis
- Recommendations
