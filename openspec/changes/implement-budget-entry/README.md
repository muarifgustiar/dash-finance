# README: Implement Budget Entry

## Change ID
`implement-budget-entry`

## Status
🟡 **PROPOSED** - Awaiting review and approval

## Quick Summary
Replace mock budget data with real API integration and implement full CRUD functionality for budget management. Currently, the budget page displays hardcoded data and form only logs to console.

## Problem
Budget feature is incomplete:
- Budget page displays hardcoded array of 3 mock budgets
- Form submission only does `console.log()`
- No hooks to fetch real data from API
- No create/update/delete functionality
- Backend API is ready but frontend doesn't use it
- Users cannot manage their actual budgets

## Solution
Implement complete budget data integration:
- Create `useBudgets`, `useCreateBudget`, `useUpdateBudget`, `useDeleteBudget` hooks
- Replace mock data with real API calls
- Implement form validation and submission
- Add edit and delete UI with confirmations
- Calculate and display spending progress with color-coded bars
- Add filters by budget owner and year
- Display budget owner names and years clearly

## Impact
- **Budget feature**: Add 4 new hook files, completely refactor BudgetPageContainer
- **User capability**: Users can now create, view, edit, and delete real budgets
- **Data accuracy**: Real spending data from backend, not hardcoded values
- **Data flow**: Component → Hook (TanStack Query) → API Client → Backend
- **Visual improvements**: Progress bars, filters, better card design

## Why
Users need to create annual budgets and track spending against those budgets. The current mock implementation provides no real value and blocks budget management - a core feature of the finance dashboard.

## Files
- [proposal.md](proposal.md) - Full problem statement and solution
- [tasks.md](tasks.md) - 60+ ordered implementation tasks in 10 phases
- `specs/budget-data-entry/` - Requirements for creation and validation
- `specs/budget-management/` - Requirements for edit/delete functionality
- `specs/budget-visualization/` - Requirements for replacing mock data and display enhancements

## Next Steps
1. Review proposal and three spec capabilities
2. Get approval from team
3. Execute tasks phase by phase:
   - Phase 1: Create hooks (2h)
   - Phase 2: Replace mock data (1h)
   - Phase 3: Implement create (2h)
   - Phase 4-5: Add edit/delete (2.5h)
   - Phase 6-7: Validation & visualization (2.5h)
   - Phase 8-9: Filters & polish (3.5h)
   - Phase 10: Testing (1.5h)
4. Validate with manual E2E testing
5. Run `bun run build` to verify production build

## Estimated Timeline
- **Minimum**: 11 hours (~1.5 days) without filters/sorting
- **Complete**: 15 hours (~2 days) with all enhancements

## Questions?
See [proposal.md](proposal.md) for detailed context and [tasks.md](tasks.md) for step-by-step implementation guide.

