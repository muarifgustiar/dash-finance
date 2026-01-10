# Spec Delta: Transaction Category Filter

**Capability**: `transaction-category-filter`  
**Change Type**: MODIFIED  
**Status**: DRAFT  
**Related Capabilities**: `category-management` (depends on)  

---

## MODIFIED Requirements

### Requirement: TCF-001 - Single Category Filter
**Priority**: HIGH  
**Type**: Functional  
**Modifies**: Existing transaction query endpoint  

The system SHALL enhance the GET `/transactions` endpoint to support filtering by a single category ID.

#### Scenario: Filter transactions by category
**Given** transactions exist with different categories  
**And** category "Food" has id "cat-123"  
**And** transactions T1 and T2 have categoryId "cat-123"  
**And** transaction T3 has a different categoryId  
**When** a user requests GET `/transactions?categoryId=cat-123`  
**Then** the system returns only transactions T1 and T2  
**And** transaction T3 is excluded from results  
**And** the response format matches existing transaction list format  

#### Scenario: Category filter with no results
**Given** no transactions exist for category "cat-999"  
**When** a user requests GET `/transactions?categoryId=cat-999`  
**Then** the system returns an empty array  
**And** the response status code is 200  
**And** the pagination meta indicates zero total items  

#### Scenario: Invalid category UUID format
**Given** an invalid UUID "not-a-uuid"  
**When** a user requests GET `/transactions?categoryId=not-a-uuid`  
**Then** the system returns status code 400  
**And** the error indicates invalid UUID format  

---

## ADDED Requirements

### Requirement: TCF-002 - Multiple Category Filter
**Priority**: HIGH  
**Type**: Functional  

The system SHALL support filtering transactions by multiple category IDs simultaneously with OR logic.

#### Scenario: Filter by multiple categories
**Given** transactions exist with categories "Food" (cat-1), "Transport" (cat-2), "Entertainment" (cat-3)  
**And** transactions T1 has cat-1, T2 has cat-2, T3 has cat-3, T4 has cat-1  
**When** a user requests GET `/transactions?categoryIds=cat-1,cat-2` (array format)  
**Then** the system returns transactions T1, T2, T4  
**And** transaction T3 (cat-3) is excluded  
**And** results are ordered by date descending (default)  

#### Scenario: Filter by multiple categories (array parameter)
**Given** multiple categories exist  
**When** a user requests GET `/transactions?categoryIds[]=cat-1&categoryIds[]=cat-2`  
**Then** the system interprets as array and returns transactions matching any of the categories  

#### Scenario: Empty category array
**Given** an empty array is provided  
**When** a user requests GET `/transactions?categoryIds=` (empty)  
**Then** the system ignores the filter  
**And** returns all transactions (respecting other filters)  

#### Scenario: Single category in array
**Given** only one category ID in array  
**When** a user requests GET `/transactions?categoryIds=cat-1`  
**Then** the system returns transactions with categoryId "cat-1"  
**And** behavior is identical to single categoryId filter  

---

### Requirement: TCF-003 - Category Filter Validation
**Priority**: HIGH  
**Type**: Functional  

The system SHALL validate category filter parameters to ensure data integrity and prevent ambiguous queries.

#### Scenario: Prevent both single and array filters
**Given** a request with both categoryId and categoryIds  
**When** a user requests GET `/transactions?categoryId=cat-1&categoryIds=cat-2,cat-3`  
**Then** the system returns status code 400  
**And** the error message is "Cannot provide both categoryId and categoryIds"  
**And** no query is executed  

#### Scenario: Validate all UUIDs in array
**Given** an array with mixed valid and invalid UUIDs  
**When** a user requests GET `/transactions?categoryIds=valid-uuid,invalid,another-valid-uuid`  
**Then** the system returns status code 400  
**And** the error indicates which UUIDs are invalid  
**And** no query is executed  

#### Scenario: Limit array size
**Given** a request with more than 50 category IDs  
**When** the request is processed  
**Then** the system returns status code 400  
**And** the error indicates maximum array size exceeded  
**And** suggests using broader filters instead  

---

### Requirement: TCF-004 - Filter Combination
**Priority**: HIGH  
**Type**: Functional  

The system SHALL support combining category filter with existing transaction filters using AND logic.

#### Scenario: Category + Date Range
**Given** transactions exist with various categories and dates  
**When** a user requests GET `/transactions?categoryId=cat-1&startDate=2026-01-01&endDate=2026-01-31`  
**Then** the system returns transactions where categoryId="cat-1" AND date between 2026-01-01 and 2026-01-31  
**And** transactions outside date range are excluded even if they match category  

#### Scenario: Category + Budget Owner
**Given** transactions exist for multiple budget owners and categories  
**When** a user requests GET `/transactions?categoryId=cat-1&budgetOwnerId=owner-123`  
**Then** the system returns transactions where categoryId="cat-1" AND budgetOwnerId="owner-123"  
**And** all filter conditions are combined with AND logic  

#### Scenario: Category + Multiple Filters
**Given** various transactions exist  
**When** a user requests GET `/transactions?categoryIds=cat-1,cat-2&budgetOwnerId=owner-1&year=2026`  
**Then** the system returns transactions where:
- categoryId IN (cat-1, cat-2) AND
- budgetOwnerId = owner-1 AND  
- year = 2026  
**And** all conditions must be satisfied  

#### Scenario: Category + Pagination
**Given** 50 transactions match category filter  
**When** a user requests GET `/transactions?categoryId=cat-1&page=2&limit=20`  
**Then** the system returns items 21-40 of the filtered results  
**And** pagination meta includes correct total count of filtered results  
**And** pagination works identically to non-filtered queries  

---

### Requirement: TCF-005 - Query Performance Optimization
**Priority**: MEDIUM  
**Type**: Non-Functional  

The system SHALL optimize category filter queries for performance with large datasets.

#### Scenario: Database index usage
**Given** transactions table has index on categoryId column  
**When** a category filter query is executed  
**Then** the database query plan uses the categoryId index  
**And** query execution time is under 200ms for up to 100K transactions  

#### Scenario: IN clause optimization
**Given** a filter with multiple category IDs  
**When** the query is executed  
**Then** the system uses SQL IN clause efficiently  
**And** the query is optimized to prevent N+1 queries  
**And** only one database round-trip occurs  

#### Scenario: Combined filter optimization
**Given** multiple filters are applied (category + date + owner)  
**When** the query is executed  
**Then** the database uses composite index when available  
**And** filters are applied in optimal order (most selective first)  

---

### Requirement: TCF-006 - API Response Consistency
**Priority**: HIGH  
**Type**: Technical  

The system SHALL maintain consistent response format for filtered and non-filtered transaction queries.

#### Scenario: Response structure unchanged
**Given** any transaction query with category filter  
**When** the API returns results  
**Then** the response structure is identical to non-filtered queries  
**And** each transaction includes all standard fields:
```json
{
  "id": "uuid",
  "budgetOwnerId": "uuid",
  "categoryId": "uuid",
  "date": "ISO-8601",
  "amount": number,
  "description": "string",
  "receiptUrl": "string | null",
  "createdBy": "uuid",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

#### Scenario: Pagination meta with filters
**Given** a filtered query with pagination  
**When** the response is returned  
**Then** the pagination meta reflects filtered results:
```json
{
  "page": 1,
  "limit": 20,
  "total": 50,        // Total filtered results
  "totalPages": 3     // Total pages for filtered results
}
```

#### Scenario: Empty result consistency
**Given** a filter with no matching transactions  
**When** the API returns the response  
**Then** the response follows the same format with empty data array  
**And** pagination meta shows total: 0  

---

### Requirement: TCF-007 - Repository Layer Enhancement
**Priority**: HIGH  
**Type**: Technical  

The system SHALL enhance the transaction repository to support category filtering at the data access layer.

#### Scenario: Repository interface extension
**Given** the TransactionRepository interface  
**When** category filter is implemented  
**Then** the interface includes:
```typescript
interface TransactionFilters {
  budgetOwnerId?: string;
  categoryId?: string;
  categoryIds?: string[];  // NEW
  startDate?: Date;
  endDate?: Date;
  year?: number;
}
```
**And** both single and array filters are supported  

#### Scenario: Infrastructure implementation
**Given** the Prisma repository implementation  
**When** category filter is applied  
**Then** the Prisma query uses:
```typescript
where: {
  categoryId: filters.categoryIds?.length 
    ? { in: filters.categoryIds }
    : filters.categoryId,
  // ... other filters
}
```
**And** the query is type-safe and validated  

---

### Requirement: TCF-008 - Use Case Modification
**Priority**: HIGH  
**Type**: Technical  

The system SHALL modify GetTransactionsUseCase to handle category filters while maintaining backward compatibility.

#### Scenario: Use case query interface
**Given** GetTransactionsUseCase  
**When** category filter is added  
**Then** the query interface includes optional categoryId and categoryIds fields  
**And** both fields are mutually exclusive  
**And** existing queries without category filter continue to work  

#### Scenario: Filter priority logic
**Given** use case receives query with filter parameters  
**When** building repository filters  
**Then** the use case applies this logic:
1. If categoryIds is provided and non-empty, use categoryIds
2. Else if categoryId is provided, use categoryId  
3. Else no category filter
**And** the logic is clearly documented  

#### Scenario: Backward compatibility
**Given** existing code calls GetTransactionsUseCase without category fields  
**When** the use case is executed  
**Then** it functions exactly as before  
**And** no regression occurs in existing functionality  

---

### Requirement: TCF-009 - HTTP Route & Handler Updates
**Priority**: HIGH  
**Type**: Technical  

The system SHALL update transaction HTTP routes and handlers to accept and validate category filter parameters.

#### Scenario: Route schema validation
**Given** the GET `/transactions` endpoint  
**When** the route schema is defined  
**Then** it includes:
```typescript
query: t.Object({
  categoryId: t.Optional(t.String({ format: "uuid" })),
  categoryIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  // ... existing fields
})
```
**And** validation occurs before handler execution  

#### Scenario: Handler parameter mapping
**Given** the getTransactionsHandler  
**When** processing a request  
**Then** it extracts categoryId and categoryIds from query params  
**And** passes them to the use case query object  
**And** array serialization is handled correctly (comma-separated or array syntax)  

#### Scenario: Error response mapping
**Given** a validation error for category filter  
**When** the handler catches the error  
**Then** it maps to appropriate HTTP status code (400 for validation)  
**And** returns error in standard format  
**And** error message is in Indonesian  

---

### Requirement: TCF-010 - Schema Package Updates
**Priority**: HIGH  
**Type**: Technical  

The system SHALL update `@repo/schema` to include category filter in transaction query schema.

#### Scenario: Schema definition
**Given** the GetTransactionsQuerySchema in `@repo/schema`  
**When** the schema is updated  
**Then** it includes:
```typescript
export const GetTransactionsQuerySchema = z.object({
  budgetOwnerId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).max(50).optional(),
  // ... existing fields
}).refine(
  (data) => !(data.categoryId && data.categoryIds),
  { message: "Cannot provide both categoryId and categoryIds" }
);
```
**And** the schema enforces mutual exclusivity  
**And** array size is limited to 50 items  

#### Scenario: Type export
**Given** the updated schema  
**When** the package is built  
**Then** TypeScript types are exported  
**And** both API and Web can import the types  
**And** type safety is enforced at compile time  

---

### Requirement: TCF-011 - Web UI Integration
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide UI components for filtering transactions by category in the web application.

#### Scenario: Category filter dropdown
**Given** the transaction list page  
**When** the filter section is displayed  
**Then** it includes a category multi-select dropdown  
**And** the dropdown is populated with ACTIVE categories from API  
**And** users can select multiple categories  

#### Scenario: Filter application
**Given** a user selects categories "Food" and "Transport"  
**When** the filter is applied  
**Then** the transaction list updates to show only matching transactions  
**And** the query parameter categoryIds is sent as array  
**And** TanStack Query refetches with new filters  

#### Scenario: Filter clearing
**Given** category filters are active  
**When** a user clicks "Clear Filters" or removes all category selections  
**Then** the category filter is removed from the query  
**And** the transaction list shows all transactions (respecting other filters)  
**And** the URL query parameters are updated accordingly  

#### Scenario: Filter persistence in URL
**Given** category filters are applied  
**When** the page URL is copied and shared  
**Then** the URL includes category filter parameters  
**And** opening the URL applies the same filters automatically  
**And** the filter state is restored from URL on page load  

#### Scenario: Loading states
**Given** category filter is being applied  
**When** data is loading  
**Then** the UI shows loading indicator  
**And** the filter controls remain interactive  
**And** users can modify filters during loading (debounced)  

---

### Requirement: TCF-012 - Error Handling in UI
**Priority**: MEDIUM  
**Type**: Technical  

The system SHALL handle category filter errors gracefully in the web UI.

#### Scenario: API error display
**Given** the category filter API returns an error  
**When** the error is received  
**Then** the UI displays an error message in Indonesian  
**And** the message is user-friendly (no technical details)  
**And** users can retry the operation  

#### Scenario: Invalid filter recovery
**Given** invalid category IDs in URL parameters  
**When** the page loads  
**Then** the UI validates the parameters  
**And** removes invalid IDs  
**And** displays a warning to the user  
**And** continues with valid filters only  

---

### Requirement: TCF-013 - Analytics & Monitoring
**Priority**: LOW  
**Type**: Non-Functional  

The system SHALL log category filter usage for analytics and optimization.

#### Scenario: Filter usage tracking
**Given** any category filter query is executed  
**When** the query completes  
**Then** the system logs:
- Number of category filters applied
- Query execution time
- Result count
**And** logs are aggregated for analysis  

#### Scenario: Performance monitoring
**Given** category filter queries over time  
**When** monitoring dashboards are viewed  
**Then** they show:
- Average query response time
- P95/P99 response times
- Most frequently used category filters
- Slow query alerts when thresholds exceeded  

---

## Clean Architecture Compliance

### Requirement: TCF-014 - Architecture Boundaries
**Priority**: HIGH  
**Type**: Technical  

The system SHALL maintain Clean Architecture principles when implementing category filter.

#### Scenario: No cross-module imports
**Given** the transaction module implementation  
**When** category filter is added  
**Then** transaction module MUST NOT import from category module  
**And** transaction only references categoryId (primitive)  
**And** category validation occurs in category module only  

#### Scenario: Domain layer purity maintained
**Given** transaction domain layer  
**When** filter logic is implemented  
**Then** domain entities remain pure TypeScript  
**And** no external dependencies are added  
**And** filter logic resides in repository interface (port)  

#### Scenario: Dependency injection
**Given** use cases and repositories  
**When** implementations are wired  
**Then** concrete implementations are injected via constructors  
**And** no hard-coded dependencies exist  
**And** module container manages DI  

---

## Related Requirements
- **Depends On**: `category-management` - Categories must exist to be filtered
- **Related To**: Existing transaction query functionality (modified, not replaced)
