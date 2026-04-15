# Architecture

## Document Purpose
This document defines the technical architecture for a Next.js + Firebase application with public pages, authenticated user flows, and admin/user role-based access.

---

## 1. Architecture Goals
The architecture should:
- support public and protected experiences
- cleanly separate UI, auth, and data access
- support role-based access control
- be secure and scalable
- keep the MVP easy to implement and extend

---

## 2. High-Level Architecture

### Frontend
- Next.js application
- App Router
- shared layout and reusable UI components
- protected and public route separation

### Backend / Services
- Firebase Authentication for identity
- Cloud Firestore for user profile and role data
- Firestore Security Rules for access control

### Access Model
- public routes for visitors
- authenticated user routes for logged-in users
- admin-only routes for users whose role is `admin`

---

## 3. Recommended Folder Structure

```text
app/
  (public)/
    page.tsx
    about/
      page.tsx
    contact/
      page.tsx
  (auth)/
    login/
      page.tsx
    register/
      page.tsx
  dashboard/
    page.tsx
  admin/
    page.tsx
  layout.tsx
  globals.css

components/
  layout/
    navbar.tsx
    footer.tsx
  sections/
    hero-section.tsx
    services-section.tsx
    contact-section.tsx
  auth/
    login-form.tsx
    register-form.tsx
  dashboard/
    profile-card.tsx
  admin/
    admin-summary-card.tsx
  guards/
    auth-guard.tsx
    role-guard.tsx
  ui/

lib/
  firebase/
    client.ts
  auth/
    auth-service.ts
    auth-context.tsx
    get-current-user.ts
  firestore/
    user-profile-service.ts
    admin-service.ts
  roles/
    role-utils.ts
  utils/

firebase/
  firestore.rules

docs/

public/

4. Layer Responsibilities
App / Routes
Responsible for:
page-level composition
route structure
route-level access behavior
metadata and route organization
Components
Responsible for:
rendering UI
organizing reusable layout and section patterns
local UI concerns
Auth Layer
Responsible for:
registration
login
logout
auth state subscription
current user state access
auth-aware route behavior
Firestore Layer
Responsible for:
user profile creation
user profile retrieval
role retrieval
admin-oriented reads/services in the future
Roles Layer
Responsible for:
role-related helpers
access checks
central role constants if needed
Firebase Initialization
Responsible for:
central Firebase app configuration
avoiding repeated initialization
5. Data Model
Collection: users
Document ID:
use authenticated user uid
Suggested fields:
uid: string
email: string
role: "user" | "admin"
createdAt: timestamp
displayName?: string
This keeps the MVP model simple and easy to secure.
6. Access Design
Public Routes
Accessible to everyone:
/
/about
/contact
/login
/register
User-Protected Routes
Accessible only to authenticated users:
/dashboard
Admin-Protected Routes
Accessible only to authenticated users whose profile role is admin:
/admin
7. Role Enforcement Strategy
Role enforcement should happen at multiple levels:
UI Level
hide or show role-based navigation options
prevent confusing UI access paths
Route Level
protect admin pages from non-admin users
redirect or block users when unauthorized
Data Level
enforce ownership and role rules in Firestore Security Rules
never rely only on UI hiding
8. Auth and Data Flow
Registration Flow
User submits registration form
Firebase Authentication creates the account
Firestore creates a users/{uid} profile document
Role is set to user by default
User is redirected to dashboard or onboarding state
Login Flow
User submits credentials
Firebase Authentication validates credentials
Application loads current auth state
Firestore profile is loaded
Role-aware UI and routing are applied
Dashboard Flow
Authenticated user accesses /dashboard
Auth guard verifies user is logged in
Profile service fetches users/{uid}
Dashboard renders personal account information
Admin Flow
Authenticated user accesses /admin
Auth guard verifies authentication
Role guard verifies role is admin
Admin page loads allowed content
9. Security Architecture
Firestore Security Principles
user can read their own user profile
user can write only to fields allowed by the app model
admin rules can later be extended to support broader access
regular users must not read all user documents
access checks must reflect role and ownership
Important Principle
The application must not trust the frontend alone.
Sensitive access control must be enforced in Firestore Security Rules.
10. State Management Guidance
For MVP:
keep auth state centralized
keep user profile loading predictable
avoid spreading raw auth listeners across many components
prefer one clear auth context/provider or equivalent app-level pattern
11. Scalability Considerations
This architecture should support future additions such as:
admin user list
role management
profile editing
analytics
activity logs
file uploads
additional collections and feature modules
To support future growth:
keep services modular
keep roles centralized
avoid mixing admin and user logic in the same files
keep Firestore logic reusable and traceable
12. Tradeoffs
This design intentionally favors:
simple service boundaries
lightweight role-based access
straightforward Firebase usage
fast MVP delivery with clear future extension points
It does not attempt to introduce enterprise-level complexity too early.
13. Architecture Rules
keep page files focused on composition
centralize Firebase app setup
centralize auth helpers
centralize Firestore access functions
keep role checks consistent
keep admin code separated from user code
keep rules aligned with the actual profile model
14. Architecture Summary
Recommended architecture for MVP:
Next.js App Router
Firebase Auth for authentication
Firestore users collection for profile + role data
protected user dashboard
protected admin dashboard
centralized auth, role, and profile services
Firestore Security Rules aligned with role/ownership model
