---
name: api-feature-builder
description: Use this skill when implementing an API-backed feature, route handler, form submission flow, validation, or server-side logic for a website.
---

# API Feature Builder Skill

Use this skill when the task involves:
- creating an API endpoint
- adding a form submission flow
- implementing server-side feature logic
- handling database or external service calls
- validating input and shaping responses

## Objectives
- keep the request flow easy to follow
- validate external input
- separate transport logic from business logic
- return predictable responses
- handle failure states clearly

## Recommended flow
1. define the input shape
2. validate input
3. call domain/service logic
4. return a clear success or error response
5. keep side effects explicit
6. document env vars or setup requirements if added

## Architecture guidance
- keep route handlers/controllers thin
- move reusable logic into services/lib/domain modules
- keep validation close to entry points
- avoid mixing UI concerns into backend logic
- prefer explicit types over loosely typed objects

## Error handling
Always think about:
- invalid input
- missing required data
- external service failure
- unexpected exceptions
- predictable user-facing failure states

## Response shape guidance
Prefer consistent response structures such as:
- success boolean
- data payload when successful
- error message or code when unsuccessful

## Output expectations
When using this skill, provide:
1. short flow summary
2. files created/updated
3. validation notes
4. request/response behavior summary
5. setup or environment notes if needed

## Things to avoid
- fat handlers
- missing validation
- inconsistent response shapes
- hidden side effects
- undocumented environment assumptions
