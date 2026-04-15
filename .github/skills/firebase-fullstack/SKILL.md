---
name: firebase-fullstack
description: Use this skill when implementing Firebase-backed website features, including Auth, Firestore, Storage, env setup, client/server separation, and security rules.
---

# Firebase Fullstack Skill

Use this skill when the task involves:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- security rules
- Firebase setup in a web app
- login/signup flows
- protected user data
- profile, dashboard, admin, or CRUD features backed by Firebase

## Objectives
- keep Firebase integration secure and maintainable
- separate setup, auth, database access, and UI concerns
- avoid insecure starter patterns
- keep code scalable for future features

## Architecture guidance
Prefer separating the code into clear areas such as:
- `lib/firebase/` for app initialization
- `lib/auth/` for auth helpers
- `lib/firestore/` for database access functions
- `lib/storage/` for file upload helpers if needed
- `firebase/` or project root files for rules/config where appropriate

When relevant:
- keep reusable Firebase initialization centralized
- do not duplicate initialization logic
- keep Firestore queries in reusable helpers/services
- keep UI components free of raw Firebase complexity where practical

## Authentication guidance
- support clear sign-in and sign-out flows
- keep auth state handling predictable
- protect user-specific data by user identity
- prefer patterns that make session/auth state easy to understand
- consider persistence behavior explicitly

## Firestore guidance
- define collections and document structure intentionally
- validate required fields before writes
- use predictable data shapes
- avoid spreading raw query logic everywhere
- keep reads/writes easy to trace

## Security rules guidance
Always think about security rules when generating Firebase-backed features.
Do not assume client code alone is enough for security.

For Firestore-backed user data:
- restrict access by authenticated user identity where appropriate
- validate ownership for user-scoped documents
- validate required fields and allowed updates where relevant
- avoid overly permissive rules

When rules are needed:
- generate or update Firestore Security Rules
- explain what the rules protect
- keep rules aligned with the data model

## Environment and setup guidance
When adding Firebase config:
- clearly identify required environment variables
- document where they should be added
- avoid hardcoding secrets
- distinguish public client config from server-only secrets when relevant

## Output expectations
When using this skill, provide:
1. short architecture summary
2. files to create or update
3. Firebase setup notes
4. auth/data/rules summary
5. environment variables required
6. any important security notes

## Things to avoid
- insecure example rules in production code
- duplicated Firebase initialization
- mixing auth, UI, and data access in one file
- undocumented environment variables
- unclear ownership rules for user data
