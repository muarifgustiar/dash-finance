# Proposal: Implement Budget Entry

## Problem Statement

The budget management page currently displays hardcoded mock data and has a non-functional creation form. Users cannot create, edit, or manage budgets to track their spending limits.

**Current State:**
- Budget page displays 3 hardcoded budgets (Personal, Family, Business)
- Form UI present with basic fields (name, amount, period)
- Backend API endpoint `POST /budgets` is fully functional
- Frontend form submission only does `console.log()`
- No integration with actual budget data

**Issues:**
- Users cannot create new budgets
- No ability to edit or delete budgets
- Cannot track real spending against budget limits
- Form has no validation
- No error handling or feedback
- Mock data not connected to real API

## Proposed Solution

Implement complete budget management functionality with creation, viewing, editing, and deletion capabilities, following the simplified frontend architecture.

### Key Changes

1. **Create Budget Hooks** (`useBudgets`, `useCreateBudget`, `useUpdateBudget`, `useDeleteBudget`)
   - Direct API calls via `apiRequest`
   - TanStack Query for fetching and mutations
   - Cache invalidation after mutations

2. **Implement Form Validation**
   - Use TanStack Form with Zod schemas from `@repo/schema`
   - Validate budget amount (positive number)
   - Validate budget owner selection
   - Year validation (current or future years)

3. **Update BudgetPageContainer**
   - Replace mock data with API calls
   - Implement real budget creation
   - Add edit and delete functionality
   - Show actual vs planned spending
   - Add loading/error/success states

4. **Budget Display Enhancements**
   - Progress bars showing spending vs budget
   - Color-coded warnings (>80% = yellow, >100% = red)
   - Filter by budget owner
   - Filter by year
   - Sort by name/amount/spending

### User Flow

**Create Budget:**
1. User clicks "Tambah Budget"
2. Fills out form (owner, year, planned amount)
3. Form validates in real-time
4. Clicks "Simpan"
5. API call with loading state
6. Success: Toast, form resets, list refreshes
7. Error: Error message displayed

**Edit Budget:**
1. User clicks edit icon on budget card
2. Form pre-populates with existing data
3. User modifies fields
4. Clicks "Simpan"
5. Budget updates, list refreshes

**Delete Budget:**
1. User clicks delete icon
2. Confirmation dialog appears
3. User confirms deletion
4. Budget deleted, list refreshes

## Benefits

- Users can set spending limits per budget owner
- Track spending progress against budgets
- Visual indicators for budget status
- Better financial planning and control
- Follows project's simplified frontend architecture
- Consistent with transaction and category management

## Scope

**In Scope:**
- Budget creation with validation
- Budget listing with real API data
- Budget editing
- Budget deletion with confirmation
- Progress visualization (spent vs planned)
- Filter by budget owner and year
- TanStack Query hooks
- Form validation with TanStack Form + Zod
- Toast notifications

**Out of Scope:**
- Budget templates or presets
- Multi-year budget comparison
- Budget forecasting/projections
- Budget alerts/notifications
- Recurring budget creation
- Budget sharing between users

## Dependencies

- Existing: Backend API endpoints functional (`POST`, `GET`, `PUT`, `DELETE`)
- Existing: Schema definitions in `@repo/schema/budget`
- Existing: UI components from `@repo/ui`
- Required: Budget owner list API endpoint
- Required: Toast component (already implemented)

## Risks & Mitigation

**Risk:** Spent amount calculation complexity
- **Mitigation:** Backend already handles spent calculation via `getTotalSpentByBudgetOwner`

**Risk:** Year selection UI complexity
- **Mitigation:** Use simple select dropdown with last 5 years + next 2 years

**Risk:** Budget owner relationship management
- **Mitigation:** Use existing budget owner API endpoint, ensure referential integrity

**Risk:** Concurrent edits by multiple users
- **Mitigation:** Use optimistic updates, handle 409 Conflict errors gracefully

## Success Criteria

1. Users can create budgets successfully
2. Budget list displays real data from API
3. Users can edit existing budgets
4. Users can delete budgets with confirmation
5. Form validates all fields correctly
6. Progress bars accurately show spending vs budget
7. Loading/error/success states work properly
8. Toast notifications provide clear feedback
9. Type-checking passes
10. Follows architecture guidelines (no repositories)

## Alternatives Considered

**Alternative 1:** Inline editing in budget cards
- **Rejected:** Form complexity better suited for modal/separate section

**Alternative 2:** Keep mock data for MVP
- **Rejected:** Backend is ready, users need real functionality

**Alternative 3:** Separate pages for create/edit
- **Rejected:** Single-page flow is more efficient for simple CRUD

## Timeline Estimate

- **Phase 1** (Hooks & API integration): 2-3 hours
- **Phase 2** (Create functionality): 2-3 hours
- **Phase 3** (Edit/Delete): 2-3 hours
- **Phase 4** (UI polish & filters): 1-2 hours
- **Phase 5** (Testing): 1-2 hours
- **Total:** 8-13 hours (1-2 days)
