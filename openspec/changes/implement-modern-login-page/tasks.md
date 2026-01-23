# Tasks: Implement Modern Login Page

## Phase 1: Setup & Schema (Foundational)

### 1. Create authentication schemas in @repo/schema
- [ ] Create `packages/schema/src/auth/` directory
- [ ] Create `login.schema.ts` with `LoginWithEmailSchema` (email, password, rememberMe)
- [ ] Export schemas from `packages/schema/src/auth/index.ts`
- [ ] Write unit tests for schema validation

**Validation:** Schemas validate correct/incorrect inputs, tests pass

---

### 2. Setup design system components (if not exist)
- [ ] Create `apps/web/src/components/ds/input.tsx` extending `@repo/ui/input`
- [ ] Create `apps/web/src/components/ds/button.tsx` extending `@repo/ui/button`
- [ ] Create `apps/web/src/components/ds/checkbox.tsx` extending `@repo/ui/checkbox`
- [ ] Create `apps/web/src/components/ds/label.tsx` extending `@repo/ui/label`
- [ ] Create `apps/web/src/components/ds/index.ts` barrel export
- [ ] Add password visibility toggle to Input component (eye icon)

**Validation:** Components render correctly, styles match design system

---

## Phase 2: Core Components

### 3. Build LoginForm component
- [ ] Create `apps/web/src/features/auth/components/LoginForm.tsx`
- [ ] Add email input field with label
- [ ] Add password input field with label and visibility toggle
- [ ] Add "Remember me" checkbox
- [ ] Add submit button
- [ ] Implement form validation with TanStack Form + Zod
- [ ] Show validation errors below each field
- [ ] Add disabled state during submission
- [ ] Style form fields with proper spacing

**Validation:** Form validates input, shows errors, handles submission

---

## Phase 3: Authentication Logic

### 4. Create email/password login hook
- [ ] Create `apps/web/src/features/auth/hooks/use-login-email.ts`
- [ ] Implement TanStack Query mutation for email/password login
- [ ] Call `POST /auth/login` with email, password, rememberMe
- [ ] Handle success: store tokens, return user data
- [ ] Handle errors: map to Bahasa Indonesia messages
- [ ] Implement remember me logic (set token expiry)
- [ ] Write unit tests with MSW mocks

**Validation:** Hook calls API correctly, handles success/error, tests pass

---

## Phase 4: Container & Integration

### 5. Build LoginContainer orchestrator
- [ ] Update `apps/web/src/features/auth/components/LoginContainer.tsx` (Client Component)
- [ ] Import LoginForm
- [ ] Integrate `useLoginWithEmail` hook
- [ ] Handle form submission → call email hook
- [ ] Handle remember me → pass to hooks
- [ ] Display error messages at top of form
- [ ] Handle loading states (disable all inputs)
- [ ] Redirect to `/dashboard` on success
- [ ] Implement centered card layout

**Validation:** Container orchestrates flow, handles errors, redirects correctly

---

### 6. Build responsive layout
- [ ] Add Tailwind breakpoints for responsive design
- [ ] Implement centered card layout (max-width 448px)
- [ ] Add gradient background
- [ ] Test on various screen sizes
- [ ] Ensure touch targets are ≥44px on mobile
- [ ] Add padding and margins for proper spacing

**Validation:** Layout adapts correctly on all screen sizes

---

## Phase 5: Polish & UX

### 7. Implement password visibility toggle
- [ ] Add eye icon button to password input
- [ ] Toggle input type between "password" and "text"
- [ ] Change icon between eye and eye-off
- [ ] Position icon inside input field (right side)
- [ ] Ensure keyboard accessibility

**Validation:** Toggle works, icon changes, accessible via keyboard

---

### 8. Add navigation links
- [ ] Add "Forgot Password?" link (navigate to `/auth/forgot-password`)
- [ ] Add "Sign Up" link at bottom (navigate to `/auth/signup`)
- [ ] Style links with hover states
- [ ] Use Next.js Link component for client-side routing

**Validation:** Links navigate correctly, no page reload

---

### 9. Implement loading and error states
- [ ] Show loading spinner in submit button during auth
- [ ] Change button text to "Masuk..." when loading
- [ ] Disable all inputs during loading
- [ ] Show error alerts at top of form (red background)
- [ ] Auto-focus first invalid field on error
- [ ] Clear errors when user starts editing

**Validation:** Loading states clear, errors display correctly

---

## Phase 6: Testing

### 10. Write component unit tests
- [ ] Test LoginForm: validation, submission, field changes
- [ ] Test LoginContainer: orchestration, error handling, redirection
- [ ] Test password visibility toggle
- [ ] Mock TanStack Query hooks in tests
- [ ] Use MSW for API mocking
- [ ] Achieve ≥80% coverage

**Validation:** All tests pass, coverage ≥80%

---

### 11. Write integration tests
- [ ] Test full email/password login flow (happy path)
- [ ] Test validation errors display correctly
- [ ] Test backend error scenarios (401, 404, 429, 500)
- [ ] Test remember me persists session

**Validation:** Integration tests cover all critical paths, tests pass

---

### 12. Write accessibility tests
- [ ] Test keyboard navigation through form
- [ ] Test screen reader announcements (ARIA labels)
- [ ] Test focus indicators are visible
- [ ] Test error messages have aria-describedby
- [ ] Test color contrast meets WCAG AA
- [ ] Test touch target sizes on mobile

**Validation:** Accessibility tests pass, meets WCAG standards

---

### 13. Setup Playwright for E2E tests
- [ ] Install Playwright and dependencies: `bun add -D @playwright/test`
- [ ] Create `playwright.config.ts` in `apps/web/`
- [ ] Configure browsers (Chromium, Firefox, WebKit)
- [ ] Setup test fixtures and base URL
- [ ] Create E2E test directory: `apps/web/e2e/`
- [ ] Add Playwright scripts to package.json

**Validation:** Playwright installed, config works, can run sample test

---

### 14. Write E2E authentication tests with Playwright
- [ ] Create `apps/web/e2e/auth/login.spec.ts`
- [ ] Test successful login flow (valid credentials → redirect to dashboard)
- [ ] Test failed login flow (invalid credentials → error message)
- [ ] Test form validation (empty fields, invalid email format)
- [ ] Test password visibility toggle interaction
- [ ] Test remember me checkbox (session persistence across browser restarts)
- [ ] Test forgot password link navigation
- [ ] Test sign up link navigation
- [ ] Mock backend API responses with Playwright route handlers
- [ ] Test on multiple browsers (Chromium, Firefox, WebKit)

**Validation:** E2E tests pass on all browsers, cover critical user flows

---

### 15. Add visual regression tests with Playwright
- [ ] Install Playwright visual comparison tools
- [ ] Capture baseline screenshots (desktop, tablet, mobile)
- [ ] Test login page layout consistency
- [ ] Test form error states visually
- [ ] Test loading states visually
- [ ] Compare screenshots across test runs

**Validation:** Visual regression tests detect layout changes

---

## Phase 7: Finalization

### 16. Add Bahasa Indonesia content
- [ ] Review all UI text and error messages
- [ ] Ensure all text is in Bahasa Indonesia
- [ ] Add proper punctuation and capitalization
- [ ] Test error message readability

**Validation:** All text in Bahasa Indonesia, clear and professional

---

### 14. Performance optimization
- [ ] Optimize images with Next.js Image component
- [ ] Minimize client bundle size
- [ ] Run Lighthouse audit (score ≥90)

**Validation:** Performance metrics meet targets

---

### 15. Final review and deployment
- [ ] Review design matches requirements
- [ ] Test on real devices (iOS, Android, Desktop)
- [ ] Check backend API endpoint is available
- [ ] Verify all success criteria met
- [ ] Get design approval from stakeholders
- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Deploy to production

**Validation:** All success criteria met, stakeholders approve

---

## Dependencies & Parallelization

**Can be done in parallel:**
- Tasks 3, 4 (LoginForm, email hook)

**Blocking dependencies:**
- Task 2 must complete before 3
- Tasks 3, 4 must complete before 5
- Task 5 must complete before 6, 7, 8, 9
- Tasks 10, 11, 12 require all implementation tasks done
- Task 13 (Playwright setup) can be done in parallel with unit tests
- Tasks 14, 15 (E2E tests) require task 13 and implementation complete

**Critical Path:**
1 → 2 → 5 → 10 → 13 → 14 → 18 (Setup → Container → Unit Tests → Playwright → E2E → Deploy)

---

## Estimated Effort

- Phase 1 (Setup): 2-3 hours
- Phase 2 (Components): 3-4 hours
- Phase 3 (Hooks): 2-3 hours
- Phase 4 (Container): 3-4 hours
- Phase 5 (Polish): 2-3 hours
- Phase 6 (Testing): 6-8 hours (includes E2E setup)
- Phase 7 (Final): 2-3 hours

**Total: 20-28 hours** (2-3 days with focused work)

### 1. Create authentication schemas in @repo/schema
- [ ] Create `packages/schema/src/auth/` directory
- [ ] Create `login.schema.ts` with `LoginWithEmailSchema` (email, password, rememberMe)
- [ ] Create `oauth.schema.ts` with `OAuthLoginSchema` (provider, idToken)
- [ ] Export schemas from `packages/schema/src/auth/index.ts`
- [ ] Write unit tests for schema validation

**Validation:** Schemas validate correct/incorrect inputs, tests pass

---

### 2. Setup design system components (if not exist)
- [ ] Create `apps/web/src/components/ds/input.tsx` extending `@repo/ui/input`
- [ ] Create `apps/web/src/components/ds/button.tsx` extending `@repo/ui/button`
- [ ] Create `apps/web/src/components/ds/checkbox.tsx` extending `@repo/ui/checkbox`
- [ ] Create `apps/web/src/components/ds/label.tsx` extending `@repo/ui/label`
- [ ] Create `apps/web/src/components/ds/index.ts` barrel export
- [ ] Add password visibility toggle to Input component (eye icon)

**Validation:** Components render correctly, styles match design system

---

## Phase 2: Core Components (Parallel Work)

### 3. Build OAuthButtons component
- [ ] Create `apps/web/src/features/auth/components/OAuthButtons.tsx`
- [ ] Add Google sign-in button with icon and text
- [ ] Add Apple sign-in button with icon and text
- [ ] Implement onClick handlers (accept callback prop)
- [ ] Add loading state (show spinner on specific button)
- [ ] Add disabled state (disable all when one is loading)
- [ ] Style with proper spacing and hover states

**Validation:** Buttons render, onClick triggers, loading states work

---

### 4. Build LoginForm component
- [ ] Create `apps/web/src/features/auth/components/LoginForm.tsx`
- [ ] Add email input field with label
- [ ] Add password input field with label and visibility toggle
- [ ] Add "Remember me" checkbox
- [ ] Add submit button
- [ ] Implement form validation with TanStack Form + Zod
- [ ] Show validation errors below each field
- [ ] Add disabled state during submission
- [ ] Style form fields with proper spacing

**Validation:** Form validates input, shows errors, handles submission

---

### 5. Build FeatureShowcase component
- [ ] Create `apps/web/src/features/auth/components/FeatureShowcase.tsx` (Server Component)
- [ ] Add blue gradient background styling
- [ ] Add hero text: "Get better with money"
- [ ] Add benefits description text (Bahasa Indonesia)
- [ ] Add app preview mockup (placeholder or actual design)
- [ ] Add carousel indicators (3 dots at bottom)
- [ ] Make responsive (hidden on mobile <768px)

**Validation:** Showcase renders, responsive behavior correct

---

## Phase 3: Authentication Logic

### 6. Create email/password login hook
- [ ] Create `apps/web/src/features/auth/hooks/use-login-email.ts`
- [ ] Implement TanStack Query mutation for email/password login
- [ ] Call `POST /auth/login` with email, password, rememberMe
- [ ] Handle success: store tokens, return user data
- [ ] Handle errors: map to Bahasa Indonesia messages
- [ ] Implement remember me logic (set token expiry)
- [ ] Write unit tests with MSW mocks

**Validation:** Hook calls API correctly, handles success/error, tests pass

---

### 7. Create OAuth login hook
- [ ] Create `apps/web/src/features/auth/hooks/use-login-oauth.ts`
- [ ] Implement TanStack Query mutation for OAuth login
- [ ] Integrate Firebase Auth OAuth (Google, Apple)
- [ ] Open OAuth popup on mutation call
- [ ] Get OAuth token from Firebase
- [ ] Call `POST /auth/oauth` with provider and token
- [ ] Handle popup blocked error
- [ ] Handle user cancelled flow (no error message)
- [ ] Handle OAuth provider errors
- [ ] Write unit tests with mocked Firebase Auth

**Validation:** Hook triggers OAuth flow, handles all scenarios, tests pass

---

## Phase 4: Container & Integration

### 8. Build LoginContainer orchestrator
- [ ] Create `apps/web/src/features/auth/components/LoginContainer.tsx` (Client Component)
- [ ] Import OAuthButtons, LoginForm, FeatureShowcase
- [ ] Integrate `useLoginWithEmail` hook
- [ ] Integrate `useLoginWithOAuth` hook
- [ ] Handle OAuth button clicks → call OAuth hook
- [ ] Handle form submission → call email hook
- [ ] Handle remember me → pass to hooks
- [ ] Display error messages at top of form
- [ ] Handle loading states (disable all inputs)
- [ ] Redirect to `/dashboard` on success
- [ ] Implement split-screen layout (form left, showcase right)

**Validation:** Container orchestrates all flows, handles errors, redirects correctly

---

### 9. Build responsive layout
- [ ] Add Tailwind breakpoints for responsive design
- [ ] Desktop (≥1024px): 40/60 split (form/showcase)
- [ ] Tablet (768-1023px): 50/50 split
- [ ] Mobile (<768px): Single column, hide showcase
- [ ] Test on various screen sizes
- [ ] Ensure touch targets are ≥44px on mobile
- [ ] Add padding and margins for proper spacing

**Validation:** Layout adapts correctly on all screen sizes

---

## Phase 5: Polish & UX

### 10. Implement password visibility toggle
- [ ] Add eye icon button to password input
- [ ] Toggle input type between "password" and "text"
- [ ] Change icon between eye and eye-off
- [ ] Position icon inside input field (right side)
- [ ] Ensure keyboard accessibility

**Validation:** Toggle works, icon changes, accessible via keyboard

---

### 11. Add navigation links
- [ ] Add "Forgot Password?" link (navigate to `/auth/forgot-password`)
- [ ] Add "Sign Up" link at bottom (navigate to `/auth/signup`)
- [ ] Style links with hover states
- [ ] Use Next.js Link component for client-side routing

**Validation:** Links navigate correctly, no page reload

---

### 12. Implement loading and error states
- [ ] Show loading spinner in submit button during auth
- [ ] Change button text to "Masuk..." when loading
- [ ] Disable all inputs during loading
- [ ] Show error alerts at top of form (red background)
- [ ] Auto-focus first invalid field on error
- [ ] Clear errors when user starts editing

**Validation:** Loading states clear, errors display correctly

---

## Phase 6: Testing

### 13. Write component unit tests
- [ ] Test LoginForm: validation, submission, field changes
- [ ] Test OAuthButtons: click handlers, loading states
- [ ] Test LoginContainer: orchestration, error handling, redirection
- [ ] Test password visibility toggle
- [ ] Mock TanStack Query hooks in tests
- [ ] Use MSW for API mocking
- [ ] Achieve ≥80% coverage

**Validation:** All tests pass, coverage ≥80%

---

### 14. Write integration tests
- [ ] Test full email/password login flow (happy path)
- [ ] Test full OAuth login flow (happy path)
- [ ] Test validation errors display correctly
- [ ] Test backend error scenarios (401, 404, 429, 500)
- [ ] Test remember me persists session
- [ ] Test popup blocked scenario
- [ ] Test user cancels OAuth

**Validation:** Integration tests cover all critical paths, tests pass

---

### 15. Write accessibility tests
- [ ] Test keyboard navigation through form
- [ ] Test screen reader announcements (ARIA labels)
- [ ] Test focus indicators are visible
- [ ] Test error messages have aria-describedby
- [ ] Test color contrast meets WCAG AA
- [ ] Test touch target sizes on mobile

**Validation:** Accessibility tests pass, meets WCAG standards

---

## Phase 7: Finalization

### 16. Add Bahasa Indonesia content
- [ ] Review all UI text and error messages
- [ ] Ensure all text is in Bahasa Indonesia
- [ ] Add proper punctuation and capitalization
- [ ] Test error message readability

**Validation:** All text in Bahasa Indonesia, clear and professional

---

### 17. Performance optimization
- [ ] Code-split OAuth SDK (dynamic import)
- [ ] Optimize images with Next.js Image component
- [ ] Lazy load FeatureShowcase on viewport
- [ ] Minimize client bundle size
- [ ] Run Lighthouse audit (score ≥90)

**Validation:** Performance metrics meet targets

---

### 18. Final review and deployment
- [ ] Review design matches reference image
- [ ] Test on real devices (iOS, Android, Desktop)
- [ ] Verify Firebase Auth configuration (Google, Apple enabled)
- [ ] Check backend API endpoints are available
- [ ] Verify all success criteria met
- [ ] Get design approval from stakeholders
- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Deploy to production

**Validation:** All success criteria met, stakeholders approve

---

## Dependencies & Parallelization

**Can be done in parallel:**
- Tasks 3, 4, 5 (OAuthButtons, LoginForm, FeatureShowcase)
- Tasks 6, 7 (email hook, OAuth hook)

**Blocking dependencies:**
- Task 2 must complete before 3, 4
- Tasks 3, 4, 5 must complete before 8
- Tasks 6, 7 must complete before 8
- Task 8 must complete before 9, 10, 11, 12
- Tasks 13, 14, 15 require all implementation tasks done

**Critical Path:**
1 → 2 → 8 → 13 → 18 (Setup → Components → Container → Tests → Deploy)

---

## Estimated Effort

- Phase 1 (Setup): 2-3 hours
- Phase 2 (Components): 4-6 hours (parallel)
- Phase 3 (Hooks): 3-4 hours (parallel)
- Phase 4 (Container): 3-4 hours
- Phase 5 (Polish): 2-3 hours
- Phase 6 (Testing): 4-6 hours
- Phase 7 (Final): 2-3 hours

**Total: 20-29 hours** (1-2 days with focused work)
