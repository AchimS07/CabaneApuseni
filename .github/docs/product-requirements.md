# Product Requirements

## Project Name
Next.js + Firebase Website with User and Admin Roles

## Document Purpose
This document defines the MVP product requirements for a modern website built with Next.js and Firebase, supporting:
- public pages
- user authentication
- user dashboard
- admin-only area
- role-based access control

---

## 1. Problem Statement
We need a website foundation that supports both public visitors and authenticated users, while also providing an admin-only area for internal management.

The MVP should allow:
- visitors to browse the public site
- users to register and log in
- users to access their own dashboard and profile data
- admins to access an admin dashboard unavailable to regular users

The solution should be easy to extend in future iterations without requiring major restructuring.

---

## 2. Business Goal
Build a production-minded starter that:
- launches quickly
- supports authenticated product growth
- introduces role-based access from the beginning
- uses Firebase for authentication and database storage
- is maintainable for future feature expansion

---

## 3. Target Users

### Public Visitor
A person who wants to:
- view information about the business or product
- browse public pages
- contact the business
- optionally register for an account

### Registered User
A person who wants to:
- create an account
- log in securely
- access a protected dashboard
- view their own profile/account data

### Admin
An internal user who wants to:
- log in securely
- access an admin dashboard
- view privileged admin-only sections
- manage or review user-related data in future phases

---

## 4. MVP Scope

### In Scope
- Public website pages
- Shared responsive layout
- User registration
- User login
- User logout
- Firebase Authentication
- Firestore user profile document creation
- Role field stored in user profile
- Protected user dashboard
- Protected admin dashboard
- Role-aware navigation behavior
- Firestore security rules for user/admin access
- Environment variable documentation
- Basic loading, empty, success, and error handling

### Out of Scope for MVP
- Full admin CRUD system
- Content management system
- payments
- notifications
- advanced analytics
- file uploads
- complex role hierarchies beyond basic user/admin
- password reset and advanced account recovery
- audit log UI
- advanced dashboard widgets

---

## 5. Product Goals
The MVP should:
- provide a professional and responsive website
- support secure authentication
- distinguish clearly between user and admin experiences
- protect data appropriately
- create a clean base for future features

---

## 6. User Stories

### Public Experience
**As a visitor**, I want to browse the public pages so that I can understand the product or business.

**As a visitor**, I want clear navigation so that I can move easily between pages.

### Registration and Login
**As a visitor**, I want to register for an account so that I can access protected features.

**As a registered user**, I want to log in securely so that I can access my account.

**As a logged-in user**, I want to log out easily so that I can end my session.

### User Dashboard
**As a logged-in user**, I want to access my own dashboard so that I can see my profile information.

**As a logged-in user**, I want to see only my own personal data so that my account remains private.

### Admin Dashboard
**As an admin**, I want to access an admin-only area so that I can use internal features not available to normal users.

**As an admin**, I want admin routes to be protected from regular users so that privileged functionality remains secure.

---

## 7. Functional Requirements

### 7.1 Public Pages
The system must provide:
- Home page
- About page
- Contact page

Each page must:
- be accessible through the main navigation
- be responsive
- use clear semantic structure

### 7.2 Shared Layout
The system must provide:
- navbar
- footer
- responsive layout behavior
- role-aware navigation updates where relevant

### 7.3 Registration
The system must:
- allow account creation using Firebase Authentication
- create a corresponding user profile document in Firestore
- assign a default role of `user` unless otherwise explicitly managed by the system

### 7.4 Login
The system must:
- allow registered users to log in with valid credentials
- reject invalid credentials with clear feedback
- allow successful authenticated access after login

### 7.5 Logout
The system must:
- allow authenticated users to sign out successfully
- remove access to protected routes after logout

### 7.6 User Dashboard
The system must:
- provide a protected user dashboard
- show user-specific profile information
- prevent unauthenticated access

### 7.7 Admin Dashboard
The system must:
- provide a protected admin dashboard
- restrict access to admin users only
- prevent regular users from accessing admin routes

### 7.8 User Profile
The system must:
- store a user profile document
- include a role field
- retrieve the correct profile for the authenticated user
- display profile information in the dashboard

---

## 8. Data Requirements

### User Profile Document
Suggested initial fields:
- `uid`
- `email`
- `role`
- `createdAt`
- `displayName` (optional)
- `status` (optional, if needed later)

### Role Rules
Initial roles:
- `user`
- `admin`

The MVP should assume a simple role model without subroles or permissions matrices.

---

## 9. Non-Functional Requirements

### Usability
- easy-to-understand navigation
- clean page structure
- intuitive login and dashboard flow

### Responsiveness
- mobile-first layout
- usable on common mobile and desktop sizes

### Accessibility
- semantic HTML
- labeled form fields
- keyboard-accessible interactions
- logical heading hierarchy

### Security
- user data access must be scoped correctly
- admin access must be restricted properly
- security must not rely only on UI checks
- Firebase security rules must align with the data model

### Maintainability
- modular code structure
- clear separation of auth, Firestore, and UI concerns
- minimal duplication

---

## 10. Acceptance Criteria

### Public Website
- users can access Home, About, and Contact
- navigation works on desktop and mobile

### Registration
- user can register successfully
- Firestore profile is created
- default role is assigned correctly

### Login
- valid login succeeds
- invalid login shows clear feedback

### Logout
- authenticated user can log out
- protected routes are no longer accessible after logout

### User Dashboard
- authenticated user can access their dashboard
- user sees their own profile information
- unauthenticated access is blocked or redirected

### Admin Dashboard
- admin can access admin dashboard
- regular user cannot access admin dashboard
- unauthenticated visitor cannot access admin dashboard

### Role Handling
- role is stored in Firestore profile
- access behavior matches the stored role model

---

## 11. Dependencies
Expected dependencies include:
- Next.js
- Firebase Authentication
- Cloud Firestore
- styling system
- environment variable configuration

---

## 12. Risks
- incorrect role handling
- weak route protection
- user/admin access mismatch
- Firestore rules not matching app behavior
- auth state not handled cleanly across routes

---

## 13. MVP Success Criteria
The MVP is successful if:
- public pages work
- registration/login/logout work
- user dashboard works
- admin dashboard access is protected correctly
- Firebase profile data is created and loaded correctly
- role-based behavior works as intended

---

## 14. Future Enhancements
- role management UI
- profile editing
- admin user list
- admin moderation tools
- analytics
- notifications
- file uploads
- additional role types
- audit/history logging
