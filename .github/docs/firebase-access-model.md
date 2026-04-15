# Firebase Access Model

## Document Purpose
This document defines the Firebase access model for the MVP application built with Next.js and Firebase.

It describes:
- collections and document ownership
- role model
- access expectations
- Firestore security assumptions
- how application behavior should align with Firestore Security Rules

This document should be used by:
- Product
- Architecture
- Engineering
- QA

to stay aligned on who can access what and why.

---

## 1. Core Principles

### 1.1 Backend-Enforced Security
Sensitive access control must be enforced in Firebase Security Rules, not only in frontend logic.

Frontend guards and hidden UI are useful for user experience, but they are not sufficient for security.

### 1.2 Least Privilege
Each user should have access only to the minimum data and functionality required for their role.

### 1.3 Predictable Ownership
User-owned data should be easy to identify and easy to protect through document structure and rules.

### 1.4 Simple MVP Role Model
The MVP should use a simple role model:
- `user`
- `admin`

No sub-roles, permission matrices, or advanced authorization engine should be introduced in MVP unless clearly needed.

---

## 2. Firebase Services in Scope

### Firebase Authentication
Used for:
- user identity
- login
- registration
- session/auth state

### Cloud Firestore
Used for:
- storing user profile documents
- storing role information
- supporting future application data

### Firebase Security Rules
Used for:
- enforcing ownership
- restricting admin-only access
- preventing users from accessing other users’ private data

---

## 3. Identity Model

### Authenticated User Identity
Each authenticated user is identified by:
- `request.auth.uid`

This UID is the primary identity key used for ownership checks.

### Unauthenticated Visitor
An unauthenticated visitor has:
- no authenticated UID
- access only to public application content
- no direct access to protected Firestore documents

---

## 4. Role Model

### Supported Roles
Initial MVP roles:
- `user`
- `admin`

### Role Source of Truth
The role should be stored in the user profile document in Firestore.

Example:
- `users/{uid}.role`

### Default Role
When a new user registers, the application should create their Firestore user profile with:
- `role = "user"`

### Admin Creation
Admin creation should not be exposed through normal public registration flow unless explicitly intended.
For MVP, admin users should be provisioned separately through controlled means.

---

## 5. Collections and Ownership

## 5.1 `users` Collection

### Purpose
Stores user profile documents and access-related fields.

### Document ID
Use the authenticated user UID as the document ID.

Example:
- `users/{uid}`

### Suggested Fields
- `uid: string`
- `email: string`
- `role: "user" | "admin"`
- `createdAt: timestamp`
- `displayName?: string`
- `status?: string`

### Ownership Model
Each user owns their own `users/{uid}` document for the purpose of viewing their own profile data.

### Access Intent
- normal user can read their own profile
- normal user must not read arbitrary other users’ profiles
- admin access may be extended for broader reads if the product requires it

---

## 6. Access Rules by Actor

## 6.1 Public Visitor

### Allowed
- access public website pages through the app
- register
- login

### Not Allowed
- read protected Firestore user documents
- access dashboard data
- access admin routes or admin data

---

## 6.2 Authenticated Normal User

### Allowed
- read their own user profile document
- access protected user dashboard
- use features explicitly intended for standard users

### Not Allowed
- read other users’ private profile documents
- write to restricted identity/role fields unless explicitly allowed
- access admin-only routes or admin-only Firestore capabilities

---

## 6.3 Admin User

### Allowed
- access admin routes
- access admin-only UI
- potentially read additional user-related data if the rules and product scope allow it

### Not Allowed
- perform actions not explicitly supported by the data model and rules
- bypass rules purely because the UI exposes a path

### Important Note
Admin permissions should be implemented intentionally.
Do not assume admin has unlimited access unless that is explicitly defined in both product requirements and security rules.

---

## 7. MVP Access Expectations

## 7.1 Public App Access
Public pages should be accessible to everyone:
- `/`
- `/about`
- `/contact`
- `/login`
- `/register`

These routes do not require Firestore authorization.

---

## 7.2 User Dashboard Access
The user dashboard should:
- require authentication
- load the current user's profile
- only display data for the authenticated user

Typical route:
- `/dashboard`

Expected Firestore access:
- authenticated read of `users/{currentUid}`

---

## 7.3 Admin Dashboard Access
The admin dashboard should:
- require authentication
- require `role = "admin"`
- not be accessible to normal users

Typical route:
- `/admin`

Important:
Admin route checks should happen in:
- app logic / route guards
- role-aware UI
- Firestore rules where admin data is involved

---

## 8. Write Permissions Model

### User Registration
During registration:
- Firebase Authentication creates the identity
- Firestore creates `users/{uid}`
- role is set to `"user"` by default

### User Profile Updates
For MVP, profile update permissions should be intentionally limited.

Recommended approach:
- allow user to read their profile
- allow only safe profile fields to be updated if edit functionality exists
- do not allow normal users to change:
  - `uid`
  - `email` ownership semantics improperly
  - `role`
  - security-sensitive account status fields

### Role Changes
Role changes should not be allowed through standard user-facing flows.

For MVP, role changes should be controlled through:
- manual admin tooling later
- secure backend/admin process
- not direct public client write access

---

## 9. Firestore Security Design Guidance

## 9.1 `users/{uid}` Read Logic
Recommended MVP intent:
- authenticated user can read `users/{request.auth.uid}`
- authenticated user cannot read other user profile docs
- admin broader read access only if explicitly required

## 9.2 `users/{uid}` Write Logic
Recommended MVP intent:
- creation allowed only for authenticated user creating their own doc
- update limited to allowed fields
- role changes blocked for normal users
- arbitrary overwrite of other users' docs blocked

## 9.3 Rule Alignment Principle
Security rules must match:
- real collection names
- real document structure
- real ownership model
- real app behavior

Do not write generic rules that do not reflect the actual implementation.

---

## 10. Suggested Data Validation Concepts

When validating user profile writes, consider:
- `uid` matches authenticated UID
- `role` is one of allowed values
- client cannot self-promote to admin
- required fields exist on creation
- immutable identity fields remain stable where appropriate

---

## 11. Suggested Firestore Rules Strategy

The rules should at minimum support:
- authenticated self-read of profile
- authenticated self-create of profile
- limited self-update where appropriate
- denial of cross-user reads/writes
- explicit admin handling if admin collection/data access is implemented

This document is intentionally a policy/model document, not the final rules file.
The actual `firestore.rules` file should implement these expectations directly.

---

## 12. Example Access Matrix

| Resource | Public Visitor | Authenticated User | Admin |
|---|---|---|---|
| Public pages | Yes | Yes | Yes |
| Login/Register pages | Yes | Yes | Yes |
| Own user profile | No | Yes | Yes, if explicitly allowed |
| Other users' profiles | No | No | Only if explicitly allowed |
| User dashboard | No | Yes | Yes |
| Admin dashboard | No | No | Yes |
| Role change | No | No | Only through controlled admin flow |

---

## 13. Application-Level Guard Expectations

The application should include:
- auth guard for protected pages
- role guard for admin pages
- role-aware navigation behavior
- graceful redirect or fallback when unauthorized

These app-level guards improve UX, but the real data protection must still exist in Firestore rules.

---

## 14. QA Implications

QA should validate:
- public users cannot access protected routes
- logged-in normal users cannot access admin routes
- logged-in normal users cannot retrieve other users’ profile data through normal app behavior
- admin access behaves according to defined scope
- role-based behavior matches Firestore profile data

---

## 15. Common Mistakes to Avoid

- relying only on hidden UI for admin protection
- allowing user profile updates without field restrictions
- allowing role to be changed from the client
- using email instead of UID as the main ownership key
- writing overly permissive Firestore rules for convenience
- assuming admin access without implementing it explicitly

---

## 16. Future Extensions

This access model should support future additions such as:
- admin user management
- role upgrade workflows
- profile editing
- activity logs
- moderation tools
- additional collections with owner-based rules
- more granular permissions if needed later

Future complexity should be added only when product needs justify it.

---

## 17. Summary
The MVP Firebase access model should be based on:
- Firebase Authentication for identity
- Firestore `users/{uid}` as the profile and role source of truth
- `user` and `admin` roles
- self-access for user-owned profile data
- restricted admin-only route access
- Firestore Security Rules aligned with real ownership and role behavior

This creates a secure and understandable foundation for future expansion.
