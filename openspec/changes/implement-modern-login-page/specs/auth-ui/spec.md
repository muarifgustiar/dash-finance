# Spec: Authentication UI

## ADDED Requirements

### Requirement: Email and Password Sign-In Form (REQ-AUTH-UI-001)

The system MUST allow users to sign in using email and password with proper validation and error handling.

#### Scenario: User submits valid email and password
**Given** the user is on the login page  
**When** the user enters a valid email "user@example.com"  
**And** the user enters a valid password "securePass123"  
**And** the user clicks the "Sign In" button  
**Then** the form should submit to the backend  
**And** the user should be redirected to `/dashboard` on success  
**And** a loading indicator should be shown during submission  

#### Scenario: User submits empty email field
**Given** the user is on the login page  
**When** the user leaves the email field empty  
**And** the user clicks the "Sign In" button  
**Then** an error message should display below the email field: "Email harus diisi"  
**And** the form should not submit  
**And** the email field should have error styling (red border)  

#### Scenario: User submits invalid email format
**Given** the user is on the login page  
**When** the user enters "invalid-email" in the email field  
**And** the user clicks the "Sign In" button  
**Then** an error message should display below the email field: "Format email tidak valid"  
**And** the form should not submit  

#### Scenario: User submits password shorter than minimum
**Given** the user is on the login page  
**When** the user enters a password with less than 6 characters  
**And** the user clicks the "Sign In" button  
**Then** an error message should display below the password field: "Password minimal 6 karakter"  
**And** the form should not submit  

#### Scenario: Backend returns invalid credentials error
**Given** the user submits valid format email and password  
**When** the backend returns a 401 unauthorized error  
**Then** an error alert should display at the top of the form: "Email atau password salah"  
**And** the form fields should remain filled  
**And** the password field should be focused  

#### Scenario: Backend returns account not found error
**Given** the user submits credentials  
**When** the backend returns a 404 not found error  
**Then** an error alert should display: "Akun tidak ditemukan"  

#### Scenario: Backend returns rate limit error
**Given** the user has made too many failed login attempts  
**When** the backend returns a 429 rate limit error  
**Then** an error alert should display: "Terlalu banyak percobaan, coba lagi nanti"  
**And** the submit button should be disabled for 60 seconds  

---

### Requirement: Password Visibility Toggle (REQ-AUTH-UI-003)

The system MUST allow users to toggle password visibility to verify their input.

#### Scenario: User toggles password visibility to show
**Given** the user is on the login page  
**And** the password field contains "myPassword"  
**And** the password is hidden (type="password")  
**When** the user clicks the eye icon next to the password field  
**Then** the password should be visible as plain text  
**And** the eye icon should change to an "eye-off" icon  

#### Scenario: User toggles password visibility to hide
**Given** the password is currently visible  
**When** the user clicks the eye-off icon  
**Then** the password should be hidden again (type="password")  
**And** the icon should change back to an "eye" icon  

---

### Requirement: Remember Me Functionality (REQ-AUTH-UI-004)

The system MUST allow users to persist their login session using a "Remember me" checkbox.

#### Scenario: User checks "Remember me" and logs in
**Given** the user is on the login page  
**When** the user checks the "Remember me" checkbox  
**And** the user successfully logs in  
**Then** the user's session should persist for 30 days  
**And** a preference flag should be stored in localStorage  

#### Scenario: User unchecks "Remember me" and logs in
**Given** the "Remember me" checkbox is unchecked  
**When** the user successfully logs in  
**Then** the user's session should persist for 1 day only  
**And** no remember preference should be stored  

#### Scenario: User returns with remembered session
**Given** the user previously logged in with "Remember me" checked  
**And** the user closed the browser  
**When** the user returns to the site within 30 days  
**Then** the user should be automatically redirected to `/dashboard`  
**And** the user should not see the login page  

---

### Requirement: Forgot Password Navigation (REQ-AUTH-UI-005)

The system MUST allow users to navigate to password recovery from the login page.

#### Scenario: User clicks "Forgot Password?" link
**Given** the user is on the login page  
**When** the user clicks the "Forgot Password?" link  
**Then** the user should be navigated to `/auth/forgot-password`  
**And** the navigation should use client-side routing (no full page reload)  

---

### Requirement: Sign-Up Navigation (REQ-AUTH-UI-006)

The system MUST allow users to navigate to the sign-up page if they don't have an account.

#### Scenario: User clicks "Sign Up" link
**Given** the user is on the login page  
**When** the user clicks the "Sign Up" link at the bottom  
**Then** the user should be navigated to `/auth/signup`  
**And** the navigation should use client-side routing  

---

### Requirement: Centered Card Layout (REQ-AUTH-UI-007)

The login page MUST display a centered card layout that is responsive across all devices.

#### Scenario: User views login page on desktop
**Given** the user's viewport width is 1024px or larger  
**When** the user visits the login page  
**Then** the page should display a centered card layout  
**And** the card should have a maximum width of 448px  
**And** the card should be horizontally centered on the page  
**And** the background should have a gradient  

#### Scenario: User views login page on mobile
**Given** the user's viewport width is less than 768px  
**When** the user visits the login page  
**Then** the page should display the login card  
**And** the card should adapt to screen width with appropriate padding  
**And** all form elements should be accessible without horizontal scroll  

---

### Requirement: Loading States During Authentication (REQ-AUTH-UI-008)

The UI MUST provide clear feedback during authentication operations.

#### Scenario: User submits email/password form
**Given** the user has filled in valid credentials  
**When** the user clicks the "Sign In" button  
**Then** the button text should change to "Masuk..."  
**And** the button should show a loading spinner  
**And** all form inputs should be disabled  

#### Scenario: Authentication completes successfully
**Given** an authentication operation is in progress  
**When** the authentication succeeds  
**Then** all loading indicators should be cleared  
**And** the user should be redirected within 500ms  

#### Scenario: Authentication fails
**Given** an authentication operation is in progress  
**When** the authentication fails  
**Then** loading indicators should be cleared  
**And** form inputs should be re-enabled  
**And** an error message should be displayed  

---

### Requirement: Responsive and Accessible Form (REQ-AUTH-UI-009)

The login form MUST be fully accessible and responsive across all devices.

#### Scenario: Keyboard navigation through form
**Given** the user is on the login page  
**When** the user presses Tab key repeatedly  
**Then** focus should move through elements in this order:  
1. Email input
2. Password input
3. Password visibility toggle
4. Remember me checkbox
5. Forgot password link
6. Sign in button
7. Sign up link  
**And** each focused element should have a visible focus indicator  

#### Scenario: Screen reader announces form fields
**Given** a screen reader user is on the login page  
**When** the user navigates to the email input  
**Then** the screen reader should announce: "Email, edit text, required"  
**When** the user navigates to the password input  
**Then** the screen reader should announce: "Password, password field, required"  

#### Scenario: Screen reader announces validation errors
**Given** the user submits the form with errors  
**When** the screen reader user navigates to an invalid field  
**Then** the error message should be announced  
**And** the field should be announced as "invalid"  

#### Scenario: Form displays correctly on small mobile screens
**Given** the user's viewport width is 320px (smallest mobile)  
**When** the user views the login form  
**Then** all form elements should be visible without horizontal scroll  
**And** text should be readable without zooming  
**And** touch targets should be at least 44x44px  

---

### Requirement: Form Validation Feedback (REQ-AUTH-UI-010)

The system MUST provide immediate, clear feedback on form validation errors to users.

#### Scenario: Real-time validation on email blur
**Given** the user is typing in the email field  
**When** the user enters "invalid@" and blurs the field  
**Then** an error message should display immediately below the field  
**And** the field should have a red border  
**And** the error should not require form submission to appear  

#### Scenario: Validation error clears on correction
**Given** the email field has a validation error  
**When** the user enters a valid email "user@example.com"  
**And** the user blurs the field  
**Then** the error message should disappear  
**And** the red border should be removed  
**And** the field should show a success state (green border)  

#### Scenario: Multiple validation errors displayed
**Given** the user submits the form with multiple invalid fields  
**Then** each invalid field should show its own error message  
**And** errors should be displayed in Bahasa Indonesia  
**And** the first invalid field should receive focus  

---

### Requirement: End-to-End Authentication Flow (REQ-AUTH-UI-010)

The system MUST provide end-to-end tests using Playwright to validate the complete authentication flow in a real browser environment.

#### Scenario: E2E login flow with valid credentials
**Given** the user navigates to the login page in a real browser  
**When** the user enters valid email "test@example.com"  
**And** the user enters valid password "TestPass123"  
**And** the user clicks the "Sign In" button  
**Then** the system should authenticate the user  
**And** the user should be redirected to "/dashboard"  
**And** the dashboard page should be visible  

#### Scenario: E2E login flow with invalid credentials
**Given** the user navigates to the login page in a real browser  
**When** the user enters email "wrong@example.com"  
**And** the user enters password "wrongpass"  
**And** the user clicks the "Sign In" button  
**Then** an error message should be visible: "Email atau password salah"  
**And** the user should remain on the login page  

#### Scenario: E2E remember me persistence across sessions
**Given** the user successfully logs in with "Remember me" checked  
**When** the user closes the browser  
**And** the user reopens the browser and navigates to the app  
**Then** the user should be automatically logged in  
**And** the user should be redirected to "/dashboard"  

#### Scenario: E2E password visibility toggle interaction
**Given** the user navigates to the login page  
**When** the user enters "MyPassword123" in the password field  
**And** the user clicks the password visibility toggle  
**Then** the password should be visible as plain text in the browser  
**And** the toggle icon should change to "eye-off"  

---

## Test Coverage Requirements

- All scenarios must have corresponding unit, integration, or E2E tests
- Component tests must achieve ≥80% code coverage
- Critical paths (form submission, validation, authentication) must have E2E tests with Playwright
- Accessibility tests must validate ARIA attributes and keyboard navigation
- Visual regression tests should cover desktop and mobile layouts
- E2E tests must run in multiple browsers (Chromium, Firefox, WebKit)
