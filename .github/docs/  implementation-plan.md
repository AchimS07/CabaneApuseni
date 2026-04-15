
---

## `docs/implementation-plan.md`

```md
# Implementation Plan

## Document Purpose
This document defines the recommended implementation order for the Next.js + Firebase MVP with user/admin roles.

---

## 1. Delivery Strategy
Build the MVP in the following order:
1. project setup and structure
2. public pages and layout
3. Firebase initialization
4. authentication flows
5. user profile creation and retrieval
6. user dashboard
7. admin dashboard and role guard
8. Firestore rules
9. QA and cleanup

This sequence reduces confusion and ensures role-based access is added on top of a working auth/data foundation.

---

## 2. Phase 1: Project Setup and Structure

### Goals
- establish app structure
- define folders for auth, Firestore, roles, and UI
- add docs and README baseline
- verify project runs locally

### Tasks
- initialize Next.js project
- add styling setup
- create folder structure
- create placeholder route files
- create docs folder
- define environment variable placeholders

### Deliverables
- working project skeleton
- documented folder structure
- initial README

---

## 3. Phase 2: Public Pages and Shared Layout

### Goals
- establish the public-facing website shell
- create responsive navigation and footer
- provide a polished baseline UI

### Tasks
- build navbar
- build footer
- build Home page
- build About page
- build Contact page
- ensure responsive behavior

### Deliverables
- responsive public site
- shared layout components

---

## 4. Phase 3: Firebase Initialization

### Goals
- centralize Firebase setup
- prepare auth and Firestore services
- document environment variables

### Tasks
- create Firebase client initialization
- create service folders
- define environment variable expectations
- verify app can connect to Firebase services

### Deliverables
- reusable Firebase initialization
- documented configuration

---

## 5. Phase 4: Authentication Flows

### Goals
- allow users to register, log in, and log out
- centralize auth state handling

### Tasks
- implement register form
- implement login form
- implement logout action
- create auth service helpers
- create auth context or equivalent auth state handling
- display auth-aware navigation options

### Deliverables
- working registration/login/logout
- centralized auth handling

---

## 6. Phase 5: User Profile Creation and Retrieval

### Goals
- create a Firestore profile for each registered user
- store role information
- make profile retrieval reusable

### Tasks
- define `users/{uid}` profile shape
- create user profile on registration
- set default role to `user`
- implement profile retrieval helper
- implement typed profile model if desired

### Deliverables
- Firestore user profile creation
- reusable profile service

---

## 7. Phase 6: User Dashboard

### Goals
- create a protected user dashboard
- show authenticated user's profile information

### Tasks
- add dashboard route
- protect route from unauthenticated access
- fetch current user's profile
- render profile UI
- add loading/error/empty states

### Deliverables
- protected dashboard
- user profile displayed correctly

---

## 8. Phase 7: Admin Dashboard and Role Guard

### Goals
- create a protected admin route
- restrict admin access to users with admin role

### Tasks
- add `/admin` route
- create role guard
- load current user role
- block or redirect regular users
- optionally show admin link only for admin role

### Deliverables
- working admin-only route
- role-aware access behavior

---

## 9. Phase 8: Firestore Security Rules

### Goals
- align app behavior with backend enforcement
- prevent unauthorized access to user data

### Tasks
- create Firestore rules for user profile ownership
- define initial admin-capable extension strategy
- confirm regular users cannot broadly read all profiles
- document assumptions around admin access

### Deliverables
- Firestore security rules
- documented access model

---

## 10. Phase 9: QA and Cleanup

### Goals
- validate all core flows
- fix blockers and inconsistencies
- stabilize MVP

### Tasks
- test public pages
- test registration/login/logout
- test user dashboard access
- test admin dashboard access
- test role behavior
- test responsive layout
- clean dead code and unused imports
- update README

### Deliverables
- release-ready MVP baseline
- resolved blockers or documented issues

---

## 11. Suggested Role-Based Workflow

### Product Owner
- confirm public/user/admin requirements
- confirm role model
- approve MVP scope

### Architect
- validate service boundaries
- validate role enforcement strategy
- validate future admin extension path

### Fullstack Developer
- build routes, components, auth, and Firestore services
- connect UI and backend logic
- implement role-aware guards

### QA
- validate access behavior
- validate auth and dashboard flows
- validate user/admin separation

---

## 12. Risks During Implementation
- auth state timing issues
- profile creation race conditions
- role data not loaded consistently
- admin access guard mismatches
- security rules not matching frontend expectations
- accidental exposure of admin links or routes

---

## 13. Definition of Done
The MVP is done when:
- public site works responsively
- registration/login/logout work
- Firestore user profile is created correctly
- dashboard works for authenticated users
- admin dashboard is accessible only to admins
- rules protect data as intended
- setup is documented
- critical QA scenarios pass

---

## 14. Post-MVP Follow-Up Ideas
- profile editing
- admin user list
- admin role management
- password reset
- richer dashboard cards
- analytics
- content management
- upload support
