# Proposal: Implement Transaction Entry

## Problem Statement

The transaction entry form in the web frontend currently has incomplete implementation - clicking "Simpan" (Save) only logs data to console without actually creating transactions. Users cannot add new transactions to track their expenses and income.

**Current State:**
- Transaction list page exists with filtering by category
- Form UI is present with all required fields (amount, category, budget owner, date, description)
- Backend API endpoint `POST /transactions` is fully functional
- Frontend form submission handler only does `console.log()`

**Issues:**
- Users cannot create new transactions
- Form has no validation
- No error handling for failed submissions
- No loading states during API calls
- No success feedback after creation
- Query cache not invalidated after successful creation

## Proposed Solution

Implement complete transaction entry functionality using TanStack Query mutations and TanStack Form for validation, following the simplified frontend architecture (no repositories/use cases).

### Key Changes

1. **Create Transaction Hooks** (`useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`)
   - Direct API calls via `apiRequest`
   - TanStack Query mutations with cache invalidation
   - Proper error handling and loading states

2. **Implement Form Validation**
   - Use TanStack Form with Zod schemas from `@repo/schema`
   - Field-level validation (amount > 0, required fields, etc.)
   - Real-time validation feedback

3. **Update TransactionPageContainer**
   - Replace `console.log` with actual mutation call
   - Add loading/error/success states
   - Implement toast notifications for feedback
   - Invalidate transaction list queries after creation

4. **Optional: Transaction Edit/Delete**
   - Add edit button to transaction cards
   - Add delete confirmation dialog
   - Implement update and delete mutations

### User Flow

1. User opens transaction page
2. Clicks "Tambah Transaksi" button
3. Fills out form with validation feedback
4. Clicks "Simpan"
5. Loading state shows during API call
6. On success: Toast notification, form resets, list refreshes
7. On error: Error message displayed

## Benefits

- Users can track their expenses and income
- Form validation prevents invalid data submission
- Better UX with loading states and feedback
- Follows project's simplified frontend architecture
- Consistent with category management implementation

## Scope

**In Scope:**
- Transaction creation with full validation
- TanStack Query hooks for mutations
- Form validation with TanStack Form + Zod
- Loading/error/success states
- Toast notifications
- Cache invalidation
- Optional: Edit and delete functionality

**Out of Scope:**
- Receipt upload (file handling) - future enhancement
- Advanced transaction categorization
- Bulk transaction import
- Transaction export/reporting
- Multi-currency support

## Dependencies

- Existing: Backend API endpoints fully functional
- Existing: Schema definitions in `@repo/schema/transaction`
- Existing: UI components from `@repo/ui` (Button, Input, Select, etc.)
- Required: Toast component from `@repo/ui` (already implemented)

## Risks & Mitigation

**Risk:** Form complexity with multiple dropdowns (category, budget owner)
- **Mitigation:** Use existing `useCategories` pattern, create similar `useBudgetOwners` hook

**Risk:** Date handling complexity
- **Mitigation:** Use native HTML5 date input, handle timezone in backend

**Risk:** Amount validation (negative numbers, decimals)
- **Mitigation:** Use Zod number schema with min/max constraints

## Success Criteria

1. Users can create transactions successfully via form
2. Form validates all required fields before submission
3. Loading states visible during API calls
4. Success/error messages displayed appropriately
5. Transaction list refreshes automatically after creation
6. No console errors or warnings
7. Type-checking passes
8. Follows project architecture guidelines (no repositories in frontend)

## Alternatives Considered

**Alternative 1:** Keep repository pattern
- **Rejected:** Project explicitly moved away from repositories in frontend (see `remove-web-repositories-layer`)

**Alternative 2:** Use native form with ref
- **Rejected:** TanStack Form provides better type safety and validation

**Alternative 3:** Server Actions (Next.js 14+)
- **Rejected:** Inconsistent with existing API client pattern

## Timeline Estimate

- **Phase 1** (Create functionality): 3-4 hours
- **Phase 2** (Edit/Delete): 2-3 hours
- **Phase 3** (Polish & testing): 1-2 hours
- **Total:** 6-9 hours (1-2 days)
