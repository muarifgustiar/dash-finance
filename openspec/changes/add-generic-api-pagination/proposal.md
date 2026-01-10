# Proposal: Add Generic API Pagination

## Problem Statement

Currently, the API has inconsistent pagination implementation across modules:

1. **Transaction module** has partial pagination support with `page` and `limit` parameters, but returns incomplete metadata (missing `hasNext`, `hasPrev`, `totalPages`)
2. **User module** repository has pagination signature `findAll(page, limit)` returning `{ items, total }` but the API handler doesn't expose this
3. **Category, Budget, and BudgetOwner modules** have NO pagination - `findAll()` returns all records, which will cause performance issues as data grows
4. **Inconsistent contracts**: Some use offset-based (`page`/`limit`), some return nothing, making frontend implementation confusing

The lack of a standardized pagination contract leads to:
- Performance issues when datasets grow (fetching thousands of records)
- Poor UX without proper loading states or "load more" capability
- Duplicated pagination logic across modules
- Frontend struggles with inconsistent response formats

## Proposed Solution

Implement a **generic, flexible pagination contract** that supports:

1. **Offset-based pagination** (cursor/page + limit) as the primary method
2. **Consistent metadata** in all list responses including:
   - Current page/cursor information
   - Total count
   - Has next/previous flags
   - Total pages (for offset-based)
3. **Opt-in pagination**: Allow unpaginated responses where appropriate (e.g., small reference data like categories)
4. **Generic types** that can be reused across all modules

The solution will be layered:
- **@repo/domain**: Generic pagination types (`PaginationMeta`, `PaginatedResponse`)
- **@repo/schema**: Zod schemas for query validation (`PaginationQuerySchema`)
- **Module repositories**: Accept optional pagination params, return paginated data structure
- **Module use cases**: Pass pagination through, return structured results
- **API handlers**: Map to standard `ApiResponse<PaginatedResponse<T>>` format

## Goals

1. Establish a single, generic pagination contract usable by all GET list endpoints
2. Support offset-based pagination (`page` + `limit`) as default strategy
3. Provide complete pagination metadata (total, hasNext, hasPrev, totalPages)
4. Allow opt-in/opt-out: modules can choose to paginate or not based on data size
5. Maintain backward compatibility where pagination already exists (Transaction)
6. Apply to all modules: Transaction, Category, Budget, BudgetOwner, User

## Non-Goals

- Cursor-based pagination (can be added later if needed)
- Sorting/ordering (handled separately)
- Advanced filtering strategies (separate concern)
- Client-side pagination helpers (Web/Mobile implementation is separate)

## Impact Assessment

### Breaking Changes
- **Transaction API**: Response structure changes from `data: T[]` to `data: { items: T[], pagination: {...} }`
- **Category/Budget/BudgetOwner APIs**: Adding optional query parameters won't break existing calls, but response format changes

### Migration Strategy
1. Update `@repo/domain` types first (non-breaking, internal)
2. Update `@repo/schema` with optional pagination schemas
3. Update module repositories to accept pagination params
4. Update use cases to return paginated results
5. Update API handlers to return new format
6. Update Web frontend to consume new pagination contract
7. Document changes for API consumers

### Affected Components
- `packages/domain/src/types/pagination.ts` - Update types
- `packages/schema/src/common/index.ts` - Update Zod schemas
- All module repositories (domain interfaces + infrastructure implementations)
- All module use cases with list operations
- All API handlers for GET list endpoints
- Web features consuming list APIs

## Success Criteria

1. All list endpoints return consistent paginated response format
2. Pagination metadata is complete and accurate
3. Query parameters validated via Zod schemas
4. Performance improved for large datasets (tested with 1000+ records)
5. Zero regression in existing tests
6. Documentation updated with pagination examples

## Alternatives Considered

### Alternative 1: Cursor-based only
- **Pros**: Better for real-time data, infinite scroll
- **Cons**: More complex implementation, harder to jump to specific page
- **Decision**: Rejected - offset-based is simpler and sufficient for current needs

### Alternative 2: Implement per-module (no shared contract)
- **Pros**: Maximum flexibility per module
- **Cons**: Inconsistent API, duplicated logic, poor DX
- **Decision**: Rejected - standardization is a core goal

### Alternative 3: Keep simple total count only
- **Pros**: Minimal changes, simpler
- **Cons**: Frontend can't show "has more" or calculate pages
- **Decision**: Rejected - incomplete metadata reduces UX quality

## Timeline Estimate

- **Specification**: 1 hour
- **Implementation**: 4-6 hours
  - Shared types/schemas: 30 minutes
  - Repository updates: 1.5 hours
  - Use case updates: 1 hour
  - Handler updates: 1 hour
  - Testing: 1-2 hours
- **Documentation**: 30 minutes

**Total**: ~6-8 hours

## Open Questions

1. Should pagination be optional or required for all list endpoints?
   - **Recommendation**: Optional - allow small reference data to skip pagination
2. Default page size? 
   - **Recommendation**: 20 items (current Transaction default)
3. Maximum page size limit?
   - **Recommendation**: 100 items (prevent abuse)
4. Should we support disabling pagination for specific queries?
   - **Recommendation**: Yes - add `paginate=false` query param for opt-out

## References

- Current implementation: [Transaction use case](apps/api/src/modules/transaction/application/use-cases/get-transactions.use-case.ts)
- Existing types: [packages/domain/src/types/pagination.ts](packages/domain/src/types/pagination.ts)
- Schema: [packages/schema/src/common/index.ts](packages/schema/src/common/index.ts)
