---
name: qa-checklist
description: Use this skill before finalizing a feature to review quality, correctness, accessibility, responsiveness, and obvious integration issues.
---

# QA Checklist Skill

Use this skill when:
- a feature is nearly complete
- code has been generated and should be reviewed
- a page or API flow should be sanity-checked
- the task needs a quick quality pass before handoff

## Review areas

### 1. Code correctness
- broken imports
- missing exports
- incorrect file references
- obvious type issues
- inconsistent naming

### 2. UI quality
- responsive layout issues
- overflow or spacing issues
- broken hierarchy
- inaccessible controls
- missing labels or unclear button text

### 3. State handling
- loading states
- empty states
- error states
- success feedback where needed

### 4. Backend and flow quality
- input validation present
- failure cases handled
- predictable response structure
- missing environment assumptions

### 5. Cleanup
- dead code
- unused imports
- duplicate logic
- placeholder content accidentally left in place

## Output format
When using this skill, return:
1. pass/fail checklist
2. issues that should be fixed now
3. optional improvements
4. short overall assessment

## Severity guidance
Classify issues roughly as:
- critical: likely broken or unsafe
- important: should be fixed before merge
- minor: polish or maintainability improvement

## Goal
Catch the most likely problems before the work is considered done.
Do not invent speculative issues without grounding them in the actual implementation.
