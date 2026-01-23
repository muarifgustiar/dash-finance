# Proposal: Implement Modern Login Page

## Why

Users need a professional, clean authentication experience that:
1. **Builds trust** - Professional design signals product quality and security
2. **Improves conversion** - Clear, intuitive UX reduces abandonment
3. **Supports mobile** - Responsive design works across all devices
4. **Reduces errors** - Clear validation feedback helps users succeed

The current basic login form doesn't meet modern UX standards and needs refinement to provide a better user experience.

## Problem Statement

The current login page needs to be redesigned to match modern authentication UX patterns with:
- Clean, professional visual design with centered layout
- Email/password authentication with proper validation
- Remember me functionality
- Password recovery flow
- Clear navigation to signup

The existing `LoginContainer` has basic email/password fields but lacks:
- Password visibility toggle
- Proper spacing and typography following design system
- Forgot password link functionality
- Remember me checkbox
- Modern centered card layout

## Proposed Solution

Redesign the login page to follow modern authentication patterns with:

### Visual Design
- **Centered card layout**: Clean white form area with proper card styling
- **Professional branding**: Logo and tagline at top
- **Design system components**: Use components from `@repo/ui` and DS layer

### Authentication Methods
1. **Email/Password**: Form with validation
2. **Remember Me**: Checkbox to persist session
3. **Forgot Password**: Link to password recovery flow

### User Experience
- Loading states during authentication
- Clear error messages in Bahasa Indonesia
- Responsive design (mobile: single column, desktop: split-screen)
- Smooth transitions and animations
- Password visibility toggle with eye icon

### Technical Approach
- Use Next.js 15 App Router patterns (server components where possible)
- `LoginContainer` orchestrates OAuth and form-based auth
- TanStack Form for form validation with Zod schemas
- TanStack Query for auth mutations with proper error handling
- Firebase Auth for OAuth and email/password
- Design system components from `components/ds/`

## Scope

**In Scope:**
- Login page UI redesign with centered card layout
- Email/password form with validation
- Remember me checkbox
- Password visibility toggle
- Forgot password link (UI only, flow in separate change)
- Responsive layout (mobile/desktop/tablet)
- Loading and error states
- Auth schema validation with Zod

**Out of Scope:**
- OAuth/Social authentication
- Password reset flow implementation (separate change)
- Sign up page (separate change)
- Two-factor authentication
- Session management changes
- Backend auth endpoint modifications

## Success Criteria

1. ✅ Login page has clean, centered card design
2. ✅ Users can sign in with email/password
3. ✅ Form validation shows clear error messages
4. ✅ Remember me persists user session
5. ✅ Password visibility can be toggled
6. ✅ Responsive on mobile, tablet, and desktop
7. ✅ All text in Bahasa Indonesia
8. ✅ Loading states during auth operations
9. ✅ Component tests achieve ≥80% coverage

## Impact & Dependencies

**Benefits:**
- Modern, professional authentication experience
- Reduced friction with OAuth sign-in
- Improved conversion for new users
- Better mobile experience

**Risks:**
- None significant

**Dependencies:**
- `@repo/ui` components (Button, Input, Checkbox)
- Design system layer (`components/ds/`)
- TanStack Form + Query
- lucide-react for icons
- Backend auth endpoint (`POST /auth/login`)

**Blocking:**
- None (can implement incrementally)

## Related Changes

- **Future**: Implement password reset flow
- **Future**: Implement sign up page
- **Future**: Add OAuth authentication (Google, Apple)
- **Future**: Add two-factor authentication
- **Related**: Auth module in API (already exists)
