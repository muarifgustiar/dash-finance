# Implementation Tasks: Implement Budget Entry

## Phase 1: Budget Hooks (Core Infrastructure)

### Task 1.1: Create useBudgets Hook
**Files:**
- Create: `apps/web/src/features/budget/hooks/useBudgets.ts`

**Details:**
- Import `apiRequest` from `@/lib/api-client`
- Import `BudgetResponse` from `@repo/schema/budget`
- Define `BudgetFilters` interface (budgetOwnerId?, year?)
- Implement `mapBudgetResponse` helper
- Use `useQuery` with GET to `/budgets`
- Support query params for filtering
- Export `budgetKeys` for cache management

**Validation:** Hook fetches budgets successfully

### Task 1.2: Create useCreateBudget Hook
**Files:**
- Create: `apps/web/src/features/budget/hooks/useCreateBudget.ts`

**Details:**
- Import schemas from `@repo/schema/budget`
- Define `CreateBudgetData` type
- Use `useMutation` with POST to `/budgets`
- Invalidate `budgetKeys.lists()` on success
- Return mutation states

**Validation:** Type-check passes

### Task 1.3: Create useUpdateBudget Hook
**Files:**
- Create: `apps/web/src/features/budget/hooks/useUpdateBudget.ts`

**Details:**
- Use `UpdateBudgetRequest` schema
- PUT request to `/budgets/:id`
- Invalidate queries on success
- Support partial updates

**Validation:** Hook compiles correctly

### Task 1.4: Create useDeleteBudget Hook
**Files:**
- Create: `apps/web/src/features/budget/hooks/useDeleteBudget.ts`

**Details:**
- DELETE request to `/budgets/:id`
- Invalidate queries on success
- Simple mutation (no response data)

**Validation:** Hook ready for use

## Phase 2: Replace Mock Data with Real API

### Task 2.1: Remove Hardcoded Budget Data
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Remove `const budgets = [...]` mock array
- Import `useBudgets` hook
- Call `useBudgets()` to fetch real data
- Handle loading state with skeleton
- Handle error state with message
- Map budget data to display format

**Validation:** Real budgets display from API

### Task 2.2: Add useBudgetOwners Hook
**Files:**
- Create: `apps/web/src/features/budget/hooks/useBudgetOwners.ts`

**Details:**
- Fetch budget owners for form dropdown
- Use existing API endpoint `/budget-owners?status=ACTIVE`
- Similar pattern to transaction page
- Cache query data

**Validation:** Budget owners load for form

## Phase 3: Implement Create Functionality

### Task 3.1: Update Form State Management
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Define proper `BudgetFormData` interface
- Add form mode state (`create` | `edit` | null)
- Add `editingBudgetId` state
- Initialize form with empty values

**Validation:** Form state properly typed

### Task 3.2: Implement Create Form Submission
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Import `useCreateBudget` hook
- Replace `console.log()` with `createMutation.mutate()`
- Transform form data to API format
- Convert plannedAmount to number
- Parse year as integer
- Handle budgetOwnerId from select

**Validation:** Can create budgets successfully

### Task 3.3: Add Loading & Error States
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Disable form during `isLoading`
- Show loading spinner on submit button
- Display error messages with Alert component
- Prevent double submission

**Validation:** States reflect correctly in UI

### Task 3.4: Add Success Feedback
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Import `toast` from `@repo/ui/use-toast`
- Show success message "Budget berhasil dibuat"
- Reset form after success
- Close form section
- Budget list auto-refreshes via cache

**Validation:** Success flow complete

## Phase 4: Implement Edit Functionality

### Task 4.1: Add Edit Button to Budget Cards
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Add Edit icon button to each budget card
- Set `editingBudgetId` on click
- Set form mode to 'edit'
- Pre-populate form with budget data
- Open form section

**Validation:** Edit mode activates correctly

### Task 4.2: Implement Update Handler
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Import `useUpdateBudget` hook
- Check form mode in submit handler
- Call update mutation if editing
- Pass budget ID with data
- Reset editing state on success

**Validation:** Can update existing budgets

## Phase 5: Implement Delete Functionality

### Task 5.1: Add Delete Button with Confirmation
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Add Delete icon button to budget cards
- Import AlertDialog from `@repo/ui`
- Show confirmation dialog
- Display budget name in confirmation
- Handle delete on confirm

**Validation:** Delete confirmation appears

### Task 5.2: Implement Delete Handler
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Import `useDeleteBudget` hook
- Call delete mutation with budget ID
- Show success toast "Budget berhasil dihapus"
- Handle errors gracefully
- Close dialog after success

**Validation:** Can delete budgets safely

## Phase 6: Form Validation

### Task 6.1: Add Validation Rules
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Budget Owner: required selection
- Year: required, integer, current year or later
- Planned Amount: required, > 0, max 2 decimals
- Show inline validation errors
- Use Bahasa Indonesia error messages

**Validation:** Invalid inputs prevented

### Task 6.2: Implement Real-Time Validation
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Validate on blur
- Show error state styling (red borders)
- Clear errors when user edits
- Disable submit button if invalid

**Validation:** Validation is responsive

## Phase 7: Budget Display Enhancements

### Task 7.1: Calculate Spending Percentage
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Calculate `spentAmount / plannedAmount * 100`
- Handle division by zero
- Round to 1 decimal place
- Use for progress bar value

**Validation:** Percentages calculate correctly

### Task 7.2: Add Color-Coded Progress Bars
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- < 80%: green/primary color
- 80-99%: yellow/warning color  
- ≥ 100%: red/destructive color
- Use conditional className or variant
- Smooth transitions

**Validation:** Colors match spending levels

### Task 7.3: Add Budget Owner Name Display
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Display budget owner name (not just ID)
- Fetch budget owner data if not included in response
- Show in budget card subtitle
- Handle missing owner data gracefully

**Validation:** Owner names display correctly

### Task 7.4: Add Year Display
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Show budget year prominently
- Format as "Budget 2026"
- Add badge or label styling
- Group budgets by year (optional)

**Validation:** Year visible on each budget

## Phase 8: Filters & Sorting (Optional Enhancement)

### Task 8.1: Add Budget Owner Filter
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Add Select dropdown for budget owner
- "Semua" (All) option as default
- Pass filter to `useBudgets` hook
- Update query on selection change

**Validation:** Filter works correctly

### Task 8.2: Add Year Filter
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Add Select dropdown for year
- Show last 3 years + current + next 2
- Default to current year
- Pass filter to `useBudgets` hook

**Validation:** Year filter functional

### Task 8.3: Add Sort Options
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Sort by: Name, Planned Amount, Spent Amount, Percentage
- Ascending/Descending toggle
- Store sort preference in state
- Apply sorting to displayed budgets

**Validation:** Sorting works as expected

## Phase 9: UI Polish & Refinements

### Task 9.1: Improve Form Layout
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Use grid layout for fields
- Proper spacing and padding
- Responsive design (mobile-friendly)
- Accessible form controls

**Validation:** Form looks professional

### Task 9.2: Add Form Cancel/Reset
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Add "Batal" button
- Reset form to empty state
- Close form section
- Cancel editing mode
- Confirm if unsaved changes (optional)

**Validation:** Cancel works correctly

### Task 9.3: Improve Budget Card Design
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Better visual hierarchy
- Larger fonts for amounts
- Icons for spent/planned amounts
- Hover effects on action buttons
- Consistent spacing

**Validation:** Cards look polished

### Task 9.4: Add Empty State
**Files:**
- Modify: `apps/web/src/features/budget/components/BudgetPageContainer.tsx`

**Details:**
- Show message when no budgets exist
- "Belum ada budget" with icon
- Call-to-action button "Buat Budget Pertama"
- Friendly illustration or icon

**Validation:** Empty state helpful

## Unit Testing Principles

**Critical Guidelines:**
- ✅ **No production code until failing tests exist** - Write tests first (TDD approach)
- ✅ **Each spec requirement maps to ≥1 test** - Every requirement in specs/ must have corresponding test coverage
- ✅ **Never edit unrelated packages** - Only modify files within the budget feature boundary
- ✅ **Update spec when ambiguity is found** - If requirements are unclear during implementation, update spec.md first

**Test Coverage Requirements:**
- Hook tests: `useBudgets`, `useCreateBudget`, `useUpdateBudget`, `useDeleteBudget`
- Component tests: Form validation, data transformation, progress calculation
- Integration tests: API calls with MSW mocks, filter logic
- Each scenario in spec.md → at least one test case

**Test Location:**
- `apps/web/src/features/budget/hooks/__tests__/`
- `apps/web/src/features/budget/components/__tests__/`

**Spec-to-Test Mapping:**
- `specs/budget-data-entry/spec.md` → Hook creation tests
- `specs/budget-management/spec.md` → CRUD operation tests
- `specs/budget-visualization/spec.md` → Progress bar, filter, display tests

---

## Phase 10: Testing & Verification

### Task 10.1: Manual E2E Testing
**Steps:**
1. Open budget page
2. Verify budgets load from API (not mock data)
3. Create new budget with valid data
4. Verify budget appears in list
5. Edit existing budget
6. Verify changes reflected
7. Delete budget with confirmation
8. Test validation with invalid inputs
9. Test filters (if implemented)
10. Test sorting (if implemented)

**Validation:** All flows work end-to-end

### Task 10.2: Type Checking
**Command:** `cd apps/web && bun run type-check`

**Validation:** No TypeScript errors

### Task 10.3: Build Verification
**Command:** `cd apps/web && bun run build`

**Validation:** Build succeeds

### Task 10.4: Check Console Errors
**Steps:**
- Run dev server
- Perform all operations
- Check browser console

**Validation:** No errors or warnings

## Dependencies & Parallelization

**Can be done in parallel:**
- Phase 1: All hook tasks can be created simultaneously
- Phase 7: Display enhancements can overlap with Phase 6
- Phase 8: Filters can be implemented independently

**Must be sequential:**
- Phase 1 → Phase 2 (hooks needed for API integration)
- Phase 2 → Phase 3 (real data needed before create)
- Phase 3 → Phase 4 & 5 (create must work before edit/delete)
- Phase 9 requires Phases 3-5 completion
- Phase 10 requires all phases complete

**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 10

## Estimated Time

- Phase 1: 2 hours
- Phase 2: 1 hour
- Phase 3: 2 hours
- Phase 4: 1.5 hours
- Phase 5: 1 hour
- Phase 6: 1 hour
- Phase 7: 1.5 hours
- Phase 8: 2 hours (optional)
- Phase 9: 1.5 hours
- Phase 10: 1.5 hours

**Total:** 15 hours (~2 days) including optional filters/sorting
**Minimum:** 11 hours (~1.5 days) without optional features

## Success Criteria Checklist

- [ ] Budget hooks implemented and typed correctly
- [ ] Mock data replaced with real API calls
- [ ] Can create new budgets via form
- [ ] Can edit existing budgets
- [ ] Can delete budgets with confirmation
- [ ] Form validation prevents invalid data
- [ ] Loading states work correctly
- [ ] Error handling displays messages
- [ ] Success toasts appear
- [ ] Budget list refreshes automatically
- [ ] Progress bars show correct percentages
- [ ] Color-coding reflects budget status
- [ ] Filters work (if implemented)
- [ ] Type-check passes
- [ ] Build succeeds
- [ ] No console errors
- [ ] Follows architecture guidelines
