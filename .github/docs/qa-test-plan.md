# QA Test Plan

## Document Purpose
This document defines the QA plan for the Next.js + Firebase MVP with public pages, authenticated user flows, Firestore profile data, and role-based admin access.

---

## 1. QA Scope
The MVP QA scope includes:
- public pages
- shared navigation/footer
- registration
- login
- logout
- Firestore profile creation
- protected user dashboard
- protected admin dashboard
- role-based route behavior
- responsive layout
- accessibility basics
- error/loading/empty states

---

## 2. QA Objectives
The main QA objectives are:
- verify core public and authenticated journeys
- verify role separation between user and admin
- verify profile creation and retrieval
- verify route protection
- identify release blockers before launch

---

## 3. Assumptions
This plan assumes:
- Firebase project is configured
- test environment variables are valid
- Firestore and Auth are reachable
- at least one admin test account is available
- normal user account creation is available
- expected app behavior follows the product requirements

---

## 4. Test Areas

### 4.1 Public Pages
Verify:
- Home loads
- About loads
- Contact loads
- navigation works
- footer renders correctly
- layout works on mobile and desktop

### 4.2 Registration
Verify:
- valid registration succeeds
- invalid registration is rejected with clear feedback
- Firestore user profile document is created
- default role is stored correctly as `user`

### 4.3 Login
Verify:
- valid login succeeds
- invalid login fails clearly
- auth state updates correctly
- user reaches the correct post-login experience

### 4.4 Logout
Verify:
- user can sign out
- auth-protected routes become inaccessible after logout
- UI updates correctly after sign-out

### 4.5 User Dashboard
Verify:
- unauthenticated visitor cannot access dashboard
- authenticated user can access dashboard
- correct profile data is loaded
- loading/error/empty states behave safely

### 4.6 Admin Dashboard
Verify:
- unauthenticated visitor cannot access admin route
- logged-in normal user cannot access admin route
- admin user can access admin route
- admin navigation visibility behaves correctly if role-aware links exist

### 4.7 Role Handling
Verify:
- role is stored in Firestore profile
- app behavior matches role value
- role checks do not incorrectly grant or deny access

### 4.8 Responsive Behavior
Verify:
- navbar works on smaller screens
- auth forms are usable on mobile
- dashboard layouts do not break at small widths
- admin page remains usable on common screen sizes

### 4.9 Accessibility Basics
Verify:
- inputs have labels
- buttons are understandable
- major keyboard actions are possible
- headings are logically structured

---

## 5. Critical Test Scenarios

### Scenario 1: Public Navigation
**Priority:** Critical  
**Steps:**
1. Open the site
2. Navigate to Home, About, and Contact

**Expected Result:**
All public pages load and navigation works.

---

### Scenario 2: Successful Registration with Profile Creation
**Priority:** Critical  
**Steps:**
1. Open registration page
2. Submit valid credentials/details
3. Complete registration
4. Verify profile document exists in Firestore

**Expected Result:**
Account is created and Firestore user profile is created with expected fields including default role.

---

### Scenario 3: Successful Login
**Priority:** Critical  
**Steps:**
1. Open login page
2. Submit valid user credentials
3. Continue to authenticated area

**Expected Result:**
Login succeeds and user gains authenticated access.

---

### Scenario 4: Protected User Dashboard Enforcement
**Priority:** Critical  
**Steps:**
1. Ensure visitor is logged out
2. Attempt to access `/dashboard`

**Expected Result:**
Access is blocked or redirected.

---

### Scenario 5: User Dashboard Access for Logged-In User
**Priority:** Critical  
**Steps:**
1. Log in as normal user
2. Open `/dashboard`

**Expected Result:**
Dashboard loads and shows correct user profile data.

---

### Scenario 6: Admin Route Blocked for Normal User
**Priority:** Critical  
**Steps:**
1. Log in as normal user
2. Attempt to access `/admin`

**Expected Result:**
Access is denied, redirected, or blocked appropriately.

---

### Scenario 7: Admin Route Accessible for Admin
**Priority:** Critical  
**Steps:**
1. Log in as admin user
2. Open `/admin`

**Expected Result:**
Admin dashboard loads successfully.

---

### Scenario 8: Logout Flow
**Priority:** Critical  
**Steps:**
1. Log in
2. Log out
3. Attempt to re-open `/dashboard` and `/admin`

**Expected Result:**
Protected routes are no longer accessible after logout.

---

## 6. High-Value Important Scenarios

### Scenario 9: Invalid Login
**Priority:** High  
**Expected Result:**
Clear error shown, no access granted.

### Scenario 10: Invalid Registration
**Priority:** High  
**Expected Result:**
Registration blocked with helpful validation feedback.

### Scenario 11: Missing Firestore Profile
**Priority:** High  
**Expected Result:**
Dashboard fails gracefully without crashing.

### Scenario 12: Incorrect Role Value Handling
**Priority:** High  
**Expected Result:**
Application handles unexpected or missing role safely.

### Scenario 13: Refresh After Login
**Priority:** High  
**Expected Result:**
Auth/profile state restores as intended.

### Scenario 14: Mobile Auth Flow
**Priority:** High  
**Expected Result:**
Registration and login remain usable on mobile.

---

## 7. Edge Cases
- registration succeeds but profile creation fails
- login succeeds but profile retrieval is delayed
- user profile exists without expected role field
- role field contains invalid value
- user opens admin route in new tab while session expired
- logout occurs while on protected page
- Firestore returns permission error
- profile UI receives partial or missing fields
- auth state flickers during page load

---

## 8. Regression Checks
Re-test these after any auth, Firestore, role, or layout change:
- public navigation
- register
- login
- logout
- dashboard access
- admin access
- profile loading
- responsive navbar
- role-based UI visibility

---

## 9. Automated Test Strategy (PR Gate)
Automated checks must run on every pull request targeting `main`:
- TypeScript type check (`npm run type-check`)
- Unit tests (`npm test -- --ci --runInBand`)

Automated unit tests currently cover high-risk shared logic:
- shared result helpers
- booking service business rules
- role/ownership authorization helpers
- validation schemas for auth/booking input
- API middleware rate-limiting behavior

Manual QA from this plan remains required for integration and UX coverage that is not yet automated.

---

## 10. Severity Levels

### Critical
Blocks core functionality, breaks access control, or creates unsafe release conditions.

### High
Major user-facing issue or important security/access issue that should be fixed before release.

### Medium
Meaningful issue with moderate impact.

### Low
Minor inconsistency or polish item.

---

## 11. Release Blockers
The following should block release:
- registration does not work
- login does not work
- logout does not work
- user profile is not created correctly
- unauthenticated visitor can access protected pages
- normal user can access admin dashboard
- admin cannot access admin dashboard
- Firestore profile data is incorrect or unsafe
- major mobile usability issue in auth or dashboard flows

---

## 12. Exit Criteria
QA is complete when:
- all critical scenarios pass
- release blockers are resolved
- high-priority issues are resolved or explicitly accepted
- user/admin separation behaves correctly
- public and protected flows are stable

---

## 13. Post-MVP QA Suggestions
- add password reset coverage
- add profile editing coverage
- add admin CRUD coverage
- add more accessibility depth
- add browser matrix testing
- add security rule verification for broader scenarios
