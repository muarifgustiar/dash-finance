# Implementation Tasks: Implement Transaction Entry

## Phase 1: Transaction Hooks (Core Infrastructure)

### Task 1.1: Create useCreateTransaction Hook
**Files:**
- Create: `apps/web/src/features/transaction/hooks/useCreateTransaction.ts`

**Details:**
- Import `apiRequest` from `@/lib/api-client`
- Import `CreateTransactionRequest`, `TransactionResponse` from `@repo/schema/transaction`
- Define `CreateTransactionData` type (form data structure)
- Implement `mapTransactionResponse` helper
- Use `useMutation` with POST to `/transactions`
- Invalidate `transactionKeys.lists()` on success
- Return mutation with `mutate`, `isLoading`, `error`

**Validation:** Hook returns correct types, compiles without errors

### Task 1.2: Create useUpdateTransaction Hook
**Files:**
- Create: `apps/web/src/features/transaction/hooks/useUpdateTransaction.ts`

**Details:**
- Similar pattern to create hook
- Use `UpdateTransactionRequest` schema
- PUT request to `/transactions/:id`
- Invalidate both list and detail queries
- Support partial updates

**Validation:** Type-check passes

### Task 1.3: Create useDeleteTransaction Hook
**Files:**
- Create: `apps/web/src/features/transaction/hooks/useDeleteTransaction.ts`

**Details:**
- DELETE request to `/transactions/:id`
- Invalidate queries on success
- Return simple mutation (no response data needed)

**Validation:** Hook compiles correctly

### Task 1.4: Update Transaction Query Keys
**Files:**
- Modify: `apps/web/src/features/transaction/hooks/useTransactions.ts`

**Details:**
- Ensure query keys structure supports invalidation
- Add `details()` and `detail(id)` keys if missing
- Export `transactionKeys` for use in mutations

**Validation:** Consistent key structure across hooks

## Phase 2: Form Validation & Schema Integration

### Task 2.1: Create Transaction Form Schema
**Files:**
- Review: `packages/schema/src/transaction/index.ts`
- Create (if needed): Additional validation schemas for frontend

**Details:**
- Verify `CreateTransactionRequest` schema exists
- Add frontend-specific validation if needed (e.g., min/max amounts)
- Ensure all required fields are validated
- Add helpful error messages in Bahasa Indonesia

**Validation:** Schema validates correctly with Zod

### Task 2.2: Define Form State Types
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Define `TransactionFormData` interface
- Map to API request types
- Handle optional fields (description, receipt)
- Add form mode type (`create` | `edit` | null)

**Validation:** TypeScript types are correct

## Phase 3: Implement Create Functionality

### Task 3.1: Implement Form Submission Handler
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Import `useCreateTransaction` hook
- Replace `console.log()` with `createMutation.mutate()`
- Transform form data to API request format
- Handle `budgetOwnerId` and `categoryId` from selects
- Handle date formatting (ISO string)
- Convert amount to number

**Validation:** Form submission calls API successfully

### Task 3.2: Add Loading States
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Disable form fields during `isLoading`
- Disable submit button during `isLoading`
- Show loading spinner on button (`<Loader2 />` icon)
- Prevent multiple submissions

**Validation:** UI reflects loading state correctly

### Task 3.3: Add Error Handling
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Display mutation error message
- Use Alert component for errors
- Parse API error responses
- Show field-specific errors if available
- Clear error on retry

**Validation:** Error messages display correctly

### Task 3.4: Add Success Feedback
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Use `toast()` from `@repo/ui/use-toast`
- Show success message "Transaksi berhasil disimpan"
- Reset form after success
- Close form modal/section
- Auto-refresh transaction list (via cache invalidation)

**Validation:** Success flow works end-to-end

## Phase 4: Edit & Delete Functionality (Optional)

### Task 4.1: Add Edit Button to Transaction Cards
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionListContainer.tsx`

**Details:**
- Add Edit icon button to each transaction card
- Pass transaction data to parent via callback
- Open form in edit mode with pre-filled data

**Validation:** Edit button triggers form open

### Task 4.2: Implement Edit Mode in Form
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Add `editingTransaction` state
- Pre-populate form when editing
- Change button text to "Perbarui" (Update)
- Use `useUpdateTransaction` hook for updates
- Reset editing state after success

**Validation:** Can edit existing transactions

### Task 4.3: Add Delete Confirmation Dialog
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionListContainer.tsx`

**Details:**
- Add Delete icon button
- Use AlertDialog from `@repo/ui`
- Show confirmation "Hapus transaksi ini?"
- Call `useDeleteTransaction` on confirm
- Show toast on success

**Validation:** Can delete transactions safely

## Phase 5: Form Validation Enhancement

### Task 5.1: Add Field Validation Rules
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Amount: required, > 0, max 2 decimal places
- Category: required selection
- Budget Owner: required selection
- Date: required, not future date (optional constraint)
- Description: optional, max length
- Show validation errors below fields

**Validation:** Invalid inputs prevented

### Task 5.2: Implement Real-Time Validation
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Validate on blur (not on every keystroke)
- Show error state on input fields (red border)
- Clear errors when user starts typing
- Disable submit if form invalid

**Validation:** Validation feedback is responsive

## Phase 6: UI Polish & Refinements

### Task 6.1: Improve Form Layout
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Use 2-column grid for fields
- Proper spacing and alignment
- Responsive design (mobile-friendly)
- Accessible labels and inputs

**Validation:** Form looks good on all screen sizes

### Task 6.2: Add Form Reset/Cancel
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

**Details:**
- Add "Batal" (Cancel) button
- Reset form state on cancel
- Close form section
- Confirm if user has unsaved changes

**Validation:** Cancel flow works correctly

### Task 6.3: Improve Transaction List Refresh
**Files:**
- Modify: `apps/web/src/features/transaction/components/TransactionListContainer.tsx`

**Details:**
- Ensure smooth transition after create/update/delete
- Consider optimistic updates for better UX
- Show loading skeletons during refetch

**Validation:** List updates feel instant

## Unit Testing Principles

**Critical Guidelines:**
- ✅ **No production code until failing tests exist** - Write tests first (TDD approach)
- ✅ **Each spec requirement maps to ≥1 test** - Every requirement in specs/ must have corresponding test coverage
- ✅ **Never edit unrelated packages** - Only modify files within the transaction feature boundary
- ✅ **Update spec when ambiguity is found** - If requirements are unclear during implementation, update spec.md first

**Test Coverage Requirements:**
- Hook tests: `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`
- Component tests: Form validation, mode management, error handling
- Integration tests: API calls with MSW mocks
- Each scenario in spec.md → at least one test case

**Test Location:**
- `apps/web/src/features/transaction/hooks/__tests__/`
- `apps/web/src/features/transaction/components/__tests__/`

---

## Phase 7: Testing & Verification

### Task 7.1: Manual E2E Testing
**Steps:**
1. Open transaction page
2. Click "Tambah Transaksi"
3. Fill all fields with valid data
4. Submit and verify success
5. Check transaction appears in list
6. Edit transaction and verify update
7. Delete transaction and verify removal
8. Test validation by submitting invalid data
9. Test error handling by breaking API

**Validation:** All scenarios work correctly

### Task 7.2: Type Checking
**Command:** `cd apps/web && bun run type-check`

**Validation:** No TypeScript errors

### Task 7.3: Build Verification
**Command:** `cd apps/web && bun run build`

**Validation:** Production build succeeds

### Task 7.4: Check Console Errors
**Steps:**
- Run dev server
- Open browser console
- Perform all operations
- Check for errors/warnings

**Validation:** No console errors

## Dependencies & Parallelization

**Can be done in parallel:**
- Phase 1 (all hook tasks can be created simultaneously)
- Phase 5 (validation) can start during Phase 3

**Must be sequential:**
- Phase 1 → Phase 3 (hooks needed for functionality)
- Phase 3 → Phase 4 (create must work before edit/delete)
- Phase 6 requires Phase 3 completion
- Phase 7 requires all phases complete

**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 7

## Estimated Time

- Phase 1: 2 hours
- Phase 2: 1 hour
- Phase 3: 2 hours
- Phase 4: 2 hours (optional)
- Phase 5: 1 hour
- Phase 6: 1 hour
- Phase 7: 1 hour

**Total:** 10 hours (~1.5 days) including optional edit/delete
**Minimum:** 7 hours (~1 day) for create-only

## Success Criteria Checklist

- [ ] useCreateTransaction hook implemented and typed correctly
- [ ] Form submission creates actual transactions via API
- [ ] Loading states prevent multiple submissions
- [ ] Error messages display clearly
- [ ] Success toast appears after creation
- [ ] Transaction list refreshes automatically
- [ ] Form validation prevents invalid data
- [ ] Edit functionality works (optional)
- [ ] Delete functionality works (optional)
- [ ] Type-check passes
- [ ] Build succeeds
- [ ] No console errors
- [ ] Follows architecture guidelines (no repositories)
