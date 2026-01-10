# Implementation Tasks

## Phase 1: Foundation (Shared Types & Schemas) ✅

- [x] **Task 1.1**: Update `packages/domain/src/types/pagination.ts`
  - [x] Ensure `PaginationMeta` includes all required fields (page, limit, total, totalPages, hasNext, hasPrev)
  - [x] Ensure `PaginatedResponse<T>` wraps items with pagination metadata
  - [x] Add JSDoc comments for clarity
  - [x] Verify type exports in `packages/domain/src/types/index.ts`
  - [x] Added `PaginationParams` type for repository contract
  - [x] Added `calculatePaginationMeta()` helper function
  - **Acceptance**: ✅ Types compile, exports visible to all packages

- [x] **Task 1.2**: Update `packages/schema/src/common/index.ts`
  - [x] Enhance `PaginationQuerySchema` to support optional `paginate` flag (default: true)
  - [x] Add validation for page (min: 1) and limit (min: 1, max: 100, default: 20)
  - [x] Export typed `PaginationQuery` from inferred schema
  - [x] Add JSDoc examples
  - **Acceptance**: ✅ Schema validates correctly with test cases

## Phase 2: Repository Layer Updates ✅

- [x] **Task 2.1**: Update Transaction repository
  - [x] Update `domain/repositories/transaction-repository.interface.ts` to return `{ items: T[], total: number }` for all list methods
  - [x] Update `infrastructure/repositories/prisma-transaction.repository.ts` implementations
  - [x] Ensure all `findBy*` methods support pagination params `{ page, limit }`
  - [x] Add proper `skip` and `take` calculations with parallel count queries
  - **Acceptance**: ✅ Repository updated with pagination support

- [x] **Task 2.2**: Update Category repository
  - [x] Add pagination params to `findAll(filters?, pagination?)` in domain interface
  - [x] Update Prisma implementation to support pagination
  - [x] Return `{ items: Category[], total: number }`
  - **Acceptance**: ✅ Category list supports optional pagination

- [x] **Task 2.3**: Update Budget repository
  - [x] Add pagination params to `findAll(pagination?)` in domain interface
  - [x] Update Prisma implementation to support pagination
  - [x] Return `{ items: Budget[], total: number }`
  - **Acceptance**: ✅ Budget list supports optional pagination

- [x] **Task 2.4**: Update BudgetOwner repository
  - [x] Add pagination params to `findAll(filters?, pagination?)` in domain interface
  - [x] Update Prisma implementation to support pagination
  - [x] Return `{ items: BudgetOwner[], total: number }`
  - **Acceptance**: ✅ BudgetOwner list supports optional pagination

- [x] **Task 2.5**: Verify User repository (already has pagination)
  - [x] Confirm `findAll(page, limit)` signature matches new contract
  - [x] Update to return `{ items: User[], total: number }` if needed
  - **Acceptance**: ✅ User repository contract is consistent (not modified - no exposed API endpoint)

## Phase 3: Application Layer Updates (Use Cases) ✅

- [x] **Task 3.1**: Update GetTransactionsUseCase
  - [x] Accept pagination params from query (with defaults)
  - [x] Pass pagination to repository calls
  - [x] Calculate pagination metadata using `calculatePaginationMeta()` helper
  - [x] Return structured `{ items: T[], pagination: PaginationMeta }`
  - **Acceptance**: ✅ Use case returns complete pagination metadata

- [x] **Task 3.2**: Update ListCategoriesUseCase
  - [x] Accept optional pagination params (default: paginate=true, limit=20)
  - [x] Support `paginate=false` to return all items (for small reference data)
  - [x] Return `{ items: Category[], pagination: PaginationMeta }` when paginated
  - **Acceptance**: ✅ Supports both paginated and unpaginated modes

- [x] **Task 3.3**: Update GetBudgetsUseCase
  - [x] Add pagination support similar to categories
  - [x] Return structured response with pagination metadata
  - **Acceptance**: ✅ Budget list returns pagination metadata

- [x] **Task 3.4**: Update ListBudgetOwnersUseCase
  - [x] Add pagination support
  - [x] Return structured response with pagination metadata
  - **Acceptance**: ✅ BudgetOwner list returns pagination metadata

## Phase 4: Delivery Layer Updates (API Handlers) ✅

- [x] **Task 4.1**: Update Transaction handlers
  - [x] Parse `PaginationQuerySchema` from query params
  - [x] Pass to use case
  - [x] Map response to `ApiResponse<PaginatedResponse<TransactionResponse>>`
  - [x] Update route schema validation
  - **Acceptance**: ✅ API returns paginated response with metadata

- [x] **Task 4.2**: Update Category handlers
  - [x] Parse optional pagination query params
  - [x] Support `paginate=false` query param
  - [x] Map response accordingly (paginated or full list)
  - [x] Update route schema validation
  - **Acceptance**: ✅ API supports optional pagination

- [x] **Task 4.3**: Update Budget handlers
  - [x] Add pagination query param parsing
  - [x] Map to paginated response format
  - [x] Update route schema validation
  - **Acceptance**: ✅ API returns paginated response

- [x] **Task 4.4**: Update BudgetOwner handlers
  - [x] Add pagination query param parsing
  - [x] Map to paginated response format
  - [x] Update route schema validation
  - **Acceptance**: ✅ API returns paginated response

- [x] **Task 4.5**: Update User handlers (if exposed via API)
  - [x] Ensure consistent pagination query params
  - [x] Map to standardized response format
  - **Acceptance**: ✅ User API not exposed via public endpoints (no changes needed)

## Phase 5: Testing & Validation

- [ ] **Task 5.1**: Add unit tests for pagination helpers
  - [ ] Test pagination metadata calculation (totalPages, hasNext, hasPrev)
  - [ ] Test edge cases (empty results, single page, last page)
  - **Acceptance**: 100% coverage on pagination utilities

- [ ] **Task 5.2**: Update repository tests
  - [ ] Add tests for paginated queries
  - [ ] Test limit/offset calculations
  - [ ] Test total count accuracy
  - **Acceptance**: All repository tests pass

- [ ] **Task 5.3**: Update use case tests
  - [ ] Mock paginated repository responses
  - [ ] Assert pagination metadata correctness
  - [ ] Test default values and edge cases
  - **Acceptance**: All use case tests pass

- [ ] **Task 5.4**: Update API handler tests
  - [ ] Test query param parsing
  - [ ] Test response format compliance
  - [ ] Test with/without pagination
  - **Acceptance**: All handler tests pass

- [ ] **Task 5.5**: Integration tests
  - [ ] Test full request/response cycle for each module
  - [ ] Test with large datasets (100+ records)
  - [ ] Verify performance improvements
  - **Acceptance**: E2E tests pass, no performance regression

## Phase 6: Documentation & Cleanup

- [ ] **Task 6.1**: Update API documentation
  - [ ] Document pagination query parameters
  - [ ] Document response format with examples
  - [ ] Add examples for each module
  - [ ] Document opt-out behavior (`paginate=false`)
  - **Acceptance**: Clear documentation available

- [ ] **Task 6.2**: Update architecture diagrams (if applicable)
  - [ ] Reflect pagination flow in sequence diagrams
  - **Acceptance**: Diagrams updated

- [ ] **Task 6.3**: Migration guide for frontend
  - [ ] Document breaking changes in response format
  - [ ] Provide migration examples for Web features
  - [ ] Update TanStack Query hooks to handle pagination
  - **Acceptance**: Frontend team can migrate smoothly

- [ ] **Task 6.4**: Code review & refinements
  - [ ] Review all changes for consistency
  - [ ] Ensure Clean Architecture boundaries respected
  - [ ] Verify no cross-module dependencies
  - **Acceptance**: PR approved and merged

## Dependencies & Parallelization

- **Can be done in parallel**:
  - Task 1.1 and 1.2 (shared packages)
  - Tasks 2.1-2.5 (repository updates per module)
  - Tasks 3.1-3.4 (use case updates per module)
  
- **Must be sequential**:
  - Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
  - Within Phase 4, each handler depends on corresponding use case from Phase 3

## Estimated Time per Phase

- Phase 1: 30 minutes
- Phase 2: 1.5 hours
- Phase 3: 1 hour
- Phase 4: 1 hour
- Phase 5: 1.5 hours
- Phase 6: 45 minutes

**Total**: ~6.25 hours
