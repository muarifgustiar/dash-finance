# Design: Generic API Pagination

## Architecture Overview

This design establishes a layered pagination architecture that respects Clean Architecture and DDD principles while providing a flexible, reusable contract across all API modules.

### Design Principles

1. **Single Responsibility**: Pagination concerns are isolated per layer
2. **Dependency Inversion**: Domain defines interfaces, infrastructure implements
3. **Open/Closed**: Easy to extend with cursor-based pagination later
4. **Zero Business Logic in Shared Kernel**: Pagination is a technical concern, not domain-specific

## Layered Design

```
┌─────────────────────────────────────────────────────────────┐
│ Delivery/Presentation Layer (API Handlers)                  │
│ - Validate query params (Zod)                               │
│ - Extract pagination params                                  │
│ - Map to ApiResponse<PaginatedResponse<T>>                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Application Layer (Use Cases)                                │
│ - Receive pagination params                                  │
│ - Pass to repository                                         │
│ - Calculate metadata (totalPages, hasNext, hasPrev)         │
│ - Return structured result                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Domain Layer (Interfaces/Contracts)                         │
│ - Repository interfaces accept optional PaginationParams    │
│ - Return { items: T[], total: number }                      │
│ - PURE TS - no external dependencies                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure Layer (Prisma Repositories)                   │
│ - Calculate skip/take from page/limit                       │
│ - Execute paginated query + count query                     │
│ - Map persistence model → domain entity                     │
└─────────────────────────────────────────────────────────────┘
```

## Type Hierarchy

### Shared Kernel (@repo/domain)

```typescript
// packages/domain/src/types/pagination.ts

/**
 * Generic pagination parameters for queries
 * Used in repository and use case layers
 */
export type PaginationParams = {
  page: number;   // 1-indexed
  limit: number;  // items per page
};

/**
 * Pagination metadata returned in responses
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;       // total items across all pages
  totalPages: number;  // calculated: Math.ceil(total / limit)
  hasNext: boolean;    // page < totalPages
  hasPrev: boolean;    // page > 1
};

/**
 * Generic paginated response wrapper
 * Used in API responses
 */
export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMeta;
};
```

### Validation Schema (@repo/schema)

```typescript
// packages/schema/src/common/index.ts

import { z } from "zod";

/**
 * Query parameter schema for pagination
 * Used in API route validation
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  paginate: z.coerce.boolean().default(true), // opt-out flag
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
```

## Repository Contract Pattern

### Before (Inconsistent)
```typescript
// Some modules
interface Repository {
  findAll(): Promise<Entity[]>; // No pagination
}

// Other modules
interface Repository {
  findAll(filters?: Filters): Promise<Entity[]>; // Still no pagination
}

// Transaction only
interface Repository {
  findByDateRange(
    ownerId: string,
    start: Date,
    end: Date,
    pagination: { page: number; limit: number }
  ): Promise<{ transactions: Transaction[]; total: number }>;
}
```

### After (Consistent)
```typescript
import { PaginationParams } from "@repo/domain/types";

interface Repository {
  findAll(
    filters?: Filters,
    pagination?: PaginationParams // Optional - supports unpaginated
  ): Promise<{ items: Entity[]; total: number }>;
}
```

**Key Design Decisions**:
1. **Pagination is optional** - allows small datasets to skip pagination
2. **Return structure is consistent** - always `{ items, total }`
3. **Domain layer stays pure** - no Zod, no HTTP concepts
4. **Generic pattern** - works for all entities

## Use Case Pattern

### Calculation Logic
```typescript
export class ListEntitiesUseCase {
  async execute(
    query: Query
  ): Promise<{ items: Entity[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const paginate = query.paginate ?? true;

    if (!paginate) {
      // Unpaginated mode (for small reference data)
      const result = await this.repository.findAll(query.filters);
      return {
        items: result.items,
        pagination: {
          page: 1,
          limit: result.items.length,
          total: result.items.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // Paginated mode
    const result = await this.repository.findAll(
      query.filters,
      { page, limit }
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
```

**Key Design Decisions**:
1. **Use case calculates metadata** - repository only returns raw data
2. **Supports opt-out** - `paginate=false` returns all items
3. **Consistent return type** - always includes pagination object
4. **No external dependencies** - pure business logic

## API Handler Pattern

### Response Mapping
```typescript
import type { ApiResponse } from "@repo/domain/types";
import type { PaginatedResponse } from "@repo/domain/types";

export function listHandler(deps: Deps) {
  return async (context) => {
    const query = validateQuery(context.query); // Zod validation
    
    const result = await deps.useCase.execute(query);

    const response: ApiResponse<PaginatedResponse<ResponseDTO>> = {
      success: true,
      data: {
        items: result.items.map(mapToDTO),
        pagination: result.pagination,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return response;
  };
}
```

**Key Design Decisions**:
1. **Validation at boundary** - Zod schema validates query params
2. **DTO mapping in handler** - domain entities → response DTOs
3. **Consistent API contract** - `ApiResponse<PaginatedResponse<T>>`
4. **Metadata included** - timestamp, request ID

## Performance Considerations

### Database Query Optimization
```typescript
// Prisma implementation
async findAll(
  filters?: Filters,
  pagination?: PaginationParams
): Promise<{ items: Entity[]; total: number }> {
  const where = buildWhereClause(filters);

  if (!pagination) {
    // Unpaginated - single query
    const items = await prisma.entity.findMany({ where });
    return { items: items.map(this.toDomain), total: items.length };
  }

  // Paginated - parallel queries for efficiency
  const skip = (pagination.page - 1) * pagination.limit;
  const [items, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.entity.count({ where }),
  ]);

  return {
    items: items.map(this.toDomain),
    total,
  };
}
```

**Optimization Strategies**:
1. **Parallel queries** - `Promise.all([findMany, count])` reduces latency
2. **Skip unpaginated count** - when fetching all, reuse length
3. **Index optimization** - ensure DB indexes on filter + sort columns
4. **Limit max page size** - prevent abuse (max 100)

## Edge Cases & Error Handling

### Edge Case 1: Page Beyond Range
**Scenario**: User requests page 999 but only 3 pages exist

**Handling**:
- Return empty items array
- Correct pagination metadata (hasNext=false, page=999, totalPages=3)
- HTTP 200 (not an error - valid query, no results)

### Edge Case 2: Zero Results
**Scenario**: Filters return no matching records

**Handling**:
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
  }
}
```

### Edge Case 3: Invalid Pagination Params
**Scenario**: `page=-1` or `limit=1000`

**Handling**:
- Zod validation catches this at delivery layer
- Return 400 Bad Request with error details
- Never reaches use case/repository

### Edge Case 4: Unpaginated Large Dataset
**Scenario**: Client requests `paginate=false` on 10,000 records

**Handling Options**:
1. **Hard limit** (recommended): Reject if total > 500, force pagination
2. **Soft limit**: Log warning, allow but discourage
3. **Smart default**: Auto-enable pagination for large tables

**Decision**: Implement option 1 for production safety

## Migration Path

### Phase 1: Non-Breaking Addition
1. Add optional `pagination` params to repositories
2. Update use cases to accept pagination
3. Handlers conditionally return paginated format based on query params

**Result**: Old clients still work, new clients can opt-in

### Phase 2: Breaking Change Communication
1. Deprecation notice in API docs (30 days)
2. Response includes `deprecated` field in meta
3. Provide migration examples

### Phase 3: Enforce New Format
1. Remove conditional logic
2. Always return paginated format
3. Bump API version if using versioning

## Testing Strategy

### Unit Tests
- Pagination metadata calculation
  - First page: `hasPrev=false`
  - Last page: `hasNext=false`
  - Middle page: both true
  - Empty results: totalPages=0
- Edge cases: page beyond range, limit=0, etc.

### Integration Tests
- Repository pagination with real DB
- Count accuracy with filters
- Performance with 1000+ records

### E2E Tests
- Full request/response cycle
- Query param validation
- Response format compliance

## Future Extensions

### Cursor-Based Pagination (Optional)
If real-time data or infinite scroll becomes critical:

```typescript
export type CursorPaginationParams = {
  cursor?: string;  // opaque token
  limit: number;
};

export type CursorPaginationMeta = {
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
};
```

**When to implement**:
- Need for real-time data consistency
- Infinite scroll UX requirement
- Large, frequently-changing datasets

**Design**: Add alongside offset-based, let client choose via query param

### Sort/Order Integration
Pagination naturally pairs with sorting:

```typescript
export type SortParams = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

// Repository
findAll(
  filters?: Filters,
  pagination?: PaginationParams,
  sort?: SortParams
): Promise<{ items: T[]; total: number }>;
```

## Security Considerations

1. **Rate Limiting**: Large limit values can cause DOS → enforce max 100
2. **Data Exposure**: Pagination metadata reveals collection size → acceptable for this app
3. **Injection Prevention**: Zod validation prevents SQL injection in page/limit params

## Conclusion

This design provides:
- ✅ Consistent pagination contract across all modules
- ✅ Clean Architecture compliance (pure domain, validation at boundary)
- ✅ Performance optimization (parallel queries, indexed)
- ✅ Flexibility (optional pagination, opt-out support)
- ✅ Extensibility (cursor-based can be added later)
- ✅ Type safety (TypeScript + Zod throughout)

The implementation follows DDD principles with pagination as a **technical concern** in the shared kernel, not domain-specific business logic.
