# Copilot Instructions
This repository is for a modern production-minded fullstack website.

## General principles
- Use TypeScript for all application code.
- Prefer simple, maintainable solutions over clever abstractions.
- Keep code readable, modular, and easy to review.
- Avoid changing unrelated files.
- Reuse existing patterns before introducing new ones.
- Keep implementations incremental and review-friendly.

## Architecture
- Prefer a clean separation between UI, business logic, and data access.
- Keep components focused and composable.
- Prefer shared utilities over duplicated logic.
- Prefer predictable folder structure and naming.

## Frontend expectations
- Prefer Next.js with App Router unless the task clearly requires something else.
- Prefer Tailwind CSS for styling.
- Build responsive layouts with a mobile-first approach.
- Use semantic HTML.
- Prioritize accessibility:
  - correct heading hierarchy
  - labels for inputs
  - keyboard-friendly interactions
  - sufficient contrast
  - accessible button and link text

## Backend expectations
- Validate all external inputs.
- Keep handlers/controllers thin.
- Move reusable logic into services/lib/domain modules.
- Return predictable response shapes.
- Handle empty, loading, and error states.

## Performance and SEO
- Prefer server rendering where it makes sense.
- Avoid unnecessary client-side code.
- Optimize for Core Web Vitals where practical.
- Use meaningful metadata and page titles.
- Prefer accessible, crawlable content structure.

## Dependencies
- Do not add dependencies unless clearly justified.
- When adding a dependency:
  - explain why it is needed
  - prefer widely adopted and actively maintained packages
  - avoid overlapping libraries

## Testing and quality
- Add tests for meaningful logic when appropriate.
- Do not add fake or placeholder tests.
- Check for:
  - broken imports
  - unused code
  - obvious edge cases
  - missing states
  - type safety

## Output expectations for Copilot
When implementing a feature:
1. briefly inspect existing structure
2. propose a short plan
3. implement the smallest complete version first
4. summarize files created or changed
5. mention any follow-up improvements if relevant

## Preferred output style
- Be concise and practical.
- Generate complete files when creating new files.
- When editing existing files, preserve working behavior unless the task explicitly asks for refactoring.
- Prefer production-ready starter code over pseudo-code.
