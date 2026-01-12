# Implementation Tasks: Remove Web Repositories Layer

## Phase 1: Category Feature Refactoring (Highest Priority)

### Task 1.1: Refactor Category Hooks ✅
**Description**: Simplify `useCategories.ts` to call `apiRequest` directly without repository/use case layers  
**Files**:
- Modify: `apps/web/src/features/category/hooks/useCategories.ts` ✅
**Details**:
- Add inline mapping function `mapCategoryResponse(dto: CategoryResponse): Category` ✅
- Remove repository and use case imports ✅
- Refactor `useCategories()` to call `apiRequest` directly ✅
- Refactor `useCreateCategory()` to call `apiRequest` directly ✅
- Refactor `useUpdateCategory()` to call `apiRequest` directly ✅
- Refactor `useDeleteCategory()` to call `apiRequest` directly ✅
- Maintain same return types and query keys for compatibility ✅
**Validation**: Component tests still pass, no regression in category management UI ✅

### Task 1.2: Delete Category Repository Layer ✅
**Description**: Remove repository interface and implementation  
**Files**:
- Delete: `apps/web/src/features/category/domain/repositories/category-repository.ts` ✅
- Delete: `apps/web/src/features/category/infrastructure/repositories/api-category.repository.ts` ✅
- Delete directory: `apps/web/src/features/category/infrastructure/repositories/` ✅
**Validation**: No imports reference deleted files (check with grep) ✅

### Task 1.3: Delete Category Application Layer ✅
**Description**: Remove use case files (no longer needed)  
**Files**:
- Delete: `apps/web/src/features/category/application/use-cases/get-categories.use-case.ts` ✅
- Delete: `apps/web/src/features/category/application/use-cases/create-category.use-case.ts` ✅
- Delete: `apps/web/src/features/category/application/use-cases/update-category.use-case.ts` ✅
- Delete: `apps/web/src/features/category/application/use-cases/delete-category.use-case.ts` ✅
- Delete directory: `apps/web/src/features/category/application/use-cases/` ✅
- Delete directory: `apps/web/src/features/category/application/` (if empty) ✅
**Validation**: No imports reference deleted files ✅

### Task 1.4: Verify Category Feature Works
**Description**: Test category management UI end-to-end  
**Steps**:
- Run dev server
- Open category master page
- Test: List categories
- Test: Create new category
- Test: Edit category
- Test: Delete category
- Test: Filter by status
**Validation**: All CRUD operations work correctly, no console errors

## Phase 2: Auth Feature Refactoring

### Task 2.1: Refactor Auth Hooks ✅
**Description**: Simplify `use-auth.ts` to call `apiRequest` directly  
**Files**:
- Modify: `apps/web/src/features/auth/hooks/use-auth.ts` ✅
**Details**:
- Add inline mapping if needed ✅
- Remove repository and use case imports ✅
- Refactor `useLogin()` to call `apiRequest` directly ✅
- Refactor `useLogout()` to call `apiRequest` directly ✅
- Refactor `useCurrentUser()` to call `apiRequest` directly (if exists) N/A
**Validation**: Login/logout functionality works correctly

### Task 2.2: Delete Auth Repository Layer ✅
**Description**: Remove repository interface and implementation  
**Files**:
- Delete: `apps/web/src/features/auth/domain/repositories/auth-repository.ts` ✅
- Delete: `apps/web/src/features/auth/infrastructure/http-auth.repository.ts` ✅
**Validation**: No imports reference deleted files ✅

### Task 2.3: Delete Auth Application Layer ✅
**Description**: Remove use case files  
**Files**:
- Delete: `apps/web/src/features/auth/application/use-cases/login.use-case.ts` ✅
- Delete: `apps/web/src/features/auth/application/use-cases/logout.use-case.ts` ✅
- Delete: `apps/web/src/features/auth/application/use-cases.ts` (if exists) ✅
- Delete directory: `apps/web/src/features/auth/application/use-cases/` ✅
- Delete directory: `apps/web/src/features/auth/application/` (if empty) ✅
**Validation**: No imports reference deleted files ✅

### Task 2.4: Verify Auth Feature Works
**Description**: Test authentication flow end-to-end  
**Steps**:
- Test: Login with valid credentials
- Test: Login with invalid credentials
- Test: Logout
- Test: Protected route access
**Validation**: All auth operations work correctly

## Phase 3: Clean Up Domain Layer

### Task 3.1: Review Domain Repositories Directory ✅
**Description**: Check if other features have repository interfaces  
**Command**: `find apps/web/src/features/*/domain/repositories -type f` ✅  
**Action**: Delete any remaining repository interface files if found ✅  
**Validation**: No repository interfaces remain in web domain layer ✅

### Task 3.2: Review Infrastructure Layer ✅
**Description**: Check if infrastructure layer still needed  
**Command**: `find apps/web/src/features/*/infrastructure -type f` ✅  
**Action**: 
- If only repositories exist, delete entire infrastructure directory per feature ✅
- If other implementations exist (external service adapters), keep directory but document purpose N/A
**Validation**: Infrastructure layer is either removed or clearly documented ✅

## Phase 4: Documentation Updates

### Task 4.1: Update Architecture Quick Reference
**Description**: Remove references to web repository pattern  
**Files**:
- Modify: `docs/ARCHITECTURE-QUICK-REFERENCE.md`
**Details**:
- Remove mentions of repository pattern for web
- Update web data fetching section to show direct `apiRequest` usage
- Add examples of simplified hook pattern
**Validation**: Documentation accurately reflects new architecture

### Task 4.2: Update Application Documentation
**Description**: Update architecture diagrams and explanations  
**Files**:
- Modify: `docs/APPLICATION-DOCUMENTATION.md`
**Details**:
- Remove web repository layer from architecture diagrams
- Update data flow diagrams to show: Component → Hook → API Client → HTTP
- Clarify distinction between backend repositories (valid) and web (removed)
**Validation**: Documentation is clear and accurate

### Task 4.3: Update Web Instructions ✅
**Description**: Enhance web architecture instructions  
**Files**:
- Modify: `.github/instructions/03-web-nextjs.md.instructions.md` ✅
**Details**:
- Add explicit anti-pattern warning against repository pattern in web ✅
- Add code examples of correct hook implementation ✅
- Emphasize TanStack Query as the state management layer ✅
**Validation**: Instructions clearly guide against reintroducing repositories ✅

### Task 4.4: Update README Examples
**Description**: Update any code examples in README  
**Files**:
- Modify: `apps/web/README.md` (if exists)
- Modify: `README.md` (root)
**Details**:
- Replace any repository pattern examples with simplified hooks
- Ensure consistency with updated architecture
**Validation**: All examples follow new pattern

## Phase 5: Verification & Testing

### Task 5.1: Run Type Checking ✅
**Command**: `bun run type-check` (from root or `cd apps/web && bun run type-check`) ✅  
**Validation**: No TypeScript errors ✅

### Task 5.2: Run Linting
**Command**: `bun run lint` (from root or `cd apps/web && bun run lint`)  
**Validation**: No linting errors

### Task 5.3: Run Tests
**Command**: `bun run test` (if tests exist)  
**Validation**: All tests pass

### Task 5.4: Manual E2E Testing
**Description**: Full application walkthrough  
**Steps**:
1. Start dev server: `bun run dev:web`
2. Test login flow
3. Test category management (CRUD)
4. Test transaction list with category filter
5. Test logout
6. Verify no console errors
7. Verify network requests are correct
**Validation**: Application works correctly with no regressions

### Task 5.5: Search for Remaining References ✅
**Commands**:
```bash
# Check for repository imports
rg "Repository" apps/web/src/features --type ts ✅

# Check for use case imports in hooks
rg "UseCase" apps/web/src/features/*/hooks --type ts ✅

# Check for infrastructure/repositories directories
find apps/web/src/features -name "repositories" -type d ✅
```
**Validation**: No unwanted references remain ✅

## Phase 6: Final Cleanup

### Task 6.1: Remove Empty Directories
**Description**: Delete empty application/infrastructure directories  
**Command**: `find apps/web/src/features -type d -empty -delete`  
**Validation**: Clean directory structure

### Task 6.2: Update .gitignore (if needed)
**Description**: Check if any build artifacts need ignore patterns  
**Files**: `apps/web/.gitignore`  
**Validation**: No build artifacts tracked

### Task 6.3: Create Migration Guide
**Description**: Document changes for team members  
**Files**:
- Create: `docs/MIGRATION-REMOVE-WEB-REPOS.md` (optional)
**Details**:
- Explain what changed and why
- Provide before/after examples
- Guide for writing new features
**Validation**: Clear guide for team

## Dependencies & Parallelization

**Can be done in parallel:**
- Phase 1 (Category) and Phase 2 (Auth) are independent
- Phase 4 (Documentation) can start after Phase 1 or 2 completes

**Must be sequential:**
- Phase 3 requires Phase 1 & 2 completion
- Phase 5 requires Phase 1, 2, 3 completion
- Phase 6 requires Phase 5 completion

**Critical Path**: Phase 1 → Phase 3 → Phase 5 → Phase 6

## Rollback Plan

If issues discovered after implementation:
1. Revert commits in reverse order (documentation → code)
2. Git tags should mark: `pre-remove-repos` and `post-remove-repos`
3. Each phase should be a separate commit for granular rollback

## Estimated Time

- Phase 1: 2-3 hours
- Phase 2: 1-2 hours  
- Phase 3: 30 minutes
- Phase 4: 2-3 hours
- Phase 5: 1-2 hours
- Phase 6: 30 minutes

**Total**: 7-11 hours (1-2 days)
