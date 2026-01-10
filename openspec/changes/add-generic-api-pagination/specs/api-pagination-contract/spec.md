# API Pagination Contract

**Capability ID**: `api-pagination-contract`
**Status**: Proposed
**Last Updated**: 2026-01-09

## Overview

This specification defines a generic, reusable pagination contract for all API GET list endpoints. It supports offset-based pagination with complete metadata, optional pagination for small datasets, and consistent response formatting across all modules.

## ADDED Requirements

### Requirement: Shared Pagination Types
**ID**: `REQ-PAG-001`
**Priority**: High
**Category**: Technical Contract

The system MUST provide generic pagination types in the shared domain package that can be used across all modules without external dependencies.

#### Scenario: Type definitions for pagination parameters
**Given** a module needs to implement pagination
**When** the module imports from `@repo/domain/types`
**Then** it MUST have access to:
- `PaginationParams` type with `page: number` and `limit: number` fields
- `PaginationMeta` type with `page`, `limit`, `total`, `totalPages`, `hasNext`, and `hasPrev` fields
- `PaginatedResponse<T>` generic type with `items: T[]` and `pagination: PaginationMeta`
**And** all types MUST be pure TypeScript with zero external dependencies
**And** all fields MUST be required (no optional fields)

#### Scenario: Type usage across layers
**Given** pagination types are defined in shared domain
**When** a repository, use case, or handler needs pagination
**Then** it MUST import from `@repo/domain/types`
**And** MUST NOT redefine pagination types locally
**And** type consistency MUST be maintained across all layers

---

### Requirement: Pagination Query Validation Schema
**ID**: `REQ-PAG-002`
**Priority**: High
**Category**: Validation Contract

The system MUST provide Zod schemas for validating pagination query parameters at the API boundary.

#### Scenario: Valid pagination query parameters
**Given** a client makes a GET request to a list endpoint
**When** the query includes `page=2&limit=50`
**Then** the validation schema MUST parse successfully
**And** MUST coerce string values to numbers
**And** MUST return `{ page: 2, limit: 50, paginate: true }`

#### Scenario: Default pagination values
**Given** a client makes a GET request without pagination params
**When** the query is validated
**Then** the schema MUST apply defaults:
- `page: 1`
- `limit: 20`
- `paginate: true`

#### Scenario: Invalid pagination parameters
**Given** a client provides invalid pagination params
**When** the query includes:
- `page=0` (below minimum)
- `page=-5` (negative)
- `limit=0` (below minimum)
- `limit=500` (above maximum)
**Then** validation MUST fail with a descriptive error
**And** response MUST be HTTP 400 Bad Request
**And** error message MUST indicate which param is invalid

#### Scenario: Opt-out of pagination
**Given** a client wants to retrieve all items without pagination
**When** the query includes `paginate=false`
**Then** validation MUST succeed
**And** MUST return `{ paginate: false }`
**And** `page` and `limit` MAY be ignored by the handler

#### Scenario: Maximum limit enforcement
**Given** a client requests a large page size
**When** the query includes `limit=150`
**Then** validation MUST fail
**And** error MUST indicate maximum allowed is 100
**And** response MUST suggest using multiple requests

---

### Requirement: Repository Pagination Contract
**ID**: `REQ-PAG-003`
**Priority**: High
**Category**: Data Access

All repository interfaces MUST support optional pagination parameters and return a consistent structure with items and total count.

#### Scenario: Paginated query execution
**Given** a repository method accepts pagination params `{ page: 2, limit: 10 }`
**When** the method is called with valid filters
**Then** it MUST calculate `skip = (page - 1) * limit` (skip: 10)
**And** MUST execute a query with `OFFSET 10 LIMIT 10`
**And** MUST execute a count query with the same filters
**And** MUST return `{ items: Entity[], total: number }`
**And** items array MUST contain at most 10 entities
**And** total MUST reflect the total count across all pages

#### Scenario: Unpaginated query execution
**Given** a repository method is called without pagination params
**When** the pagination parameter is `undefined` or `null`
**Then** it MUST fetch all matching items without limit
**And** MUST return `{ items: Entity[], total: Entity[].length }`
**And** total MUST equal the length of items array

#### Scenario: Parallel query execution for performance
**Given** a repository needs to return paginated results
**When** executing the paginated query
**Then** it MUST run the data query and count query in parallel using `Promise.all`
**And** MUST NOT execute them sequentially
**And** response time MUST be optimized for concurrent execution

#### Scenario: Empty result set
**Given** filters result in no matching records
**When** pagination params are `{ page: 1, limit: 20 }`
**Then** repository MUST return `{ items: [], total: 0 }`
**And** MUST NOT throw an error
**And** MUST execute successfully with HTTP 200

#### Scenario: Page beyond available range
**Given** total records is 45 and limit is 20
**When** page requested is 5 (only 3 pages exist)
**Then** repository MUST return `{ items: [], total: 45 }`
**And** MUST NOT throw an error
**And** handler MUST return valid pagination metadata showing `page: 5, totalPages: 3, hasNext: false`

---

### Requirement: Use Case Pagination Logic
**ID**: `REQ-PAG-004`
**Priority**: High
**Category**: Business Logic

Use cases MUST accept pagination query params, invoke repositories correctly, calculate pagination metadata, and return structured results.

#### Scenario: Calculate pagination metadata
**Given** repository returns `{ items: [...], total: 95 }` with `{ page: 2, limit: 20 }`
**When** use case processes the result
**Then** it MUST calculate:
- `totalPages = Math.ceil(95 / 20) = 5`
- `hasNext = (page 2 < 5) = true`
- `hasPrev = (page 2 > 1) = true`
**And** MUST return structured response with calculated metadata

#### Scenario: First page metadata
**Given** repository returns results for page 1
**When** use case calculates metadata
**Then** `hasPrev` MUST be `false`
**And** `hasNext` MUST be `true` if `totalPages > 1`

#### Scenario: Last page metadata
**Given** repository returns results for the last page (page = totalPages)
**When** use case calculates metadata
**Then** `hasNext` MUST be `false`
**And** `hasPrev` MUST be `true` if `page > 1`

#### Scenario: Single page result
**Given** total items is 15 and limit is 20
**When** use case processes page 1
**Then** `totalPages` MUST be 1
**And** `hasNext` MUST be `false`
**And** `hasPrev` MUST be `false`

#### Scenario: Opt-out unpaginated mode
**Given** query includes `paginate: false`
**When** use case executes
**Then** it MUST call repository without pagination params
**And** MUST return all items
**And** MUST include mock pagination metadata:
  - `page: 1`
  - `limit: items.length`
  - `total: items.length`
  - `totalPages: 1`
  - `hasNext: false`
  - `hasPrev: false`

---

### Requirement: API Response Format
**ID**: `REQ-PAG-005`
**Priority**: High
**Category**: API Contract

All list endpoint responses MUST follow a consistent format wrapping paginated results with metadata.

#### Scenario: Successful paginated response
**Given** a GET list endpoint receives a valid request
**When** the handler processes the query successfully
**Then** response MUST have structure:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2026-01-09T10:00:00.000Z"
  }
}
```
**And** HTTP status MUST be 200 OK
**And** `items` MUST be an array of DTOs
**And** all pagination fields MUST be present

#### Scenario: Empty paginated response
**Given** no items match the query filters
**When** the handler returns the result
**Then** response structure MUST be:
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2026-01-09T10:00:00.000Z"
  }
}
```
**And** HTTP status MUST be 200 OK

#### Scenario: Unpaginated response (opt-out)
**Given** client requests `paginate=false`
**When** dataset is small (e.g., categories)
**Then** response MUST still include pagination object with appropriate metadata
**And** `items` MUST contain all records
**And** pagination metadata MUST reflect unpaginated state

---

### Requirement: Module-Specific Implementation
**ID**: `REQ-PAG-006`
**Priority**: High
**Category**: Feature Parity

All modules with list endpoints MUST implement pagination consistently using the shared contract.

#### Scenario: Transaction module pagination
**Given** Transaction module has a GET `/transactions` endpoint
**When** a client requests with pagination params
**Then** it MUST support filters: `budgetOwnerId`, `categoryId`, `startDate`, `endDate`, `year`
**And** MUST return paginated `TransactionResponse[]` with metadata
**And** response format MUST match `ApiResponse<PaginatedResponse<TransactionResponse>>`

#### Scenario: Category module pagination
**Given** Category module has a GET `/categories` endpoint
**When** a client requests categories
**Then** it MUST support optional pagination with `paginate` flag
**And** MUST support filters: `status`, `search`
**And** MUST return paginated `CategoryResponse[]` when `paginate=true`
**And** MAY return all categories when `paginate=false` (opt-out)

#### Scenario: Budget module pagination
**Given** Budget module has a GET `/budgets` endpoint
**When** a client requests budgets
**Then** it MUST return paginated `BudgetResponse[]`
**And** MUST include complete pagination metadata

#### Scenario: BudgetOwner module pagination
**Given** BudgetOwner module has a GET `/budget-owners` endpoint
**When** a client requests budget owners
**Then** it MUST return paginated `BudgetOwnerResponse[]`
**And** MUST support filters: `status`
**And** MUST include complete pagination metadata

#### Scenario: User module pagination (if exposed)
**Given** User module has a GET `/users` endpoint (admin only)
**When** a client requests users
**Then** it MUST return paginated `UserResponse[]`
**And** MUST include complete pagination metadata
**And** MUST enforce role-based access control

---

### Requirement: Performance Standards
**ID**: `REQ-PAG-007`
**Priority**: Medium
**Category**: Non-Functional

Pagination MUST not degrade performance and SHOULD improve response times for large datasets.

#### Scenario: Large dataset query performance
**Given** a table contains 10,000+ records
**When** a client requests page 1 with limit 20
**Then** response time MUST be under 500ms
**And** database MUST use indexed columns for skip/take
**And** count query MUST use indexed columns

#### Scenario: Parallel query execution
**Given** a paginated request is made
**When** the repository executes queries
**Then** data query and count query MUST run in parallel
**And** total execution time MUST NOT exceed max(dataQuery, countQuery)

#### Scenario: Maximum page size limit enforcement
**Given** system defines max limit as 100
**When** any query exceeds this limit
**Then** validation MUST reject the request
**And** response MUST be HTTP 400
**And** error MUST suggest using smaller page size

---

### Requirement: Backward Compatibility
**ID**: `REQ-PAG-008`
**Priority**: High
**Category**: Migration

Changes MUST be rolled out in a way that minimizes breaking changes for existing API consumers.

#### Scenario: Existing Transaction API clients
**Given** Transaction API previously returned `{ success: true, data: Transaction[] }`
**When** pagination is implemented
**Then** response format changes to `{ success: true, data: { items: Transaction[], pagination: {...} } }`
**And** this is a BREAKING CHANGE
**And** clients MUST be notified with migration guide

#### Scenario: Modules without existing pagination
**Given** Category, Budget, BudgetOwner modules currently return plain arrays
**When** pagination is added
**Then** adding optional query params MUST NOT break existing calls
**But** response format change IS a breaking change
**And** deprecation notice MUST be provided

#### Scenario: Migration communication
**Given** breaking changes are introduced
**When** changes are deployed
**Then** API documentation MUST be updated
**And** changelog MUST document breaking changes
**And** migration examples MUST be provided
**And** frontend team MUST be notified before deployment

---

### Requirement: Error Handling
**ID**: `REQ-PAG-009`
**Priority**: Medium
**Category**: Error Handling

The system MUST handle pagination-related errors gracefully with appropriate HTTP status codes and error messages.

#### Scenario: Invalid page parameter type
**Given** client sends `page=abc` (non-numeric)
**When** validation occurs
**Then** Zod MUST coerce to number or fail
**And** if coercion fails, response MUST be HTTP 400
**And** error message MUST indicate invalid type for `page`

#### Scenario: Database query failure during pagination
**Given** a paginated request is made
**When** database connection fails during query
**Then** error MUST be caught at repository layer
**And** handler MUST return HTTP 500
**And** error response MUST follow `ApiError` format
**And** error details MUST NOT expose internal database errors to client

#### Scenario: Out of bounds page request
**Given** client requests page 100 with only 5 pages available
**When** the request is processed
**Then** it MUST NOT be treated as an error
**And** response MUST return empty items array
**And** pagination metadata MUST reflect actual state (page: 100, totalPages: 5)
**And** HTTP status MUST be 200 OK

---

## MODIFIED Requirements

None (this is a new capability).

---

## REMOVED Requirements

None (this is a new capability).

---

## Dependencies

### Internal Dependencies
- `@repo/domain/types` - pagination type definitions
- `@repo/schema/common` - Zod validation schemas
- All module repositories - must implement pagination contract
- All module use cases - must calculate pagination metadata
- All module handlers - must map to paginated response format

### External Dependencies
- Prisma ORM - for `skip`, `take`, and `count` operations
- Zod - for query parameter validation

---

## Constraints

1. **Maximum page size**: 100 items per page (enforced by validation)
2. **Minimum page number**: 1 (1-indexed, not 0-indexed)
3. **Pagination strategy**: Offset-based only (cursor-based not in scope)
4. **Clean Architecture compliance**: Domain layer MUST remain pure (no Zod, no HTTP)
5. **No cross-module dependencies**: Each module implements pagination independently

---

## Testing Requirements

### Unit Tests
- Pagination metadata calculation logic
- Edge cases: empty results, single page, last page, out-of-bounds
- Default value application
- Opt-out behavior (`paginate=false`)

### Integration Tests
- Repository pagination with real database
- Count query accuracy with filters
- Performance with 1000+ records
- Parallel query execution

### E2E Tests
- Full request/response cycle for each module
- Query param validation
- Response format compliance
- Error handling scenarios

---

## Non-Functional Requirements

### Performance
- Paginated queries MUST complete within 500ms for 10,000+ record tables
- Parallel query execution MUST be used (data + count)
- Database indexes MUST support pagination columns

### Scalability
- Design MUST support datasets up to 100,000 records per table
- Page size limit prevents abuse and memory issues

### Maintainability
- Shared types reduce duplication
- Generic pattern applies to all modules
- Clear separation of concerns per layer

### Security
- Max page size limit prevents DOS attacks
- Query validation prevents injection
- No sensitive data exposed in pagination metadata

---

## Future Considerations

### Cursor-Based Pagination
If real-time consistency or infinite scroll becomes critical, cursor-based pagination can be added alongside offset-based:
- Add `CursorPaginationParams` and `CursorPaginationMeta` types
- Add separate query param schema
- Let client choose strategy via query param
- No breaking changes to existing offset-based implementation

### Sort/Order Integration
Pagination naturally pairs with sorting:
- Add `sortBy` and `sortOrder` query params
- Pass to repository for `ORDER BY` clause
- Can be added without breaking pagination contract

### Total Count Optimization
For very large datasets, counting all records can be expensive:
- Consider approximate count strategies
- Add flag to skip total count if not needed
- Implement count caching for frequent queries

---

## Acceptance Criteria Summary

✅ All list endpoints return consistent paginated response format  
✅ Pagination query params validated via Zod schemas  
✅ Repository interfaces support optional pagination  
✅ Use cases calculate complete pagination metadata  
✅ API handlers map to `ApiResponse<PaginatedResponse<T>>`  
✅ Performance meets standards (<500ms for large datasets)  
✅ Zero regression in existing tests  
✅ Documentation updated with examples  
✅ Migration guide provided for breaking changes  
✅ All modules (Transaction, Category, Budget, BudgetOwner, User) implement consistently
