# Design: Modern Login Page

## Architecture Overview

### Component Hierarchy
```
app/(auth)/login/page.tsx (Routing Layer - Server Component)
    ↓
LoginContainer (Client Component - Orchestration)
    ↓
├── LoginForm (Email/Password form)
│   ├── Input (email)
│   ├── Input (password) + visibility toggle
│   ├── Checkbox (remember me)
│   └── Button (submit)
├── ForgotPasswordLink
└── SignUpLink
```

### Layout Structure
```
┌─────────────────────────────────────
│                                     
│        ┌───────────────┐           
│        │               │           
│        │  Login Card   │           
│        │  (Centered)   │           
│        │               │           
│        │  - Email      │           
│        │  - Password   │           
│        │  - Remember   │           
│        │  - Submit     │           
│        │               │           
│        └───────────────┘           
│                                     
└─────────────────────────────────────
       Centered Card Layout
```

All screen sizes: Centered card with max-width constraint

## Component Design

### 1. LoginContainer
**Responsibility:** Orchestrate authentication flow

**State:**
- Form data (email, password, rememberMe)
- Loading state (isAuthenticating)
- Error messages

**Hooks:**
- `useLoginWithEmail` - TanStack Query mutation for email/password
- `useForm` - TanStack Form for validation

**Logic:**
- Handle form submission → validate → call email/password auth
- Handle remember me → store preference in localStorage
- Handle errors → display in Bahasa Indonesia

### 2. LoginForm
**Responsibility:** Email/password form fields

**Features:**
- Email validation (Zod schema)
- Password validation (min length, required)
- Password visibility toggle (eye icon)
- Remember me checkbox
- Client-side validation before submission
- Disabled state during loading

### 2. LoginForm
```
1. User enters email + password
2. User clicks "Sign In" button
3. TanStack Form validates input (Zod schema)
4. If valid → LoginContainer calls useLoginWithEmail mutation
5. Mutation → apiRequest → POST /auth/login
6. Success → Store tokens → Redirect to /dashboard
7. Error → Display error message in form
```

### Remember Me
```
1. User checks "Remember me"
2. On successful login → Store flag in localStorage
3. Auth hook reads flag → Sets longer token expiry (30 days vs 1 day)
4. On app load → Check localStorage → Auto-login if token valid
```

## Validation Schema

**Location:** `packages/schema/src/auth/login.schema.ts`

```typescript
import { z } from "zod";

export const LoginWithEmailSchema = z.object({
  email: z.string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z.string()
    .min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

export type LoginWithEmailDTO = z.infer<typeof LoginWithEmailSchema>;
```

## Styling Approach

### Design System Components
Use design system layer (`components/ds/`) for consistent styling:
- `ds/button.tsx` - Primary (blue), Outline variants
- `ds/input.tsx` - With focus states
- `ds/checkbox.tsx` - Custom styled
- `ds/label.tsx` - Typography

### Tailwind Classes
- **Form container:** `bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md mx-auto`
- **Page background:** `bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50`
- **Submit button:** `bg-blue-600 hover:bg-blue-700 text-white w-full`
- **Spacing:** Consistent `space-y-4` for form fields

### Responsive Breakpoints
- Mobile (< 768px): Full-width card with padding
- Tablet/Desktop (≥ 768px): Centered card with max-width 448px

## Error Handling

### Validation Errors (Client-Side)
- Display below each field
- Red text (`text-red-600`)
- Show on blur or submit attempt

### Authentication Errors (Server-Side)
- Display at top of form in alert box
- Bahasa Indonesia messages:
  - "Email atau password salah"
  - "Akun tidak ditemukan"
  - "Terlalu banyak percobaan, coba lagi nanti"
  - "Terjadi kesalahan, silakan coba lagi"

## Accessibility

- All interactive elements have proper ARIA labels
- Form inputs have associated labels
- Error messages linked with `aria-describedby`
- Keyboard navigation support
- Focus indicators visible
- Alt text for logo and images
- Sufficient color contrast (WCAG AA)

## Testing Strategy

### Unit Tests
- **LoginContainer**: 
  - Form submission with valid data
  - Form validation errors
  - Remember me checkbox behavior
  - Error message display
  
- **LoginForm**:
  - Input changes update state
  - Password visibility toggle
  - Validation on blur/submit

### Integration Tests
- Full login flow with MSW mocked API
- Remember me persists across reload
- Error scenarios (401, 500, network error)

### E2E Tests (Playwright)
- **Critical Flows**:
  - Complete login flow (enter credentials → authenticate → redirect)
  - Form validation in real browser
  - Password visibility toggle interaction
  - Remember me session persistence (browser restart)
  - Navigation (forgot password, sign up links)
  
- **Cross-Browser**:
  - Chromium (Chrome/Edge)
  - Firefox
  - WebKit (Safari)
  
- **Visual Regression**:
  - Screenshot comparison for layout consistency
  - Mobile vs desktop views
  - Error states
  - Loading states

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Color contrast (WCAG AA)

### Visual Regression Tests (Optional)
- Screenshot comparison for layout
- Mobile vs desktop views

## Implementation Notes

### File Structure
```
apps/web/src/features/auth/
  components/
    LoginContainer.tsx          # Main orchestrator
    LoginForm.tsx              # Email/password form
    __tests__/
      LoginContainer.test.tsx
      LoginForm.test.tsx
  hooks/
    use-login-email.ts         # Email/password mutation
    __tests__/
      use-login-email.test.ts
```

### Performance Considerations
- Server Component for static content where possible
- Client Component only for interactive form area
- Optimize images (Next.js Image component)
- Minimize client bundle

### Security Considerations
- No password stored in state longer than necessary
- HTTPS only (enforced by Next.js/Firebase)
- OAuth tokens validated on backend
- CSRF protection (Firebase Auth handles)
- Rate limiting on backend for brute force prevention
- Remember me uses secure cookies/localStorage with expiry
